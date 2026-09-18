import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Activity, ShieldAlert, Sparkles } from 'lucide-react';
import { Site } from '../../types';

interface SiteCardProps {
  site: Site;
  healthScore?: number;
}

export const SiteCard: React.FC<SiteCardProps> = ({ site, healthScore = 74 }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'MONITORING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AT_RISK':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>{site.latitude.toFixed(2)}°N, {site.longitude.toFixed(2)}°E</span>
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(site.status)}`}>
            {site.status}
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">{site.name}</h4>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{site.description}</p>
      </div>

      <div>
        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl mb-3 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Area</span>
            <span className="font-bold text-slate-800">{site.area_hectares} ha</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Health Index</span>
            <span className={`font-extrabold ${healthScore >= 70 ? 'text-emerald-700' : healthScore >= 50 ? 'text-amber-700' : 'text-rose-700'}`}>
              {healthScore} / 100
            </span>
          </div>
        </div>

        <Link
          to={`/sites/${site.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
        >
          <span>View Site Telemetry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
