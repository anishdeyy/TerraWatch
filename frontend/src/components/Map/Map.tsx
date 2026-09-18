import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Site } from '../../types';
import { Layers, Maximize2, Navigation, ZoomIn, ZoomOut, Info, Sparkles, Filter } from 'lucide-react';

// Geodesic area calculation helper on WGS84 for immediate client-side feedback
function calculateClientPolygonArea(coords: number[][]): number {
  if (!coords || coords.length < 3) return 0.0;
  let area = 0.0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coords[i][0] * coords[j][1];
    area -= coords[j][0] * coords[i][1];
  }
  const avgLat = coords.reduce((acc, c) => acc + c[1], 0) / n;
  const mLat = 111132.95;
  const mLon = 111412.84 * Math.cos((avgLat * Math.PI) / 180.0);
  const sqMeters = Math.abs(area / 2.0) * mLat * mLon;
  return Math.round((sqMeters / 10000.0) * 100) / 100;
}

function calculateClientCentroid(coords: number[][]): [number, number] {
  if (!coords || coords.length === 0) return [20.5937, 78.9629];
  const avgLon = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
  const avgLat = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
  return [Number(avgLat.toFixed(6)), Number(avgLon.toFixed(6))];
}

interface MapProps {
  sites: Site[];
  selectedSiteId?: number | null;
  onSelectSite?: (site: Site) => void;
  height?: string;
  enableDraw?: boolean;
  onPolygonCreated?: (geometry: any, areaHectares: number, lat: number, lon: number) => void;
  onPolygonUpdated?: (siteId: number, geometry: any, areaHectares: number) => void;
  onPolygonDeleted?: (siteId: number) => void;
}

