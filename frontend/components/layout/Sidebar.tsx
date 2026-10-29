'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  PlusCircle, 
  FileCheck2, 
  RefreshCw, 
  CreditCard, 
  BellRing, 
  BarChart3, 
  History, 
  Settings,
  Building,
  ChevronRight
} from 'lucide-react';
import { FDRService } from '@/lib/supabase/service';
import { SystemRole } from '@/lib/types/database';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: SystemRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'],
  },
  {
    name: 'FDR Registry',
    href: '/fdrs',
    icon: FileSpreadsheet,
    roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'],
  },
  {
    name: 'Submit FDR',
    href: '/fdrs/submit',
    icon: PlusCircle,
    roles: ['institution_user', 'administrator'],
    badge: 'Wizard',
  },
  {
    name: 'Scrutiny Workbench',
    href: '/verification',
    icon: FileCheck2,
    roles: ['scrutiny_officer', 'approving_authority', 'administrator'],
    badge: 'AI Review',
  },
  {
    name: 'Renewals & Replacements',
    href: '/renewals',
    icon: RefreshCw,
    roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'],
  },
  {
    name: 'Release / Refund Requests',
    href: '/release-requests',
    icon: CreditCard,
    roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'],
  },
  {
    name: 'Maturity & Alerts',
    href: '/notifications',
    icon: BellRing,
    roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'],
  },
  {
    name: 'Compliance Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['institution_user', 'scrutiny_officer', 'approving_authority', 'administrator'],
  },
  {
    name: 'Audit Trail',
    href: '/admin/audit',
    icon: History,
    roles: ['scrutiny_officer', 'approving_authority', 'administrator'],
  },
  {
    name: 'Administration',
    href: '/admin',
    icon: Settings,
    roles: ['administrator'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<SystemRole>('institution_user');

  useEffect(() => {
    FDRService.getCurrentUser().then(user => {
      setUserRole(user.system_role);
    });
  }, [pathname]);

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-800 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          AICTE Portal Navigation
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Official AICTE Regulatory notice footer */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 mb-1 text-slate-300 font-semibold">
          <Building className="w-3.5 h-3.5 text-amber-400" />
          <span>Statutory Compliance</span>
        </div>
        <p className="leading-relaxed">
          AICTE Approval Process Handbook (APH) Regulations. Security deposit verification.
        </p>
      </div>
    </aside>
  );
}

