import React, { useState } from 'react';
import { Sparkles, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { PackageItem } from '../../types';
import { PaymentModal } from '../../components/PaymentModal/PaymentModal';
import { useAuth } from '../../context/AuthContext';

export const Pricing: React.FC = () => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  const packages: PackageItem[] = [
    {
      id: 'explorer',
      name: 'Explorer',
      price_inr: 0,
      price_paise: 0,
      popular: false,
      features: [
        'Project Dashboard & Portfolio Overview',
        'Interactive Mapbox GIS Explorer',
        'Basic Site Polygon Visualization',
        'Standard Metric Cards (NDVI, Temp, Rainfall)',
        'Community Support'
      ],
      limits: { max_projects: 3, max_sites: 5, ai_insights: false, pdf_reports: false }
    },
    {
      id: 'professional',
      name: 'Professional',
      price_inr: 499,
      price_paise: 49900,
      popular: true,
      features: [
        'Everything in Explorer',
        '✨ Gemini AI Site Summaries & Findings',
        'Automated Environmental Anomaly Explanations',
        'Cross-Variable Recommendation Engine',
        '12-Month Temporal Chart.js Trajectories',
        'Verified PDF Environmental Report Generation',
        'Real-Time Environmental Alerts & Action Guides'
      ],
      limits: { max_projects: 15, max_sites: 50, ai_insights: true, pdf_reports: true }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price_inr: 1499,
      price_paise: 149900,
      popular: false,
      features: [
        'Everything in Professional',
        'Unlimited Monitored Projects & Polygons',
        'Gemini AI Project-Level Executive Dossiers',
        'Natural Language "Ask TerraWatch AI" Interface',
        'Multi-Site Comparative Benchmarking',
        'Priority PostGIS Spatial Data Ingestion & Export',
        'Dedicated Ecological Verification Support'
      ],
      limits: { max_projects: -1, max_sites: -1, ai_insights: true, pdf_reports: true }
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Flexible Environmental Analytics Tiers</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Invest in Verifiable Environmental Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          From basic perimeter monitoring to AI-powered multi-strata carbon accounting. Backed by Razorpay secure checkout.
        </p>
      </div>

      {/* Pricing Cards Grid (Section 21) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {packages.map((pkg) => {
          const isCurrentTier =
            (pkg.id === 'explorer' && user?.subscription_tier === 'FREE') ||
            (pkg.id === 'professional' && user?.subscription_tier === 'PROFESSIONAL') ||
            (pkg.id === 'enterprise' && user?.subscription_tier === 'ENTERPRISE');

          return (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all ${
                pkg.popular
                  ? 'bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white shadow-2xl border-2 border-emerald-500/50 scale-105'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-xs'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                  Most Popular for Carbon Projects
                </span>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-xl font-black">{pkg.name}</h3>
                  {isCurrentTier && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active Plan
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-black">₹{pkg.price_inr}</span>
                  <span className={`text-xs ${pkg.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                    / month (demo)
                  </span>
                </div>

                <p className={`text-xs mb-6 ${pkg.popular ? 'text-slate-300' : 'text-slate-500'}`}>
                  {pkg.id === 'explorer'
                    ? 'Free forever for community and basic site verification.'
                    : pkg.id === 'professional'
                    ? 'Engineered for carbon credit developers and environmental analysts.'
                    : 'Unrestricted enterprise scale for multi-regional institutional funds.'}
                </p>

                <div className="space-y-3 mb-8">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${pkg.popular ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Included Modules
                  </span>
                  {pkg.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.popular ? 'text-emerald-400' : 'text-emerald-700'}`} />
                      <span className={pkg.popular ? 'text-slate-200' : 'text-slate-700'}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 hover:scale-105'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white hover:scale-105'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isCurrentTier ? 'Re-activate Tier' : `Select ${pkg.name}`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Razorpay Test Modal (Section 22) */}
      {selectedPackage && (
        <PaymentModal
          packageItem={selectedPackage}
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onSuccess={() => setSelectedPackage(null)}
        />
      )}
    </div>
  );
};
