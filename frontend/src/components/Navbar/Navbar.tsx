import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  Bell,
  Search,
  Sparkles,
  User as UserIcon,
  LogOut,
  Shield,
  CreditCard,
  ChevronDown,
  Layers,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataModeToggle } from '../Common/DataModeToggle';

interface NavbarProps {
  onOpenCommand?: () => void;
  onOpenNotifications?: () => void;
  unreadAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommand,
  onOpenNotifications,
  unreadAlertsCount = 3
}) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                  Terra<span className="text-emerald-700">Watch</span>
                </span>
                <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500 hidden sm:inline-block">
                  Geospatial Environmental Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Search bar & Command Palette Trigger */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button
              onClick={onOpenCommand}
              className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-sm text-slate-500 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search projects, sites, coordinates...</span>
              </div>
              <kbd className="px-2 py-0.5 text-xs font-semibold text-slate-600 bg-white rounded border border-slate-300 shadow-xs">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Navigation & Profile */}
          <div className="flex items-center gap-3">
            {/* Environmental Data Mode Toggle (Observed vs Calibrated Synthetic) */}
            <div className="hidden lg:block">
              <DataModeToggle />
            </div>

            {/* Quick Pricing / Upgrade pill */}
            <Link
              to="/pricing"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                user?.subscription_tier === 'ENTERPRISE'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : user?.subscription_tier === 'PROFESSIONAL'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {user?.subscription_tier === 'ENTERPRISE'
                  ? 'Enterprise'
                  : user?.subscription_tier === 'PROFESSIONAL'
                  ? 'Pro Active'
                  : 'Upgrade Plan'}
              </span>
            </Link>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Environmental Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {user.role.toLowerCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {user.subscription_tier} Tier
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Account Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      Billing & Orders
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors font-medium"
                        >
                          <Shield className="w-4 h-4 text-purple-500" />
                          Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/data-sources"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50 transition-colors font-medium"
                        >
                          <Database className="w-4 h-4 text-emerald-600" />
                          Data Sources Registry
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
