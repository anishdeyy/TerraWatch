import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export const DataModeToggle: React.FC = () => {
  const [mode, setMode] = useState<'demo' | 'real'>(() => {
    return (localStorage.getItem('terrawatch_data_mode') as 'demo' | 'real') || 'demo';
  });

  const handleToggle = (newMode: 'demo' | 'real') => {
    setMode(newMode);
    localStorage.setItem('terrawatch_data_mode', newMode);
    window.dispatchEvent(new CustomEvent('terrawatch:datamode_change', { detail: { mode: newMode } }));
  };

  return (
    <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
      <button
        onClick={() => handleToggle('demo')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          mode === 'demo'
            ? 'bg-white text-emerald-800 shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Demo Mode: Displays calibrated synthetic models alongside observed telemetry"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
        <span>Demo Mode</span>
      </button>

      <button
        onClick={() => handleToggle('real')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          mode === 'real'
            ? 'bg-emerald-800 text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Real Data Mode: Restricts views exclusively to verified observations and scientific reference studies"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-300" />
        <span>Real Data Only</span>
      </button>
    </div>
  );
};
