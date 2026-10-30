'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Building2, 
  FileCheck2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  FileSearch, 
  Clock, 
  Sparkles, 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  HelpCircle,
  FileText,
  Landmark,
  Phone,
  Mail,
  MapPin,
  Calculator,
  Calendar,
  Check,
  TrendingUp,
  Server
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<number>(0);

  // Deposit Calculator State
  const [selectedProgram, setSelectedProgram] = useState<'eng' | 'mgmt' | 'poly' | 'pharm' | 'arch'>('eng');
  const [selectedCategory, setSelectedCategory] = useState<'new_inst' | 'new_prog' | 'expansion'>('new_inst');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Calculator lookup tables per APH regulations
  const programDetails = {
    eng: {
      name: 'Engineering & Technology (UG/PG)',
      baseAmount: 3500000,
      tenorYears: 10,
      code: 'ENG-TECH',
      aphClause: 'APH 2024-27 Clause 4.1.1(a)',
    },
    mgmt: {
      name: 'Management Studies (MBA / PGDM)',
      baseAmount: 2500000,
      tenorYears: 10,
      code: 'MGMT-PG',
      aphClause: 'APH 2024-27 Clause 4.1.1(b)',
    },
    poly: {
      name: 'Polytechnic & Diploma Engineering',
      baseAmount: 1500000,
      tenorYears: 8,
      code: 'POLY-DIP',
      aphClause: 'APH 2024-27 Clause 4.1.2',
    },
    pharm: {
      name: 'Pharmacy (B.Pharm / M.Pharm)',
      baseAmount: 2500000,
      tenorYears: 10,
      code: 'PHARM-UG',
      aphClause: 'APH 2024-27 Clause 4.1.1(c)',
    },
    arch: {
      name: 'Architecture & Applied Arts (B.Arch)',
      baseAmount: 2000000,
      tenorYears: 10,
      code: 'ARCH-PLAN',
      aphClause: 'APH 2024-27 Clause 4.1.1(d)',
    },
  };

  const currentProg = programDetails[selectedProgram];
  const multiplier = selectedCategory === 'new_inst' ? 1 : selectedCategory === 'new_prog' ? 0.6 : 0.4;
  const calculatedDeposit = currentProg.baseAmount * multiplier;

  const faqs = [
    {
      q: "Why is a Fixed Deposit Receipt (FDR) mandatory for AICTE approval?",
      a: "Under the AICTE Approval Process Handbook (APH), technical and polytechnic institutions must submit a security deposit in the form of a Fixed Deposit Receipt (FDR) created jointly in the name of the AICTE and the applicant Society/Trust. This deposit safeguards educational standards, institutional financial stability, and student interests during the operational lifecycle."
    },
    {
      q: "How does the AI-powered OCR verification work?",
      a: "When an institution uploads an FDR certificate, our Python AI service utilizes OpenCV image preprocessing and Tesseract OCR alongside digital PDF parsing to extract critical fields: FDR Number, Issuing Bank, IFSC Code, Principal Amount, Deposit Date, Maturity Date, and the Joint-Lien Clause. It compares these extracted values against the institution's submitted data and flags any discrepancies for scrutiny officers."
    },
    {
      q: "Can the AI service certify an FDR as genuine or release funds?",
      a: "No. The system strictly adheres to regulatory principles: AI provides automated assistance, field extraction, and anomaly detection with confidence scores, but only authorized AICTE Scrutiny Officers can verify physical instruments with issuing banks, and only the Regional Director / Approving Authority can authorize a release or refund."
    },
    {
      q: "What is the procedure when an FDR approaches its maturity date?",
      a: "The portal monitors all maturity dates in real time and automatically triggers statutory renewal alerts at 90, 60, and 30 days prior to expiry. The institution must renew the FDR for the mandated tenor with the issuing bank, obtain the joint-lien endorsement, and submit the renewal instrument on this portal."
    },
    {
      q: "Under what conditions can a security deposit FDR be refunded or released?",
      a: "A security deposit may be released upon: (1) Completion of the mandatory lock-in period (e.g., 8 or 10 years) without regulatory breaches, (2) Closure of the institution following proper No-Objection Certificate (NOC) and student relocation, or (3) Specific AICTE Council directives. All release requests require dual verification and executive financial sign-off."
    }
  ];

  const workflowStages = [
    {
      id: 0,
      badge: 'Step 01',
      title: 'Institutional Lodgment',
      summary: 'Authorized registrar uploads FDR certificate & bank confirmation letter',
      description: 'The institution logs into the portal and registers the Fixed Deposit Receipt issued by a Scheduled Commercial Bank. The submission captures bank branch IFSC, deposit amount, deposit date, and maturity date, ensuring joint lien endorsement to the Regional Officer, AICTE.',
      techStack: 'Supabase Storage · Private Encrypted Buckets · SHA-256 Checksums',
      sampleCode: `{
  "fdr_number": "SBI-DEL-2024-8841",
  "bank_name": "State Bank of India",
  "branch_ifsc": "SBIN0001234",
  "principal_amount": "₹ 35,00,000.00",
  "joint_lien_status": "ENDORSED_AICTE",
  "submission_status": "SUBMITTED"
}`
    },
    {
      id: 1,
      badge: 'Step 02',
      title: 'AI OCR & Anomaly Extraction',
      summary: 'FastAPI microservice parses scanned certificate and flags discrepancies',
      description: 'The uploaded PDF or image is routed to the Python AI service. Using OpenCV Otsu thresholding and Tesseract OCR, the system parses the document, cross-checks extracted amounts and maturity dates against submitted form values, and scores matching confidence.',
      techStack: 'Python 3.12 · FastAPI · OpenCV · Tesseract OCR · PyMuPDF',
      sampleCode: `{
  "extraction_model": "tesseract_v5.5_ocr",
  "confidence_score": 0.96,
  "extracted_amount": 3500000.00,
  "discrepancies_found": 0,
  "joint_holder_verified": true,
  "anomaly_flag": "NONE"
}`
    },
    {
      id: 2,
      badge: 'Step 03',
      title: 'Regional Scrutiny Audit',
      summary: 'AICTE Scrutiny Officer audits evidence against issuing bank records',
      description: 'The assigned Scrutiny Officer inspects the verification workbench. The officer compares the institution submission, AI OCR extraction overlay, and physical bank confirmation letter, recording a binding audit recommendation (Accept, Return for Correction, or Reject).',
      techStack: 'PostgreSQL RLS · Scrutiny Workbench · Tamper-Resistant Auditing',
      sampleCode: `{
  "case_id": "vc-delhi-fdr-8841",
  "scrutiny_officer": "Sunil Kumar (RO North)",
  "bank_letter_ref": "SBI/AICTE/CONF/2024/99",
  "scrutiny_decision": "ACCEPT",
  "observations": "Original FDR verified with bank branch manager."
}`
    },
    {
      id: 3,
      badge: 'Step 04',
      title: 'Maturity Alarms & Release Sign-Off',
      summary: 'Automated 90-day renewal tracking & executive financial approval',
      description: 'Automated daily cron jobs monitor maturity dates and issue escalation alerts at 90, 60, and 30 days. When an institution applies for release upon completion or closure, the Regional Director exercises statutory financial sign-off with strict 2-person separation of duties.',
      techStack: 'Maturity Cron Monitor · Approving Authority Sign-Off · 2-Person Rule',
      sampleCode: `{
  "release_request_id": "rel-2026-1029",
  "approval_authority": "Dr. V. K. Adiseshiah (Regional Director)",
  "financial_clearance": "APPROVED",
  "student_grievances": "NONE_PENDING",
  "status": "RELEASE_RECORDED"
}`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. NATIONAL TRICOLOR TOP STRIP WITH SHIMMER ANIMATION */}
      <div className="h-1.5 w-full bg-linear-to-r from-[#FF9933] via-white to-[#138808] shimmer-bar" />

      {/* 2. GOVERNMENT OF INDIA & AICTE OFFICIAL TOP BAR */}
      <div className="bg-[#0b1e38] text-slate-200 text-xs py-2 px-4 border-b border-[#1b3d6b]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-400">भारत सरकार | Government of India</span>
            <span className="text-slate-400">|</span>
            <span>शिक्षा मंत्रालय | Ministry of Education</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a href="#guidelines" className="hover:text-amber-300 transition-colors">APH 2024-27 Guidelines</a>
            <span className="text-slate-500">·</span>
            <a href="#calculator" className="hover:text-amber-300 transition-colors">Deposit Calculator</a>
            <span className="text-slate-500">·</span>
            <a href="#faq" className="hover:text-amber-300 transition-colors">Helpdesk & FAQs</a>
            <span className="text-slate-500">·</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Operational</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN PORTAL NAVIGATION HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & Council Branding */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-[#0f294a] flex items-center justify-center text-amber-400 shadow-sm ring-1 ring-amber-400/20 group-hover:scale-105 transition-transform">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0f294a]">
                  अखिल भारतीय तकनीकी शिक्षा परिषद
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                  Govt. of India
                </span>
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">
                AICTE FDR & Security Deposit Portal
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Mandatory Institutional Deposit Governance · Approval Process Handbook (APH)
              </p>
            </div>
          </Link>

          {/* Quick Nav & Sign In CTA */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <a href="#overview" className="hover:text-blue-700 transition-colors">Overview</a>
            <a href="#workflow" className="hover:text-blue-700 transition-colors">Workflow</a>
            <a href="#calculator" className="hover:text-blue-700 transition-colors">Deposit Calculator</a>
            <a href="#ai-ocr" className="hover:text-blue-700 transition-colors">AI & OCR</a>
            <a href="#roles" className="hover:text-blue-700 transition-colors">Portals</a>
            <a href="#faq" className="hover:text-blue-700 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f294a] hover:bg-[#153a66] text-white text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.99] group"
            >
              <span>Portal Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* 4. HERO SECTION WITH ANIMATED ACCENTS */}
      <section id="overview" className="relative bg-linear-to-b from-slate-100 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-200 overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
          <Shield className="w-[850px] h-[850px] text-slate-900" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7">
              {/* Regulatory Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold mb-6 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>STATUTORY COMPLIANCE SYSTEM · APH 2024-27 REGULATIONS</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Digital Governance & Verification for Technical Institutions&apos; Security Deposits
              </h2>

              {/* Sub-paragraph */}
              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                The official centralized platform for the All India Council for Technical Education (AICTE) to monitor, 
                verify, and manage joint-lien Fixed Deposit Receipts (FDRs). Combining automated AI/OCR document 
                extraction, multi-tier regulatory scrutiny, maturity tracking, and immutable audit trails.
              </p>

              {/* Primary Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0f294a] hover:bg-[#1a4478] text-white text-base font-semibold shadow-md transition-all hover:scale-[1.01] group"
                >
                  <span>Institutional Portal Sign In</span>
                  <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-base font-semibold shadow-xs transition-all"
                >
                  <Calculator className="w-5 h-5 text-slate-600" />
                  <span>Deposit Calculator</span>
                </a>
              </div>

              {/* Trust and Compliance Markers */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PostgreSQL Row Level Security (RLS)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI-Assisted Field Discrepancy Checks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Append-Only Immutability</span>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase Badge with Orbital Animation */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative p-8 rounded-3xl bg-[#0f294a] text-white shadow-2xl border border-[#1b3d6b] max-w-sm w-full text-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-400 via-blue-400 to-emerald-400 shimmer-bar" />

                {/* Animated Concentric Rings Emblem */}
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center my-4">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/40 animate-spin-slow" />
                  <div className="absolute w-24 h-24 rounded-full border border-dotted border-blue-400/60 animate-spin-reverse" />
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-xl">
                    <Shield className="w-9 h-9" />
                  </div>
                </div>

                <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-1">
                  National Security Vault
                </div>
                <div className="text-lg font-bold text-white mb-2">
                  Joint Lien Protection
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Mandatory dual-lien endorsement ensuring zero unauthorized encashment prior to Council sign-off.
                </p>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Lock-in Tenor:</span>
                    <span className="text-emerald-400 font-bold font-mono">8 to 10 Years</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Bank Scope:</span>
                    <span className="text-amber-300 font-bold font-mono">RBI Scheduled Banks</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Lien Holder:</span>
                    <span className="text-white font-bold font-mono">AICTE New Delhi</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. STATS STRIP */}
      <section className="bg-[#0f294a] text-white py-10 border-y border-[#1b3d6b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="p-4 rounded-xl bg-[#163863] border border-[#23508a] transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <Landmark className="w-6 h-6" />
                <span className="text-xs font-mono uppercase bg-amber-400/10 px-2 py-0.5 rounded text-amber-300">Mandate</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100% Joint Lien</div>
              <div className="text-xs text-slate-300 mt-1">Jointly in the name of AICTE & Society/Trust</div>
            </div>

            <div className="p-4 rounded-xl bg-[#163863] border border-[#23508a] transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <Sparkles className="w-6 h-6" />
                <span className="text-xs font-mono uppercase bg-emerald-400/10 px-2 py-0.5 rounded text-emerald-300">AI Powered</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">Automated OCR</div>
              <div className="text-xs text-slate-300 mt-1">IFSC, FDR Number, Dates & Amount Cross-Match</div>
            </div>

            <div className="p-4 rounded-xl bg-[#163863] border border-[#23508a] transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-blue-400 mb-2">
                <Users className="w-6 h-6" />
                <span className="text-xs font-mono uppercase bg-blue-400/10 px-2 py-0.5 rounded text-blue-300">Separation</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">4-Tier Governance</div>
              <div className="text-xs text-slate-300 mt-1">Institutions, Scrutiny, Approvers & Admins</div>
            </div>

            <div className="p-4 rounded-xl bg-[#163863] border border-[#23508a] transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-purple-400 mb-2">
                <Clock className="w-6 h-6" />
                <span className="text-xs font-mono uppercase bg-purple-400/10 px-2 py-0.5 rounded text-purple-300">Proactive</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">90-Day Alarms</div>
              <div className="text-xs text-slate-300 mt-1">Automated maturity & renewal notifications</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STATUTORY COMPLIANCE NOTICE TICKER */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 text-xs text-amber-950">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          <div className="truncate">
            <span className="font-bold">Official Statutory Advisory:</span> Fixed Deposit Receipts must be issued by a Scheduled Commercial Bank recognized by RBI. The instrument must explicitly endorse the joint lien clause in favor of the Regional Officer, AICTE. Unilateral encashment without Council approval constitutes an offense under AICTE regulations.
          </div>
        </div>
      </div>

      {/* 7. INTERACTIVE 4-STAGE LIFECYCLE WORKFLOW STEPPER */}
      <section id="workflow" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
              Standard Operating Procedure
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive FDR Verification & Governance Lifecycle
            </h3>
            <p className="mt-3 text-base text-slate-600">
              Select any stage below to inspect the real-time operational payload, verification checks, and audit standards:
            </p>
          </div>

          {/* Interactive Stepper Navigation Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {workflowStages.map((stage) => {
              const isActive = activeWorkflowTab === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveWorkflowTab(stage.id)}
                  className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#0f294a] text-white border-[#0f294a] shadow-md scale-100'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
                    isActive ? 'text-amber-400' : 'text-slate-500'
                  }`}>
                    {stage.badge}
                  </div>
                  <div className="font-bold text-sm leading-tight">{stage.title}</div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Details Showcase Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700 text-blue-300 text-xs font-semibold">
                  <span>{workflowStages[activeWorkflowTab].badge}</span>
                  <span>·</span>
                  <span>{workflowStages[activeWorkflowTab].title}</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-white">
                  {workflowStages[activeWorkflowTab].summary}
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {workflowStages[activeWorkflowTab].description}
                </p>
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-amber-400 font-mono">
                  <Server className="w-4 h-4 shrink-0" />
                  <span>Enforcement Architecture: {workflowStages[activeWorkflowTab].techStack}</span>
                </div>
              </div>

              {/* Terminal Code Display */}
              <div className="lg:col-span-5 bg-black/60 rounded-2xl p-4 border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                  <span>payload_sample.json</span>
                  <span className="text-emerald-400">STATE_SYNCHRONIZED</span>
                </div>
                <pre className="text-slate-300 leading-relaxed overflow-x-auto text-[11px]">
                  {workflowStages[activeWorkflowTab].sampleCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE STATUTORY DEPOSIT & TENOR CALCULATOR */}
      <section id="calculator" className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>APH 2024-27 Regulatory Tool</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive Security Deposit & Tenor Calculator
            </h3>
            <p className="mt-3 text-base text-slate-600">
              Calculate statutory fixed deposit amounts and mandatory lock-in duration based on program type and approval category:
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Program / Discipline Category:
                  </label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a]"
                  >
                    <option value="eng">Engineering & Technology (UG/PG)</option>
                    <option value="mgmt">Management Studies (MBA / PGDM)</option>
                    <option value="poly">Polytechnic / Diploma Engineering</option>
                    <option value="pharm">Pharmacy (B.Pharm / M.Pharm)</option>
                    <option value="arch">Architecture & Applied Arts (B.Arch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Approval Scope / Application Tier:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('new_inst')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        selectedCategory === 'new_inst'
                          ? 'bg-[#0f294a] text-white border-[#0f294a]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      New Institute
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('new_prog')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        selectedCategory === 'new_prog'
                          ? 'bg-[#0f294a] text-white border-[#0f294a]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      New Program
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('expansion')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        selectedCategory === 'expansion'
                          ? 'bg-[#0f294a] text-white border-[#0f294a]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Expansion
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Regulatory Reference:</span> {currentProg.aphClause}
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="p-6 rounded-2xl bg-[#0f294a] text-white shadow-lg space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Mandatory Instrument Requirements
                </div>

                <div>
                  <div className="text-xs text-slate-300">Statutory FDR Principal Sum:</div>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    ₹ {calculatedDeposit.toLocaleString('en-IN')}.00
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700 text-xs">
                  <div>
                    <div className="text-slate-400">Mandated Lock-in:</div>
                    <div className="text-emerald-400 font-bold font-mono text-sm">{currentProg.tenorYears} Years Lock-in</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Proactive Alerts:</div>
                    <div className="text-amber-300 font-bold font-mono text-sm">90, 60, 30 Days</div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-300">
                  Endorsement: Must be drawn jointly in name of Regional Officer, AICTE and Society/Trust.
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 9. AI & OCR INTELLIGENCE SECTION */}
      <section id="ai-ocr" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Specialized Document Intelligence Service</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Automated OCR Extraction & Discrepancy Analysis
              </h3>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                The portal integrates a dedicated Python FastAPI service that ingests scanned certificates and digital PDF receipts. 
                Using computer vision preprocessing (Gaussian filtering, Otsu thresholding) and optical character recognition, it verifies 
                that the physical certificate matches the metadata submitted by the institution.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">IFSC & Scheduled Bank Verification</h5>
                    <p className="text-xs text-slate-500">Detects issuing bank branch and confirms RBI scheduled commercial status.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Joint Lien Endorsement Clause Check</h5>
                    <p className="text-xs text-slate-500">Extracts certificate text to verify inclusion of &quot;AICTE&quot; as joint holder under lien.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Tenor & Maturity Date Precision</h5>
                    <p className="text-xs text-slate-500">Cross-checks deposit duration against mandated APH approval requirements (8-10 years).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Terminal / Card */}
            <div className="p-6 rounded-2xl bg-[#0f294a] text-slate-100 shadow-xl border border-[#1b3d6b]">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-mono text-slate-400 ml-2 text-[11px]">aicte_ai_extractor.py</span>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">HTTP 200 OK · Tesseract 5.5</span>
              </div>

              <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto p-4 rounded-xl bg-[#0a1b30]">
{`{
  "fdr_number": "SBI-FDR-2024-9988",
  "bank_name": "State Bank of India",
  "ifsc_code": "SBIN0001234",
  "principal_amount": 10000000.00,
  "maturity_date": "2034-03-31",
  "joint_holder_found": true,
  "joint_holder_text": "Jointly with AICTE New Delhi",
  "discrepancies": [],
  "confidence_score": 0.96,
  "recommendation": "VERIFIED_MATCH"
}`}
              </pre>

              <div className="mt-4 pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                <span>Algorithm: PyMuPDF + OpenCV Otsu + Tesseract PSM 6</span>
                <span className="text-amber-400 font-semibold">Latency: ~380ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. MULTI-ROLE PORTALS & ACCESS GATEWAYS */}
      <section id="roles" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
              Role-Based Access Control (RBAC)
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dedicated Institutional & Regulatory Portals
            </h3>
            <p className="mt-3 text-base text-slate-600">
              PostgreSQL Row Level Security ensures users access only records matching their verified institutional scope or official cell authority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Institution User */}
            <div className="p-6 rounded-2xl border border-emerald-200 bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider mb-1">Role 01</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Technical Institutions</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Registrars and authorized trustees submit FDR records, monitor maturity status, upload renewed instruments, and initiate refund requests.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Institution Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Scrutiny Officer */}
            <div className="p-6 rounded-2xl border border-blue-200 bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-blue-800 uppercase tracking-wider mb-1">Role 02</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Scrutiny Officers</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Regional Scrutiny Cells audit FDR submissions, inspect OCR extraction flags, verify bank letters, and submit formal verification recommendations.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Scrutiny Cell Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Approving Authority */}
            <div className="p-6 rounded-2xl border border-purple-200 bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-purple-800 uppercase tracking-wider mb-1">Role 03</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Approving Authorities</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Regional Directors and authorized financial signatories exercise release authority, signing off on refund disbursements upon complete compliance.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Approver Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* System Administrator */}
            <div className="p-6 rounded-2xl border border-amber-200 bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider mb-1">Role 04</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">System Administrators</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Council IT administrators monitor append-only audit event streams, manage institution memberships, system parameters, and security policies.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Admin Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
              Clarifications & Assistance
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="mt-3 text-base text-slate-600">
              Guidance for institutions, registrars, and bank officials regarding deposit compliance.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50 transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:bg-slate-100/70 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-100 animate-fade-in-up">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. OFFICIAL FOOTER */}
      <footer className="bg-[#0b1e38] text-white pt-12 pb-8 border-t border-[#1b3d6b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1b3d6b] text-xs">
            {/* Column 1: Council Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Shield className="w-5 h-5" />
                <span>AICTE FDR PORTAL</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                All India Council for Technical Education (AICTE), Statutory Body of the Ministry of Education, Government of India.
              </p>
              <div className="text-slate-400">
                Nelson Mandela Marg, Vasant Kunj,<br />
                New Delhi - 110070, India
              </div>
            </div>

            {/* Column 2: Portals & Links */}
            <div>
              <h5 className="font-bold text-amber-400 mb-3 uppercase tracking-wider text-[11px]">Portal Navigation</h5>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/login" className="hover:text-white transition-colors">Institutional Single Sign-On</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Scrutiny Cell Gateway</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Approving Authority Portal</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Audit & System Administration</Link></li>
              </ul>
            </div>

            {/* Column 3: Regulations */}
            <div>
              <h5 className="font-bold text-amber-400 mb-3 uppercase tracking-wider text-[11px]">Regulatory Resources</h5>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#guidelines" className="hover:text-white transition-colors">Approval Process Handbook 2024-27</a></li>
                <li><a href="#calculator" className="hover:text-white transition-colors">APH Deposit Calculator</a></li>
                <li><a href="#workflow" className="hover:text-white transition-colors">Joint Lien Endorsement Formats</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Scheduled Bank Verification Guidelines</a></li>
              </ul>
            </div>

            {/* Column 4: Helpdesk */}
            <div>
              <h5 className="font-bold text-amber-400 mb-3 uppercase tracking-wider text-[11px]">Helpdesk & Assistance</h5>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>fdr-helpdesk@aicte-india.org</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>011-29581000 / 29581050</span>
                </div>
                <div className="mt-3 p-2.5 rounded-lg bg-[#143259] text-[11px] text-slate-300">
                  Helpdesk Hours: 09:30 AM – 05:30 PM (IST), Mon – Fri (Excl. Gazetted Holidays)
                </div>
              </div>
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © 2026 All India Council for Technical Education. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Security Audited</span>
              <span>·</span>
              <span>NIC Standards Compliant</span>
              <span>·</span>
              <span>Information Technology Act, 2000</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
