'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Shield, ChevronDown, CheckCircle2, User, Building2, LogOut } from 'lucide-react';
import { FDRService } from '@/lib/supabase/service';
import { Profile, NotificationItem, SystemRole } from '@/lib/types/database';

export function Navbar() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const user = await FDRService.getCurrentUser();
    setCurrentUser(user);
    const notifs = await FDRService.getNotifications(user.id);
    setNotifications(notifs);
  }

  async function handleRoleChange(newRole: SystemRole) {
    const updated = await FDRService.switchActiveUserRole(newRole);
    setCurrentUser(updated);
    setShowRoleMenu(false);
    const notifs = await FDRService.getNotifications(updated.id);
    setNotifications(notifs);
    // Refresh current route to trigger role-based access updates
    router.refresh();
  }

  const unreadCount = notifications.filter(n => !n.read_status).length;

  const roleLabels: Record<SystemRole, { label: string; desc: string; color: string }> = {
    institution_user: {
      label: 'Institution User',
      desc: 'Delhi Institute of Advanced Technology',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    scrutiny_officer: {
      label: 'Scrutiny Officer',
      desc: 'Regional Scrutiny Cell (AICTE North)',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    approving_authority: {
      label: 'Approving Authority',
      desc: 'Regional Director / Financial Sign-off',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    administrator: {
      label: 'System Administrator',
      desc: 'AICTE Headquarters, New Delhi',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f294a] text-white border-b border-[#1b3d6b] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-amber-400 group-hover:bg-white/20 transition">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight block leading-tight text-white">
                  AICTE FDR PORTAL
                </span>
                <span className="text-xs text-slate-300 block leading-tight">
                  Security Deposit Management & Verification
                </span>
              </div>
            </Link>
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-4">
            {/* Interactive Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium transition cursor-pointer"
                title="Switch test persona"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Role:</span>
                <span className="font-semibold text-amber-300">
                  {currentUser ? roleLabels[currentUser.system_role].label : 'Loading...'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  {(['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'] as SystemRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition cursor-pointer ${
                        currentUser?.system_role === role ? 'bg-blue-50/70 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-900 font-medium">{roleLabels[role].label}</span>
                        {currentUser?.system_role === role && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <span className="text-slate-500 text-[11px]">{roleLabels[role].desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <Link
                      href="/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 4).map(n => (
                        <div
                          key={n.id}
                          className={`px-4 py-2.5 text-xs ${!n.read_status ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="font-semibold text-slate-900">{n.title}</div>
                          <p className="text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile display */}
            <div className="hidden sm:flex items-center gap-2 border-l border-white/20 pl-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-400/30">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-white leading-tight">
                  {currentUser?.full_name || 'Loading...'}
                </div>
                <div className="text-[11px] text-slate-300 leading-tight">
                  {currentUser?.email || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
