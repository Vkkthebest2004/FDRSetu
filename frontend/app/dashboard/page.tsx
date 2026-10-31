'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  CreditCard,
  FileText,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FDRService } from '@/lib/supabase/service';
import { Profile, FDRRecord, VerificationCase } from '@/lib/types/database';

export default function DashboardPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [stats, setStats] = useState({
    totalFDRs: 0,
    activeFDRs: 0,
    totalDepositAmount: 0,
    maturingSoonCount: 0,
    discrepancyCount: 0,
    pendingReviewCount: 0,
    pendingReleaseCount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const currentUser = await FDRService.getCurrentUser();
    setUser(currentUser);

    const fdrList = await FDRService.getFDRs();
    setFdrs(fdrList);

    const kpi = await FDRService.getKPIStats();
    setStats(kpi);
  }

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Banner / Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                AICTE Official Portal
              </span>
              <span className="text-xs text-slate-500">Security Deposit Governance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Welcome, {user?.full_name || 'Authorized Official'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {user?.system_role === 'institution_user' && 'Monitor and maintain your institution’s fixed deposit receipts under AICTE custody.'}
              {user?.system_role === 'scrutiny_officer' && 'Review uploaded instruments, OCR discrepancies, and conduct institutional scrutiny.'}
              {user?.system_role === 'approving_authority' && 'Executive oversight and final approval authority for release and refund requests.'}
              {user?.system_role === 'administrator' && 'System configuration, role management, and tamper-evident audit history.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.system_role === 'institution_user' && (
              <Link
                href="/fdrs/submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                Submit New FDR
              </Link>
            )}
            {(user?.system_role === 'scrutiny_officer' || user?.system_role === 'administrator') && (
              <Link
                href="/verification"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Scrutiny Workbench
              </Link>
            )}
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Reports
            </Link>
          </div>
        </div>

        {/* Top KPI Cards with Staggered Fade-in */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-fade-in-up stagger-1">
            <KPICard
              title="Total Active Deposits"
              value={formatINR(stats.totalDepositAmount)}
              subtitle={`${stats.activeFDRs} active instruments`}
              icon={CreditCard}
              badge="Protected Funds"
            />
          </div>
          <div className="animate-fade-in-up stagger-2">
            <KPICard
              title="Maturing in 90 Days"
              value={stats.maturingSoonCount}
              subtitle="Requires renewal or release"
              icon={Clock}
              badge={stats.maturingSoonCount > 0 ? "Action Required" : "Compliant"}
              trend={stats.maturingSoonCount > 0 ? "alert" : "neutral"}
            />
          </div>
          <div className="animate-fade-in-up stagger-3">
            <KPICard
              title="Discrepancies Flagged"
              value={stats.discrepancyCount}
              subtitle="AI & OCR detected mismatches"
              icon={AlertTriangle}
              badge={stats.discrepancyCount > 0 ? "Needs Attention" : "Clear"}
              trend={stats.discrepancyCount > 0 ? "alert" : "neutral"}
            />
          </div>
          <div className="animate-fade-in-up stagger-4">
            <KPICard
              title="Pending Scrutiny"
              value={stats.pendingReviewCount}
              subtitle="Submissions in review"
              icon={CheckCircle}
              badge="Queue"
              trend="neutral"
            />
          </div>
        </div>

        {/* Actionable Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Table: Recent Instruments */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent FDR Instruments</h2>
                <p className="text-xs text-slate-500">Security deposits held in joint custody with AICTE</p>
              </div>
              <Link
                href="/fdrs"
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">FDR Number</th>
                    <th className="py-3 px-4">Bank & Branch</th>
                    <th className="py-3 px-4 text-right">Amount (INR)</th>
                    <th className="py-3 px-4">Maturity Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fdrs.slice(0, 5).map(fdr => (
                    <tr key={fdr.id} className="hover:bg-blue-50/40 transition-colors duration-150">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <Link href={`/fdrs/${fdr.id}`} className="hover:text-blue-600 hover:underline transition-colors">
                          {fdr.fdr_number}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">{fdr.bank_name}</div>
                        <div className="text-[11px] text-slate-500">{fdr.branch_name}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        ₹ {Number(fdr.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {fdr.maturity_date}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={fdr.review_status} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/fdrs/${fdr.id}`}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold transition-all duration-150 hover-lift-sm inline-block shadow-2xs"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Card: Regulatory Notice & Quick Links */}
          <div className="space-y-6">
            {/* Regulatory Guidelines */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">AICTE Regulatory Policy</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>All FDRs must be issued jointly in the name of the Institution and the <strong>Regional Officer, AICTE</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Minimum tenure is <strong>5 years (or 8/10 years per approved program norms)</strong> with automatic renewal or replacement.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Early encashment requires formal sanction and refund order from the AICTE Approving Authority.</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-linear-to-br from-[#0f294a] to-[#1e4273] text-white rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-white mb-2">Security Deposit Workflows</h3>
              <p className="text-xs text-slate-200 mb-4 leading-relaxed">
                Direct access to statutory compliance actions.
              </p>
              <div className="space-y-2">
                <Link
                  href="/renewals"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition"
                >
                  <span>Submit Replacement Instrument</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
                </Link>
                <Link
                  href="/release-requests"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition"
                >
                  <span>Request Deposit Release / Refund</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
                </Link>
                <Link
                  href="/notifications"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition"
                >
                  <span>View Maturity Alerts</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

