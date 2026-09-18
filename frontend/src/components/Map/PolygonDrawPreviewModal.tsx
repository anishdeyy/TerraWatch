import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Trees,
  Droplets,
  Thermometer,
  Layers,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Project, SiteDrawPreview } from '../../types';
import { dataSourceService } from '../../services/dataSourceService';

interface PolygonDrawPreviewModalProps {
  geometry: any;
  projects: Project[];
  onSave: (siteData: {
    name: string;
    description: string;
    projectId: number;
    geometry: any;
    areaHectares: number;
    latitude: number;
    longitude: number;
    ecologicalType: string;
    status: string;
  }) => Promise<void>;
  onClose: () => void;
}

export const PolygonDrawPreviewModal: React.FC<PolygonDrawPreviewModalProps> = ({
  geometry,
  projects,
  onSave,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<SiteDrawPreview | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number>(projects[0]?.id || 1);
  const [ecologicalType, setEcologicalType] = useState('tropical_evergreen');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      try {
        const res = await dataSourceService.previewDrawnPolygon(geometry);
        setPreview(res);
        if (res.suggested_ecological_type) {
          setEcologicalType(res.suggested_ecological_type);
        }
        setName(`Monitored Plot ${res.latitude.toFixed(3)}N`);
      } catch (e) {
        console.error("Preview draw error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [geometry]);

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !preview) return;
    setSaving(true);
    try {
      await onSave({
        name,
        description,
        projectId,
        geometry,
        areaHectares: preview.area_hectares,
        latitude: preview.latitude,
        longitude: preview.longitude,
        ecologicalType,
        status: 'ACTIVE'
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center">
              <Compass className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">PostGIS Polygon Pre-Save Analysis</h2>
              <p className="text-xs text-slate-500">Spatial telemetry, geodesic area, and live climate preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
              <p className="text-xs font-semibold text-slate-500">Computing spatial intersections & querying Open-Meteo...</p>
            </div>
          ) : preview ? (
            <>
              {/* Geodesic Spatial Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Geodesic Area (WGS84)</span>
                  <span className="text-xl font-black text-emerald-950">{preview.area_hectares.toFixed(1)}</span>
                  <span className="text-[10px] text-emerald-700 ml-1">hectares</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Centroid Coordinates</span>
                  <span className="text-sm font-black text-slate-900 block font-mono">
                    {preview.latitude.toFixed(4)}°N
                  </span>
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    {preview.longitude.toFixed(4)}°E
                  </span>
                </div>

                <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-100">
                  <span className="text-[10px] font-bold text-teal-800 uppercase block">Suggested Biome</span>
                  <span className="text-xs font-extrabold text-teal-900 block mt-1 capitalize">
                    {preview.suggested_ecological_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[9px] text-teal-700">Calibrated Baseline</span>
                </div>
              </div>

              {/* Spatial Intersection Alert */}
              {preview.overlapping_sites.length > 0 ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Spatial Overlap Detected (ST_Intersects):</span>
                    <span>This polygon overlaps with {preview.overlapping_sites.map(s => s.site_name).join(', ')} ({preview.overlapping_sites[0].overlap_area_hectares} ha overlap).</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero spatial collision detected. Valid independent PostGIS parcel.</span>
                </div>
              )}

              {/* Live Open-Meteo Climate Preview */}
              {preview.climate_preview && preview.climate_preview.status !== 'unavailable' && (
                <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-sky-950 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-700" />
                      Live Open-Meteo Climate Telemetry
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200/60 text-sky-800">
                      Past 90 Days
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Total Rainfall:</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {preview.climate_preview.total_rainfall_mm} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Mean Temperature:</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {preview.climate_preview.average_temperature_c}°C
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Inputs for Saving */}
              <form id="save-site-form" onSubmit={handleConfirmSave} className="space-y-3.5 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Site Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Western Ghats Sector Bravo"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Parent Project *
                    </label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Ecological Categorization
                  </label>
                  <select
                    value={ecologicalType}
                    onChange={(e) => setEcologicalType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="tropical_evergreen">Tropical Wet Evergreen (PMC7417561)</option>
                    <option value="tropical_dry_deciduous">Tropical Dry Deciduous (Central India)</option>
                    <option value="agroforestry">Cauvery Basin Agroforestry</option>
                    <option value="semi_arid_grassland">Semi-Arid Silvopasture (Thar Arid)</option>
                    <option value="mangrove">Tidal Mangrove Buffer (Sundarbans)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Description & Objectives
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter conservation scope, tree species, or monitoring notes..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </form>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Discard
          </button>

          <button
            type="submit"
            form="save-site-form"
            disabled={saving || !preview}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
            <span>Commit to PostGIS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
