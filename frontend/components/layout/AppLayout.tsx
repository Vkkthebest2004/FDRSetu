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
      <Suspense fallback={<header className="h-16 bg-[#0f294a] border-b border-[#1b3d6b]" />}>
        <Navbar />
      </Suspense>
      <div className="flex-1 flex overflow-hidden">
        <Suspense fallback={<aside className="w-64 bg-slate-900 border-r border-slate-800" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading view...</div>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
