import { formatDistanceToNow } from "date-fns";

interface FreshnessBadgeProps {
  lastIngestion: string | null;
  isStale: boolean;
}

export function FreshnessBadge({ lastIngestion, isStale }: FreshnessBadgeProps) {
  if (!lastIngestion) {
    return (
      <span className="text-xs text-muted">
        No data yet
      </span>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(lastIngestion), { addSuffix: true });

  return (
    <span className={`text-xs ${isStale ? "text-accent font-medium" : "text-muted"}`}>
      Updated {timeAgo}
    </span>
  );
}
