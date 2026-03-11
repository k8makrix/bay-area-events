import axios from "axios";
import type { NormalizedEvent } from "@/lib/types";
import { normalizeCity } from "./utils";

const CITIES = ["San Jose", "Campbell", "Santa Clara", "Mountain View", "San Francisco", "Oakland"];

interface BandsintownEvent {
  id: string;
  title: string;
  description: string;
  url: string;
  datetime: string;
  venue: {
    name: string;
    city: string;
    region: string;
    country: string;
    latitude: string;
    longitude: string;
  };
  offers: Array<{ type: string; url: string; status: string }>;
  artist: { name: string; thumb_url: string };
  lineup: string[];
}

export async function scrapeBandsintown(): Promise<NormalizedEvent[]> {
  const appId = process.env.BANDSINTOWN_APP_ID;
  if (!appId) {
    console.warn("[bandsintown] No app ID found, skipping");
    return [];
  }

  const events: NormalizedEvent[] = [];
  const seen = new Set<string>();

  for (const city of CITIES) {
    try {
      // Bandsintown's events search by location
      const { data } = await axios.get(
        `https://rest.bandsintown.com/v4/events`, {
          params: {
            app_id: appId,
            location: `${city},CA`,
            date: "upcoming",
          },
          timeout: 10000,
        }
      );

      for (const ev of (data || []) as BandsintownEvent[]) {
        const key = `${ev.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const lineup = ev.lineup?.join(", ") || "";

        events.push({
          externalId: ev.id.toString(),
          source: "bandsintown",
          title: ev.title || `${ev.artist?.name} at ${ev.venue?.name}`,
          description: lineup ? `Lineup: ${lineup}` : ev.description?.slice(0, 1000),
          url: ev.url,
          imageUrl: ev.artist?.thumb_url,
          startTime: new Date(ev.datetime),
          venueName: ev.venue?.name,
          city: normalizeCity(ev.venue?.city) || city,
          lat: ev.venue?.latitude ? parseFloat(ev.venue.latitude) : undefined,
          lng: ev.venue?.longitude ? parseFloat(ev.venue.longitude) : undefined,
          tags: ["live music", "concert"],
          isFree: false,
        });
      }

      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`[bandsintown] Failed for ${city}:`, (err as Error).message);
    }
  }

  console.log(`[bandsintown] Scraped ${events.length} events`);
  return events;
}