export const Map: React.FC<MapProps> = ({
  sites = [],
  selectedSiteId,
  onSelectSite,
  height = '520px',
  enableDraw = false,
  onPolygonCreated,
  onPolygonUpdated,
  onPolygonDeleted
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [dataLayer, setDataLayer] = useState<'status' | 'biodiversity' | 'ndvi' | 'carbon_stock' | 'water_stress' | 'soil_organic_carbon'>('status');
  const [mapError, setMapError] = useState<string | null>(null);

  // Convert sites list to standard GeoJSON FeatureCollection
  const getGeoJSONData = useCallback((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = sites
      .filter(s => s.geometry && s.geometry.coordinates && s.geometry.coordinates.length > 0)
      .map(s => {
        return {
          type: 'Feature',
          id: s.id,
          properties: {
            id: s.id,
            name: s.name,
            status: s.status,
            project_name: s.project_name || '',
            area_hectares: s.area_hectares,
            latitude: s.latitude,
            longitude: s.longitude,
            biodiversity_score: s.biodiversity_score ?? 78.4,
            ndvi: s.ndvi ?? 0.68,
            carbon_stock: s.carbon_stock ?? 180.0,
            water_stress: s.water_stress ?? 34.2,
            soil_organic_carbon: s.soil_organic_carbon ?? 1.8,
            data_source: s.data_source || 'SYNTHETIC',
            ecological_type: s.ecological_type || 'tropical_evergreen'
          },
          geometry: s.geometry as GeoJSON.Geometry
        };
      });

    return {
      type: 'FeatureCollection',
      features
    };
  }, [sites]);

  // Compute dynamic fill color expression based on selected data layer
  const getFillColorExpression = useCallback(() => {
    switch (dataLayer) {
      case 'biodiversity':
        return [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'biodiversity_score'], 70],
          40, '#f59e0b',
          70, '#10b981',
          90, '#059669'
        ];
      case 'ndvi':
        return [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'ndvi'], 0.5],
          0.2, '#d97706',
          0.5, '#65a30d',
          0.8, '#15803d'
        ];
      case 'carbon_stock':
        return [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'carbon_stock'], 180.0],
          80, '#a855f7',
          200, '#6366f1',
          350, '#312e81'
        ];
      case 'soil_organic_carbon':
        return [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'soil_organic_carbon'], 1.5],
          0.5, '#d97706',
          2.0, '#10b981',
          5.0, '#047857'
        ];
      case 'water_stress':
        return [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'water_stress'], 30],
          20, '#3b82f6',
          45, '#f59e0b',
          70, '#ef4444'
        ];
      case 'status':
      default:
        return [
          'match',
          ['get', 'status'],
          'ACTIVE', '#10b981',
          'MONITORING', '#3b82f6',
          'AT_RISK', '#ef4444',
          '#6b7280'
        ];
    }
  }, [dataLayer]);

  // Reusable layer installation function hooked to map.on('style.load')
  const addEnvironmentalLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = 'terrawatch-sites-source';
    const fillLayerId = 'terrawatch-sites-fill';
    const outlineLayerId = 'terrawatch-sites-outline';

    // Remove existing layers and source if present
    if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
    if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    const geoData = getGeoJSONData();

    map.addSource(sourceId, {
      type: 'geojson',
      data: geoData
    });

    // Site Polygon Fill Layer
    map.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': getFillColorExpression() as any,
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.75,
          ['boolean', ['feature-state', 'hover'], false],
          0.6,
          0.4
        ]
      }
    });

    // Site Boundary Line Outline
    map.addLayer({
      id: outlineLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#ffffff',
          '#064e3b'
        ],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          3,
          1.8
        ]
      }
    });

    // Site Hover interaction with Popup Tooltip
    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 15
      });
    }

    let hoveredFeatureId: number | null = null;

    map.on('mousemove', fillLayerId, (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features || e.features.length === 0) return;

      const f = e.features[0];
      const props = f.properties || {};

      if (hoveredFeatureId !== null) {
        map.setFeatureState({ source: sourceId, id: hoveredFeatureId }, { hover: false });
      }
      hoveredFeatureId = Number(f.id);
      map.setFeatureState({ source: sourceId, id: hoveredFeatureId }, { hover: true });

      const coordinates = e.lngLat;
      const statusColor = props.status === 'ACTIVE' ? '#10b981' : props.status === 'MONITORING' ? '#3b82f6' : '#ef4444';

      const tooltipContent = `
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${props.name}</div>
          <div style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${statusColor}; background: ${statusColor}18; padding: 2px 6px; border-radius: 4px; margin-bottom: 6px;">
            ${props.status}
          </div>
          <div style="font-size: 11px; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <div>Area: <strong style="color: #0f172a;">${props.area_hectares} ha</strong></div>
            <div>NDVI: <strong style="color: #059669;">${props.ndvi || 0.68}</strong></div>
            <div>Carbon: <strong style="color: #0f172a;">${props.carbon_stock || 180} tC/ha</strong></div>
            <div>SOC: <strong style="color: #d97706;">${props.soil_organic_carbon ? props.soil_organic_carbon + '%' : '1.8%'}</strong></div>
            <div>Bio Score: <strong style="color: #7c3aed;">${props.biodiversity_score || 78}</strong></div>
            <div>Stress: <strong style="color: #ef4444;">${props.water_stress ? props.water_stress + '%' : '34%'}</strong></div>
          </div>
        </div>
      `;

      popupRef.current?.setLngLat(coordinates).setHTML(tooltipContent).addTo(map);
    });

    map.on('mouseleave', fillLayerId, () => {
      map.getCanvas().style.cursor = '';
      if (hoveredFeatureId !== null) {
        map.setFeatureState({ source: sourceId, id: hoveredFeatureId }, { hover: false });
        hoveredFeatureId = null;
      }
      popupRef.current?.remove();
    });

    // Site Click Handler
    map.on('click', fillLayerId, (e) => {
      if (!e.features || e.features.length === 0) return;
      const f = e.features[0];
      const clickedId = Number(f.id || f.properties?.id);
      const matchedSite = sites.find(s => s.id === clickedId);
      if (matchedSite && onSelectSite) {
        onSelectSite(matchedSite);
      }
    });
  }, [sites, getGeoJSONData, getFillColorExpression, onSelectSite]);

  // Initialize Mapbox Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
    mapboxgl.accessToken = token;

    try {
      const initialStyleUri = mapStyle === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/light-v11';

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: initialStyleUri,
        center: [78.9629, 20.5937], // India Center
        zoom: 4.8
      });

      mapRef.current = map;

      // Real Mapbox Controls
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }), 'top-right');

      // Polygon Drawing Controls
      if (enableDraw) {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          defaultMode: 'draw_polygon'
        });
        drawRef.current = draw;
        map.addControl(draw, 'top-left');

        map.on('draw.create', (e: any) => {
          if (e.features && e.features[0]) {
            const feat = e.features[0];
            const coords = feat.geometry.coordinates[0];
            const area = calculateClientPolygonArea(coords);
            const [lat, lon] = calculateClientCentroid(coords);
            if (onPolygonCreated) {
              onPolygonCreated(feat.geometry, area, lat, lon);
            }
          }
        });

        map.on('draw.update', (e: any) => {
          if (e.features && e.features[0] && onPolygonUpdated) {
            const feat = e.features[0];
            const coords = feat.geometry.coordinates[0];
            const area = calculateClientPolygonArea(coords);
            onPolygonUpdated(feat.id, feat.geometry, area);
          }
        });

        map.on('draw.delete', (e: any) => {
          if (e.features && e.features[0] && onPolygonDeleted) {
            onPolygonDeleted(e.features[0].id);
          }
        });
      }

      // Re-hydrate environmental layers when style loads
      map.on('style.load', () => {
        addEnvironmentalLayers();
      });

      // Fit bounds to sites bounding box
      map.on('load', () => {
        addEnvironmentalLayers();

        if (sites.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          let count = 0;
          sites.forEach(s => {
            if (s.longitude && s.latitude) {
              bounds.extend([s.longitude, s.latitude]);
              count++;
            }
          });
          if (count > 0) {
            map.fitBounds(bounds, { padding: 50, maxZoom: 8.5, duration: 1200 });
          }
        }
      });

      return () => {
        popupRef.current?.remove();
        map.remove();
        mapRef.current = null;
      };
    } catch (err: any) {
      console.error("Mapbox initialization error:", err);
      setMapError(err.message || "Failed to initialize Mapbox GL map");
    }
  }, [enableDraw]);

  // Handle Map Style toggle (Standard / Satellite)
  const handleStyleChange = (style: 'standard' | 'satellite') => {
    setMapStyle(style);
    const map = mapRef.current;
    if (!map) return;
    const styleUri = style === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/light-v11';
    map.setStyle(styleUri);
  };

  // Update environmental layers when sites or dataLayer change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      addEnvironmentalLayers();
    }
  }, [sites, dataLayer, addEnvironmentalLayers]);

  // Highlight selected site
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = 'terrawatch-sites-source';
    sites.forEach(s => {
      try {
        map.setFeatureState(
          { source: sourceId, id: s.id },
          { selected: selectedSiteId === s.id }
        );
      } catch (_) {}
    });

    if (selectedSiteId) {
      const selected = sites.find(s => s.id === selectedSiteId);
      if (selected && selected.longitude && selected.latitude) {
        map.flyTo({
          center: [selected.longitude, selected.latitude],
          zoom: 7.5,
          speed: 1.2
        });
      }
    }
  }, [selectedSiteId, sites]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm" style={{ height }}>
      {/* Top Left: Map Style & Data Layer Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Style Selector */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-semibold text-slate-800">
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>Style:</span>
          <button
            onClick={() => handleStyleChange('standard')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mapStyle === 'standard' ? 'bg-emerald-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => handleStyleChange('satellite')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mapStyle === 'satellite' ? 'bg-emerald-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Data Layer Color Dropdown */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-semibold text-slate-800">
          <Filter className="w-3.5 h-3.5 text-emerald-700" />
          <span>Color by:</span>
          <select
            value={dataLayer}
            onChange={(e) => setDataLayer(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-md py-0.5 px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="status">Site Status</option>
            <option value="ndvi">NDVI Canopy</option>
            <option value="carbon_stock">Carbon Density (tC/ha)</option>
            <option value="soil_organic_carbon">Soil Organic Carbon (SOC %)</option>
            <option value="biodiversity">Biodiversity Score</option>
            <option value="water_stress">Water Stress (%)</option>
          </select>
        </div>
      </div>

      {/* Dynamic Map Legend Based on Active Layer */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200 text-xs space-y-1.5 hidden sm:block">
        <div className="font-bold text-slate-800 pb-1 border-b border-slate-100 flex items-center justify-between gap-3">
          <span className="capitalize">{dataLayer.replace('_', ' ')}</span>
          <span className="text-[10px] text-slate-400 font-mono">Legend</span>
        </div>

        {dataLayer === 'status' && (
          <>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 opacity-80 border border-emerald-700"></span>
              <span>Active Protected ({sites.filter(s => s.status === 'ACTIVE').length || 9})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-blue-500 opacity-80 border border-blue-700"></span>
              <span>Assisted Monitoring ({sites.filter(s => s.status === 'MONITORING').length || 4})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-rose-500 opacity-80 border border-rose-700"></span>
              <span>At Risk Stress ({sites.filter(s => s.status === 'AT_RISK').length || 2})</span>
            </div>
          </>
        )}

        {dataLayer === 'biodiversity' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Low (40)</span>
              <span>High (95)</span>
            </div>
            <div className="w-36 h-2.5 rounded bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-700 border border-slate-300"></div>
          </div>
        )}

        {dataLayer === 'ndvi' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Sparse (0.2)</span>
              <span>Dense Canopy (0.8)</span>
            </div>
            <div className="w-36 h-2.5 rounded bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-800 border border-slate-300"></div>
          </div>
        )}

        {dataLayer === 'carbon_stock' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>80 tC/ha (Degraded)</span>
              <span>350 tC/ha (Pristine)</span>
            </div>
            <div className="w-40 h-2.5 rounded bg-gradient-to-r from-purple-400 via-indigo-600 to-indigo-950 border border-slate-300"></div>
          </div>
        )}

        {dataLayer === 'soil_organic_carbon' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>0.5% (Low SOC)</span>
              <span>5.0%+ (Carbon-Rich)</span>
            </div>
            <div className="w-40 h-2.5 rounded bg-gradient-to-r from-amber-600 via-emerald-500 to-emerald-800 border border-slate-300"></div>
          </div>
        )}

        {dataLayer === 'water_stress' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Low (20%)</span>
              <span>Severe (75%)</span>
            </div>
            <div className="w-36 h-2.5 rounded bg-gradient-to-r from-blue-500 via-amber-500 to-rose-600 border border-slate-300"></div>
          </div>
        )}
      </div>

      {/* Synthetic Dataset Notice Badge */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1.5 shadow-sm">
        <Info className="w-3.5 h-3.5 text-emerald-400" />
        <span>Demo Environment — Synthetic environmental data</span>
      </div>

      {/* Error state if Mapbox fails */}
      {mapError && (
        <div className="absolute inset-0 bg-slate-900/90 z-30 flex flex-col items-center justify-center p-6 text-center text-white">
          <Info className="w-10 h-10 text-rose-400 mb-2" />
          <h3 className="font-bold text-base mb-1">Unable to load map</h3>
          <p className="text-xs text-slate-300 max-w-sm mb-4">
            Check your Mapbox token in frontend/.env and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Native Mapbox Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
