import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ArrowRight,
  Download,
  Activity,
  Droplets,
  Trees,
  Layers,
  Sparkles,
  FileText,
  ShieldCheck,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Site, MetricTrendPoint } from '../../types';
import { EnvironmentalChart } from '../Chart/EnvironmentalChart';
import { analyticsService } from '../../services/analyticsService';
import { api } from '../../services/api';

interface SiteAnalyticsDrawerProps {
  site: Site | null;
  onClose: () => void;
}

export const SiteAnalyticsDrawer: React.FC<SiteAnalyticsDrawerProps> = ({ site, onClose }) => {
  const [trends, setTrends] = useState<MetricTrendPoint[]>([]);
  const [healthIndex, setHealthIndex] = useState<any>(null);
  const [activeChartType, setActiveChartType] = useState<'carbon' | 'biodiversity' | 'ndvi' | 'water' | 'soil' | 'rainfall'>('carbon');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!site) return;

    let isMounted = true;
    setLoading(true);

    const loadSiteAnalytics = async () => {
      try {
        const [trendsData, healthData] = await Promise.all([
          analyticsService.getSiteMetricTrends(site.id),
          api.get(`/sites/${site.id}/health-index`).then(r => r.data).catch(() => null)
        ]);

        if (isMounted) {
          setTrends(trendsData.trends || []);
          setHealthIndex(healthData);
        }
      } catch (err) {
        console.error("Failed to load site trends:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSiteAnalytics();

    return () => {
      isMounted = false;
    };
  }, [site]);

  if (!site) return null;

  const handleDownloadCSV = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/sites/${site.id}/export/csv`, '_blank');
  };

  const latestTrend = trends.length > 0 ? trends[trends.length - 1] : null;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[480px] bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-200 z-30 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                site.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : site.status === 'MONITORING'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {site.status}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {site.project_name || 'Conservation Corridor'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            {site.name}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>{site.area_hectares} ha</span>
            <span>•</span>
            <span>{site.latitude.toFixed(3)}° N, {site.longitude.toFixed(3)}° E</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          title="Close Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* Health Score Banner */}
        {healthIndex && (
          <div className="bg-emerald-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">
                Environmental Health Index
              </span>
              <span className="text-xs text-emerald-100/80">Demo index based on 5 metrics</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white">{healthIndex.score} / 100</span>
              <span className="text-[10px] block font-semibold text-emerald-300">Active Good Standing</span>
            </div>
          </div>
        )}

        {/* Live Metrics Grid */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Latest Telemetry Readings
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Carbon Stock</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {latestTrend?.carbon_stock || 1840} <span className="text-[10px] font-normal text-slate-500">tC/ha</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">NDVI Canopy</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                {latestTrend?.ndvi || 0.68}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Biodiversity</span>
              <span className="font-extrabold text-purple-700 text-sm">
                {latestTrend?.biodiversity_score || 78.4} <span className="text-[10px] font-normal text-slate-500">/ 100</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Water Stress</span>
              <span className="font-extrabold text-amber-700 text-sm">
                {latestTrend?.water_stress || 34.2}%
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Soil Moisture</span>
              <span className="font-extrabold text-blue-700 text-sm">
                {latestTrend?.soil_moisture || 28.5}%
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Rainfall</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {latestTrend?.rainfall || 140} <span className="text-[10px] font-normal text-slate-500">mm</span>
              </span>
            </div>
          </div>
        </div>

        {/* 12-Month Time-Series Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              12-Month Time-Series Trajectory
            </span>
          </div>

          {/* Metric Tab Selector */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3">
            {[
              { id: 'carbon', label: 'Carbon' },
              { id: 'ndvi', label: 'NDVI' },
              { id: 'biodiversity', label: 'Biodiversity' },
              { id: 'water', label: 'Water Stress' },
              { id: 'rainfall', label: 'Climate' },
              { id: 'soil', label: 'Soil' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveChartType(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeChartType === tab.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Canvas Component */}
          <EnvironmentalChart
            trends={trends}
            chartType={activeChartType}
            siteName={site.name}
            title={`${site.name} — ${activeChartType.toUpperCase()}`}
          />
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center gap-2">
        <Link
          to={`/sites/${site.id}`}
          className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <span>Open Full Site Details</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleDownloadCSV}
          className="w-full sm:w-auto py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          title="Export CSV"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
};
