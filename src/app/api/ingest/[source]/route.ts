import { NextRequest, NextResponse } from "next/server";
import { upsertEvents, logIngestionError } from "@/lib/scrapers/upsert";

import { scrapeEventbrite } from "@/lib/scrapers/eventbrite";
import { scrapeMeetup } from "@/lib/scrapers/meetup";
import { scrapeDothebay } from "@/lib/scrapers/dothebay";
import { scrapeFuncheap } from "@/lib/scrapers/funcheap";
import { scrapeBandsintown } from "@/lib/scrapers/bandsintown";
import { scrapeSjpl } from "@/lib/scrapers/sjpl";
import { scrapeCraigslist } from "@/lib/scrapers/craigslist";
import { scrapeMuseums } from "@/lib/scrapers/museums";

const SCRAPERS: Record<string, () => Promise<import("@/lib/types").NormalizedEvent[]>> = {
  eventbrite: scrapeEventbrite,
  meetup: scrapeMeetup,
  dothebay: scrapeDothebay,
  funcheap: scrapeFuncheap,
  bandsintown: scrapeBandsintown,
  sjpl: scrapeSjpl,
  craigslist: scrapeCraigslist,
  museums: scrapeMuseums,
};

export const VALID_SOURCES = Object.keys(SCRAPERS);

function isAuthorized(request: NextRequest): boolean {
  const apiKey = process.env.INGEST_API_KEY;
  if (!apiKey) return true; // No key configured = allow (dev mode)
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${apiKey}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { source } = await params;
  const scraperFn = SCRAPERS[source];

  if (!scraperFn) {
    return NextResponse.json(
      { error: `Unknown source: ${source}`, validSources: VALID_SOURCES },
      { status: 404 }
    );
  }

  try {
    const events = await scraperFn();
    const result = await upsertEvents(source, events);

    return NextResponse.json({
      status: "ok",
      source,
      scraped: events.length,
      ...result,
    });
  } catch (err) {
    const message = (err as Error).message;
    await logIngestionError(source, message).catch(() => {});

    return NextResponse.json(
      { status: "error", source, message },
      { status: 500 }
    );
  }
}

// Also support POST for backwards compat
export const POST = GET;
