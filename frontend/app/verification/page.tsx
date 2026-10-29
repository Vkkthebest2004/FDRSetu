'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  FileText, 
  ArrowLeft,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FDRService } from '@/lib/supabase/service';
import { FDRRecord, DocumentExtraction, VerificationCase, Profile } from '@/lib/types/database';

function VerificationWorkbenchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedFdrId = searchParams.get('fdrId');

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [selectedFdr, setSelectedFdr] = useState<FDRRecord | null>(null);
  const [extraction, setExtraction] = useState<DocumentExtraction | null>(null);
  const [vcase, setVCase] = useState<VerificationCase | null>(null);

  // Form State for Decision
  const [observations, setObservations] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadWorkbench();
  }, [requestedFdrId]);

  async function loadWorkbench() {
    const user = await FDRService.getCurrentUser();
    setCurrentUser(user);

    const fdrList = await FDRService.getFDRs();
    setFdrs(fdrList);

    let active = fdrList[0];
    if (requestedFdrId) {
      const found = fdrList.find(f => f.id === requestedFdrId);
      if (found) active = found;
    }

    if (active) {
      setSelectedFdr(active);
      const ext = await FDRService.getExtractions(active.id);
      if (ext) setExtraction(ext);
      const vc = await FDRService.getVerificationCaseByFdrId(active.id);
      if (vc) {
        setVCase(vc);
        setObservations(vc.observations || '');
        setEvidenceNotes(vc.independent_evidence_notes || '');
      }
    }
  }

  async function handleSelectFdr(fdr: FDRRecord) {
    setSelectedFdr(fdr);
    setSuccessMsg(null);
    const ext = await FDRService.getExtractions(fdr.id);
    setExtraction(ext || null);
    const vc = await FDRService.getVerificationCaseByFdrId(fdr.id);
    if (vc) {
      setVCase(vc);
      setObservations(vc.observations || '');
      setEvidenceNotes(vc.independent_evidence_notes || '');
    }
  }

  async function handleDecision(decision: 'ACCEPT' | 'RETURN_FOR_CORRECTION' | 'FLAG_DISCREPANCY' | 'REJECT') {
    if (!selectedFdr) return;
    setIsSubmitting(true);
    setSuccessMsg(null);

    const reason = decisionReason.trim() || 
      (decision === 'ACCEPT' ? 'Document verified against bank joint confirmation letter' : 
       decision === 'RETURN_FOR_CORRECTION' ? 'Discrepancy identified between submitted data and scanned receipt' : 
       decision === 'FLAG_DISCREPANCY' ? 'Potential anomaly highlighted for regional review' : 'Non-compliant instrument terms');

    try {
      await FDRService.recordVerificationDecision({
        fdrId: selectedFdr.id,
        decision,
        decisionReason: reason,
        observations: observations || 'Verified during statutory compliance scrutiny.',
        evidenceNotes: evidenceNotes || undefined,
      });

      setSuccessMsg(`Decision successfully recorded: ${decision.replace('_', ' ')}`);
      // Reload updated FDR
      const updated = await FDRService.getFDRById(selectedFdr.id);
      if (updated) setSelectedFdr(updated);
      const vc = await FDRService.getVerificationCaseByFdrId(selectedFdr.id);
      if (vc) setVCase(vc);
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                Official Scrutiny Cell
              </span>
              <span className="text-xs text-slate-500">AI-Assisted Document Verification</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              FDR Scrutiny & Verification Workbench
            </h1>
          </div>

          {selectedFdr && (
            <Link
              href={`/fdrs/${selectedFdr.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
            >
              <span>View Full Instrument Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Workbench Layout: Master-Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: FDR Selection Queue */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Scrutiny Queue ({fdrs.length})
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {fdrs.map(f => {
                const isSelected = selectedFdr?.id === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFdr(f)}
                    className={`w-full text-left p-3 rounded-lg border transition cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 font-semibold'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-900 font-bold">{f.fdr_number}</span>
                      <StatusBadge status={f.review_status} />
                    </div>
                    <div className="text-slate-600 font-medium mt-1 truncate">{f.bank_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{f.institution?.name}</div>
                    <div className="text-slate-900 font-bold mt-1">
                      ₹ {Number(f.amount).toLocaleString('en-IN')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Comparative Verification View */}
          <div className="lg:col-span-3 space-y-6">
            {selectedFdr && (
              <>
                {/* Notification Banner */}
                {successMsg && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Instrument Header Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 font-mono">
                        {selectedFdr.fdr_number}
                      </h2>
                      <StatusBadge status={selectedFdr.lifecycle_status} type="lifecycle" />
                      <StatusBadge status={selectedFdr.review_status} type="review" />
                      <StatusBadge status={selectedFdr.verification_status} type="verification" />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Submitted by: {selectedFdr.institution?.name} · Joint: {selectedFdr.joint_holder_name}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500">Security Deposit</div>
                    <div className="text-xl font-bold text-slate-900">
                      ₹ {Number(selectedFdr.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Comparison: Submitted vs Extracted */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Field-by-Field Verification Matrix
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Compare claimed institution inputs against machine-extracted document values.
                      </p>
                    </div>

                    {extraction && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        AI Confidence: {(extraction.confidence_scores.overall * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 p-3 font-semibold text-slate-500 bg-slate-50/50">
                      <div className="col-span-3">Field</div>
                      <div className="col-span-4">Submitted by Institution</div>
                      <div className="col-span-4">OCR Extracted Value</div>
                      <div className="col-span-1 text-center">Match</div>
                    </div>

                    {/* FDR Number */}
                    <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50 transition">
                      <div className="col-span-3 font-medium text-slate-700">FDR Reference Number</div>
                      <div className="col-span-4 font-mono font-bold text-slate-900">{selectedFdr.fdr_number}</div>
                      <div className="col-span-4 font-mono font-medium text-slate-800">
                        {extraction?.extracted_fields?.fdr_number || selectedFdr.fdr_number}
                      </div>
                      <div className="col-span-1 text-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      </div>
                    </div>

                    {/* Bank Name */}
                    <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50 transition">
                      <div className="col-span-3 font-medium text-slate-700">Issuing Bank</div>
                      <div className="col-span-4 font-semibold text-slate-900">{selectedFdr.bank_name}</div>
                      <div className="col-span-4 font-medium text-slate-800">
                        {extraction?.extracted_fields?.bank_name || selectedFdr.bank_name}
                      </div>
                      <div className="col-span-1 text-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      </div>
                    </div>

                    {/* Amount Comparison */}
                    <div className={`grid grid-cols-12 p-3 items-center transition ${
                      extraction?.extracted_fields?.amount && Math.abs(extraction.extracted_fields.amount - Number(selectedFdr.amount)) > 1
                        ? 'bg-rose-50/70'
                        : 'hover:bg-slate-50/50'
                    }`}>
                      <div className="col-span-3 font-medium text-slate-700">Deposit Amount</div>
                      <div className="col-span-4 font-bold text-slate-900">
                        ₹ {Number(selectedFdr.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="col-span-4 font-bold text-slate-900">
                        {extraction?.extracted_fields?.amount ? (
                          <>₹ {Number(extraction.extracted_fields.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</>
                        ) : (
                          <>₹ {Number(selectedFdr.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</>
                        )}
                      </div>
                      <div className="col-span-1 text-center">
                        {extraction?.extracted_fields?.amount && Math.abs(extraction.extracted_fields.amount - Number(selectedFdr.amount)) > 1 ? (
                          <XCircle className="w-4 h-4 text-rose-600 mx-auto" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        )}
                      </div>
                    </div>

                    {/* IFSC Code */}
                    <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50 transition">
                      <div className="col-span-3 font-medium text-slate-700">Bank IFSC Code</div>
                      <div className="col-span-4 font-mono text-slate-900">{selectedFdr.ifsc_code}</div>
                      <div className="col-span-4 font-mono text-slate-800">
                        {extraction?.extracted_fields?.ifsc_code || selectedFdr.ifsc_code}
                      </div>
                      <div className="col-span-1 text-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      </div>
                    </div>

                    {/* Maturity Date */}
                    <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50 transition">
                      <div className="col-span-3 font-medium text-slate-700">Maturity Date</div>
                      <div className="col-span-4 font-mono font-bold text-slate-900">{selectedFdr.maturity_date}</div>
                      <div className="col-span-4 font-mono text-slate-800">{selectedFdr.maturity_date}</div>
                      <div className="col-span-1 text-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrutiny Decision Panel */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Record Official Scrutiny Decision
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Scrutiny Officer Observations
                      </label>
                      <textarea
                        rows={3}
                        value={observations}
                        onChange={e => setObservations(e.target.value)}
                        placeholder="Detail observations regarding document validity, seal, and joint custody..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Independent Evidence Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={evidenceNotes}
                        onChange={e => setEvidenceNotes(e.target.value)}
                        placeholder="e.g. Confirmed with Branch Manager via official bank domain email..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Decision Rationale (Mandatory for returns/rejections)
                    </label>
                    <input
                      type="text"
                      value={decisionReason}
                      onChange={e => setDecisionReason(e.target.value)}
                      placeholder="e.g. Terms match AICTE Approval Process Handbook (APH)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDecision('RETURN_FOR_CORRECTION')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Return for Correction
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDecision('FLAG_DISCREPANCY')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Flag Discrepancy
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDecision('REJECT')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Instrument
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDecision('ACCEPT')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept & Verify FDR
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  );
}

export default function VerificationWorkbenchPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading scrutiny workbench...</div>}>
        <VerificationWorkbenchContent />
      </Suspense>
    </AppLayout>
  );
}
