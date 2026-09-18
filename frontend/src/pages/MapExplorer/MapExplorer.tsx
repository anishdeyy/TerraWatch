import React, { useState, useEffect } from 'react';
import { Plus, Filter, MapPin, Layers, Sparkles, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { siteService } from '../../services/siteService';
import { projectService } from '../../services/projectService';
import { Site, Project } from '../../types';
import { Map } from '../../components/Map/Map';
import { PolygonEditor } from '../../components/PolygonEditor/PolygonEditor';
import { PolygonDrawPreviewModal } from '../../components/Map/PolygonDrawPreviewModal';
import { SiteAnalyticsDrawer } from '../../components/Map/SiteAnalyticsDrawer';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const MapExplorer: React.FC = () => {
  const { isAnalyst } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);
  const [enableDrawMode, setEnableDrawMode] = useState(false);
  const [initialDrawnData, setInitialDrawnData] = useState<any>(null);
  const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const loadData = async () => {
    try {
      const [sitesData, projData] = await Promise.all([
        siteService.getSites({
          project_id: projectFilter ? parseInt(projectFilter, 10) : undefined,
          status: statusFilter || undefined
        }),
        projectService.getProjects()
      ]);
      setSites(sitesData);
      setProjects(projData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectFilter, statusFilter]);

  const handlePolygonDrawn = (geometry: any, areaHectares: number, lat: number, lon: number) => {
    setDrawnGeometry(geometry);
    setShowPreviewModal(true);
  };

  const handleSaveFromPreview = async (siteData: {
    name: string;
    description: string;
    projectId: number;
    geometry: any;
    areaHectares: number;
    latitude: number;
    longitude: number;
    ecologicalType: string;
    status: string;
  }) => {
    try {
      const created = await siteService.createSite({
        name: siteData.name,
        description: siteData.description,
        project_id: siteData.projectId,
        geometry: siteData.geometry,
        area_hectares: siteData.areaHectares,
        latitude: siteData.latitude,
        longitude: siteData.longitude,
        status: siteData.status || 'ACTIVE',
        ecological_type: siteData.ecologicalType
      });
      setShowPreviewModal(false);
      setDrawnGeometry(null);
      await loadData();
      if (created) {
        setSelectedSite(created);
      }
    } catch (e) {
      console.error("Save site error:", e);
    }
  };

  const handleSavePolygon = async (data: any) => {
    try {
      const pId = data.projectId || projects[0]?.id || 1;
      await siteService.createSite({
        name: data.name,
        description: data.description,
        project_id: pId,
        geometry: data.geometry,
        area_hectares: data.areaHectares,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status || 'ACTIVE'
      });
      setShowEditor(false);
      setInitialDrawnData(null);
      await loadData();
    } catch (e) {
      console.error("Save site error:", e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls (Section 28) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              PostGIS EPSG:4326
            </span>
            <span className="text-xs text-slate-500">
              Demo Environment — Synthetic environmental data
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Geospatial Map Explorer</h1>
          <p className="text-xs text-slate-500 font-medium">
            Interactive GIS viewport across PostGIS boundary polygons and telemetry records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="">All Projects ({projects.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active (Protected)</option>
            <option value="MONITORING">Assisted Monitoring</option>
            <option value="AT_RISK">At Risk (Stress)</option>
          </select>

          {isAnalyst && (
            <button
              onClick={() => setShowEditor(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Site Polygon</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm">
        <Map
          sites={sites}
          selectedSiteId={selectedSite?.id}
          onSelectSite={(s) => setSelectedSite(s)}
          height="640px"
          enableDraw={true}
          onPolygonCreated={handlePolygonDrawn}
        />

        {/* Selected Site Full Slide-Over Analytics Drawer */}
        {selectedSite && (
          <SiteAnalyticsDrawer
            site={selectedSite}
            onClose={() => setSelectedSite(null)}
          />
        )}
      </div>

      {/* Polygon Creation / Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <PolygonEditor
            initialData={initialDrawnData}
            projects={projects}
            onSave={handleSavePolygon}
            onCancel={() => {
              setShowEditor(false);
              setInitialDrawnData(null);
            }}
          />
        </div>
      )}

      {/* PostGIS Pre-Save Analysis Draw Preview Modal */}
      {showPreviewModal && drawnGeometry && (
        <PolygonDrawPreviewModal
          geometry={drawnGeometry}
          projects={projects}
          onSave={handleSaveFromPreview}
          onClose={() => {
            setShowPreviewModal(false);
            setDrawnGeometry(null);
          }}
        />
      )}
    </div>
  );
};
