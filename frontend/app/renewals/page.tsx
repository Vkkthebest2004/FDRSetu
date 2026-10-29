'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  RefreshCw, 
  ArrowRight, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FDRService } from '@/lib/supabase/service';
import { RenewalItem, FDRRecord, Profile } from '@/lib/types/database';

function RenewalsContent() {
  const searchParams = useSearchParams();
  const preselectedFdrId = searchParams.get('fdrId');

  const [renewals, setRenewals] = useState<RenewalItem[]>([]);
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Form State
  const [showModal, setShowModal] = useState(!!preselectedFdrId);
  const [originalFdrId, setOriginalFdrId] = useState(preselectedFdrId || '');
  const [replacementFdrId, setReplacementFdrId] = useState('');
  const [reason, setReason] = useState('Tenure completed for initial 5-year security deposit. Renewed for extended period per AICTE norms.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const user = await FDRService.getCurrentUser();
    setCurrentUser(user);

    const renewalList = await FDRService.getRenewals();
    setRenewals(renewalList);

    const fdrList = await FDRService.getFDRs();
    setFdrs(fdrList);

    if (fdrList.length > 0) {
      if (!originalFdrId) setOriginalFdrId(fdrList[0].id);
      if (fdrList.length > 1) setReplacementFdrId(fdrList[1].id);
    }
  }

  async function handleLinkRenewal(e: React.FormEvent) {
    e.preventDefault();
    if (!originalFdrId || !replacementFdrId) {
      setErrorMsg('Please select both the expiring original FDR and the replacement FDR.');
      return;
    }
    if (originalFdrId === replacementFdrId) {
      setErrorMsg('Original instrument and replacement instrument cannot be the same FDR.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await FDRService.createRenewal({
        original_fdr_id: originalFdrId,
        replacement_fdr_id: replacementFdrId,
        reason,
      });

      setSuccessMsg('Replacement instrument successfully linked!');
      setShowModal(false);
      const updated = await FDRService.getRenewals();
      setRenewals(updated);
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to link replacement instrument.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              FDR Renewals & Replacement Instruments
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Maintain continuity of technical institution security deposits across renewal tenures.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Link Replacement FDR
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal: Link Replacement Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  Link Replacement Instrument
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLinkRenewal} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Original / Predecessor FDR *
                  </label>
                  <select
                    value={originalFdrId}
                    onChange={e => setOriginalFdrId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  >
                    {fdrs.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.fdr_number} — {f.bank_name} (₹ {Number(f.amount).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Replacement Instrument *
                  </label>
                  <select
                    value={replacementFdrId}
                    onChange={e => setReplacementFdrId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  >
                    {fdrs.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.fdr_number} — {f.bank_name} (₹ {Number(f.amount).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    If the new instrument is not registered yet, submit it via the FDR Submission Wizard first.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Administrative Reason for Renewal / Extension *
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                  >
                    {isSubmitting ? 'Linking...' : 'Confirm Linkage'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Renewals Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recorded Replacements & Continuations
            </h2>
            <span className="text-xs text-slate-500">{renewals.length} chains established</span>
          </div>

          <div className="divide-y divide-slate-100">
            {renewals.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No renewal records yet.
              </div>
            ) : (
              renewals.map(r => (
                <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-slate-50/50 transition">
                  {/* Original vs Replacement Flow */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Predecessor (Original)</span>
                      <Link href={`/fdrs/${r.original_fdr_id}`} className="font-mono font-bold text-blue-700 hover:underline">
                        {r.original_fdr?.fdr_number}
                      </Link>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {r.original_fdr?.bank_name} · ₹ {Number(r.original_fdr?.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />

                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                      <span className="text-[10px] text-emerald-600 block">Successor (Replacement)</span>
                      <Link href={`/fdrs/${r.replacement_fdr_id}`} className="font-mono font-bold text-emerald-800 hover:underline">
                        {r.replacement_fdr?.fdr_number}
                      </Link>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        {r.replacement_fdr?.bank_name} · ₹ {Number(r.replacement_fdr?.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Metadata and Reason */}
                  <div className="flex-1 md:px-6">
                    <div className="text-slate-500 text-[11px]">Reason for Renewal:</div>
                    <p className="text-slate-800 font-medium line-clamp-2 mt-0.5">{r.reason}</p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Submitted on: {r.submission_date}
                    </div>
                  </div>

                  <div>
                    <StatusBadge status={r.status} type="lifecycle" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
}

export default function RenewalsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading renewal records...</div>}>
        <RenewalsContent />
      </Suspense>
    </AppLayout>
  );
}
