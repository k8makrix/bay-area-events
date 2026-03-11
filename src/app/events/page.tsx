import { Suspense } from "react";
import { FilterBar } from "@/components/filter-bar";
import { EventCard } from "@/components/event-card";
import { FreshnessBadge } from "@/components/freshness-badge";

interface EventsPageProps {
  searchParams: Promise<{
    scope?: string;
    timeframe?: string;
    category?: string;
  }>;
}

async function fetchEvents(params: {
  scope?: string;
  timeframe?: string;
  category?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.scope) searchParams.set("scope", params.scope);
  if (params.timeframe) searchParams.set("timeframe", params.timeframe);
  if (params.category) searchParams.set("category", params.category);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/events?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) return { events: [], meta: { totalFound: 0, returned: 0, lastIngestion: null } };
  return res.json();
}

async function EventList({
  scope,
  timeframe,
  category,
}: {
  scope?: string;
  timeframe?: string;
  category?: string;
}) {
  const data = await fetchEvents({ scope, timeframe, category });
  const { events, meta } = data;

  const lastIngestion = meta?.lastIngestion;
  const isStale = !lastIngestion || Date.now() - new Date(lastIngestion).getTime() > 24 * 60 * 60 * 1000;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">
          Showing {events.length} of {meta.totalFound} events
        </p>
        <FreshnessBadge lastIngestion={lastIngestion} isStale={isStale} />
      </div>

      {events.length > 0 ? (
        <div className="grid gap-3">
          {events.map((event: Record<string, unknown>) => (
            <EventCard
              key={event.id as string}
              title={event.title as string}
              url={event.url as string}
              imageUrl={event.imageUrl as string | undefined}
              startTime={event.startTime as string}
              endTime={event.endTime as string | undefined}
              venueName={event.venueName as string | undefined}
              city={event.city as string | undefined}
              category={event.category as string}
              tags={event.tags as string[]}
              isFree={event.isFree as boolean}
              price={event.price as string | undefined}
              relevanceScore={event.relevanceScore as number}
              matchReason={event.matchReason as string}
              source={event.source as string}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-card-border bg-card-bg p-8 text-center">
          <p className="text-lg font-medium text-foreground">No events match your filters</p>
          <p className="mt-2 text-sm text-muted">
            Try broadening your location or time range.
          </p>
        </div>
      )}
    </div>
  );
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Browse Events</h1>

      <Suspense fallback={null}>
        <div className="mb-6">
          <FilterBar />
        </div>
      </Suspense>

      <Suspense
        fallback={
          <div className="py-8 text-center text-muted">Loading events...</div>
        }
      >
        <EventList
          scope={params.scope}
          timeframe={params.timeframe}
          category={params.category}
        />
      </Suspense>
    </div>
  );
}
