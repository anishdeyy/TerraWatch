import React from 'react';
import { User as UserIcon, Shield, Mail, Calendar, Sparkles, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Profile & Workspace</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your environmental intelligence permissions, role credentials, and active subscription tier
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Assigned Platform Role</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span className="font-extrabold text-sm text-slate-900">{user?.role}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Authorized to view projects, draw site polygons, run AI synthesis, and export verified reports.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1">Subscription Tier</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span className="font-black text-sm text-emerald-950">{user?.subscription_tier} PLAN</span>
              </div>
              <Link
                to="/pricing"
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Change Plan
              </Link>
            </div>
            <p className="text-[11px] text-emerald-800 mt-1">
              Full access to Gemini telemetry interpretation and Razorpay billing management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
