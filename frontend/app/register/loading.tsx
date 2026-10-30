import React from 'react';
import { Building2 } from 'lucide-react';

export default function RegisterLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Top Tricolor Shimmer Strip */}
      <div className="h-1.5 w-full bg-linear-to-r from-[#FF9933] via-white to-[#138808] shimmer-bar" />

      {/* Header Placeholder */}
      <div className="bg-[#0b1e38] text-white py-3 px-4 border-b border-[#1b3d6b] flex justify-between items-center text-xs">
        <div className="w-40 h-4 bg-slate-700/60 rounded-md skeleton-pulse" />
        <div className="w-48 h-4 bg-slate-700/60 rounded-md skeleton-pulse" />
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center items-center">
        {/* Animated Emblem Loader */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600/40 animate-spin-slow" />
          <div className="absolute w-12 h-12 rounded-xl bg-[#0f294a] flex items-center justify-center text-emerald-400 shadow-md">
            <Building2 className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-2 mb-8">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Loading Institutional Registration Gateway
          </h2>
          <p className="text-xs text-slate-500">
            Preparing AICTE Approval Process Handbook (APH) Affiliation Form...
          </p>
        </div>

        {/* Skeleton Form Card */}
        <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="w-1/3 h-5 bg-slate-200 rounded-md skeleton-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-slate-100 rounded-xl skeleton-pulse" />
            <div className="h-10 bg-slate-100 rounded-xl skeleton-pulse" />
          </div>
          <div className="w-1/3 h-5 bg-slate-200 rounded-md skeleton-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-slate-100 rounded-xl skeleton-pulse" />
            <div className="h-10 bg-slate-100 rounded-xl skeleton-pulse" />
          </div>
          <div className="h-12 bg-slate-200 rounded-2xl skeleton-pulse mt-4" />
        </div>
      </div>
    </div>
  );
}
