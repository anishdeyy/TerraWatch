import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-3 w-24 bg-slate-200 rounded"></div>
      <div className="h-8 w-8 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="h-7 w-32 bg-slate-200 rounded mb-3"></div>
    <div className="h-3 w-40 bg-slate-100 rounded"></div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div className="h-4 w-40 bg-slate-200 rounded"></div>
      <div className="h-6 w-32 bg-slate-200 rounded"></div>
    </div>
    <div className="h-64 w-full bg-slate-100 rounded-xl"></div>
  </div>
);

export const MapSkeleton: React.FC<{ height?: string }> = ({ height = '500px' }) => (
  <div
    style={{ height }}
    className="w-full bg-slate-800 rounded-2xl border border-slate-700 animate-pulse flex items-center justify-center text-slate-500 text-sm"
  >
    Loading geospatial polygon layers...
  </div>
);
