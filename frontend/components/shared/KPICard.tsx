import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: 'up' | 'down' | 'neutral' | 'alert';
}

export function KPICard({ title, value, subtitle, icon: Icon, badge, trend }: KPICardProps) {
  let badgeColor = 'bg-slate-100 text-slate-700';
  if (trend === 'alert') badgeColor = 'bg-rose-100 text-rose-800';
  if (trend === 'up') badgeColor = 'bg-emerald-100 text-emerald-800';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs transition hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <div className="p-2.5 rounded-lg bg-blue-50 text-blue-900">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {(subtitle || badge) && (
          <div className="mt-2 flex items-center gap-2">
            {badge && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>
                {badge}
              </span>
            )}
            {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
