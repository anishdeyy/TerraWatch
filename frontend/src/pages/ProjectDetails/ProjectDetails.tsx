import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderKanban,
  MapPin,
  Trees,
  Plus,
  Sparkles,
  ArrowLeft,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { siteService } from '../../services/siteService';
import { aiService } from '../../services/aiService';
import { Project, Site, ProjectSummaryResponse } from '../../types';
import { Map } from '../../components/Map/Map';
import { SiteCard } from '../../components/SiteCard/SiteCard';
import { PolygonEditor } from '../../components/PolygonEditor/PolygonEditor';
import { useAuth } from '../../context/AuthContext';
import { PremiumGate } from '../../components/PremiumGate/PremiumGate';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || '1', 10);
  const { isAnalyst } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [showAddSite, setShowAddSite] = useState(false);
  const [summary, setSummary] = useState<ProjectSummaryResponse | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const loadData = async () => {
    try {
      const [proj, siteList] = await Promise.all([
        projectService.getProject(projectId),
        siteService.getSites({ project_id: projectId })
      ]);
      setProject(proj);
      setSites(siteList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await aiService.getProjectSummary(projectId);
      setSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSaveSite = async (siteData: any) => {
    try {
      await siteService.createSite({
        name: siteData.name,
        description: siteData.description,
        project_id: projectId,
        geometry: siteData.geometry,
        area_hectares: siteData.areaHectares
      });
      setShowAddSite(false);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!project) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading project dossier...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {project.project_type}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Status: {project.status}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.name}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">{project.description}</p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {isAnalyst && (
              <button
                onClick={() => setShowAddSite(true)}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Site Polygon</span>
              </button>
            )}

            <button
              onClick={handleGenerateSummary}
              disabled={loadingSummary}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 border border-slate-700"
            >
              {loadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
              <span>Executive AI Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Monitored Area</span>
          <span className="text-xl font-extrabold text-slate-900">{project.total_area_hectares} ha</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Geographical Sites</span>
          <span className="text-xl font-extrabold text-slate-900">{sites.length} Sites</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Health Score</span>
          <span className="text-xl font-extrabold text-emerald-700">76 / 100</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Verification Protocol</span>
          <span className="text-xs font-bold text-slate-700 mt-1 block">Tier 2 In-Situ + NDVI</span>
        </div>
      </div>

      {/* Map of Project Sites */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-800" />
          <span>Project Geographical Sites & Boundary Polygons</span>
        </h3>
        <Map sites={sites} height="380px" />
      </div>

      {/* Executive Summary AI Card (Gemini Feature #4) */}
      {summary && (
        <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-base text-white">Project Executive Summary</h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              {summary.project_status}
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">{summary.executive_summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-emerald-400 block mb-1">Key Environmental Trends</span>
              <ul className="space-y-1 text-xs text-slate-300">
                {summary.key_environmental_trends.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="text-xs font-bold text-amber-400 block mb-1">Priority Recommendations</span>
              <ul className="space-y-1 text-xs text-slate-300">
                {summary.priority_recommendations.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sites List */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 mb-4">
          Included Sites ({sites.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sites.map(s => (
            <SiteCard key={s.id} site={s} />
          ))}
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <PolygonEditor
            onSave={handleSaveSite}
            onCancel={() => setShowAddSite(false)}
            defaultProjectId={projectId}
          />
        </div>
      )}
    </div>
  );
};
