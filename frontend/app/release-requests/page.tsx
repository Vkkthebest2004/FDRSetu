'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCheck2, 
  PlusCircle, 
  ArrowRight,
  ShieldAlert,
  Building,
  UserCheck
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FDRService } from '@/lib/supabase/service';
import { ReleaseRequest, FDRRecord, Profile, ReleaseWorkflowStatus } from '@/lib/types/database';

function ReleaseRequestsContent() {
  const searchParams = useSearchParams();
  const preselectedFdrId = searchParams.get('fdrId');

  const [requests, setRequests] = useState<ReleaseRequest[]>([]);
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // New Request Modal State
  const [showCreateModal, setShowCreateModal] = useState(!!preselectedFdrId);
  const [selectedFdrId, setSelectedFdrId] = useState(preselectedFdrId || '');
  const [requestType, setRequestType] = useState<'PROGRAM_CLOSURE' | 'COURSE_DISCONTINUATION' | 'DEPOSIT_PERIOD_EXPIRED' | 'OTHER'>('DEPOSIT_PERIOD_EXPIRED');
  const [justification, setJustification] = useState('Statutory deposit period completed per AICTE Approval Process Handbook (APH). All academic batches graduated without outstanding liabilities.');

  // Officer / Approver Action Modal State
  const [activeReq, setActiveReq] = useState<ReleaseRequest | null>(null);
  const [actionType, setActionType] = useState<'recommend' | 'approve' | 'record_release'>('recommend');
  const [actionText, setActionText] = useState('');
  const [actionDecision, setActionDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [bankReleaseRef, setBankReleaseRef] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const user = await FDRService.getCurrentUser();
    setCurrentUser(user);

    const reqList = await FDRService.getReleaseRequests();
    setRequests(reqList);

    const fdrList = await FDRService.getFDRs();
    setFdrs(fdrList);
    if (fdrList.length > 0 && !selectedFdrId) {
      setSelectedFdrId(fdrList[0].id);
    }
  }

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFdrId) {
      setErrorMsg('Please select an active FDR instrument.');
      return;
    }
    const targetFdr = fdrs.find(f => f.id === selectedFdrId);
    if (!targetFdr) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await FDRService.createReleaseRequest({
        institution_id: targetFdr.institution_id,
        fdr_id: targetFdr.id,
        request_type: requestType,
        justification,
      });

      setSuccessMsg('Release request successfully submitted for scrutiny!');
      setShowCreateModal(false);
      const updated = await FDRService.getReleaseRequests();
      setRequests(updated);
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to file release request.');
      setIsSubmitting(false);
    }
  }

  async function handleExecuteAction(e: React.FormEvent) {
    e.preventDefault();
    if (!activeReq) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let nextStatus: ReleaseWorkflowStatus = activeReq.workflow_status;

      if (actionType === 'recommend') {
        nextStatus = 'RECOMMENDED';
        await FDRService.updateReleaseRequest({
          id: activeReq.id,
          workflow_status: nextStatus,
          recommendation: actionText || 'Recommended for release following regional audit check.',
        });
      } else if (actionType === 'approve') {
        nextStatus = actionDecision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
        await FDRService.updateReleaseRequest({
          id: activeReq.id,
          workflow_status: nextStatus,
          approval_decision: actionDecision,
          decision_reason: actionText || 'Decision sanctioned by Approving Authority.',
        });
      } else if (actionType === 'record_release') {
        nextStatus = 'RELEASE_RECORDED';
        await FDRService.updateReleaseRequest({
          id: activeReq.id,
          workflow_status: nextStatus,
          bank_release_ref: bankReleaseRef || `AICTE/FIN/${new Date().getFullYear()}/REL-${Math.floor(Math.random() * 9000 + 1000)}`,
        });
      }

      setSuccessMsg(`Workflow successfully updated to: ${nextStatus}`);
      setActiveReq(null);
      const updated = await FDRService.getReleaseRequests();
      setRequests(updated);
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update workflow.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Security Deposit Release & Refund Requests
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Multi-tiered administrative scrutiny, recommendation, and formal approval workflow for deposit encashment.
            </p>
          </div>

          {currentUser?.system_role === 'institution_user' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              File Release Request
            </button>
          )}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal: Create Release Request */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Initiate Security Deposit Release / Refund
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
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

              <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select FDR Instrument *
                  </label>
                  <select
                    value={selectedFdrId}
                    onChange={e => setSelectedFdrId(e.target.value)}
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
                    Statutory Reason / Release Category *
                  </label>
                  <select
                    value={requestType}
                    onChange={e => setRequestType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="DEPOSIT_PERIOD_EXPIRED">Statutory Deposit Period Expired (Tenure Completed)</option>
                    <option value="PROGRAM_CLOSURE">Complete Closure of Accredited Institution</option>
                    <option value="COURSE_DISCONTINUATION">Discontinuation of Specific Course/Program</option>
                    <option value="OTHER">Other Regulatory Grounds</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Detailed Justification & Undertaking *
                  </label>
                  <textarea
                    rows={4}
                    value={justification}
                    onChange={e => setJustification(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                  >
                    {isSubmitting ? 'Filing Request...' : 'Submit Formal Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Officer Scrutiny & Approver Action */}
        {activeReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  {actionType === 'recommend' && 'Scrutiny Officer Recommendation'}
                  {actionType === 'approve' && 'Approving Authority Formal Decision'}
                  {actionType === 'record_release' && 'Record Bank Release Order'}
                </h2>
                <button onClick={() => setActiveReq(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
              </div>

              <form onSubmit={handleExecuteAction} className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div><strong>Instrument:</strong> {activeReq.fdr?.fdr_number} ({activeReq.fdr?.bank_name})</div>
                  <div><strong>Amount:</strong> ₹ {Number(activeReq.fdr?.amount || 0).toLocaleString('en-IN')}</div>
                  <div><strong>Category:</strong> {activeReq.request_type}</div>
                  <div><strong>Justification:</strong> {activeReq.justification}</div>
                </div>

                {actionType === 'recommend' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Scrutiny Recommendation Notes *
                    </label>
                    <textarea
                      rows={3}
                      value={actionText}
                      onChange={e => setActionText(e.target.value)}
                      placeholder="e.g. Verified zero pending student dues or legal disputes. Recommended for release."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                {actionType === 'approve' && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Formal Approval Decision</label>
                      <select
                        value={actionDecision}
                        onChange={e => setActionDecision(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="APPROVED">APPROVE RELEASE</option>
                        <option value="REJECTED">REJECT REQUEST</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Formal Decision Rationale *</label>
                      <textarea
                        rows={3}
                        value={actionText}
                        onChange={e => setActionText(e.target.value)}
                        placeholder="Detail statutory grounds for sanctioning or rejecting release..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </>
                )}

                {actionType === 'record_release' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bank Sanction / Refund Order Reference Number *
                    </label>
                    <input
                      type="text"
                      value={bankReleaseRef}
                      onChange={e => setBankReleaseRef(e.target.value)}
                      placeholder="e.g. AICTE/FIN/2026/REL-99412"
                      className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setActiveReq(null)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs">
                    {isSubmitting ? 'Recording...' : 'Submit Action'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Release / Refund Docket
            </h2>
            <span className="text-xs text-slate-500">{requests.length} requests in workflow</span>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.map(req => (
              <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-slate-50/50 transition">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{req.institution?.name}</span>
                    <span className="text-slate-400">·</span>
                    <Link href={`/fdrs/${req.fdr_id}`} className="font-mono text-blue-700 font-semibold hover:underline">
                      {req.fdr?.fdr_number}
                    </Link>
                    <StatusBadge status={req.workflow_status} type="release" />
                  </div>

                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-700">Category:</span> {req.request_type} · <span className="font-semibold text-slate-700">Amount:</span> ₹ {Number(req.fdr?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>

                  <p className="text-slate-500 line-clamp-2">
                    <strong>Justification:</strong> {req.justification}
                  </p>

                  {req.recommendation && (
                    <div className="p-2 rounded bg-blue-50 text-blue-900 border border-blue-200">
                      <strong>Officer Recommendation:</strong> {req.recommendation}
                    </div>
                  )}

                  {req.decision_reason && (
                    <div className="p-2 rounded bg-purple-50 text-purple-900 border border-purple-200">
                      <strong>Approver Decision ({req.approval_decision}):</strong> {req.decision_reason}
                    </div>
                  )}

                  {req.bank_release_ref && (
                    <div className="text-emerald-800 font-mono font-bold">
                      Bank Release Order: {req.bank_release_ref}
                    </div>
                  )}
                </div>

                {/* Role-Specific Action Triggers */}
                <div className="flex items-center gap-2">
                  {currentUser?.system_role === 'scrutiny_officer' && req.workflow_status === 'SUBMITTED' && (
                    <button
                      onClick={() => {
                        setActiveReq(req);
                        setActionType('recommend');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer"
                    >
                      Recommend
                    </button>
                  )}

                  {currentUser?.system_role === 'approving_authority' && req.workflow_status === 'RECOMMENDED' && (
                    <button
                      onClick={() => {
                        setActiveReq(req);
                        setActionType('approve');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition cursor-pointer"
                    >
                      Sign Decision
                    </button>
                  )}

                  {(currentUser?.system_role === 'approving_authority' || currentUser?.system_role === 'administrator') && req.workflow_status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setActiveReq(req);
                        setActionType('record_release');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer"
                    >
                      Record Bank Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

export default function ReleaseRequestsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading release docket...</div>}>
        <ReleaseRequestsContent />
      </Suspense>
    </AppLayout>
  );
}
