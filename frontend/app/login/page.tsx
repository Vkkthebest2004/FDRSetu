'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Building2, 
  FileSearch, 
  Scale, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth, AuthProvider } from '@/lib/auth/AuthContext';
import { SystemRole } from '@/lib/types/database';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const { signIn, switchRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeTab, setActiveTab] = useState<'institution' | 'official'>('institution');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const personas = [
    {
      role: 'institution_user' as SystemRole,
      category: 'institution',
      name: 'Dr. Rajesh Sharma',
      email: 'registrar@dit.edu.in',
      title: 'Institution Registrar',
      institution: 'Delhi Institute of Advanced Technology',
      badge: 'Institution Scope',
      accentColor: 'border-emerald-300 bg-emerald-50/70 text-emerald-950 hover:bg-emerald-100/70',
      badgeColor: 'bg-emerald-200 text-emerald-900 border-emerald-300',
      icon: Building2,
      permissions: 'Submits FDR certificates, tracks renewal alarms, initiates refund requests.',
    },
    {
      role: 'scrutiny_officer' as SystemRole,
      category: 'official',
      name: 'Sunil Kumar',
      email: 'officer@aicte-india.org',
      title: 'Regional Scrutiny Officer',
      institution: 'Regional Scrutiny Cell (AICTE North)',
      badge: 'Scrutiny & OCR Audit',
      accentColor: 'border-blue-300 bg-blue-50/70 text-blue-950 hover:bg-blue-100/70',
      badgeColor: 'bg-blue-200 text-blue-900 border-blue-300',
      icon: FileSearch,
      permissions: 'Inspects AI OCR discrepancies, audits bank letters, files scrutiny recommendations.',
    },
    {
      role: 'approving_authority' as SystemRole,
      category: 'official',
      name: 'Dr. V. K. Adiseshiah',
      email: 'approver@aicte-india.org',
      title: 'Approving Authority',
      institution: 'Regional Directorate / Financial Sign-off',
      badge: 'Release Authority',
      accentColor: 'border-purple-300 bg-purple-50/70 text-purple-950 hover:bg-purple-100/70',
      badgeColor: 'bg-purple-200 text-purple-900 border-purple-300',
      icon: Scale,
      permissions: 'Exercises financial sign-off, approves security deposit refund releases.',
    },
    {
      role: 'administrator' as SystemRole,
      category: 'official',
      name: 'Sanjay Verma',
      email: 'admin@aicte-india.org',
      title: 'System Administrator',
      institution: 'AICTE Headquarters, New Delhi',
      badge: 'Headquarters IT & Audit',
      accentColor: 'border-amber-300 bg-amber-50/70 text-amber-950 hover:bg-amber-100/70',
      badgeColor: 'bg-amber-200 text-amber-900 border-amber-300',
      icon: Shield,
      permissions: 'Monitors immutable audit events, manages institutions & system parameters.',
    },
  ];

  async function handleQuickPersonaLogin(persona: typeof personas[0]) {
    setIsLoading(true);
    setErrorMessage(null);
    setEmail(persona.email);
    setPassword('Password@123');
    try {
      await switchRole(persona.role);
      router.push(next);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Quick login failed');
      setIsLoading(false);
    }
  }

  async function handleStandardSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await signIn(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication rejected. Please verify your credentials or select an evaluation profile.');
      setIsLoading(false);
    }
  }

  function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSuccess(false);
    }, 2500);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* 1. NATIONAL TRICOLOR STRIP */}
      <div className="h-1.5 w-full bg-linear-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* 2. SUB-HEADER / RETURN LINK */}
      <div className="bg-[#0b1e38] text-white py-3 px-4 border-b border-[#1b3d6b]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to AICTE FDR Portal Overview</span>
          </Link>
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Ministry of Education · Government of India</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN LOGIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-center">
        {/* Brand & Portal Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0f294a] text-amber-400 mb-3 shadow-md ring-1 ring-amber-400/20">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            AICTE Security Deposit & FDR Management Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Statutory Approval Process Handbook (APH) · Institutional Single Sign-On
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto w-full mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-rose-600 hover:text-rose-900 font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TWO-COLUMN GRID: LEFT = CREDENTIAL LOGIN, RIGHT = 1-CLICK DEMO PERSONAS */}
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: STANDARD CREDENTIAL LOGIN (5 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Institutional Access</h2>
                <p className="text-xs text-slate-500">Sign in with registered credentials</p>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('institution')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    activeTab === 'institution'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Institution
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('official')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    activeTab === 'official'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AICTE Cell
                </button>
              </div>
            </div>

            <form onSubmit={handleStandardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Registered Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      activeTab === 'institution' 
                        ? 'registrar@dit.edu.in' 
                        : 'officer@aicte-india.org'
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Portal Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#0f294a] border-slate-300 focus:ring-0"
                  />
                  <span className="text-xs text-slate-600">Keep session active (24 hours)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0f294a] hover:bg-[#163a66] active:bg-[#0b1e38] text-white text-xs font-bold tracking-wide uppercase shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Authorize & Access Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Statutory Advisory:</strong> All access attempts, IP addresses, and cryptographic session tokens are logged in compliance with AICTE Information Security Policy.
              </span>
            </div>
          </div>

          {/* COLUMN 2: 1-CLICK DEMO & EVALUATION PERSONAS (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>Evaluation & Demonstration Mode</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  1-Click Role Switcher
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">4 Verified Personas</span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Select any role below to instantly authenticate and evaluate role-specific Row Level Security (RLS) views and permission boundaries:
            </p>

            <div className="space-y-3">
              {personas.map((persona) => {
                const IconComponent = persona.icon;
                return (
                  <button
                    key={persona.email}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickPersonaLogin(persona)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 cursor-pointer ${persona.accentColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/80 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <IconComponent className="w-4 h-4 text-slate-800" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-950 text-xs">{persona.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${persona.badgeColor}`}>
                            {persona.badge}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-700">{persona.title}</div>
                        <div className="text-[10px] text-slate-600 font-mono mt-0.5">{persona.email}</div>
                        <div className="text-[10px] text-slate-500 mt-1 italic">{persona.permissions}</div>
                      </div>
                    </div>

                    <div className="shrink-0 self-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 text-[11px] font-bold shadow-2xs hover:bg-slate-50">
                        <span>Sign In</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Simulates full Supabase RLS and token claims.</span>
              </div>
              <span className="font-semibold text-blue-700">Audit Active</span>
            </div>
          </div>

        </div>

        {/* BOTTOM SECURITY FOOTER BAR */}
        <div className="mt-12 text-center text-xs text-slate-500 space-y-1">
          <p>
            Notice: Unauthorized access to this government portal is strictly prohibited and punishable under 
            Sections 43 and 66 of the Information Technology Act, 2000.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
            <span>256-Bit TLS Encryption</span>
            <span>·</span>
            <span>PostgreSQL Row Level Security (RLS)</span>
            <span>·</span>
            <span>National Informatics Centre (NIC) Standards</span>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3 text-slate-900 font-bold text-sm mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <span>Institutional Password Recovery</span>
            </div>

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Password recovery instructions dispatched to registered institutional email.</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-slate-600 leading-relaxed">
                  Enter your registered institutional or AICTE official email to receive secure recovery credentials:
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="registrar@dit.edu.in"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white"
                />
                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#0f294a] hover:bg-[#1a4478] text-white font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-medium">
          Loading AICTE Portal Single Sign-On...
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </AuthProvider>
  );
}
