import "dotenv/config";
import { PrismaClient } from "../../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { distance } from "fastest-levenshtein";
import type { NormalizedEvent } from "../types";

import { scrapeEventbrite } from "./eventbrite";
import { scrapeMeetup } from "./meetup";
import { scrapeDothebay } from "./dothebay";
import { scrapeFuncheap } from "./funcheap";
import { scrapeBandsintown } from "./bandsintown";
import { scrapeSjpl } from "./sjpl";
import { scrapeCraigslist } from "./craigslist";
import { scrapeMuseums } from "./museums";

const scrapers = [
  { name: "eventbrite", fn: scrapeEventbrite },
  { name: "meetup", fn: scrapeMeetup },
  { name: "dothebay", fn: scrapeDothebay },
  { name: "funcheap", fn: scrapeFuncheap },
  { name: "bandsintown", fn: scrapeBandsintown },
  { name: "sjpl", fn: scrapeSjpl },
  { name: "craigslist", fn: scrapeCraigslist },
  { name: "museums", fn: scrapeMuseums },
];

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

function isDuplicate(a: NormalizedEvent, b: NormalizedEvent): boolean {
  // Same source + externalId is always a duplicate
  if (a.source === b.source && a.externalId === b.externalId) return true;

  // Cross-source dedup: similar title + same date + same city
  const titleDist = distance(a.title.toLowerCase(), b.title.toLowerCase());
  if (titleDist > 3) return false;

  const sameDay =
    a.startTime.toISOString().slice(0, 10) === b.startTime.toISOString().slice(0, 10);
  if (!sameDay) return false;

  // If both have cities, they must match
  if (a.city && b.city && a.city.toLowerCase() !== b.city.toLowerCase()) return false;

  return true;
}

function deduplicateEvents(events: NormalizedEvent[]): NormalizedEvent[] {
  const unique: NormalizedEvent[] = [];

  for (const event of events) {
    const isDup = unique.some((existing) => isDuplicate(existing, event));
    if (!isDup) {
      unique.push(event);
    }
  }

  return unique;
}

async function main() {
  const prisma = createPrisma();
  console.log("Starting event ingestion...\n");

  const allEvents: NormalizedEvent[] = [];
  const logs: Array<{ source: string; status: string; eventCount: number; errors?: string }> = [];

  // Run scrapers in parallel groups to be respectful of rate limits
  const results = await Promise.allSettled(
    scrapers.map(async ({ name, fn }) => {
      console.log(`[${name}] Starting...`);
      try {
        const events = await fn();
        logs.push({ source: name, status: "success", eventCount: events.length });
        return events;
      } catch (err) {
        const message = (err as Error).message;
        console.error(`[${name}] Failed: ${message}`);
        logs.push({ source: name, status: "failed", eventCount: 0, errors: message });
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allEvents.push(...result.value);
    }
  }

  console.log(`\nTotal raw events: ${allEvents.length}`);

  // Deduplicate
  const unique = deduplicateEvents(allEvents);
  console.log(`After deduplication: ${unique.length}`);

  // Upsert into database
  let upserted = 0;
  for (const event of unique) {
    try {
      // Skip events with invalid dates
      if (isNaN(event.startTime.getTime())) continue;

      await prisma.event.upsert({
        where: {
          source_externalId: {
            source: event.source,
            externalId: event.externalId,
          },
        },
        update: {
          title: event.title,
          description: event.description,
          url: event.url,
          imageUrl: event.imageUrl,
          startTime: event.startTime,
          endTime: event.endTime,
          venueName: event.venueName,
          venueAddress: event.venueAddress,
          city: event.city,
          lat: event.lat,
          lng: event.lng,
          tags: event.tags,
          isFree: event.isFree,
          price: event.price,
        },
        create: {
          externalId: event.externalId,
          source: event.source,
          title: event.title,
          description: event.description,
          url: event.url,
          imageUrl: event.imageUrl,
          startTime: event.startTime,
          endTime: event.endTime,
          venueName: event.venueName,
          venueAddress: event.venueAddress,
          city: event.city,
          lat: event.lat,
          lng: event.lng,
          tags: event.tags,
          isFree: event.isFree,
          price: event.price,
        },
      });
      upserted++;
    } catch (err) {
      console.warn(`Failed to upsert "${event.title}":`, (err as Error).message);
    }
  }

  console.log(`Upserted ${upserted} events into database`);

  // Log results
  for (const log of logs) {
    await prisma.ingestionLog.create({
      data: {
        source: log.source,
        status: log.status,
        eventCount: log.eventCount,
        errors: log.errors,
      },
    });
  }

  console.log("\nIngestion complete!");
  console.log("Summary:");
  for (const log of logs) {
    console.log(`  ${log.source}: ${log.status} (${log.eventCount} events)`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
