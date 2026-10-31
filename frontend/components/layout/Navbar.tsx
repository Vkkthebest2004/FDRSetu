'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, 
  Shield, 
  ChevronDown, 
  CheckCircle2, 
  User, 
  Building2, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  FileCheck2,
  RefreshCw,
  CreditCard,
  BellRing,
  BarChart3,
  History,
  Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { FDRService } from '@/lib/supabase/service';
import { NotificationItem, SystemRole } from '@/lib/types/database';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentUser, switchRole, signOut } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      FDRService.getNotifications(currentUser.id).then(setNotifications);
    }
  }, [currentUser]);

  async function handleRoleChange(newRole: SystemRole) {
    await switchRole(newRole);
    setShowRoleMenu(false);
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

  const NAV_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'] },
    { name: 'FDR Registry', href: '/fdrs', icon: FileSpreadsheet, roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'] },
    { name: 'Submit FDR', href: '/fdrs/submit', icon: PlusCircle, roles: ['institution_user', 'administrator'], badge: 'New' },
    { name: 'Scrutiny Workbench', href: '/verification', icon: FileCheck2, roles: ['scrutiny_officer', 'approving_authority', 'administrator'], badge: 'AI' },
    { name: 'Renewals', href: '/renewals', icon: RefreshCw, roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'] },
    { name: 'Release Requests', href: '/release-requests', icon: CreditCard, roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'] },
    { name: 'Maturity & Alerts', href: '/notifications', icon: BellRing, roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'] },
    { name: 'Audit Trail', href: '/admin/audit', icon: History, roles: ['scrutiny_officer', 'approving_authority', 'administrator'] },
    { name: 'Administration', href: '/admin', icon: Settings, roles: ['administrator'] },
  ];

  const visibleNav = currentUser ? NAV_ITEMS.filter(item => item.roles.includes(currentUser.system_role)) : [];

  return (
    <header className="sticky top-0 z-40 bg-[#0f294a] text-white border-b border-[#1b3d6b] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 transition cursor-pointer text-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-amber-400 group-hover:scale-105 group-hover:bg-white/20 transition-all shadow-xs">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight block leading-tight text-white group-hover:text-amber-300 transition-colors">
                  AICTE SANCHAY
                </span>
                <span className="text-[11px] text-slate-300 block leading-tight">
                  Collateral Security & Verification Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Interactive Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium transition cursor-pointer hover-lift-sm"
                title="Switch test persona"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Role:</span>
                <span className="font-semibold text-amber-300">
                  {currentUser ? roleLabels[currentUser.system_role].label : 'Loading...'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-scale-in">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  {(['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'] as SystemRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition cursor-pointer ${
                        currentUser?.system_role === role ? 'bg-blue-50/80 font-semibold' : ''
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
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowRoleMenu(false);
                }}
                className="relative p-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 transition cursor-pointer hover-lift-sm"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-scale-in">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <Link
                      href="/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        No unread notifications
                      </div>
                    ) : (
                      notifications.slice(0, 4).map(n => (
                        <div
                          key={n.id}
                          className={`px-4 py-2.5 text-xs transition hover:bg-slate-50 ${!n.read_status ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="font-semibold text-slate-900">{n.title}</div>
                          <p className="text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
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
                  {currentUser?.full_name || 'Authorized Official'}
                </div>
                <div className="text-[11px] text-slate-300 leading-tight">
                  {currentUser?.email || ''}
                </div>
              </div>
            </div>

            {/* Explicit Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 border border-white/20 transition cursor-pointer text-slate-200 hover-lift-sm"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1b3d6b] bg-[#0c223e] px-4 py-3 space-y-1 animate-fade-in-up">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1">
            Navigation Menu
          </div>
          {visibleNav.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-white/20 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
