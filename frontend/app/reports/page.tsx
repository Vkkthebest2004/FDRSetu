'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FDRService } from '@/lib/supabase/service';
import { FDRRecord, Profile } from '@/lib/types/database';

const COLORS = ['#0f294a', '#1e4273', '#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#ef4444'];

export default function ReportsPage() {
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const user = await FDRService.getCurrentUser();
    setCurrentUser(user);
    const list = await FDRService.getFDRs();
    setFdrs(list);
  }

  // 1. Group by Bank
  const bankDataMap: Record<string, number> = {};
  fdrs.forEach(f => {
    bankDataMap[f.bank_name] = (bankDataMap[f.bank_name] || 0) + Number(f.amount);
  });
  const bankChartData = Object.entries(bankDataMap).map(([name, amount]) => ({
    name: name.replace('State Bank of India', 'SBI').replace('Punjab National Bank', 'PNB').replace('Bank of Baroda', 'BOB'),
    amount: amount / 100000, // in Lakhs
    fullAmount: amount,
  }));

  // 2. Group by Review Status
  const statusDataMap: Record<string, number> = {};
  fdrs.forEach(f => {
    statusDataMap[f.review_status] = (statusDataMap[f.review_status] || 0) + 1;
  });
  const statusChartData = Object.entries(statusDataMap).map(([name, count]) => ({
    name: name.replace('_', ' '),
    value: count,
  }));

  function handleExportAllCSV() {
    const headers = ['FDR Number', 'Institution', 'Bank Name', 'Branch', 'IFSC Code', 'Amount (INR)', 'Issue Date', 'Maturity Date', 'Lifecycle Status', 'Review Status'];
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
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aicte_fdr_analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const totalAmount = fdrs.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Statutory Compliance & Financial Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live aggregate distribution of security deposits, banking exposure, and compliance review states.
            </p>
          </div>

          <button
            onClick={handleExportAllCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Complete Dataset (CSV)
          </button>
        </div>

        {/* Top Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Cumulative Portfolio Value</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Across {fdrs.length} registered financial instruments
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Scheduled Commercial Banks</span>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {Object.keys(bankDataMap).length} Banks
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              All banks verified with RBI IFSC accreditation
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Scrutiny Compliance Rate</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {fdrs.length > 0 ? ((fdrs.filter(f => f.review_status === 'ACCEPTED').length / fdrs.length) * 100).toFixed(0) : 0}%
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Instruments accepted without regulatory discrepancy
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Deposit Volume by Issuing Bank */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Deposit Exposure by Bank (in Lakhs INR)
                </h2>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bankChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="L" />
                  <Tooltip 
                    formatter={(val: any) => [`₹ ${(Number(val) * 100000).toLocaleString('en-IN')}`, 'Deposit Value']}
                  />
                  <Bar dataKey="amount" fill="#1e4273" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Review Status Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Review & Scrutiny State Distribution
                </h2>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
