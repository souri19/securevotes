export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'SV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatCountdown(targetIso: string): {
  label: string;
  expired: boolean;
} {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) {
    return { label: 'Closed', expired: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  if (days > 0) return { label: `${days}d ${hours}h remaining`, expired: false };
  if (hours > 0) return { label: `${hours}h ${mins}m remaining`, expired: false };
  return { label: `${Math.max(mins, 1)}m remaining`, expired: false };
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active Polls';
    case 'upcoming':
      return 'Upcoming';
    case 'completed':
      return 'Completed';
    case 'draft':
      return 'Draft';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
}
