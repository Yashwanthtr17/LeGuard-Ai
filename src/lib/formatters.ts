export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRiskColor(score: number): string {
  if (score >= 7) return '#E53E3E';
  if (score >= 4) return '#D69E2E';
  return '#38A169';
}

export function getRiskTextColor(score: number): string {
  if (score >= 7) return 'text-danger';
  if (score >= 4) return 'text-warning';
  return 'text-success';
}

export function getRiskBg(score: number): string {
  if (score >= 7) return 'bg-danger/10';
  if (score >= 4) return 'bg-warning/10';
  return 'bg-success/10';
}

export function getRiskBadge(score: number): string {
  if (score >= 7) return 'bg-danger text-white';
  if (score >= 4) return 'bg-warning text-white';
  return 'bg-success text-white';
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
