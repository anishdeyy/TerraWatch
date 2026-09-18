import React, { useState } from 'react';
import { Database, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';

interface ProvenanceBadgeProps {
  sourceType?: string; // OBSERVED, REFERENCE, SYNTHETIC
  sourceName?: string;
  sourceUrl?: string;
  spatialLevel?: string; // SITE_OBSERVATION, SITE_OVERLAP, NEAREST_REFERENCE, STATE, COUNTRY, REFERENCE_RANGE
  confidence?: string; // HIGH, MEDIUM, LOW
  metricLabel?: string;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  sourceType = 'REFERENCE',
  sourceName = 'PMC7417561 Forest Carbon Study',
  sourceUrl,
  spatialLevel = 'REFERENCE_RANGE',
  confidence = 'HIGH',
  metricLabel,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Derive badge styling and shorthand tag
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let badgeText = sourceType;

  const sUpper = sourceName.toUpperCase();
  if (sUpper.includes('HWSD') || sUpper.includes('LANDSAT')) {
    badgeText = 'HWSD';
    badgeColor = 'bg-teal-50 text-teal-800 border-teal-300';
  } else if (sUpper.includes('OPEN-METEO') || sUpper.includes('METEO')) {
    badgeText = 'Open-Meteo';
    badgeColor = 'bg-sky-50 text-sky-800 border-sky-300';
  } else if (sUpper.includes('NASA') || sUpper.includes('POWER')) {
    badgeText = 'NASA POWER';
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-300';
  } else if (sUpper.includes('IUCN')) {
    badgeText = 'IUCN';
    badgeColor = 'bg-purple-50 text-purple-800 border-purple-300';
  } else if (sUpper.includes('INDIA') || sUpper.includes('DATA.GOV')) {
    badgeText = 'India Data Portal';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (sUpper.includes('PMC') || sUpper.includes('7417561')) {
    badgeText = 'PMC7417561';
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (sUpper.includes('RATNAGIRI') || sUpper.includes('MENDELEY')) {
    badgeText = 'Ratnagiri SOC';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (sourceType === 'SYNTHETIC') {
    badgeText = 'Synthetic';
    badgeColor = 'bg-slate-100 text-slate-600 border-slate-300';
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${badgeColor}`}
        title="View Data Provenance"
      >
        <span>[{badgeText}]</span>
      </button>

      {/* Popover Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl border border-slate-700 pointer-events-auto"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
            <span className="font-extrabold text-[11px] text-emerald-400 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Data Provenance
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
              {sourceType}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Source:</span>
              <span className="text-slate-200 font-medium">{sourceName}</span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Spatial Level:</span>
              <span className="font-semibold text-emerald-300">{spatialLevel.replace(/_/g, ' ')}</span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Confidence:</span>
              <span className={`font-bold ${confidence === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {confidence}
              </span>
            </div>

            {sourceUrl && (
              <div className="pt-1 border-t border-slate-800">
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-[10px] flex items-center gap-1 font-semibold underline"
                >
                  <span>Verify Primary Dataset</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
