import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getCitiesForScope,
  getDateRange,
  scoreEvent,
  categorizeEvent,
  generateMatchReason,
  type ScopeName,
  type Timeframe,
} from "@/lib/scoring";
import type { NormalizedEvent } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const scope = (params.get("scope") || "southBay") as ScopeName;
  const timeframe = (params.get("timeframe") || "thisWeekend") as Timeframe;
  const categoryFilter = params.get("category");
  const minScore = parseInt(params.get("minScore") || "10", 10);
  const limit = Math.min(parseInt(params.get("limit") || "30", 10), 100);

  const { start, end } = getDateRange(timeframe);
  const cities = getCitiesForScope(scope);

  // Query events from DB
  const dbEvents = await prisma.event.findMany({
    where: {
      startTime: { gte: start, lte: end },
      OR: [
        { city: { in: cities, mode: "insensitive" } },
        { city: null }, // Include events without a city
      ],
    },
    orderBy: { startTime: "asc" },
  });

  // Score and categorize each event
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
      venueAddress: dbEvent.venueAddress,
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

  // Filter and sort
  let filtered = scored.filter((e) => e.relevanceScore >= minScore);
  if (categoryFilter) {
    filtered = filtered.filter(
      (e) => e.category.toLowerCase() === categoryFilter.toLowerCase()
    );
  }
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const results = filtered.slice(0, limit);

  // Get last ingestion time
  const lastIngestion = await prisma.ingestionLog.findFirst({
    where: { status: "success" },
    orderBy: { ranAt: "desc" },
  });

  return NextResponse.json({
    events: results,
    meta: {
      totalFound: scored.length,
      returned: results.length,
      scope,
      timeframe,
      lastIngestion: lastIngestion?.ranAt.toISOString() || null,
    },
  });
}
