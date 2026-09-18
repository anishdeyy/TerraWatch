import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  MapPin,
  Trees,
  Layers,
  Sparkles,
  AlertTriangle,
  Activity,
  ArrowRight,
  Droplets,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { siteService } from '../../services/siteService';
import { analyticsService } from '../../services/analyticsService';
import { reportService } from '../../services/reportService';
import { Project, Site, AlertItem, ReportItem } from '../../types';
import { MetricCard } from '../../components/MetricCard/MetricCard';
import { Map } from '../../components/Map/Map';
import { ProjectCard } from '../../components/ProjectCard/ProjectCard';
import { SiteCard } from '../../components/SiteCard/SiteCard';
import { CardSkeleton } from '../../components/Loading/Skeleton';
import { AskAIPanel } from '../../components/AIInsight/AskAIPanel';
import { SiteAnalyticsDrawer } from '../../components/Map/SiteAnalyticsDrawer';
import { api } from '../../services/api';

export const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projData, sitesData, alertsData, reportsData, summaryData] = await Promise.all([
          projectService.getProjects(),
          siteService.getSites(),
          analyticsService.getAllAlerts(),
          reportService.getReports(),
          api.get('/dashboard/summary').then(r => r.data).catch(() => null)
        ]);
        setProjects(projData);
        setSites(sitesData);
        setAlerts(alertsData);
        setReports(reportsData);
        setDashboardSummary(summaryData);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalArea = dashboardSummary?.total_area_hectares || projects.reduce((acc, p) => acc + (p.total_area_hectares || 0), 0);
  const totalSites = dashboardSummary?.total_sites || sites.length;
  const activeProjectsCount = dashboardSummary?.active_projects || projects.filter(p => p.status === 'ACTIVE').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Demo Environment — Synthetic environmental data</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Geospatial Environmental Command Center
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl font-medium">
            Monitor environmental projects, site boundaries, and ecological metrics in one place.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/map"
            className="px-5 py-2.5 bg-white text-emerald-950 font-bold text-xs rounded-xl shadow-md hover:bg-slate-100 transition-all hover:scale-105 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-emerald-800" />
            <span>Open Map Explorer</span>
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl border border-emerald-500/40 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* 8 Metric Cards from Section 6 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              title="Active Projects"
              value={activeProjectsCount}
              unit="Initiatives"
              icon={FolderKanban}
              color="emerald"
              trend={{ direction: 'up', percentage: 25, label: 'vs last cycle' }}
            />
            <MetricCard
              title="Total Sites"
              value={totalSites}
              unit="Polygons"
              icon={MapPin}
              color="blue"
              trend={{ direction: 'up', percentage: 12 }}
            />
            <MetricCard
              title="Total Area"
              value={totalArea.toLocaleString()}
              unit="Hectares"
              icon={Trees}
              color="emerald"
            />
            <MetricCard
              title="Estimated Carbon Stock"
              value={dashboardSummary?.carbon_stock ? `${dashboardSummary.carbon_stock}` : "1,840"}
              unit="tC / ha Avg"
              icon={Activity}
              color="purple"
              trend={{ direction: 'up', percentage: 3.8 }}
            />
            <MetricCard
              title="Avg Biodiversity Score"
              value={dashboardSummary?.biodiversity_score ? `${dashboardSummary.biodiversity_score}` : "78.4"}
              unit="/ 100"
              icon={Sparkles}
              color="emerald"
              trend={{ direction: 'up', percentage: 4.2 }}
            />
            <MetricCard
              title="Average NDVI"
              value={dashboardSummary?.ndvi ? `${dashboardSummary.ndvi}` : "0.68"}
              unit="Canopy Index"
              icon={Layers}
              color="emerald"
              trend={{ direction: 'neutral', percentage: 0.0 }}
            />
            <MetricCard
              title="Water Stress"
              value={dashboardSummary?.water_stress ? `${dashboardSummary.water_stress}%` : "34.2%"}
              unit="Moderate"
              icon={Droplets}
              color="amber"
              trend={{ direction: 'down', percentage: 5.1 }}
            />
            <MetricCard
              title="Active Alerts"
              value={dashboardSummary?.active_alerts !== undefined ? dashboardSummary.active_alerts : alerts.length}
              unit="Flagged"
              icon={AlertTriangle}
              color="rose"
            />
          </>
        )}
      </div>

      {/* Large Interactive Map (Section 6) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-800" />
              <span>Environmental Sites</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              View and manage project sites on the map.
            </p>
          </div>
          <Link
            to="/map"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Map
          sites={sites}
          selectedSiteId={selectedSite?.id}
          onSelectSite={(site) => {
            setSelectedSite(site);
            setShowDrawer(true);
          }}
          height="480px"
        />

        {/* Slide-over Analytics Drawer on Map Polygon Click */}
        {showDrawer && selectedSite && (
          <SiteAnalyticsDrawer
            site={selectedSite}
            onClose={() => setShowDrawer(false)}
          />
        )}
      </div>

      {/* Environmental Health Composite Index Breakdown (Section 11) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Environmental Health Index
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Demo index based on five configurable metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-800">74 / 100</span>
              <span className="text-xs font-semibold text-emerald-600 block">Good Standing</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Biodiversity (30%)</span>
            <span className="text-lg font-bold text-slate-800">78 / 100</span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Vegetation NDVI (20%)</span>
            <span className="text-lg font-bold text-slate-800">82 / 100</span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Carbon Stock (20%)</span>
            <span className="text-lg font-bold text-slate-800">71 / 100</span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full" style={{ width: '71%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Soil Health (15%)</span>
            <span className="text-lg font-bold text-slate-800">64 / 100</span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Water Balance (15%)</span>
            <span className="text-lg font-bold text-slate-800">65 / 100</span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Language Query Widget */}
      <AskAIPanel />

      {/* Below Map: Recent Projects, Sites, and Alerts (Section 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Active Projects</h3>
            <Link to="/projects" className="text-xs font-bold text-emerald-800 hover:underline">
              View All ({projects.length})
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 4).map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>

        {/* Environmental Alerts Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Active Alerts</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800">
              {alerts.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 4).map(a => (
              <div
                key={a.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      a.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : a.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {a.severity}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(a.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">{a.site_name}</h4>
                <p className="text-[11px] text-slate-600 mb-2">{a.metric}: {a.change_pct}% change</p>
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg leading-tight">
                  {a.recommended_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
