'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw,
  FileText,
  Landmark
} from 'lucide-react';
import { useAuth, AuthProvider } from '@/lib/auth/AuthContext';

function RegisterFormContent() {
  const router = useRouter();
  const { signUp } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('Registrar');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aicteId, setAicteId] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('Engineering & Technology');
  const [state, setState] = useState('Delhi');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [undertakingAgreed, setUndertakingAgreed] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Captcha
  const [captchaCode, setCaptchaCode] = useState('9W4X');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // Loading Overlay state
  const [regLoadingStep, setRegLoadingStep] = useState<'IDLE' | 'ENCRYPTING' | 'REGISTERING_DB' | 'FINALIZING'>('IDLE');

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // Validation checks
    if (!fullName || !email || !aicteId || !institutionName || !password) {
      setErrorMessage('Please fill in all mandatory institutional registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long and contain letters and numbers.');
      return;
    }

    if (userCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('Security verification code does not match. Please re-enter the code.');
      generateNewCaptcha();
      setUserCaptcha('');
      return;
    }

    if (!undertakingAgreed) {
      setErrorMessage('You must confirm the statutory regulatory declaration before registering.');
      return;
    }

    // Trigger multi-phase animated loading overlay
    setRegLoadingStep('ENCRYPTING');

    try {
      await new Promise(r => setTimeout(r, 260));
      setRegLoadingStep('REGISTERING_DB');

      const res = await signUp({
        email,
        password,
        fullName,
        phone,
        designation,
        aicteId,
        institutionName,
        institutionType,
        state,
        city: city || state,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed. Please review your details.');
        setRegLoadingStep('IDLE');
        return;
      }

      setRegLoadingStep('FINALIZING');
      await new Promise(r => setTimeout(r, 240));
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred during institutional registration.');
      setRegLoadingStep('IDLE');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. NATIONAL TRICOLOR TOP STRIP WITH SHIMMER ANIMATION */}
      <div className="h-1.5 w-full bg-linear-to-r from-[#FF9933] via-white to-[#138808] shimmer-bar" />

      {/* 2. SUB-HEADER / RETURN LINK */}
      <div className="bg-[#0b1e38] text-white py-2.5 px-4 border-b border-[#1b3d6b]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Already have an account? Sign In</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono">TLS 1.3 · 256-Bit Encrypted Registration</span>
            </div>
            <div className="h-3 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              <span>Ministry of Education · Govt. of India</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN REGISTRATION CONTAINER */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center animate-fade-in-up">
        
        {/* Animated Brand Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0f294a] text-amber-400 mb-3 shadow-xl ring-2 ring-amber-400/30 animate-float">
            <Building2 className="w-8 h-8" />
            <div className="absolute -inset-1 rounded-2xl bg-amber-400/20 filter blur-sm -z-10 animate-pulse-glow" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2 shadow-2xs">
            Institutional Onboarding Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Register Technical Institution Account
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            For Colleges, Polytechnics, and Universities filing FDR Security Deposits under AICTE APH Norms
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3 shadow-sm animate-scale-in">
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

        {/* REGISTRATION FORM CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm transition-shadow hover:shadow-md">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: SIGNATORY DETAILS */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-xs">
                  1
                </div>
                <span>Authorized Signatory / Institutional Representative</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Full Name & Title *
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-[#0f294a] transition-colors" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Ramesh Gupta"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Official Designation *
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                  >
                    <option value="Registrar">Registrar</option>
                    <option value="Principal">Principal / Dean</option>
                    <option value="Director">Director / Head of Institute</option>
                    <option value="Trustee">Trustee / Society Secretary</option>
                    <option value="Finance Officer">Finance / Accounts Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Institutional Email Address *
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-[#0f294a] transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="registrar@college.edu.in"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Official Mobile / Contact Number
                  </label>
                  <div className="relative group">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-[#0f294a] transition-colors" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98112 34567"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: INSTITUTION INFORMATION */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                  2
                </div>
                <span>Technical Institution & AICTE Affiliation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    AICTE Permanent Institute ID *
                  </label>
                  <div className="relative group">
                    <Landmark className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-[#0f294a] transition-colors" />
                    <input
                      type="text"
                      required
                      value={aicteId}
                      onChange={(e) => setAicteId(e.target.value)}
                      placeholder="e.g. 1-4567890123"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Found on your AICTE Approval Letter or Portal Portal ID</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Institution Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. National Institute of Technology & Science"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Institution Discipline / Category *
                  </label>
                  <select
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                  >
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Management">Management (MBA/PGDM)</option>
                    <option value="Polytechnic">Polytechnic / Diploma</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Architecture">Architecture & Applied Arts</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Delhi / Maharashtra"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Delhi"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: SECURITY CREDENTIALS */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-xs">
                  3
                </div>
                <span>Portal Security & Password</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Create Password *
                  </label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-[#0f294a] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-transform active:scale-90 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`transition-all duration-500 rounded-full ${
                            pwdScore <= 1 ? 'w-1/4 bg-rose-500' : pwdScore === 2 ? 'w-2/4 bg-amber-500' : pwdScore === 3 ? 'w-3/4 bg-blue-500' : 'w-full bg-emerald-500'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Complexity:</span>
                        <span className={
                          pwdScore <= 1 ? 'text-rose-600 font-bold' : pwdScore === 2 ? 'text-amber-600 font-bold' : pwdScore === 3 ? 'text-blue-600 font-bold' : 'text-emerald-600 font-bold'
                        }>
                          {pwdScore <= 1 ? 'Basic' : pwdScore === 2 ? 'Moderate' : pwdScore === 3 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 group-focus-within:text-[#0f294a] transition-colors" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-transform active:scale-90 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && confirmPassword !== password && (
                    <span className="text-[10px] text-rose-600 mt-1 block">Passwords do not match</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4: CAPTCHA & STATUTORY UNDERTAKING */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Security Anti-Bot Verification Code *
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
                    className="max-w-[200px] px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-[#0f294a] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Statutory Declaration */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={undertakingAgreed}
                    onChange={(e) => setUndertakingAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#0f294a] border-slate-300 focus:ring-0 cursor-pointer"
                  />
                  <span className="leading-relaxed">
                    <strong>Statutory Undertaking:</strong> I hereby declare that I am the authorized institutional representative of the applicant technical society/trust. All FDR certificates and documentation submitted under this account will comply with the AICTE Approval Process Handbook (APH) joint-lien mandates and RBI regulations.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-[#0f294a] hover:bg-[#163a66] active:bg-[#0b1e38] text-white text-xs font-bold tracking-wide uppercase shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-blue-950/20 active:scale-[0.99] group"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Submit Institutional Registration & Access Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </form>

          {/* Bottom Footer Note */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Already have an institutional login?{' '}
              <Link href="/login" className="font-bold text-blue-700 hover:text-blue-900 underline">
                Sign In to Portal
              </Link>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span>PostgreSQL RLS Protected</span>
              <span>·</span>
              <span>Audit Logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FULL-SCREEN ANIMATED REGISTRATION LOADING OVERLAY */}
      {regLoadingStep !== 'IDLE' && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white animate-scale-in">
          <div className="relative flex items-center justify-center mb-8">
            {/* Outer Orbiting Ring */}
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-emerald-400/50 animate-spin-slow" />
            {/* Counter Orbiting Ring */}
            <div className="absolute w-20 h-20 rounded-full border-2 border-dotted border-blue-400/70 animate-spin-reverse" />
            {/* Central Seal */}
            <div className="absolute w-14 h-14 rounded-2xl bg-[#0f294a] border border-emerald-400/70 flex items-center justify-center text-emerald-400 shadow-2xl">
              <Building2 className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="text-center max-w-sm w-full space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              {regLoadingStep === 'ENCRYPTING' && 'Phase 1 of 3: Cryptographic Token Generation'}
              {regLoadingStep === 'REGISTERING_DB' && 'Phase 2 of 3: Institutional Schema & RLS Binding'}
              {regLoadingStep === 'FINALIZING' && 'Phase 3 of 3: Initializing Institution Dashboard'}
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              {regLoadingStep === 'ENCRYPTING' && 'Securing Institutional Credentials...'}
              {regLoadingStep === 'REGISTERING_DB' && 'Creating Institution Profile & Audit Trail...'}
              {regLoadingStep === 'FINALIZING' && 'Onboarding Complete! Opening Portal...'}
            </h3>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative mt-2 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  regLoadingStep === 'ENCRYPTING'
                    ? 'w-1/3 bg-amber-400'
                    : regLoadingStep === 'REGISTERING_DB'
                    ? 'w-2/3 bg-blue-400'
                    : 'w-full bg-emerald-400'
                }`}
              />
            </div>

            <p className="text-xs text-slate-400 font-mono pt-1">
              {institutionName || 'Institutional Entity'} · {aicteId || 'AICTE-ID'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-medium">
          Loading AICTE Institutional Registration Portal...
        </div>
      }>
        <RegisterFormContent />
      </Suspense>
    </AuthProvider>
  );
}

