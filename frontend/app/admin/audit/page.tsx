'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle,
  FileText,
  Download
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FDRService } from '@/lib/supabase/service';
import { AuditEvent, Profile } from '@/lib/types/database';

export default function AuditTrailPage() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    loadAuditEvents();
  }, []);

  async function loadAuditEvents() {
    const events = await FDRService.getAuditEvents();
    setAuditEvents(events);
  }

  const filtered = auditEvents.filter(a => {
    const matchesSearch = 
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      (a.reason || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.actor?.full_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesAction = filterAction === 'ALL' || a.action.startsWith(filterAction);
    return matchesSearch && matchesAction;
  });

  function handleExportAuditCSV() {
    const headers = ['Timestamp', 'Action', 'Responsible Actor', 'Role', 'Entity Type', 'Entity ID', 'Outcome', 'Rationale', 'Network IP'];
    const rows = filtered.map(a => [
      `"${a.created_at}"`,
      `"${a.action}"`,
      `"${a.actor?.full_name || 'System Process'}"`,
      `"${a.actor_role}"`,
      `"${a.entity_type}"`,
      `"${a.entity_id}"`,
      `"${a.outcome}"`,
      `"${(a.reason || '').replace(/"/g, '""')}"`,
      `"${a.ip_address || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aicte_sanchay_audit_trail_export_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                Statutory Compliance
              </span>
              <span className="text-xs text-slate-500">Append-Only Immutable Ledger</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Tamper-Evident System Audit Trail
            </h1>
            <p className="text-xs text-slate-500">
              Complete historical record of all submissions, verification decisions, and release workflows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAuditCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Audit Log (CSV)
            </button>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>RLS Append-Only</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by action, actor, entity ID, or rationale..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Event Types</option>
              <option value="FDR">FDR Lifecycle</option>
              <option value="VERIFICATION">Scrutiny & Verification</option>
              <option value="RELEASE">Release Workflows</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action Type</th>
                  <th className="py-3.5 px-4">Responsible Actor</th>
                  <th className="py-3.5 px-4">Entity & Reference</th>
                  <th className="py-3.5 px-4">Audit Grounds & Details</th>
                  <th className="py-3.5 px-4 text-center">Outcome</th>
                  <th className="py-3.5 px-4">Network IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {new Date(event.created_at).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {event.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {event.actor?.full_name || 'System Process'}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        {event.actor_role.replace('_', ' ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-700 font-semibold">{event.entity_type}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        {event.entity_id}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                      <p className="line-clamp-2">{event.reason || 'Standard statutory transaction'}</p>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {event.outcome === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          FAILURE
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {event.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Displaying {filtered.length} compliance audit records</span>
            <span className="text-[11px]">Secured via Cryptographic Hash & Append-Only RLS Policies</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

