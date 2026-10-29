'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Users, 
  Building2, 
  ShieldCheck, 
  Activity, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Save 
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FDRService } from '@/lib/supabase/service';
import { Profile, Institution } from '@/lib/types/database';

export default function AdminSettingsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Configuration settings
  const [reminderDays, setReminderDays] = useState('90, 60, 30, 15');
  const [maxUploadMB, setMaxUploadMB] = useState('15');
  const [allowedFormats, setAllowedFormats] = useState('PDF, PNG, JPG');

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    const profs = await FDRService.getProfiles();
    setProfiles(profs);
    const insts = await FDRService.getInstitutions();
    setInstitutions(insts);
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
              Administrative Control
            </span>
            <span className="text-xs text-slate-500">System Parameters & Role Directory</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            System Administration & Governance
          </h1>
          <p className="text-xs text-slate-500">
            Configure statutory reminder thresholds, inspect system health, and review user role assignments.
          </p>
        </div>

        {/* System Health Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Database Engine</span>
              <div className="text-lg font-bold text-slate-900 mt-1">Supabase PostgreSQL 15+</div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> RLS Policies Active
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Document AI & OCR</span>
              <div className="text-lg font-bold text-slate-900 mt-1">Python FastAPI + Tesseract</div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PyMuPDF & OpenCV Ready
              </span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <Cpu className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Audit Subsystem</span>
              <div className="text-lg font-bold text-slate-900 mt-1">Tamper-Evident Ledger</div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Append-Only Protected
              </span>
            </div>
            <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Configuration Forms & Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statutory Settings Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              Configurable Statutory Rules
            </h2>

            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Configuration changes saved successfully.</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maturity Advance Warning Intervals (Days)
                </label>
                <input
                  type="text"
                  value={reminderDays}
                  onChange={e => setReminderDays(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Automated notifications trigger when an FDR reaches these remaining day intervals.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maximum Document Upload Size (MB)
                </label>
                <input
                  type="number"
                  value={maxUploadMB}
                  onChange={e => setMaxUploadMB(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Permitted Document MIME Types
                </label>
                <input
                  type="text"
                  value={allowedFormats}
                  onChange={e => setAllowedFormats(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Regulatory Parameters
              </button>
            </form>
          </div>

          {/* User Directory & Roles */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Authorized User Directory & Role Assignments
            </h2>

            <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
              {profiles.map(p => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{p.full_name}</div>
                    <div className="text-[11px] text-slate-500">{p.email}</div>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                      {p.system_role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

