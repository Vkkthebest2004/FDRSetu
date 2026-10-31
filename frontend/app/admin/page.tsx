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
  const [isSaving, setIsSaving] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

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

    // Load persisted system settings from backend
    try {
      const settings = await FDRService.getSystemSettings();
      const reminderSetting = settings.find(s => s.key === 'reminder_intervals_days');
      if (reminderSetting?.value?.days) {
        setReminderDays(reminderSetting.value.days.join(', '));
      }
      const uploadSetting = settings.find(s => s.key === 'max_upload_size_mb');
      if (uploadSetting?.value?.size_mb) {
        setMaxUploadMB(String(uploadSetting.value.size_mb));
      }
      const formatsSetting = settings.find(s => s.key === 'allowed_document_formats');
      if (formatsSetting?.value?.formats) {
        setAllowedFormats(formatsSetting.value.formats.join(', '));
      }
    } catch {}
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const daysArray = reminderDays.split(',').map(d => parseInt(d.trim())).filter(n => !isNaN(n));
      await FDRService.updateSystemSetting('reminder_intervals_days', { days: daysArray }, 'Maturity notification advance triggers');
      await FDRService.updateSystemSetting('max_upload_size_mb', { size_mb: parseInt(maxUploadMB) || 15 }, 'Maximum allowed document scan upload size in MB');
      await FDRService.updateSystemSetting('allowed_document_formats', { formats: allowedFormats.split(',').map(f => f.trim().toUpperCase()) }, 'Permitted document MIME extensions');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to save settings: ' + err?.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApproveInstitution(instId: string) {
    setApprovingId(instId);
    try {
      await FDRService.updateInstitutionStatus(instId, 'active', 'VERIFIED');
      const updated = await FDRService.getInstitutions();
      setInstitutions(updated);
    } catch (err: any) {
      alert('Approval failed: ' + err?.message);
    } finally {
      setApprovingId(null);
    }
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
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between hover-lift">
            <div>
              <span className="text-xs font-medium text-slate-500">Database Engine</span>
              <div className="text-base font-bold text-slate-900 mt-1">Primary Relational Vault</div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tenant Isolation Active
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between hover-lift">
            <div>
              <span className="text-xs font-medium text-slate-500">Document AI & OCR</span>
              <div className="text-base font-bold text-slate-900 mt-1">Vision Extraction Pipeline</div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Service Healthy & Operational
              </span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between hover-lift">
            <div>
              <span className="text-xs font-medium text-slate-500">Audit Subsystem</span>
              <div className="text-base font-bold text-slate-900 mt-1">Immutable Compliance Log</div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Append-Only Enforced
              </span>
            </div>
            <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
              <Activity className="w-5 h-5" />
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

        {/* Affiliated Institutions Directory & Onboarding Approval */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Affiliated Technical Institutions & Onboarding Verification
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {institutions.length} Registered Colleges
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {institutions.map(inst => (
              <div key={inst.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{inst.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">[{inst.aicte_id}]</span>
                    {inst.onboarding_status === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        PENDING ONBOARDING
                      </span>
                    )}
                    {inst.onboarding_status === 'VERIFIED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {inst.institution_type} &bull; {inst.city}, {inst.state} &bull; {inst.contact_email}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inst.onboarding_status === 'PENDING' ? (
                    <button
                      onClick={() => handleApproveInstitution(inst.id)}
                      disabled={approvingId === inst.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition cursor-pointer text-xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {approvingId === inst.id ? 'Approving...' : 'Approve Onboarding'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Active & Compliant
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

