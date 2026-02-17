export const SEVERITIES = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];
export const STATUSES = ['OPEN', 'MITIGATED', 'RESOLVED'];
export const SERVICES = [
  'Auth', 'Payments', 'Backend', 'Frontend', 'Database',
  'API Gateway', 'Notifications', 'Search', 'Analytics', 'CDN'
];

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr.replace(' ', 'T'));
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr.replace(' ', 'T'));
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr.replace(' ', 'T'));
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function severityClass(sev) {
  return `badge badge-${sev?.toLowerCase()}`;
}

export function statusClass(status) {
  return `badge badge-${status?.toLowerCase()}`;
}

export function SeverityBadge({ severity }) {
  return (
    <span className={severityClass(severity)}>
      <span className="badge-dot" />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={statusClass(status)}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
