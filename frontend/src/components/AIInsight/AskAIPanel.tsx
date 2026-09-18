import React, { useState } from 'react';
import { Send, Sparkles, Loader2, HelpCircle, MapPin, Tag } from 'lucide-react';
import { AskAIResponse } from '../../types';
import { aiService } from '../../services/aiService';

export const AskAIPanel: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskAIResponse | null>(null);

  const sampleQuestions = [
    'Which site has the highest carbon stock in our portfolio?',
    'Which sites have elevated water stress above 60%?',
    'Identify the site with the greatest biodiversity species richness.'
  ];

  const handleAsk = async (qText?: string) => {
    const q = qText || question;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await aiService.askTerraWatchAI(q);
      setResponse(res);
      if (qText) setQuestion(qText);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Ask TerraWatch AI</h3>
          <p className="text-xs text-slate-500">Query site telemetry, carbon reserves, and risk metrics using natural language</p>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleAsk(q)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 transition-colors text-left flex items-center gap-1.5"
          >
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask anything about environmental metrics across projects..."
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Inquire</span>
        </button>
      </div>

      {/* AI Response Display */}
      {response && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-900 text-white animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Evidence-Grounded Response
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Confidence: {response.confidence}
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed mb-4">{response.answer}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-800 text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Referenced Sites: <b>{response.referenced_sites.join(', ') || 'Portfolio Aggregate'}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>Metrics Considered: {response.key_metrics_considered.join(', ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
