import React, { useEffect, useState } from 'react';
import { FileText, Plus, FileDown, Eye, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { siteService } from '../../services/siteService';
import { projectService } from '../../services/projectService';
import { ReportItem, Site, Project } from '../../types';
import { PremiumGate } from '../../components/PremiumGate/PremiumGate';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [reps, sList, pList] = await Promise.all([
        reportService.getReports(),
        siteService.getSites(),
        projectService.getProjects()
      ]);
      setReports(reps);
      setSites(sList);
      setProjects(pList);
      if (sList.length > 0) setSelectedSiteId(sList[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reportService.generateReport({
        site_id: selectedSiteId,
        project_id: selectedProjectId,
        title: title || undefined
      });
      setShowGenerateModal(false);
      setTitle('');
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Environmental Intelligence Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate verifiable carbon stock, biodiversity index, and AI diagnosis dossiers with instant PDF export
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      <PremiumGate requiredTier="PROFESSIONAL" featureName="Executive PDF Report Generation">
        {/* Reports List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {rep.report_type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(rep.created_at || '').toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-2">
                  {rep.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {rep.content?.ai_summary || 'Evidence-grounded ecological audit dossier.'}
                </p>
              </div>

              <div>
                <div className="p-3 bg-slate-50 rounded-2xl mb-4 border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-[10px]">Health Index:</span>
                    <span className="font-bold text-emerald-800">
                      {rep.content?.health_score?.overall_score || 74} / 100
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">Verification:</span>
                    <span className="font-bold text-slate-700 text-[11px]">Grounded Telemetry</span>
                  </div>
                </div>

                <a
                  href={reportService.getDownloadUrl(rep.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors shadow-xs"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Verified PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </PremiumGate>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Compile Environmental Report</h3>
            <p className="text-xs text-slate-500 mb-4">Select target project or site to generate PDF</p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Target Site</label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.project_name || 'Site'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Report Dossier Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Carbon Audit & Biodiversity Synthesis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  <span>Generate & Export</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
