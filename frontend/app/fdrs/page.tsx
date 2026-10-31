'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  FileSpreadsheet, 
  ArrowUpDown,
  ExternalLink,
  Building
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FDRService } from '@/lib/supabase/service';
import { FDRRecord, Profile } from '@/lib/types/database';

export default function FDRRegistryPage() {
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [search, setSearch] = useState('');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState('ALL');
  const [selectedLifecycleStatus, setSelectedLifecycleStatus] = useState('ALL');

  useEffect(() => {
    loadData();
  }, [search, selectedReviewStatus, selectedLifecycleStatus]);

  async function loadData() {
    const user = await FDRService.getCurrentUser();
    setCurrentUser(user);

    const list = await FDRService.getFDRs({
      searchQuery: search,
      reviewStatus: selectedReviewStatus,
      lifecycleStatus: selectedLifecycleStatus,
    });
    setFdrs(list);
  }

  function handleExportCSV() {
    const headers = ['FDR Number', 'Institution', 'Bank Name', 'Branch', 'IFSC Code', 'Amount (INR)', 'Issue Date', 'Maturity Date', 'Lifecycle Status', 'Review Status', 'Verification Status'];
    const rows = fdrs.map(f => [
      `"${f.fdr_number}"`,
      `"${f.institution?.name || ''}"`,
      `"${f.bank_name}"`,
      `"${f.branch_name}"`,
      `"${f.ifsc_code}"`,
      f.amount,
      f.issue_date,
      f.maturity_date,
      f.lifecycle_status,
      f.review_status,
      f.verification_status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aicte_fdr_registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Fixed Deposit Receipt (FDR) Registry
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser?.system_role === 'institution_user' 
                ? 'Showing security deposits registered under your institution.' 
                : 'Central repository of technical education institution security deposits under AICTE custody.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV
            </button>

            {currentUser?.system_role === 'institution_user' && (
              <Link
                href="/fdrs/submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                Submit FDR
              </Link>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by FDR number, bank name, branch, or institution..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Review:</span>
            </div>
            <select
              value={selectedReviewStatus}
              onChange={e => setSelectedReviewStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="UNDER_SCRUTINY">Under Scrutiny</option>
              <option value="NEEDS_CORRECTION">Needs Correction</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap ml-2">
              <span>Lifecycle:</span>
            </div>
            <select
              value={selectedLifecycleStatus}
              onChange={e => setSelectedLifecycleStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Lifecycles</option>
              <option value="ACTIVE">Active</option>
              <option value="MATURED">Matured</option>
              <option value="REPLACED">Replaced</option>
              <option value="RELEASED">Released</option>
            </select>
          </div>
        </div>

        {/* Registry Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Instrument Reference</th>
                  {currentUser?.system_role !== 'institution_user' && (
                    <th className="py-3.5 px-4">Institution</th>
                  )}
                  <th className="py-3.5 px-4">Issuing Bank & Branch</th>
                  <th className="py-3.5 px-4 text-right">Principal Deposit</th>
                  <th className="py-3.5 px-4">Issue & Maturity Dates</th>
                  <th className="py-3.5 px-4 text-center">Lifecycle</th>
                  <th className="py-3.5 px-4 text-center">Review</th>
                  <th className="py-3.5 px-4 text-center">Verification</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fdrs.length === 0 ? (
                  <tr>
                    <td colSpan={currentUser?.system_role !== 'institution_user' ? 9 : 8} className="py-12 text-center text-slate-500">
                      <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-600">No FDR records found matching criteria</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try resetting your filters or submit a new instrument</p>
                    </td>
                  </tr>
                ) : (
                  fdrs.map(fdr => (
                    <tr key={fdr.id} className="hover:bg-blue-50/40 transition-colors duration-150 group">
                      <td className="py-3.5 px-4">
                        <Link href={`/fdrs/${fdr.id}`} className="font-bold text-blue-700 hover:text-blue-900 hover:underline transition-colors">
                          {fdr.fdr_number}
                        </Link>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Joint: {fdr.joint_holder_name}
                        </div>
                      </td>

                      {currentUser?.system_role !== 'institution_user' && (
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 line-clamp-1">
                            {fdr.institution?.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            AICTE ID: {fdr.institution?.aicte_id}
                          </div>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{fdr.bank_name}</div>
                        <div className="text-[11px] text-slate-500">{fdr.branch_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">IFSC: {fdr.ifsc_code}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          ₹ {Number(fdr.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">{fdr.currency}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        <div>Issue: {fdr.issue_date}</div>
                        <div className="font-semibold text-slate-900 mt-0.5">Mat: {fdr.maturity_date}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={fdr.lifecycle_status} type="lifecycle" />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={fdr.review_status} type="review" />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={fdr.verification_status} type="verification" />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/fdrs/${fdr.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold transition-all duration-150 hover-lift-sm shadow-2xs"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {fdrs.length} instrument records</span>
            <span className="text-[11px]">Database protected with PostgreSQL Row Level Security</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

