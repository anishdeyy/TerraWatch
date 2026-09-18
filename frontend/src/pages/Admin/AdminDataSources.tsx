import React, { useEffect, useState } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
  Loader2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { DataSource, IngestionRun, DataQualitySummary } from '../../types';
import { dataSourceService } from '../../services/dataSourceService';

export const AdminDataSources: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [quality, setQuality] = useState<DataQualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggeringSource, setTriggeringSource] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [srcList, runList, qualSummary] = await Promise.all([
        dataSourceService.getDataSources(),
        dataSourceService.getIngestionRuns(15),
        dataSourceService.getDataQualitySummary()
      ]);
      setSources(srcList);
      setRuns(runList);
      setQuality(qualSummary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerIngestion = async (sourceId: string) => {
    setTriggeringSource(sourceId);
    setMessage(null);
    try {
      const res = await dataSourceService.triggerIngestion(sourceId);
      setMessage(`Ingestion pipeline for '${sourceId}' executed successfully.`);
      await loadData();
    } catch (e: any) {
      console.error(e);
      setMessage(`Ingestion error: ${e.response?.data?.detail || e.message}`);
    } finally {
      setTriggeringSource(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span>Multi-Tier Environmental Data Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Sources & Provenance Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage registered geospatial datasets, scientific calibration studies, climate APIs, and ingestion pipelines
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Registry</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Data Quality Overview Cards */}
      {quality && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Observations</span>
            <span className="text-xl font-black text-slate-900">{quality.total_observations}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Database Records</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-teal-700 block mb-1">Spatially Matched</span>
            <span className="text-xl font-black text-teal-900">{quality.spatially_matched}</span>
            <span className="text-[10px] text-teal-600 block mt-0.5">ST_Within Site Overlap</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Scientific Reference</span>
            <span className="text-xl font-black text-emerald-900">{quality.regional_references}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">PMC7417561 & Mendeley</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">Active Sources</span>
            <span className="text-xl font-black text-amber-900">{quality.active_sources}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Data Providers</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-purple-700 block mb-1">Synthetic Records</span>
            <span className="text-xl font-black text-purple-900">{quality.synthetic_records}</span>
            <span className="text-[10px] text-purple-600 block mt-0.5">Demo Calibrated</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Latest Ingestion</span>
            <span className="text-xs font-bold text-slate-800 block mt-1">
              {quality.latest_ingestion_time ? new Date(quality.latest_ingestion_time).toLocaleTimeString() : 'Current'}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block">All Pipelines Healthy</span>
          </div>
        </div>
      )}

      {/* Registered Data Sources Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Registered Environmental Data Sources</h2>
            <p className="text-xs text-slate-500">Tier 1 core datasets, Tier 2 calibration literature, and Tier 3 climate APIs</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {sources.length} Configured Providers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Source / Dataset</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Spatial Level</th>
                <th className="py-3 px-4">Records</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {sources.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{s.dataset_identifier || s.id}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{s.provider}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {s.source_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{s.spatial_resolution || 'Site / Region'}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.record_count}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{s.active ? 'Active' : 'Inactive'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg inline-block transition-colors"
                        title="View Primary Dataset"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {s.source_type !== 'API' && (
                      <button
                        onClick={() => handleTriggerIngestion(s.id)}
                        disabled={triggeringSource === s.id}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                      >
                        {triggeringSource === s.id ? (
                          <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                        ) : null}
                        <span>Ingest</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingestion Run History */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900">Recent Ingestion Pipelines Run History</h2>
          <p className="text-xs text-slate-500">Audit logs of data imports, validation checks, and records processed</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Run ID</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Rows Processed</th>
                <th className="py-3 px-4">Rows Inserted</th>
                <th className="py-3 px-4">Warnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {runs.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">#{r.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.source_name || r.source_id}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(r.started_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{r.rows_processed}</td>
                  <td className="py-3 px-4 font-bold text-emerald-800">+{r.rows_inserted}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {r.warnings && r.warnings.length > 0 ? r.warnings.length : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
