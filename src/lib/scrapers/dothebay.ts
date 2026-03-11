import * as cheerio from "cheerio";
import type { NormalizedEvent } from "@/lib/types";
import { fetchPage, normalizeCity, extractPrice } from "./utils";

const DOTHEBAY_URLS = [
  "https://dothebay.com/events/today",
  "https://dothebay.com/events/this-weekend",
  "https://southbay.dothebay.com/events/today",
  "https://southbay.dothebay.com/events/this-weekend",
];

export async function scrapeDothebay(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = [];
  const seen = new Set<string>();

  for (const url of DOTHEBAY_URLS) {
    try {
      const html = await fetchPage(url);
      const $ = cheerio.load(html);

      $(".ds-listing, .event-card, article.event, [data-event-id]").each((_, el) => {
        const $card = $(el);
        const title = $card.find("h2, h3, .ds-listing-event-title, .event-title").first().text().trim();
        const link = $card.find("a").first().attr("href");
        const dateStr = $card.find("time, .ds-listing-event-date, .event-date").first().attr("datetime")
          || $card.find("time, .ds-listing-event-date, .event-date").first().text().trim();
        const venue = $card.find(".ds-venue-name, .event-venue, .venue").first().text().trim();
        const location = $card.find(".ds-venue-city, .event-location, .location").first().text().trim();
        const priceText = $card.find(".ds-listing-event-price, .event-price, .price").first().text().trim();
        const imageUrl = $card.find("img").first().attr("src");

        if (!title || !link) return;
        const fullUrl = link.startsWith("http") ? link : `https://dothebay.com${link}`;

        // Deduplicate
        const key = `${title}-${dateStr}`;
        if (seen.has(key)) return;
        seen.add(key);

        const priceInfo = priceText ? extractPrice(priceText) : { isFree: false };

        events.push({
          externalId: link.split("/").filter(Boolean).pop() || title,
          source: "dothebay",
          title,
          url: fullUrl,
          imageUrl: imageUrl || undefined,
          startTime: dateStr ? new Date(dateStr) : new Date(),
          venueName: venue || undefined,
          city: normalizeCity(location) || undefined,
          tags: [],
          ...priceInfo,
        });
      });

      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.warn(`[dothebay] Failed for ${url}:`, (err as Error).message);
    }
  }

  console.log(`[dothebay] Scraped ${events.length} events`);
  return events;
}
