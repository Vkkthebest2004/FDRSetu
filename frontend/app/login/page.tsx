'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { FDRService } from '@/lib/supabase/service';
import { SystemRole } from '@/lib/types/database';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const personas = [
    {
      role: 'institution_user' as SystemRole,
      name: 'Dr. Rajesh Sharma',
      title: 'Institution Registrar',
      institution: 'Delhi Institute of Advanced Technology',
      badge: 'Institution Scope',
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50',
    },
    {
      role: 'scrutiny_officer' as SystemRole,
      name: 'Sunil Kumar',
      title: 'Scrutiny Officer',
      institution: 'Regional Scrutiny Cell (AICTE North)',
      badge: 'Scrutiny & OCR Review',
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50',
    },
    {
      role: 'approving_authority' as SystemRole,
      name: 'Dr. V. K. Adiseshiah',
      title: 'Approving Authority',
      institution: 'Regional Director / Financial Sign-off',
      badge: 'Release Approval',
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50',
    },
    {
      role: 'administrator' as SystemRole,
      name: 'Sanjay Verma',
      title: 'System Administrator',
      institution: 'AICTE Headquarters, New Delhi',
      badge: 'System & Audit',
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
    },
  ];

  async function handleQuickLogin(role: SystemRole) {
    setIsLoading(true);
    await FDRService.switchActiveUserRole(role);
    router.push('/dashboard');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // Find matching profile or default to institution user
    await FDRService.switchActiveUserRole('institution_user');
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0f294a] text-amber-400 mb-4 shadow-md">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          AICTE SECURITY DEPOSIT PORTAL
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          All India Council for Technical Education · Fixed Deposit Receipt Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        {/* Quick Demo Switcher Card */}
        <div className="bg-white py-6 px-6 shadow-sm rounded-xl border border-slate-200 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">One-Click Demonstration Personas</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Select a verified persona to explore real role-based permissions, institution data isolation, and review workflows:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personas.map(p => (
              <button
                key={p.role}
                onClick={() => handleQuickLogin(p.role)}
                disabled={isLoading}
                className={`text-left p-3.5 rounded-lg border transition flex flex-col justify-between cursor-pointer ${p.color}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-700 mt-0.5">{p.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{p.institution}</div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                  <span>Sign in as {p.title}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white py-6 px-6 shadow-sm rounded-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
              className="w-full py-2.5 px-4 rounded-lg bg-[#0f294a] hover:bg-[#1b3d6b] text-white text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Authenticate & Enter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500">
            Protected under Government of India Cybersecurity Standards & AICTE Approval Regulations.
          </div>
        </div>
      </div>
    </div>
  );
}
