'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
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
  Info,
  RefreshCw,
  Check,
  ShieldCheck,
  Server
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
  const [activePersonaEmail, setActivePersonaEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Security Verification Code (Captcha)
  const [captchaCode, setCaptchaCode] = useState('7B9K');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Generate dynamic captcha on mount
  useEffect(() => {
    generateNewCaptcha();
  }, []);

  function generateNewCaptcha() {
    setIsSpinning(true);
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setTimeout(() => setIsSpinning(false), 500);
  }

  // Password strength meter calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const pwdScore = getPasswordStrength(password);

  const personas = [
    {
      role: 'institution_user' as SystemRole,
      category: 'institution',
      name: 'Dr. Rajesh Sharma',
      email: 'registrar@dit.edu.in',
      title: 'Institution Registrar',
      institution: 'Delhi Institute of Advanced Technology',
      badge: 'Institution Scope',
      accentColor: 'border-emerald-300/80 bg-linear-to-br from-emerald-50/80 to-emerald-100/30 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-900/5',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-800',
      icon: Building2,
      permissions: 'Uploads FDRs, monitors renewal alarms, submits refund applications.',
    },
    {
      role: 'scrutiny_officer' as SystemRole,
      category: 'official',
      name: 'Sunil Kumar',
      email: 'officer@aicte-india.org',
      title: 'Regional Scrutiny Officer',
      institution: 'Regional Scrutiny Cell (AICTE North)',
      badge: 'Scrutiny & OCR Audit',
      accentColor: 'border-blue-300/80 bg-linear-to-br from-blue-50/80 to-blue-100/30 hover:border-blue-500 hover:shadow-md hover:shadow-blue-900/5',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      iconBg: 'bg-blue-100 text-blue-800',
      icon: FileSearch,
      permissions: 'Audits AI OCR discrepancies, verifies bank letters, submits scrutiny decisions.',
    },
    {
      role: 'approving_authority' as SystemRole,
      category: 'official',
      name: 'Dr. V. K. Adiseshiah',
      email: 'approver@aicte-india.org',
      title: 'Approving Authority',
      institution: 'Regional Directorate / Financial Sign-off',
      badge: 'Release Authority',
      accentColor: 'border-purple-300/80 bg-linear-to-br from-purple-50/80 to-purple-100/30 hover:border-purple-500 hover:shadow-md hover:shadow-purple-900/5',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      iconBg: 'bg-purple-100 text-purple-800',
      icon: Scale,
      permissions: 'Exercises financial authority, approves deposit releases upon compliance.',
    },
    {
      role: 'administrator' as SystemRole,
      category: 'official',
      name: 'Sanjay Verma',
      email: 'admin@aicte-india.org',
      title: 'System Administrator',
      institution: 'AICTE Headquarters, New Delhi',
      badge: 'Headquarters IT & Audit',
      accentColor: 'border-amber-300/80 bg-linear-to-br from-amber-50/80 to-amber-100/30 hover:border-amber-500 hover:shadow-md hover:shadow-amber-900/5',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      iconBg: 'bg-amber-100 text-amber-800',
      icon: Shield,
      permissions: 'Monitors immutable audit ledger, configures system and institution parameters.',
    },
  ];

  async function handleQuickPersonaLogin(persona: typeof personas[0]) {
    setIsLoading(true);
    setActivePersonaEmail(persona.email);
    setErrorMessage(null);
    setEmail(persona.email);
    setPassword('Password@123');
    try {
      await switchRole(persona.role);
      router.push(next);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Quick login failed');
      setIsLoading(false);
      setActivePersonaEmail(null);
    }
  }

  async function handleStandardSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your registered institutional email address.');
      return;
    }

    if (userCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('Security verification code does not match. Please re-enter the code.');
      generateNewCaptcha();
      setUserCaptcha('');
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
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. NATIONAL TRICOLOR TOP STRIP WITH CONTINUOUS SHIMMER ANIMATION */}
      <div className="h-1.5 w-full bg-linear-to-r from-[#FF9933] via-white to-[#138808] shimmer-bar" />

      {/* 2. SUB-HEADER / RETURN LINK */}
      <div className="bg-[#0b1e38] text-white py-2.5 px-4 border-b border-[#1b3d6b]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Return to Portal Home & Overview</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono">TLS 1.3 · 256-Bit Encrypted</span>
            </div>
            <div className="h-3 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              <span>Ministry of Education · Govt. of India</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN LOGIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center animate-fade-in-up">
        
        {/* Animated Brand Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0f294a] text-amber-400 mb-4 shadow-xl ring-2 ring-amber-400/30 animate-float">
            <Shield className="w-9 h-9" />
            <div className="absolute -inset-1 rounded-2xl bg-amber-400/20 filter blur-sm -z-10 animate-pulse-glow" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2 shadow-2xs">
            Approval Process Handbook (APH) Mandatory System
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            AICTE Security Deposit & FDR Management Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Institutional Single Sign-On (SSO) & Regulatory Scrutiny Gateway
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto w-full mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3 shadow-sm animate-scale-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-rose-700 hover:text-rose-950 font-bold ml-2 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TWO-COLUMN GRID: LEFT = CREDENTIAL LOGIN, RIGHT = 1-CLICK DEMO PERSONAS */}
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: INTERACTIVE CREDENTIAL LOGIN FORM (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
            
            {/* Tab Switcher */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Portal Sign In</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
                    v1.0
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Enter authorized institutional credentials</p>
              </div>

              {/* Animated Mode Pill */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('institution');
                    if (email.includes('aicte-india.org')) setEmail('');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'institution'
                      ? 'bg-white text-blue-900 shadow-xs scale-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Institution
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('official');
                    if (email.includes('.edu.in')) setEmail('');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'official'
                      ? 'bg-white text-blue-900 shadow-xs scale-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AICTE Cell
                </button>
              </div>
            </div>

            <form onSubmit={handleStandardSubmit} className="space-y-4">
              {/* Email Input with Smooth Elevation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  {activeTab === 'institution' ? 'Institutional Registered Email' : 'Official Council Email'}
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-[#0f294a] transition-colors" />
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
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white focus:border-transparent transition-all duration-200 focus:-translate-y-0.5 focus:shadow-xs"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide & Complexity Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-[#0f294a] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white focus:border-transparent transition-all duration-200 focus:-translate-y-0.5 focus:shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-transform active:scale-90 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Animated Password Strength Bar */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1 animate-fade-in-up">
                    <div className="flex h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`transition-all duration-500 rounded-full ${
                          pwdScore <= 1 
                            ? 'w-1/4 bg-rose-500' 
                            : pwdScore === 2 
                            ? 'w-2/4 bg-amber-500' 
                            : pwdScore === 3 
                            ? 'w-3/4 bg-blue-500' 
                            : 'w-full bg-emerald-500'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>Security:</span>
                      <span className={
                        pwdScore <= 1 ? 'text-rose-600 font-bold' : pwdScore === 2 ? 'text-amber-600 font-bold' : pwdScore === 3 ? 'text-blue-600 font-bold' : 'text-emerald-600 font-bold'
                      }>
                        {pwdScore <= 1 ? 'Basic' : pwdScore === 2 ? 'Moderate' : pwdScore === 3 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Institutional Captcha Token with Rotation Animation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Security Verification Code
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-amber-400 font-mono font-extrabold text-sm tracking-widest select-none border border-slate-700 shadow-inner">
                    <span className="skew-x-6">{captchaCode}</span>
                    <button
                      type="button"
                      onClick={generateNewCaptcha}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded"
                      title="Generate new code"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={userCaptcha}
                    onChange={(e) => setUserCaptcha(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0f294a] border-slate-300 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
                    Keep session active (24 hours)
                  </span>
                </label>
              </div>

              {/* Animated Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#0f294a] hover:bg-[#163a66] active:bg-[#0b1e38] text-white text-xs font-bold tracking-wide uppercase shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer hover:shadow-lg hover:shadow-blue-950/20 active:scale-[0.99] group"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Verifying Institutional Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
                    <span>Authorize & Access Portal</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>Statutory Advisory:</strong> All access attempts, IP addresses, and cryptographic session tokens are logged in compliance with AICTE Information Security Policy.
              </span>
            </div>
          </div>

          {/* COLUMN 2: 1-CLICK DEMO & EVALUATION PERSONAS (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-700 animate-pulse" />
                  <span>Interactive Viva & Demo Mode</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Instant Role Evaluation Personas
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                4 RLS Scopes
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Click any verified persona below to test role-specific Row Level Security (RLS) views and permission boundaries:
            </p>

            <div className="space-y-3">
              {personas.map((persona) => {
                const IconComponent = persona.icon;
                const isThisLoading = isLoading && activePersonaEmail === persona.email;

                return (
                  <button
                    key={persona.email}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickPersonaLogin(persona)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 text-xs flex items-start justify-between gap-3 cursor-pointer group hover:-translate-y-0.5 active:scale-[0.98] ${persona.accentColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${persona.iconBg} group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-950 text-xs group-hover:text-blue-900 transition-colors">
                            {persona.name}
                          </span>
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
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-[11px] font-bold shadow-2xs group-hover:bg-blue-900 group-hover:text-white group-hover:border-blue-900 transition-all">
                        {isThisLoading ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                        ) : (
                          <>
                            <span>Sign In</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Simulates genuine Supabase JWT session claims.</span>
              </div>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Audit Active
              </span>
            </div>
          </div>

        </div>

        {/* BOTTOM SECURITY FOOTER BAR */}
        <div className="mt-12 text-center text-xs text-slate-500 space-y-1.5">
          <p>
            Notice: Unauthorized access to this government portal is strictly prohibited and punishable under 
            Sections 43 and 66 of the Information Technology Act, 2000.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>256-Bit TLS Encryption</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-slate-500" />
              <span>PostgreSQL Row Level Security (RLS)</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-500" />
              <span>National Informatics Centre (NIC) Standards</span>
            </span>
          </div>
        </div>
      </div>

      {/* ANIMATED FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs animate-scale-in">
            <div className="flex items-center gap-3 text-slate-900 font-bold text-sm mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div>Institutional Password Recovery</div>
                <div className="text-xs font-normal text-slate-500">Dispatch verified reset credentials</div>
              </div>
            </div>

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in-up">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span className="leading-relaxed">
                  Password recovery instructions dispatched to registered institutional email address.
                </span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-slate-600 leading-relaxed">
                  Enter your registered institutional or AICTE official email to receive secure recovery credentials:
                </p>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="registrar@dit.edu.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#0f294a] hover:bg-[#1a4478] text-white font-bold shadow-xs transition-all cursor-pointer hover:shadow-md"
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
