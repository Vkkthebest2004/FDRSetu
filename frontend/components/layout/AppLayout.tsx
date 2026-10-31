'use client';

import React, { Suspense } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Blueprint v2.0 - Section 0.1, 65 & Section 9.1: Transparent Pilot Simulation Notice */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-[11px] py-1 px-4 text-center flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-amber-300">FDRSetu Blueprint v2.0 Sandbox:</span>
        <span className="text-slate-300">Pilot simulation environment. AI extractions provide assistive evidence; financial decisions require authorized officer review.</span>
      </div>
      <Suspense fallback={<header className="h-16 bg-[#0f294a] border-b border-[#1b3d6b]" />}>
        <Navbar />
      </Suspense>
      <div className="flex-1 flex overflow-hidden">
        <Suspense fallback={<aside className="w-64 bg-slate-900 border-r border-slate-800" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading view...</div>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
