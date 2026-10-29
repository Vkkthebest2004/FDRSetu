import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lifecycle' | 'review' | 'verification' | 'release';
}

export function StatusBadge({ status, type = 'review' }: StatusBadgeProps) {
  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-300';
  let dotColor = 'bg-slate-400';

  const s = status.toUpperCase();

  // Review & Workflow status colors
  if (['ACCEPTED', 'VERIFIED', 'APPROVED', 'ACTIVE', 'COMPLETED'].includes(s)) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    dotColor = 'bg-emerald-500';
  } else if (['UNDER_SCRUTINY', 'UNDER_REVIEW', 'RECOMMENDED', 'AUTO_CHECKED', 'PROCESSING'].includes(s)) {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-300';
    dotColor = 'bg-blue-500';
  } else if (['SUBMITTED', 'DRAFT', 'PENDING'].includes(s)) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
    dotColor = 'bg-amber-500';
  } else if (['NEEDS_CORRECTION', 'DISCREPANCY_FLAGGED', 'AWAITING_CLARIFICATION'].includes(s)) {
    colorClasses = 'bg-orange-50 text-orange-800 border-orange-300';
    dotColor = 'bg-orange-500';
  } else if (['REJECTED', 'UNABLE_TO_VERIFY', 'MATURED', 'FAILED'].includes(s)) {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-300';
    dotColor = 'bg-rose-500';
  } else if (['REPLACED', 'RELEASED', 'RELEASE_RECORDED', 'SUPERSEDED'].includes(s)) {
    colorClasses = 'bg-purple-50 text-purple-800 border-purple-300';
    dotColor = 'bg-purple-500';
  }

  // Format label: "UNDER_SCRUTINY" -> "Under Scrutiny"
  const formatted = status
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {formatted}
    </span>
  );
}

