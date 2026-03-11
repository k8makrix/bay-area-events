import * as cheerio from "cheerio";
import type { NormalizedEvent } from "@/lib/types";
import { fetchPage } from "./utils";

const MUSEUM_SOURCES = [
  {
    name: "San Jose Museum of Art",
    url: "https://sjmusart.org/calendar",
    city: "San Jose",
  },
  {
    name: "ICA San Jose",
    url: "https://www.icasanjose.org/events",
    city: "San Jose",
  },
];

export async function scrapeMuseums(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = [];

  for (const museum of MUSEUM_SOURCES) {
    try {
      const html = await fetchPage(museum.url);
      const $ = cheerio.load(html);

      // Try JSON-LD first
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html() || "");
          const items = Array.isArray(json) ? json : [json];
          for (const item of items) {
            if (item["@type"] !== "Event") continue;
            events.push({
              externalId: item.url?.split("/").pop() || item.name,
              source: "museums",
              title: item.name,
              description: item.description?.slice(0, 1000),
              url: item.url || museum.url,
              imageUrl: item.image?.[0] || item.image,
              startTime: new Date(item.startDate),
              endTime: item.endDate ? new Date(item.endDate) : undefined,
              venueName: museum.name,
              city: museum.city,
              tags: ["museum", "art", "culture"],
              isFree: item.isAccessibleForFree || false,
              price: item.isAccessibleForFree ? "Free" : item.offers?.price ? `$${item.offers.price}` : undefined,
            });
          }
        } catch {
          // parse error
        }
      });

      // Fallback: parse event cards
      $(".event, .event-card, article, .views-row, .tribe-events-calendar-list__event").each((_, el) => {
        const $card = $(el);
        const title = $card.find("h2, h3, .event-title, .tribe-events-calendar-list__event-title").first().text().trim();
        const link = $card.find("a").first().attr("href");
        const dateStr = $card.find("time, .event-date, .tribe-events-calendar-list__event-datetime").first().attr("datetime")
          || $card.find("time, .event-date").first().text().trim();
        const imageUrl = $card.find("img").first().attr("src");

        if (!title || events.some((e) => e.title === title)) return;

        const fullUrl = link
          ? (link.startsWith("http") ? link : `${new URL(museum.url).origin}${link}`)
          : museum.url;

        events.push({
          externalId: link?.split("/").pop() || title.slice(0, 50),
          source: "museums",
          title,
          url: fullUrl,
          imageUrl: imageUrl || undefined,
          startTime: dateStr ? new Date(dateStr) : new Date(),
          venueName: museum.name,
          city: museum.city,
          tags: ["museum", "art", "culture"],
          isFree: false,
        });
      });

      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.warn(`[museums] Failed for ${museum.name}:`, (err as Error).message);
    }
  }

  console.log(`[museums] Scraped ${events.length} events`);
  return events;
}
