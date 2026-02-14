export function formatTimeAgo(isoTimestamp) {
  const now = new Date();
  const date = new Date(isoTimestamp);

  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  if (diffDays < 30) {
    return `${diffDays}d`;
  }

  if (diffMonths < 12) {
    return `${diffMonths}mo`;
  }

  return `${diffYears}yr`;
}
