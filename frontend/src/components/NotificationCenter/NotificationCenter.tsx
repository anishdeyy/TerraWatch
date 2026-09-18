import React from 'react';
import { AlertItem } from '../../types';
import { AlertTriangle, Bell, CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onSelectAlertSite?: (siteId: number) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectAlertSite
}) => {
  if (!isOpen) return null;

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'border-rose-500 bg-rose-50 text-rose-800';
      case 'HIGH':
        return 'border-amber-500 bg-amber-50 text-amber-800';
      case 'MEDIUM':
        return 'border-blue-500 bg-blue-50 text-blue-800';
      default:
        return 'border-slate-300 bg-slate-50 text-slate-800';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-800" />
          <h3 className="font-bold text-base text-slate-900">Alert Center</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">
            {alerts.length}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No active alerts detected. All telemetry within nominal parameters.
          </div>
        ) : (
          alerts.map(a => (
            <div
              key={a.id}
              onClick={() => {
                onSelectAlertSite?.(a.site_id);
                onClose();
              }}
              className={`p-3.5 rounded-xl border-l-4 border shadow-xs cursor-pointer hover:shadow-md transition-shadow ${getSeverityStyle(a.severity)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs uppercase tracking-wider">{a.severity}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(a.timestamp).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-extrabold text-xs text-slate-900 mb-1">{a.site_name}</h4>
              <p className="text-xs text-slate-600 mb-2">{a.metric}: Current {a.current_value} ({a.change_pct > 0 ? `+${a.change_pct}%` : `${a.change_pct}%`})</p>
              <div className="p-2 bg-white/80 rounded-lg text-[11px] text-slate-700 leading-tight">
                <b>Action:</b> {a.recommended_action}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
        Continuous satellite & sensor monitoring
      </div>
    </div>
  );
};
