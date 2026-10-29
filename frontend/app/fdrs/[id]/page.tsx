'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  History, 
  RefreshCw, 
  CreditCard,
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  ExternalLink,
  Download,
  AlertCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FDRService } from '@/lib/supabase/service';
import { 
  FDRRecord, 
  DocumentItem, 
  DocumentExtraction, 
  VerificationCase, 
  AuditEvent,
  Profile 
} from '@/lib/types/database';

function FDRDetailContent() {
  const params = useParams();
  const router = useRouter();
  const fdrId = params.id as string;

  const [fdr, setFdr] = useState<FDRRecord | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [extraction, setExtraction] = useState<DocumentExtraction | null>(null);
  const [vcase, setVCase] = useState<VerificationCase | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'discrepancies' | 'renewals' | 'audit'>('overview');

  useEffect(() => {
    loadFDRDetails();
  }, [fdrId]);

  async function loadFDRDetails() {
    const user = await FDRService.getCurrentUser();
    setCurrentUser(user);

    const record = await FDRService.getFDRById(fdrId);
    if (record) {
      setFdr(record);
      const docs = await FDRService.getDocuments(fdrId);
      setDocuments(docs);
      const ext = await FDRService.getExtractions(fdrId);
      if (ext) setExtraction(ext);
      const vc = await FDRService.getVerificationCaseByFdrId(fdrId);
      if (vc) setVCase(vc);
      const audits = await FDRService.getAuditEvents();
      setAuditEvents(audits.filter(a => a.entity_id === fdrId));
    }
  }

  if (!fdr) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400 animate-spin" />
        <p className="text-sm">Loading FDR record...</p>
      </div>
    );
  }

  const discrepancies = vcase?.discrepancy_summary || [];

  return (
    <div className="space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/fdrs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to FDR Registry
          </Link>

          <div className="flex items-center gap-2">
            {(currentUser?.system_role === 'scrutiny_officer' || currentUser?.system_role === 'administrator') && (
              <Link
                href={`/verification?fdrId=${fdr.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Open in Scrutiny Workbench
              </Link>
            )}

            {currentUser?.system_role === 'institution_user' && fdr.lifecycle_status === 'ACTIVE' && (
              <>
                <Link
                  href={`/renewals?fdrId=${fdr.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  Submit Renewal
                </Link>
                <Link
                  href={`/release-requests?fdrId=${fdr.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Request Release
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                  {fdr.fdr_number}
                </span>
                <StatusBadge status={fdr.lifecycle_status} type="lifecycle" />
                <StatusBadge status={fdr.review_status} type="review" />
                <StatusBadge status={fdr.verification_status} type="verification" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {fdr.institution?.name} (AICTE ID: {fdr.institution?.aicte_id})
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Principal Security Deposit</div>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">
                ₹ {Number(fdr.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-slate-500 block">Issuing Bank</span>
              <span className="font-semibold text-slate-800">{fdr.bank_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Branch & IFSC</span>
              <span className="font-semibold text-slate-800">{fdr.branch_name} ({fdr.ifsc_code})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Issue Date</span>
              <span className="font-mono text-slate-800">{fdr.issue_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Maturity Date</span>
              <span className="font-mono font-bold text-slate-900">{fdr.maturity_date}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-6 text-xs font-medium">
            {[
              { id: 'overview', label: 'Overview & Terms' },
              { id: 'documents', label: `Documents & OCR (${documents.length})` },
              { id: 'discrepancies', label: `Discrepancy Analysis (${discrepancies.length})` },
              { id: 'renewals', label: 'Replacement Chain' },
              { id: 'audit', label: `Audit Trail (${auditEvents.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 border-b-2 font-semibold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Statutory Instrument Particulars
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Joint Holder:</span>
                  <span className="font-semibold text-slate-900">{fdr.joint_holder_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Currency:</span>
                  <span className="font-mono text-slate-900">{fdr.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lifecycle State:</span>
                  <span className="font-semibold text-slate-900">{fdr.lifecycle_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Review Status:</span>
                  <span className="font-semibold text-slate-900">{fdr.review_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Engine Status:</span>
                  <span className="font-semibold text-slate-900">{fdr.verification_status}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Scrutiny Observations & Evidence
              </h3>
              {vcase ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Assigned Officer Observations:</span>
                    <p className="p-3 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 leading-relaxed">
                      {vcase.observations || 'No written observations recorded yet.'}
                    </p>
                  </div>
                  {vcase.decision && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 border border-blue-200">
                      <span className="text-blue-900 font-semibold">Official Decision:</span>
                      <span className="font-bold text-blue-900">{vcase.decision}</span>
                    </div>
                  )}
                  {vcase.decision_reason && (
                    <div>
                      <span className="text-slate-500 block mb-0.5">Decision Grounds:</span>
                      <p className="text-slate-700">{vcase.decision_reason}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  This instrument is awaiting initial scrutiny by the AICTE Regional Scrutiny Cell.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENTS & OCR EXTRACTION */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Uploaded Document Instruments</h3>
              <div className="divide-y divide-slate-100">
                {documents.map(doc => (
                  <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-bold text-slate-900">{doc.file_name}</div>
                        <div className="text-[11px] text-slate-500">
                          {doc.document_type} · {(doc.file_size / 1024).toFixed(1)} KB · Version {doc.document_version}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SHA-256: {doc.sha256_hash}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {doc.processing_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Extraction Card */}
            {extraction && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Python AI Service Extraction</h3>
                    <p className="text-xs text-slate-500">
                      Engine: {extraction.extractor_name} (v{extraction.extractor_version})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Overall AI Confidence:</span>
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {(extraction.confidence_scores.overall * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {Object.entries(extraction.extracted_fields).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 capitalize">{k.replace('_', ' ')}</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {typeof v === 'number' && k === 'amount' ? `₹ ${v.toLocaleString('en-IN')}` : String(v)}
                      </div>
                      {extraction.confidence_scores[k] && (
                        <div className="text-[10px] text-emerald-700 mt-1">
                          Confidence: {(extraction.confidence_scores[k] * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DISCREPANCIES */}
        {activeTab === 'discrepancies' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Deterministic Discrepancy Findings</h3>
            <p className="text-xs text-slate-500">
              Deterministic cross-verification between institution-submitted form data and machine-extracted document values.
            </p>

            {discrepancies.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800">No Discrepancies Detected</p>
                <p className="text-slate-500 mt-0.5">All submitted values match the uploaded instrument.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {discrepancies.map((disc, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border text-xs ${
                      disc.severity === 'HIGH'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="uppercase tracking-wider">Field: {disc.field}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white border font-bold">
                        Severity: {disc.severity}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] opacity-75 block">Submitted by Institution:</span>
                        <span className="font-bold">{disc.submitted_value}</span>
                      </div>
                      <div>
                        <span className="text-[11px] opacity-75 block">Extracted from Document:</span>
                        <span className="font-bold">{disc.extracted_value}</span>
                      </div>
                    </div>
                    {disc.explanation && (
                      <p className="mt-2 text-[11px] opacity-90 border-t border-current/20 pt-1.5">
                        {disc.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RENEWALS */}
        {activeTab === 'renewals' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Instrument Replacement Chain</h3>
            <p className="text-xs text-slate-500">
              Traceability link between expired predecessor instruments and replacement FDRs.
            </p>

            {fdr.predecessor_fdr_id ? (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                <span className="font-semibold text-blue-900">Predecessor FDR Linked:</span>
                <p className="text-blue-800 mt-1">
                  This instrument replaced expired predecessor FDR <strong>{fdr.predecessor_fdr_id}</strong>.
                </p>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <p>This is an original initial deposit. No predecessor instrument linked.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Tamper-Evident Audit History</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {auditEvents.length === 0 ? (
                <div className="py-6 text-center text-slate-500">No audit events recorded yet.</div>
              ) : (
                auditEvents.map(a => (
                  <div key={a.id} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{a.action}</div>
                      <p className="text-slate-600 mt-0.5">{a.reason || 'Executed action'}</p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Actor: {a.actor?.full_name || a.actor_role} · IP: {a.ip_address}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-slate-500">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
  );
}

export default function FDRDetailPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading instrument details...</div>}>
        <FDRDetailContent />
      </Suspense>
    </AppLayout>
  );
}
