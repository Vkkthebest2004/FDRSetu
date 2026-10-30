import React from 'react';
import { Shield } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
      {/* Top National Tricolor Shimmer Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#FF9933] via-white to-[#138808] shimmer-bar" />

      {/* Center Branded Animated Loader */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer Orbiting Ring */}
        <div className="w-28 h-28 rounded-full border-2 border-dashed border-amber-400/40 animate-spin-slow" />
        
        {/* Counter Orbiting Ring */}
        <div className="absolute w-20 h-20 rounded-full border-2 border-dotted border-blue-400/60 animate-spin-reverse" />

        {/* Central Glowing Seal */}
        <div className="absolute w-14 h-14 rounded-2xl bg-[#0f294a] border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-xl shadow-blue-900/50">
          <Shield className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      {/* Typography */}
      <div className="text-center space-y-2 px-4 max-w-md">
        <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
          अखिल भारतीय तकनीकी शिक्षा परिषद
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
          AICTE Security Deposit & FDR Portal
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Establishing encrypted institutional session & verifying RLS policies...
        </p>

        {/* Indeterminate Progress Bar */}
        <div className="w-64 mx-auto mt-6 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
          <div className="h-full bg-linear-to-r from-amber-400 via-blue-400 to-emerald-400 rounded-full animate-progress-indeterminate" />
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="absolute bottom-6 text-center text-[11px] text-slate-500 font-mono">
        Ministry of Education · Govt. of India · NIC Compliant Security
      </div>
    </div>
  );
}

