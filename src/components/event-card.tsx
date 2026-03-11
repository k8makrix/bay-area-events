import { format } from "date-fns";

interface EventCardProps {
  title: string;
  url: string;
  imageUrl?: string | null;
  startTime: string;
  endTime?: string | null;
  venueName?: string | null;
  city?: string | null;
  category: string;
  tags: string[];
  isFree: boolean;
  price?: string | null;
  relevanceScore: number;
  matchReason: string;
  source: string;
}

export function EventCard({
  title,
  url,
  imageUrl,
  startTime,
  venueName,
  city,
  category,
  isFree,
  price,
  matchReason,
  source,
}: EventCardProps) {
  const date = new Date(startTime);
  const dateStr = format(date, "EEE, MMM d");
  const timeStr = format(date, "h:mm a");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-card-border bg-card-bg p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex gap-4">
        {imageUrl && (
          <div className="hidden sm:block h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
              {title}
            </h3>
            {isFree ? (
              <span className="flex-shrink-0 rounded-full bg-free-badge px-2 py-0.5 text-xs font-medium text-white">
                Free
              </span>
            ) : price ? (
              <span className="flex-shrink-0 text-sm font-medium text-muted">
                {price}
              </span>
            ) : null}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{dateStr} at {timeStr}</span>
            {venueName && <span>{venueName}</span>}
            {city && <span>{city}</span>}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-category-pill px-2.5 py-0.5 text-xs font-medium text-foreground">
              {category}
            </span>
            <span className="text-xs text-muted capitalize">
              via {source}
            </span>
          </div>

          {matchReason && (
            <p className="mt-2 text-sm text-accent leading-snug">
              {matchReason}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
