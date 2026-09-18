import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, Lightbulb, Compass } from 'lucide-react';
import { AskAIPanel } from '../../components/AIInsight/AskAIPanel';
import { siteService } from '../../services/siteService';
import { aiService } from '../../services/aiService';
import { Site } from '../../types';
import { AIInsightPanel } from '../../components/AIInsight/AIInsightPanel';
import { PremiumGate } from '../../components/PremiumGate/PremiumGate';

export const AIInsights: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number>(1);

  useEffect(() => {
    const load = async () => {
      try {
        const sList = await siteService.getSites();
        setSites(sList);
        if (sList.length > 0) setSelectedSiteId(sList[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const selectedSite = sites.find(s => s.id === selectedSiteId);

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Google Gemini Server-Side Intelligence Layer</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Environmental Intelligence Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Evidence-grounded cross-variable synthesis, anomaly explanation hypotheses, and natural-language telemetry querying
        </p>
      </div>

      {/* Natural Language Ask TerraWatch AI */}
      <AskAIPanel />

      {/* Deep-Dive Site AI Panel */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-800" />
            <span>Site-Specific AI Synthesis & Recommendations</span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Target Site:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(parseInt(e.target.value, 10))}
              className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
              ))}
            </select>
          </div>
        </div>

        <PremiumGate requiredTier="PROFESSIONAL" featureName="Deep AI Site Synthesis">
          {selectedSite && (
            <AIInsightPanel siteId={selectedSite.id} siteName={selectedSite.name} />
          )}
        </PremiumGate>
      </div>
    </div>
  );
};
