export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  getCitiesForScope,
  getDateRange,
  scoreEvent,
  categorizeEvent,
  generateMatchReason,
  CATEGORIES,
} from "@/lib/scoring";
import type { NormalizedEvent } from "@/lib/types";
import { CategorySection } from "@/components/category-section";
import { SourceLinks } from "@/components/source-links";
import { FreshnessBadge } from "@/components/freshness-badge";
import { BayAreaMapWrapper } from "@/components/bay-area-map-wrapper";

const QUICK_LINKS = [
  { label: "Today", timeframe: "today" },
  { label: "Tomorrow", timeframe: "tomorrow" },
  { label: "This Weekend", timeframe: "thisWeekend" },
  { label: "Next Week", timeframe: "nextWeek" },
];

const SCOPE_LINKS = [
  { label: "Near Me (Campbell)", scope: "local" },
  { label: "South Bay", scope: "southBay" },
  { label: "Full Bay Area", scope: "bayArea" },
];

const FALLBACK_SOURCES = [
  { name: "Eventbrite", url: "https://www.eventbrite.com/d/ca--san-jose/events/", region: "South Bay" },
  { name: "Meetup", url: "https://www.meetup.com/find/?location=us--ca--San%20Jose&source=EVENTS", region: "South Bay" },
  { name: "DoTheBay", url: "https://dothebay.com/events/today", region: "Bay Area" },
  { name: "Funcheap", url: "https://sf.funcheap.com/region/south-bay/", region: "South Bay" },
  { name: "SJPL Events", url: "https://sjpl.bibliocommons.com/v2/events", region: "San Jose" },
];

async function getHomeData() {
  const { start, end } = getDateRange("thisWeekend");
  const cities = getCitiesForScope("southBay");

  const [dbEvents, lastIngestion, eventCount] = await Promise.all([
    prisma.event.findMany({
      where: {
        startTime: { gte: start, lte: end },
        OR: [
          { city: { in: cities, mode: "insensitive" } },
          { city: null },
        ],
      },
      orderBy: { startTime: "asc" },
      take: 100,
    }),
    prisma.ingestionLog.findFirst({
      where: { status: "success" },
      orderBy: { ranAt: "desc" },
    }),
    prisma.event.count(),
  ]);

  const scored = dbEvents.map((dbEvent) => {
    const normalized: NormalizedEvent = {
      externalId: dbEvent.externalId || dbEvent.id,
      source: dbEvent.source,
      title: dbEvent.title,
      description: dbEvent.description || undefined,
      url: dbEvent.url,
      imageUrl: dbEvent.imageUrl || undefined,
      startTime: dbEvent.startTime,
      endTime: dbEvent.endTime || undefined,
      venueName: dbEvent.venueName || undefined,
      venueAddress: dbEvent.venueAddress || undefined,
      city: dbEvent.city || undefined,
      lat: dbEvent.lat || undefined,
      lng: dbEvent.lng || undefined,
      tags: dbEvent.tags,
      isFree: dbEvent.isFree,
      price: dbEvent.price || undefined,
    };

    const relevanceScore = scoreEvent(normalized);
    const category = categorizeEvent(normalized);
    const matchReason = generateMatchReason(normalized, relevanceScore, category);

    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description,
      url: dbEvent.url,
      imageUrl: dbEvent.imageUrl,
      startTime: dbEvent.startTime.toISOString(),
      endTime: dbEvent.endTime?.toISOString(),
      venueName: dbEvent.venueName,
      city: dbEvent.city,
      category,
      tags: dbEvent.tags,
      isFree: dbEvent.isFree,
      price: dbEvent.price,
      relevanceScore,
      matchReason,
      source: dbEvent.source,
    };
  });

  const filtered = scored
    .filter((e) => e.relevanceScore >= 10)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const lastRan = lastIngestion?.ranAt;
  const isStale = !lastRan || Date.now() - lastRan.getTime() > 24 * 60 * 60 * 1000;

  return { events: filtered, lastIngestion: lastRan?.toISOString() || null, isStale, eventCount };
}

export default async function Home() {
  const { events, lastIngestion, isStale, eventCount } = await getHomeData();

  // Group events by category
  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = events.filter((e) => e.category === cat);
      return acc;
    },
    {} as Record<string, typeof events>
  );

  return (
    <div>
      {/* Hero */}
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          What&apos;s happening this weekend?
        </h1>
        <p className="mt-2 text-lg text-muted">
          Tap a region to explore events — arts, comedy, food, music, and more.
        </p>

        <div className="mt-2 flex items-center gap-3">
          <FreshnessBadge lastIngestion={lastIngestion} isStale={isStale} />
          {eventCount > 0 && (
            <span className="text-xs text-muted">
              {eventCount} events tracked
            </span>
          )}
        </div>
      </section>

      {/* Interactive Bay Area map */}
      <section className="mb-6">
        <BayAreaMapWrapper />
      </section>

      {/* Quick select */}
      <section className="mb-6">
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.timeframe}
              href={`/events?timeframe=${link.timeframe}&scope=southBay`}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Scope select (text fallback below map) */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          {SCOPE_LINKS.map((link) => (
            <Link
              key={link.scope}
              href={`/events?scope=${link.scope}&timeframe=thisWeekend`}
              className="rounded-full border border-card-border bg-card-bg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Stale data warning + source links */}
      {(isStale || events.length === 0) && (
        <section className="mb-8">
          <SourceLinks sources={FALLBACK_SOURCES} isStale={isStale} />
        </section>
      )}

      {/* Event listings by category */}
      {events.length > 0 ? (
        CATEGORIES.map((cat) => (
          <CategorySection key={cat} category={cat} events={grouped[cat] || []} />
        ))
      ) : (
        <div className="rounded-xl border border-card-border bg-card-bg p-8 text-center">
          <p className="text-lg font-medium text-foreground">No events found yet</p>
          <p className="mt-2 text-sm text-muted">
            Run the ingestion script to pull in events, or browse the sources above.
          </p>
        </div>
      )}
    </div>
  );
}
