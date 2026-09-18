import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionTier } from '../../types';

interface PremiumGateProps {
  requiredTier?: SubscriptionTier;
  featureName: string;
  children: ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  requiredTier = 'PROFESSIONAL',
  featureName,
  children
}) => {
  const { user, isProfessional, isEnterprise } = useAuth();

  const hasAccess =
    requiredTier === 'FREE' ||
    (requiredTier === 'PROFESSIONAL' && (isProfessional || isEnterprise)) ||
    (requiredTier === 'ENTERPRISE' && isEnterprise);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-8 text-center overflow-hidden shadow-xs">
      <div className="max-w-md mx-auto py-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="font-extrabold text-xl text-slate-900 mb-2">
          {featureName} Locked
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          This capability is reserved for {requiredTier} subscribers. Upgrade your workspace to access advanced geospatial telemetry, Gemini AI synthesis, and high-resolution PDF exports.
        </p>

        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Upgrade to {requiredTier} (from ₹499)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
