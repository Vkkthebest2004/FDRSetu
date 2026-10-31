'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Lock,
  Loader2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FDRService } from '@/lib/supabase/service';
import { Institution, Profile } from '@/lib/types/database';

export default function FDRSubmitWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    institution_id: '',
    fdr_number: '',
    bank_name: 'State Bank of India',
    branch_name: '',
    ifsc_code: '',
    amount: '',
    currency: 'INR',
    issue_date: '',
    maturity_date: '',
    document_file: null as File | null,
    document_hash: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const user = await FDRService.getCurrentUser();
    setCurrentUser(user);
    const instList = await FDRService.getInstitutions();
    setInstitutions(instList);
    if (instList.length > 0) {
      setFormData(prev => ({ ...prev, institution_id: instList[0].id }));
    }
  }

  // Calculate browser-side SHA-256 for the uploaded document
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15 MB regulatory limit.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setFormData(prev => ({
        ...prev,
        document_file: file,
        document_hash: hashHex,
      }));
      setErrorMsg(null);
    } catch {
      setErrorMsg('Failed to compute cryptographic hash for the file.');
    }
  }

  function validateStep(currentStep: number): boolean {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!formData.institution_id) {
        setErrorMsg('Please select a valid institution.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.bank_name.trim() || !formData.branch_name.trim()) {
        setErrorMsg('Please specify both the bank name and branch location.');
        return false;
      }
      if (!formData.fdr_number.trim()) {
        setErrorMsg('FDR / Term Deposit Receipt reference number is mandatory.');
        return false;
      }
      if (!formData.ifsc_code.trim() || formData.ifsc_code.length < 8) {
        setErrorMsg('Please enter a valid 11-character bank IFSC code (e.g. SBIN0001234).');
        return false;
      }
    } else if (currentStep === 3) {
      const amt = parseFloat(formData.amount);
      if (isNaN(amt) || amt <= 0) {
        setErrorMsg('Please enter a valid positive security deposit amount.');
        return false;
      }
      if (!formData.issue_date || !formData.maturity_date) {
        setErrorMsg('Both Issue Date and Maturity Date are required.');
        return false;
      }
      if (new Date(formData.maturity_date) <= new Date(formData.issue_date)) {
        setErrorMsg('Maturity Date must strictly follow the Issue Date.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.document_file) {
        setErrorMsg('Scanned copy of the FDR or Joint Confirmation Letter is mandatory.');
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  }

  function prevStep() {
    setErrorMsg(null);
    setStep(s => s - 1);
  }

  async function handleFinalSubmit() {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSubmitStatus('Registering FDR instrument in ledger...');

    try {
      // 1. Create FDR Record
      const newFDR = await FDRService.createFDR({
        institution_id: formData.institution_id,
        fdr_number: formData.fdr_number,
        bank_name: formData.bank_name,
        branch_name: formData.branch_name,
        ifsc_code: formData.ifsc_code.toUpperCase(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        issue_date: formData.issue_date,
        maturity_date: formData.maturity_date,
      });

      // 2. Upload Document Metadata
      if (formData.document_file) {
        setSubmitStatus('Ingesting document metadata & computing SHA-256 hash...');
        await FDRService.createDocument({
          institution_id: formData.institution_id,
          fdr_id: newFDR.id,
          document_type: 'FDR_RECEIPT',
          file_name: formData.document_file.name,
          file_size: formData.document_file.size,
          mime_type: formData.document_file.type || 'application/pdf',
          sha256_hash: formData.document_hash,
        });

        // 3. Trigger live OCR, extraction & AI Risk Assessment
        setSubmitStatus('Triggering OCR extraction and automated AI Risk Assessment...');
        try {
          await FDRService.processAndIngestFDRDocument(newFDR.id, formData.document_file, {
            fdr_number: formData.fdr_number,
            bank_name: formData.bank_name,
            amount: parseFloat(formData.amount),
            ifsc_code: formData.ifsc_code.toUpperCase(),
          });
        } catch (aiErr) {
          console.warn('AI document ingestion completed with non-fatal notice:', aiErr);
        }
      }

      setSubmitStatus('Instrument registered successfully! Redirecting...');
      router.push(`/fdrs/${newFDR.id}`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit FDR instrument. Please verify your connection.');
      setIsSubmitting(false);
      setSubmitStatus(null);
    }
  }

  const selectedInst = institutions.find(i => i.id === formData.institution_id);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb / Title */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>FDR Registry</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">New FDR Submission</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Submit Fixed Deposit Receipt (FDR)
          </h1>
          <p className="text-xs text-slate-500">
            Submit statutory security deposit instrument for AICTE approval compliance.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Institution' },
              { num: 2, label: 'Bank Details' },
              { num: 3, label: 'Financials' },
              { num: 4, label: 'Document' },
              { num: 5, label: 'Confirmation' },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                      step === s.num
                        ? 'bg-blue-600 text-white shadow-md scale-110 ring-2 ring-blue-400/40'
                        : step > s.num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline font-medium ${
                      step === s.num ? 'text-blue-900 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step Cards */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* STEP 1: Institution Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 1: Confirm Institution Details
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accredited Institution
                </label>
                <select
                  value={formData.institution_id}
                  onChange={e => setFormData({ ...formData, institution_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.aicte_id}) — {inst.city}, {inst.state}
                    </option>
                  ))}
                </select>
              </div>

              {selectedInst && (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Official AICTE ID:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedInst.aicte_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Institution Category:</span>
                    <span className="font-semibold text-slate-800">{selectedInst.institution_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered Address:</span>
                    <span className="text-slate-700 text-right">{selectedInst.address}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Bank and Instrument Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 2: Bank & Instrument Identifiers
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issuing Bank Name *
                </label>
                <select
                  value={formData.bank_name}
                  onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                  <option value="Canara Bank">Canara Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Union Bank of India">Union Bank of India</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch Name & City *
                  </label>
                  <input
                    type="text"
                    value={formData.branch_name}
                    onChange={e => setFormData({ ...formData, branch_name: e.target.value })}
                    placeholder="e.g. Connaught Place, New Delhi"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={formData.ifsc_code}
                    onChange={e => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SBIN0001234"
                    maxLength={11}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  FDR / Term Deposit Receipt Number *
                </label>
                <input
                  type="text"
                  value={formData.fdr_number}
                  onChange={e => setFormData({ ...formData, fdr_number: e.target.value })}
                  placeholder="e.g. SBI-DEL-FDR-2024-9901"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Financial Details */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 3: Deposit Amount & Tenures
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Principal Deposit Amount (in Rupees) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="1500000.00"
                    className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard AICTE security deposit amounts: Engineering (₹ 15L - ₹ 35L), Management (₹ 10L - ₹ 15L).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Issue *
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Maturity *
                  </label>
                  <input
                    type="date"
                    value={formData.maturity_date}
                    onChange={e => setFormData({ ...formData, maturity_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-900">
                <span className="font-bold">Mandatory Clause:</span> The Fixed Deposit Receipt must be in the joint name of <em>The Institution</em> and <em>Regional Officer, AICTE</em>.
              </div>
            </div>
          )}

          {/* STEP 4: Document Upload & SHA-256 Hash */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 4: Upload FDR Document & Compute Hash
              </h2>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition bg-slate-50/50">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-800">
                  Click to select or drag and drop your FDR receipt scan
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supported formats: PDF, PNG, JPG (Maximum 15 MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="mt-4 text-xs cursor-pointer"
                />
              </div>

              {formData.document_file && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {formData.document_file.name}
                    </span>
                    <span className="text-emerald-700">
                      {(formData.document_file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="text-[11px] text-emerald-800 break-all font-mono">
                    <span className="font-semibold block text-slate-600">SHA-256 Integrity Hash:</span>
                    {formData.document_hash}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Review & Confirmation */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step 5: Review & Final Confirmation
              </h2>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Institution:</span>
                  <span className="font-semibold text-slate-900">{selectedInst?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">FDR Reference Number:</span>
                  <span className="font-mono font-bold text-blue-700">{formData.fdr_number}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Bank & Branch:</span>
                  <span className="font-medium text-slate-900">{formData.bank_name} ({formData.branch_name})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Branch IFSC:</span>
                  <span className="font-mono text-slate-800">{formData.ifsc_code}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Deposit Amount:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹ {parseFloat(formData.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Tenure:</span>
                  <span className="font-mono text-slate-700">{formData.issue_date} to {formData.maturity_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Uploaded:</span>
                  <span className="font-medium text-slate-900">{formData.document_file?.name}</span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Statutory Declaration:</strong> I hereby certify that the information entered above is correct and matches the original financial instrument issued jointly with AICTE. Upon submission, the document will undergo automated OCR and human scrutiny.
                </span>
              </div>
            </div>
          )}

          {/* Status Alert during Submission */}
          {submitStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <span className="font-medium">{submitStatus}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Submission...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Submit FDR</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

