'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BellRing, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FDRService } from '@/lib/supabase/service';
import { NotificationItem, Profile } from '@/lib/types/database';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const user = await FDRService.getCurrentUser();
    setCurrentUser(user);
    const list = await FDRService.getNotifications(user.id);
    setNotifications(list);
  }

  async function handleMarkRead(id: string) {
    await FDRService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: true } : n));
  }

  async function handleMarkAllRead() {
    await FDRService.markAllNotificationsRead(currentUser?.id);
    setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Maturity Monitoring & Compliance Alerts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated reminders for upcoming maturities, observation returns, and regulatory deadlines.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-700" />
            <span>Alert Intervals Configured: <strong>90, 60, 30, and 15 days</strong> in advance.</span>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Notification Inbox ({notifications.length})
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {notifications.filter(n => !n.read_status).length} unread
              </span>
              {notifications.some(n => !n.read_status) && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark All as Read
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <BellRing className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No notifications in your inbox.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-5 flex items-start justify-between gap-4 text-xs transition-all duration-150 ${
                    !n.read_status ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {n.notification_type === 'MATURITY_APPROACHING' && (
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shadow-2xs">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}
                      {n.notification_type === 'CORRECTION_NEEDED' && (
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-800 shadow-2xs">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      {n.notification_type === 'VERIFICATION_APPROVED' && (
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                        {!n.read_status && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{n.message}</p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Scheduled: {new Date(n.scheduled_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {n.fdr_id && (
                      <Link
                        href={`/fdrs/${n.fdr_id}`}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition"
                      >
                        View FDR
                      </Link>
                    )}

                    {!n.read_status && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

