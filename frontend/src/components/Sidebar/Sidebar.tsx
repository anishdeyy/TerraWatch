import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  LineChart,
  Sparkles,
  FileText,
  Compass,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldCheck,
  CreditCard,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse
}) => {
  const { isAdmin } = useAuth();

  // Primary streamlined navigation (Requirement 56)
  const primaryNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Map Explorer', path: '/map', icon: Compass },
    { label: 'Analytics', path: '/analytics', icon: LineChart },
    { label: 'AI Insights', path: '/ai-insights', icon: Sparkles, badge: 'AI' },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <aside
      className={`relative bg-white border-r border-slate-200 transition-all duration-200 flex flex-col justify-between ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      <div className="py-5 px-3 space-y-1">
        <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {!collapsed && 'Platform Modules'}
        </div>

        {primaryNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border-r-4 border-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
            {!collapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Secondary Bottom Links & Collapse button */}
      <div className="p-3 border-t border-slate-200 space-y-1">
        {isAdmin && !collapsed && (
          <>
            <NavLink
              to="/admin/data-sources"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Data Sources</span>
            </NavLink>
            <NavLink
              to="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </NavLink>
          </>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium gap-2 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
