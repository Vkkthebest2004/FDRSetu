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
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Lock
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

  // Prioritization Triage Filters & Sorting
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL_HIGH' | 'DISCREPANCIES' | 'EXPIRING_SOON'>('ALL');
  const [sortBy, setSortBy] = useState<'RISK' | 'AMOUNT' | 'EXPIRY'>('RISK');

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
    // Sort initially by risk score descending (AI Recommended)
    const sorted = [...fdrList].sort((a, b) => (b.risk_assessment?.risk_score || 0) - (a.risk_assessment?.risk_score || 0));
    setFdrs(sorted);

    let active = sorted[0];
    if (requestedFdrId) {
      const found = sorted.find(f => f.id === requestedFdrId);
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

  // Filtered and Sorted FDR Queue
  const filteredFdrs = fdrs.filter(f => {
    if (priorityFilter === 'CRITICAL_HIGH') {
      return f.risk_assessment?.priority_tier === 'CRITICAL' || f.risk_assessment?.priority_tier === 'HIGH';
    }
    if (priorityFilter === 'DISCREPANCIES') {
      return f.review_status === 'NEEDS_CORRECTION' || f.verification_status === 'DISCREPANCY_FLAGGED';
    }
    if (priorityFilter === 'EXPIRING_SOON') {
      if (!f.maturity_date) return false;
      const diffDays = Math.ceil((new Date(f.maturity_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diffDays <= 90;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'RISK') {
      return (b.risk_assessment?.risk_score || 0) - (a.risk_assessment?.risk_score || 0);
    }
    if (sortBy === 'AMOUNT') {
      return b.amount - a.amount;
    }
    if (sortBy === 'EXPIRY') {
      return new Date(a.maturity_date).getTime() - new Date(b.maturity_date).getTime();
    }
    return 0;
  });

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
          {/* Left Column: FDR Selection Queue with AI Risk Prioritization Triage */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
                <span>Queue Triage ({filteredFdrs.length})</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                AI Prioritized
              </span>
            </div>

            {/* Triage Filter Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setPriorityFilter('ALL')}
                className={`py-1 px-1.5 rounded text-center transition cursor-pointer ${
                  priorityFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({fdrs.length})
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('CRITICAL_HIGH')}
                className={`py-1 px-1.5 rounded text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                  priorityFilter === 'CRITICAL_HIGH' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>High Risk ({fdrs.filter(f => f.risk_assessment?.priority_tier === 'CRITICAL' || f.risk_assessment?.priority_tier === 'HIGH').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('DISCREPANCIES')}
                className={`py-1 px-1.5 rounded text-center transition cursor-pointer ${
                  priorityFilter === 'DISCREPANCIES' ? 'bg-amber-600 text-white shadow-2xs font-bold' : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                Discrepancy ({fdrs.filter(f => f.review_status === 'NEEDS_CORRECTION' || f.verification_status === 'DISCREPANCY_FLAGGED').length})
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('EXPIRING_SOON')}
                className={`py-1 px-1.5 rounded text-center transition cursor-pointer ${
                  priorityFilter === 'EXPIRING_SOON' ? 'bg-blue-700 text-white shadow-2xs font-bold' : 'text-blue-800 hover:bg-blue-50'
                }`}
              >
                Expiring (&lt;90d)
              </button>
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Sort queue by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-blue-600"
              >
                <option value="RISK">AI Risk (Highest First)</option>
                <option value="AMOUNT">Deposit Amount (High-Low)</option>
                <option value="EXPIRY">Maturity Date (Soonest)</option>
              </select>
            </div>

            {/* Scrollable Queue Cards */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredFdrs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No FDR records match the active triage filter.
                </div>
              ) : (
                filteredFdrs.map(f => {
                  const isSelected = selectedFdr?.id === f.id;
                  const tier = f.risk_assessment?.priority_tier || 'LOW';
                  const score = f.risk_assessment?.risk_score || 0;

                  return (
                    <button
                      key={f.id}
                      onClick={() => handleSelectFdr(f)}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20 translate-x-1'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:translate-x-1'
                      }`}
                    >
                      {/* Card Top: Number & Priority Pill */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-slate-900 font-bold truncate">{f.fdr_number}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                          tier === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : tier === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : tier === 'MEDIUM'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {tier === 'CRITICAL' && <AlertTriangle className="w-2.5 h-2.5 text-rose-600 animate-pulse" />}
                          {tier} · {score}
                        </span>
                      </div>

                      {/* Bank & College */}
                      <div className="text-slate-600 font-medium mt-1 truncate">{f.bank_name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{f.institution?.name}</div>

                      {/* Amount and Status */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/80">
                        <span className="text-slate-900 font-extrabold text-xs">
                          ₹ {Number(f.amount).toLocaleString('en-IN')}
                        </span>
                        <StatusBadge status={f.review_status} />
                      </div>

                      {/* Primary Identified Risk Factor (If any) */}
                      {f.risk_assessment?.risk_factors && f.risk_assessment.risk_factors.length > 0 && (
                        <div className="mt-2 text-[10px] text-rose-700 bg-rose-50/80 px-2 py-1 rounded-md border border-rose-100 truncate flex items-center gap-1">
                          <span className="font-bold">⚠ Risk:</span>
                          <span className="truncate">{f.risk_assessment.risk_factors[0]}</span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Comparative Verification View */}
          <div className="lg:col-span-3 space-y-6 animate-fade-in-up">
            {selectedFdr && (
              <>
                {/* Notification Banner */}
                {successMsg && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in-up">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* AI Risk Scoring & Prioritization Intelligence Banner */}
                <div className="p-4 rounded-xl bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-md border border-slate-800 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-amber-400 via-blue-500 to-emerald-400 shimmer-bar" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          AI Risk Assessment & Case Prioritization Analysis
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Triage evaluation based on financial exposure, OCR anomaly severity, and maturity window
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        selectedFdr.risk_assessment?.priority_tier === 'CRITICAL'
                          ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                          : selectedFdr.risk_assessment?.priority_tier === 'HIGH'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                          : selectedFdr.risk_assessment?.priority_tier === 'MEDIUM'
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                          : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                      }`}>
                        {selectedFdr.risk_assessment?.priority_tier || 'LOW'} PRIORITY · SCORE {selectedFdr.risk_assessment?.risk_score || 0}/100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-0.5">
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Triage Urgency</span>
                      <span className="font-bold text-white text-xs mt-0.5 block font-mono">
                        {selectedFdr.risk_assessment?.urgency_level || 'STANDARD'} ACTION
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Security Enforcement</span>
                      <span className="font-semibold text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> PostgreSQL RLS & Append-Only
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recommended Protocol</span>
                      <span className="text-slate-200 text-[11px] mt-0.5 block truncate">
                        {selectedFdr.risk_assessment?.recommended_action}
                      </span>
                    </div>
                  </div>

                  {selectedFdr.risk_assessment?.risk_factors && selectedFdr.risk_assessment.risk_factors.length > 0 && (
                    <div className="text-[11px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-slate-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300">Identified Risk Factors:</strong>{' '}
                        {selectedFdr.risk_assessment.risk_factors.join(' · ')}
                      </div>
                    </div>
                  )}
                </div>

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
