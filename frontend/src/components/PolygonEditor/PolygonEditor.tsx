import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, CheckCircle, Calculator, FolderKanban } from 'lucide-react';
import { Project } from '../../types';

interface PolygonEditorProps {
  initialData?: {
    geometry?: { type: string; coordinates: number[][][] };
    areaHectares?: number;
    latitude?: number;
    longitude?: number;
  };
  projects?: Project[];
  defaultProjectId?: number;
  onSave: (data: {
    name: string;
    description: string;
    projectId?: number;
    status?: string;
    geometry: { type: 'Polygon'; coordinates: number[][][] };
    areaHectares: number;
    latitude: number;
    longitude: number;
  }) => void;
  onCancel: () => void;
}

export const PolygonEditor: React.FC<PolygonEditorProps> = ({
  initialData,
  projects = [],
  defaultProjectId,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number>(defaultProjectId || (projects[0]?.id || 1));
  const [status, setStatus] = useState<'ACTIVE' | 'MONITORING' | 'AT_RISK'>('ACTIVE');
  const [regionPreset, setRegionPreset] = useState('maharashtra');

  // Preset regions in India
  const presets: Record<string, { lat: number; lon: number; coords: number[][][] }> = {
    maharashtra: {
      lat: 19.12,
      lon: 73.65,
      coords: [[[73.60, 19.08], [73.70, 19.08], [73.72, 19.16], [73.61, 19.15], [73.60, 19.08]]]
    },
    karnataka: {
      lat: 12.45,
      lon: 75.92,
      coords: [[[75.88, 12.40], [75.98, 12.40], [75.99, 12.50], [75.89, 12.49], [75.88, 12.40]]]
    },
    rajasthan: {
      lat: 27.15,
      lon: 71.35,
      coords: [[[71.30, 27.10], [71.42, 27.10], [71.43, 27.20], [71.31, 27.19], [71.30, 27.10]]]
    },
    madhya_pradesh: {
      lat: 22.35,
      lon: 78.60,
      coords: [[[78.55, 22.30], [78.68, 22.30], [78.69, 22.42], [78.56, 22.41], [78.55, 22.30]]]
    },
    west_bengal: {
      lat: 22.10,
      lon: 88.75,
      coords: [[[88.70, 22.05], [88.82, 22.05], [88.83, 22.15], [88.71, 22.14], [88.70, 22.05]]]
    }
  };

  const currentPreset = presets[regionPreset];
  const [points, setPoints] = useState<[number, number][]>(
    initialData?.geometry?.coordinates?.[0]?.map(c => [c[0], c[1]] as [number, number]) ||
    currentPreset.coords[0].map(c => [c[0], c[1]] as [number, number])
  );

  useEffect(() => {
    if (initialData?.geometry?.coordinates?.[0]) {
      setPoints(initialData.geometry.coordinates[0].map(c => [c[0], c[1]] as [number, number]));
    }
  }, [initialData]);

  // Geodesic area calculation in hectares
  const calculateArea = (pts: [number, number][]) => {
    if (pts.length < 3) return 0;
    let area = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += pts[i][0] * pts[j][1];
      area -= pts[j][0] * pts[i][1];
    }
    const avgLat = pts.reduce((acc, p) => acc + p[1], 0) / n;
    const mLat = 111132;
    const mLon = 111412 * Math.cos((avgLat * Math.PI) / 180);
    const sqMeters = Math.abs(area / 2) * mLat * mLon;
    return Math.round((sqMeters / 10000) * 100) / 100;
  };

  const calculatedArea = initialData?.areaHectares || calculateArea(points);
  const avgLat = initialData?.latitude || points.reduce((acc, p) => acc + p[1], 0) / (points.length || 1);
  const avgLon = initialData?.longitude || points.reduce((acc, p) => acc + p[0], 0) / (points.length || 1);

  const handleRegionChange = (reg: string) => {
    setRegionPreset(reg);
    const p = presets[reg];
    setPoints(p.coords[0].map(c => [c[0], c[1]] as [number, number]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Ensure polygon is closed (first pt == last pt)
    const closedCoords: number[][] = [...points];
    if (
      points.length > 0 &&
      (points[0][0] !== points[points.length - 1][0] || points[0][1] !== points[points.length - 1][1])
    ) {
      closedCoords.push(points[0]);
    }

    onSave({
      name,
      description,
      projectId,
      status,
      geometry: {
        type: 'Polygon',
        coordinates: [closedCoords]
      },
      areaHectares: calculatedArea || 385.5,
      latitude: parseFloat(avgLat.toFixed(6)),
      longitude: parseFloat(avgLon.toFixed(6))
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl max-w-xl w-full">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">New Environmental Site</h2>
            <p className="text-xs text-slate-500 font-medium">PostGIS spatial polygon registration</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Site Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Northern Canopy Restoration Sector B"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Project Initiative *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {projects.length > 0 ? (
                projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              ) : (
                <option value={1}>Western Ghats Restoration</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="ACTIVE">Active (Protected)</option>
              <option value="MONITORING">Assisted Monitoring</option>
              <option value="AT_RISK">At Risk (Stress)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Key ecological notes, terrain profile, and species focus..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        {!initialData && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Region Preset
            </label>
            <select
              value={regionPreset}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="maharashtra">Maharashtra (Western Ghats - Rainforest Mosaic)</option>
              <option value="karnataka">Karnataka (Cauvery Basin - Agroforestry Corridor)</option>
              <option value="rajasthan">Rajasthan (Thar Desert - Silvopasture Zone)</option>
              <option value="madhya_pradesh">Madhya Pradesh (Satpura - Mixed Deciduous)</option>
              <option value="west_bengal">West Bengal (Sundarbans - Tidal Mangroves)</option>
            </select>
          </div>
        )}

        {/* Real-Time Polygon Metrics */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-emerald-800 font-semibold text-[11px] block">Calculated Area:</span>
            <div className="text-base font-black text-emerald-950 flex items-center gap-1.5 mt-0.5">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>{calculatedArea} Hectares</span>
            </div>
            <span className="text-[10px] text-emerald-600">Automatically calculated from polygon</span>
          </div>
          <div>
            <span className="text-emerald-800 font-semibold text-[11px] block">Centroid Coordinates:</span>
            <div className="text-xs font-bold text-emerald-950 mt-1 font-mono">
              {avgLat.toFixed(4)}° N, {avgLon.toFixed(4)}° E
            </div>
            <span className="text-[10px] text-emerald-600">EPSG:4326 PostGIS reference</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Site</span>
          </button>
        </div>
      </form>
    </div>
  );
};
