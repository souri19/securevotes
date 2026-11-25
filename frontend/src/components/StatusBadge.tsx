import React from 'react';

interface StatusBadgeProps {
  status: string;
  dark?: boolean;
  labelOverride?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, dark = false, labelOverride }) => {
  const s = status.toLowerCase();

  let styles = dark
    ? 'border-[#23304C] text-[#CBD5E1] bg-[#141D30]'
    : 'border-[#DDDAD0] text-[#0B1120] bg-[#F7F6F2]';
  let dotColor = 'bg-[#64748B]';
  let label = status;

  if (s === 'active') {
    styles = dark
      ? 'border-[#14B8A6]/50 text-[#5EEAD4] bg-[#14B8A6]/15'
      : 'border-[#0D9488] text-[#0B1120] bg-[#14B8A6]/15';
    dotColor = 'bg-[#14B8A6]';
    label = 'Active Polls';
  } else if (s === 'upcoming') {
    styles = dark
      ? 'border-[#E5A93C]/40 text-[#E5A93C] bg-[#141D30]'
      : 'border-[#E5A93C] text-[#0B1120] bg-[#E5A93C]/15';
    dotColor = 'bg-[#E5A93C]';
    label = 'Upcoming';
  } else if (s === 'completed') {
    styles = dark
      ? 'border-[#23304C] text-[#CBD5E1] bg-[#0B1120]'
      : 'border-[#DDDAD0] text-[#1E293B] bg-[#ECEAE2]';
    dotColor = 'bg-[#0B1120]';
    label = 'Completed';
  } else if (s === 'draft') {
    styles = 'border-[#E05A47]/40 text-[#E05A47] bg-[#E05A47]/10';
    dotColor = 'bg-[#E05A47]';
    label = 'Draft';
  } else if (s === 'admin') {
    styles = 'border-[#E5A93C]/60 text-[#E5A93C] bg-[#0B1120]';
    dotColor = 'bg-[#E5A93C]';
    label = 'Admin';
  } else if (s === 'voter') {
    styles = 'border-[#0D9488]/40 text-[#0D9488] bg-[#14B8A6]/10';
    dotColor = 'bg-[#0D9488]';
    label = 'Verified Demo Voter';
  } else if (s === 'suspended') {
    styles = 'border-[#E05A47]/50 text-[#E05A47] bg-[#E05A47]/10';
    dotColor = 'bg-[#E05A47]';
    label = 'Suspended';
  }

  return (
    <span
      className={`inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] rounded-[3px] ${styles}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {labelOverride || label}
    </span>
  );
};
