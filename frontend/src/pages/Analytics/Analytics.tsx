import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { siteService } from '../../services/siteService';
import { Site, AlertItem, MetricTrends } from '../../types';
import { EnvironmentalChart } from '../../components/Chart/EnvironmentalChart';
import { AlertTriangle, Layers, Scale, Sparkles, Droplets } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteAId, setSiteAId] = useState<number>(1);
  const [siteBId, setSiteBId] = useState<number>(2);
  const [trendsA, setTrendsA] = useState<MetricTrends | null>(null);
  const [trendsB, setTrendsB] = useState<MetricTrends | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const sList = await siteService.getSites();
        setSites(sList);
        if (sList.length >= 2) {
          setSiteAId(sList[0].id);
          setSiteBId(sList[1].id);
        }
        const al = await analyticsService.getAllAlerts();
        setAlerts(al);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSites();
  }, []);

  useEffect(() => {
    const fetchTrends = async () => {
      if (!siteAId) return;
      try {
        const tA = await analyticsService.getSiteMetricTrends(siteAId);
        setTrendsA(tA);
        if (siteBId && siteBId !== siteAId) {
          const tB = await analyticsService.getSiteMetricTrends(siteBId);
          setTrendsB(tB);
        } else {
          setTrendsB(null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTrends();
  }, [siteAId, siteBId]);

  const siteA = sites.find(s => s.id === siteAId);
  const siteB = sites.find(s => s.id === siteBId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Environmental Analytics & Comparative Lab</h1>
        <p className="text-xs text-slate-500 mt-1">
          Perform multi-site comparative trend analytics, cross-calibrate carbon pools, and inspect platform alert thresholds
        </p>
      </div>

      {/* Comparative Visualizer (Section 10: Site A vs Site B) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-base text-slate-900">Multi-Site Comparison Benchmarking</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-500 mr-2">Primary Site (A):</span>
              <select
                value={siteAId}
                onChange={(e) => setSiteAId(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="font-bold text-slate-500 mr-2">Benchmark Site (B):</span>
              <select
                value={siteBId}
                onChange={(e) => setSiteBId(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {trendsA && (
          <EnvironmentalChart
            trends={trendsA.trends}
            comparisonTrends={trendsB?.trends}
            comparisonLabel={siteB?.name || 'Site B'}
            siteName={siteA?.name || 'Site A'}
            chartType="carbon"
            title={`${siteA?.name} vs ${siteB?.name} — Carbon Stock Comparison`}
          />
        )}
      </div>

      {/* Environmental Alert Matrix (Section 12) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-base text-slate-900">Active Environmental Alerts Matrix</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-extrabold bg-rose-100 text-rose-800">
            {alerts.length} Monitored Flags
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Site / Region</th>
                <th className="py-3 px-3">Parameter Flag</th>
                <th className="py-3 px-3">Current</th>
                <th className="py-3 px-3">Trend %</th>
                <th className="py-3 px-3">Recommended Protocol Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        a.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : a.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{a.site_name}</td>
                  <td className="py-3 px-3 text-slate-700">{a.metric}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{a.current_value}</td>
                  <td className="py-3 px-3 font-bold text-rose-600">{a.change_pct}%</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs">{a.recommended_action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
