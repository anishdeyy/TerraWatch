import React, { useEffect, useState } from 'react';
import { History, CreditCard, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { OrderItem } from '../../types';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await paymentService.getUserOrders();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchase & Subscription Invoices</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of premium package activations and Razorpay transactions
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span>No previous transaction records found. Select a package on the Pricing page to activate.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Invoice / Order ID</th>
                  <th className="py-3 px-4">Package Tier</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Razorpay Payment ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-800">{o.razorpay_order_id || `ORD-${o.id}`}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 capitalize">{o.package_type}</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ₹{(o.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          o.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{o.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{o.razorpay_payment_id || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
