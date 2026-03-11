import axios from "axios";
import type { NormalizedEvent } from "@/lib/types";

const EVENTBRITE_API = "https://www.eventbriteapi.com/v3";

const SOUTH_BAY_LOCATIONS = [
  { city: "San Jose", lat: 37.3382, lng: -121.8863 },
  { city: "Campbell", lat: 37.2872, lng: -121.9500 },
  { city: "Santa Clara", lat: 37.3541, lng: -121.9552 },
  { city: "Sunnyvale", lat: 37.3688, lng: -122.0363 },
  { city: "Mountain View", lat: 37.3861, lng: -122.0839 },
  { city: "Cupertino", lat: 37.3230, lng: -122.0322 },
];

interface EventbriteEvent {
  id: string;
  name: { text: string };
  description: { text: string };
  url: string;
  logo?: { url: string };
  start: { utc: string; local: string };
  end?: { utc: string; local: string };
  venue_id?: string;
  is_free: boolean;
  category_id?: string;
}

interface EventbriteVenue {
  name: string;
  address: {
    localized_address_display: string;
    city: string;
    latitude: string;
    longitude: string;
  };
}

export async function scrapeEventbrite(): Promise<NormalizedEvent[]> {
  const apiKey = process.env.EVENTBRITE_API_KEY;
  if (!apiKey) {
    console.warn("[eventbrite] No API key found, skipping");
    return [];
  }

  const events: NormalizedEvent[] = [];
  const venueCache = new Map<string, EventbriteVenue>();

  for (const loc of SOUTH_BAY_LOCATIONS) {
    try {
      const { data } = await axios.get(`${EVENTBRITE_API}/events/search/`, {
        params: {
          "location.latitude": loc.lat,
          "location.longitude": loc.lng,
          "location.within": "10mi",
          "start_date.range_start": new Date().toISOString().split(".")[0] + "Z",
          expand: "venue",
          sort_by: "date",
        },
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 10000,
      });

      for (const ev of (data.events || []) as EventbriteEvent[]) {
        let venue: EventbriteVenue | undefined;
        if (ev.venue_id) {
          if (venueCache.has(ev.venue_id)) {
            venue = venueCache.get(ev.venue_id);
          } else {
            try {
              const { data: v } = await axios.get(
                `${EVENTBRITE_API}/venues/${ev.venue_id}/`,
                { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 5000 }
              );
              venue = v;
              venueCache.set(ev.venue_id, v);
            } catch {
              // venue fetch failed, continue without it
            }
          }
        }

        events.push({
          externalId: ev.id,
          source: "eventbrite",
          title: ev.name.text,
          description: ev.description?.text?.slice(0, 1000),
          url: ev.url,
          imageUrl: ev.logo?.url,
          startTime: new Date(ev.start.utc),
          endTime: ev.end ? new Date(ev.end.utc) : undefined,
          venueName: venue?.name,
          venueAddress: venue?.address?.localized_address_display,
          city: venue?.address?.city || loc.city,
          lat: venue ? parseFloat(venue.address.latitude) : loc.lat,
          lng: venue ? parseFloat(venue.address.longitude) : loc.lng,
          tags: [],
          isFree: ev.is_free,
          price: ev.is_free ? "Free" : undefined,
        });
      }

      // Small delay between location searches
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`[eventbrite] Failed for ${loc.city}:`, (err as Error).message);
    }
  }

  console.log(`[eventbrite] Scraped ${events.length} events`);
  return events;
}
