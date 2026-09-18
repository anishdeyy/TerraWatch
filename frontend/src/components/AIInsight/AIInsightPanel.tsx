import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Loader2, Clock } from 'lucide-react';
import { AISiteSummary, RecommendationResponse, AnomalyExplanationResponse } from '../../types';
import { aiService } from '../../services/aiService';

interface AIInsightPanelProps {
  siteId: number;
  siteName: string;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ siteId, siteName }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'recommendations' | 'anomaly'>('summary');
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<AISiteSummary | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [anomaly, setAnomaly] = useState<AnomalyExplanationResponse | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await aiService.getSiteSummary(siteId);
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await aiService.getRecommendations(siteId);
      setRecommendations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnomaly = async () => {
    setLoading(true);
    try {
      const data = await aiService.getAnomalyExplanation(siteId, 'ndvi', 16.5);
      setAnomaly(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight text-white">TERRAWATCH AI</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Evidence-Grounded
              </span>
            </div>
            <p className="text-xs text-slate-300">Environmental Intelligence Analysis for {siteName}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto text-xs">
          <button
            onClick={() => {
              setActiveTab('summary');
              if (!summary) fetchSummary();
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'summary' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Site Summary
          </button>
          <button
            onClick={() => {
              setActiveTab('recommendations');
              if (!recommendations) fetchRecommendations();
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'recommendations' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => {
              setActiveTab('anomaly');
              if (!anomaly) fetchAnomaly();
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'anomaly' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Anomaly Explainer
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-5">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs text-slate-300 font-medium">
              Consulting Gemini environmental synthesis model...
            </span>
          </div>
        ) : activeTab === 'summary' ? (
          summary ? (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Executive Diagnosis
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-200">
                    Priority: <b className="text-emerald-400">{summary.priority}</b>
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{summary.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Findings */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Key Findings
                  </h4>
                  <ul className="space-y-2">
                    {summary.key_findings.map((f, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Risk Factors
                  </h4>
                  <ul className="space-y-2">
                    {summary.risk_factors.map((r, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5">
                  Priority Recommended Actions
                </h4>
                <div className="space-y-2">
                  {summary.recommended_actions.map((act, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-slate-300 mb-3">
                No active synthesis loaded for this site. Click below to run AI inference.
              </p>
              <button
                onClick={fetchSummary}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>✨ Generate AI Site Analysis</span>
              </button>
            </div>
          )
        ) : activeTab === 'recommendations' ? (
          recommendations ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                {recommendations.analysis}
              </p>
              <div className="space-y-3">
                {recommendations.recommendations.map((rec, i) => (
                  <div key={i} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-sm text-emerald-300">{rec.recommendation}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rec.time_horizon}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2.5">{rec.why_it_may_help}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
                      <div>
                        <span className="text-slate-500">Expected Direction:</span>{' '}
                        <span className="text-emerald-400 font-semibold">{rec.expected_direction_of_change}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Confidence:</span>{' '}
                        <span className="text-slate-200">{rec.confidence}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <button
                onClick={fetchRecommendations}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Cross-Variable Recommendations</span>
              </button>
            </div>
          )
        ) : (
          anomaly ? (
            <div className="space-y-4">
              <div className="bg-rose-950/40 border border-rose-800/40 rounded-2xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1">
                  Detected Anomaly
                </span>
                <p className="text-sm font-semibold text-rose-200">{anomaly.anomaly_detected}</p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  Hypothesized Contributing Factors (Evidence-Grounded)
                </h4>
                <ul className="space-y-2">
                  {anomaly.hypotheses.map((h, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  Recommended Ground Verification
                </h4>
                <ul className="space-y-2">
                  {anomaly.recommended_ground_investigation.map((v, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <button
                onClick={fetchAnomaly}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explain Observed Metric Anomaly</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* Footer Grounding Statement */}
      <div className="mt-5 pt-3 border-t border-emerald-900/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strictly grounded in site telemetry — no fabricated measurements</span>
        </span>
        <span className="text-slate-500 hidden sm:inline">Model: Gemini 1.5/2.0 Flash</span>
      </div>
    </div>
  );
};
