import { distance } from "fastest-levenshtein";
import { prisma } from "@/lib/db";
import type { NormalizedEvent } from "@/lib/types";

function isDuplicate(a: NormalizedEvent, b: NormalizedEvent): boolean {
  if (a.source === b.source && a.externalId === b.externalId) return true;

  const titleDist = distance(a.title.toLowerCase(), b.title.toLowerCase());
  if (titleDist > 3) return false;

  const sameDay =
    a.startTime.toISOString().slice(0, 10) === b.startTime.toISOString().slice(0, 10);
  if (!sameDay) return false;

  if (a.city && b.city && a.city.toLowerCase() !== b.city.toLowerCase()) return false;

  return true;
}

function deduplicateEvents(events: NormalizedEvent[]): NormalizedEvent[] {
  const unique: NormalizedEvent[] = [];
  for (const event of events) {
    if (!unique.some((existing) => isDuplicate(existing, event))) {
      unique.push(event);
    }
  }
  return unique;
}

export async function upsertEvents(
  source: string,
  events: NormalizedEvent[]
): Promise<{ upserted: number; deduplicated: number }> {
  const unique = deduplicateEvents(events);
  let upserted = 0;

  for (const event of unique) {
    if (isNaN(event.startTime.getTime())) continue;

    try {
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

  await prisma.ingestionLog.create({
    data: {
      source,
      status: "success",
      eventCount: upserted,
    },
  });

  return { upserted, deduplicated: events.length - unique.length };
}

export async function logIngestionError(source: string, error: string): Promise<void> {
  await prisma.ingestionLog.create({
    data: {
      source,
      status: "failed",
      eventCount: 0,
      errors: error,
    },
  });
}
