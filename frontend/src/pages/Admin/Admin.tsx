import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, FolderKanban, MapPin, IndianRupee, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { MetricCard } from '../../components/MetricCard/MetricCard';

export const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const [sRes, uRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);
        setStats(sRes.data);
        setUsers(uRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading admin console telemetry...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>Master Governance Console</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin System Telemetry</h1>
          <p className="text-xs text-slate-500">
            Real-time subscriber metrics, cumulative Razorpay revenues, and platform usage
          </p>
        </div>
      </div>

      {/* Admin Stat Cards (Section 32) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Platform Users"
          value={stats.total_users}
          unit="Registered"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Total Projects"
          value={stats.total_projects}
          unit="Active"
          icon={FolderKanban}
          color="emerald"
        />
        <MetricCard
          title="Monitored Sites"
          value={stats.total_sites}
          unit="Polygons"
          icon={MapPin}
          color="emerald"
        />
        <MetricCard
          title="Premium Customers"
          value={stats.premium_customers}
          unit="Active Paid"
          icon={Sparkles}
          color="purple"
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${stats.revenue_inr}`}
          unit="Razorpay INR"
          icon={IndianRupee}
          color="emerald"
        />
        <MetricCard
          title="Generated Reports"
          value={stats.ai_reports_generated}
          unit="PDFs"
          icon={FileText}
          color="slate"
        />
        <MetricCard
          title="Flagged Alerts"
          value={stats.active_environmental_alerts}
          unit="Active"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">User Access & Subscription Roster</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Plan Tier</th>
                <th className="py-3 px-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.subscription_tier === 'ENTERPRISE'
                        ? 'bg-purple-100 text-purple-800'
                        : u.subscription_tier === 'PROFESSIONAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.subscription_tier}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
