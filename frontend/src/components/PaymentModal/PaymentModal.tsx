import React, { useState } from 'react';
import { Sparkles, Check, ShieldCheck, X, Loader2, AlertCircle } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { PackageItem } from '../../types';


interface PaymentModalProps {
  packageItem: PackageItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  packageItem,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create order on backend
      const orderData = await paymentService.createOrder(packageItem.id);

      // If package is free Explorer, it activates immediately
      if (orderData.amount === 0) {
        await refreshUser();
        setSuccessMsg("Explorer Tier Activated!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
        return;
      }

      // 2. Configure Razorpay Checkout options
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TerraWatch Platform',
        description: `Upgrade to ${packageItem.name} Tier`,
        order_id: orderData.order_id,
        prefill: {
          name: user?.name || 'Environmental Analyst',
          email: user?.email || 'admin@demo.terrawatch.earth',
        },
        theme: {
          color: '#1b4332',
        },
        handler: async function (response: any) {
          // 3. Verify signature on backend
          try {
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              package_id: packageItem.id
            });
            await refreshUser();
            setSuccessMsg(verifyRes.message || "Payment Verified! Features Activated.");
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 1200);
          } catch (verErr: any) {
            setError(verErr.response?.data?.detail || "Payment signature verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      // 4. Open Razorpay modal if window.Razorpay exists, else simulate test verification
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', function (resp: any) {
          setError(resp.error.description || 'Payment Failed');
          setLoading(false);
        });
      } else {
        // Fallback test mode simulation if network blocks checkout.js
        console.warn("Razorpay script offline. Executing simulated verification.");
        const verifyRes = await paymentService.verifyPayment({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'mock_sig_valid',
          package_id: packageItem.id
        });
        await refreshUser();
        setSuccessMsg(verifyRes.message);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{packageItem.name} Tier</h3>
            <p className="text-xs text-slate-500">Secure Razorpay Subscription</p>
          </div>
        </div>

        <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-600">Total Investment:</span>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-950">₹{packageItem.price_inr}</span>
            <span className="text-xs text-slate-500 font-medium"> / month</span>
          </div>
        </div>

        {/* Feature inclusions */}
        <div className="space-y-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Unlocked Capabilities
          </span>
          {packageItem.features.map((feat, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing with Razorpay...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Pay ₹{packageItem.price_inr} & Unlock</span>
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          Razorpay Test Mode Enabled · 256-Bit SSL Encrypted
        </p>
      </div>
    </div>
  );
};
