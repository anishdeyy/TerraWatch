import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    label?: string;
  };
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'slate';
  description?: string;
  badge?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  icon: Icon,
  color = 'emerald',
  description,
  badge
}) => {
  const colorSchemes = {
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-800',
      border: 'border-emerald-100'
    },
    blue: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-800',
      iconBg: 'bg-blue-100 text-blue-800',
      border: 'border-blue-100'
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-800',
      iconBg: 'bg-amber-100 text-amber-800',
      border: 'border-amber-200'
    },
    purple: {
      bg: 'bg-purple-50/80',
      text: 'text-purple-800',
      iconBg: 'bg-purple-100 text-purple-800',
      border: 'border-purple-100'
    },
    rose: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-800',
      iconBg: 'bg-rose-100 text-rose-800',
      border: 'border-rose-100'
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      iconBg: 'bg-slate-100 text-slate-800',
      border: 'border-slate-200'
    }
  };

  const scheme = colorSchemes[color];

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.iconBg} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {value !== undefined && value !== null ? value : '—'}
          </span>
          {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
        </div>
        {badge && <div>{badge}</div>}
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {trend.direction === 'up' && (
            <span className="flex items-center text-emerald-600 font-semibold gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +{trend.percentage}%
            </span>
          )}
          {trend.direction === 'down' && (
            <span className="flex items-center text-rose-600 font-semibold gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              -{trend.percentage}%
            </span>
          )}
          {trend.direction === 'neutral' && (
            <span className="flex items-center text-slate-500 font-semibold gap-0.5">
              <Minus className="w-3.5 h-3.5" />
              0.0%
            </span>
          )}
          <span className="text-slate-400">{trend.label || 'vs last cycle'}</span>
        </div>
      )}

      {description && (
        <p className="mt-2 text-[11px] text-slate-400 line-clamp-1">{description}</p>
      )}
    </div>
  );
};
