'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth, AuthProvider } from '@/lib/auth/AuthContext';
import { SystemRole } from '@/lib/types/database';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const { signIn, switchRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const personas = [
    {
      role: 'institution_user' as SystemRole,
      name: 'Dr. Rajesh Sharma',
      email: 'registrar@dit.edu.in',
      title: 'Institution Registrar',
      institution: 'Delhi Institute of Advanced Technology',
      badge: 'Institution Scope',
      color: 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-950',
    },
    {
      role: 'scrutiny_officer' as SystemRole,
      name: 'Sunil Kumar',
      email: 'officer@aicte-india.org',
      title: 'Scrutiny Officer',
      institution: 'Regional Scrutiny Cell (AICTE North)',
      badge: 'Scrutiny & OCR Review',
      color: 'border-blue-200 bg-blue-50/60 hover:bg-blue-50 text-blue-950',
    },
    {
      role: 'approving_authority' as SystemRole,
      name: 'Dr. V. K. Adiseshiah',
      email: 'approver@aicte-india.org',
      title: 'Approving Authority',
      institution: 'Regional Director / Financial Sign-off',
      badge: 'Release Approval',
      color: 'border-purple-200 bg-purple-50/60 hover:bg-purple-50 text-purple-950',
    },
    {
      role: 'administrator' as SystemRole,
      name: 'Sanjay Verma',
      email: 'admin@aicte-india.org',
      title: 'System Administrator',
      institution: 'AICTE Headquarters, New Delhi',
      badge: 'System & Audit',
      color: 'border-amber-200 bg-amber-50/60 hover:bg-amber-50 text-amber-950',
    },
  ];

  async function handleQuickPersonaLogin(persona: typeof personas[0]) {
    setIsLoading(true);
    setErrorMessage(null);
    setEmail(persona.email);
    setPassword('Password@123');
    await switchRole(persona.role);
    router.push(next);
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
      setErrorMessage(res.error || 'Authentication rejected. Please verify your credentials.');
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0f294a] text-amber-400 mb-4 shadow-md">
          <Shield className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          AICTE SECURITY DEPOSIT PORTAL
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          All India Council for Technical Education · Fixed Deposit Receipt Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Demonstration Personas */}
        <div className="bg-white py-6 px-6 shadow-xs rounded-xl border border-slate-200 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">One-Click Demonstration Personas</h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Role-Based Access
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Select a verified persona to immediately set authorized session cookies and test statutory roles:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personas.map(p => (
              <button
                key={p.role}
                type="button"
                onClick={() => handleQuickPersonaLogin(p)}
                disabled={isLoading}
                className={`text-left p-3.5 rounded-lg border transition flex flex-col justify-between cursor-pointer ${p.color}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-700">
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-700 mt-0.5">{p.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{p.institution}</div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                  <span>Sign in as {p.title}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <div className="bg-white py-6 px-6 shadow-xs rounded-xl border border-slate-200">
          <form onSubmit={handleStandardSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="registrar@dit.edu.in"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0f294a] hover:bg-[#1b3d6b] text-white text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500">
            Protected under Government of India Cybersecurity Standards & AICTE Approval Regulations.
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Password Recovery
              </h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {resetSuccess ? (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recovery instructions sent to institutional email.</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <p className="text-slate-600 leading-relaxed">
                  Enter your registered institutional email to receive secure password reset instructions:
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="registrar@dit.edu.in"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold shadow-xs">Send Recovery Email</button>
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
      <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs text-slate-500">Loading Portal Login...</div>}>
        <LoginFormContent />
      </Suspense>
    </AuthProvider>
  );
}
