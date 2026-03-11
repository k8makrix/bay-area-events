import * as cheerio from "cheerio";
import type { NormalizedEvent } from "@/lib/types";
import { fetchPage, extractPrice } from "./utils";

const SJPL_URL = "https://sjpl.bibliocommons.com/v2/events";

export async function scrapeSjpl(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = [];

  try {
    const html = await fetchPage(SJPL_URL);
    const $ = cheerio.load(html);

    // BiblioCommons events pages use structured event cards
    $(".event-card, .cp-event-item, [data-testid='event-item']").each((_, el) => {
      const $card = $(el);
      const title = $card.find(".event-title, h3, h2").first().text().trim();
      const link = $card.find("a").first().attr("href");
      const dateStr = $card.find("time, .event-date, .date").first().attr("datetime")
        || $card.find("time, .event-date, .date").first().text().trim();
      const location = $card.find(".event-location, .location, .branch-name").first().text().trim();
      const description = $card.find(".event-description, .description, p").first().text().trim();

      if (!title) return;
      const fullUrl = link
        ? (link.startsWith("http") ? link : `https://sjpl.bibliocommons.com${link}`)
        : SJPL_URL;

      events.push({
        externalId: link?.split("/").pop() || title.slice(0, 50),
        source: "sjpl",
        title,
        description: description.slice(0, 1000) || undefined,
        url: fullUrl,
        startTime: dateStr ? new Date(dateStr) : new Date(),
        venueName: location || "San Jose Public Library",
        city: "San Jose",
        tags: ["library", "community", "free"],
        isFree: true,
        price: "Free",
      });
    });

    // Also try JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "");
        const items = Array.isArray(json) ? json : [json];
        for (const item of items) {
          if (item["@type"] !== "Event") continue;
          events.push({
            externalId: item.url?.split("/").pop() || item.name,
            source: "sjpl",
            title: item.name,
            description: item.description?.slice(0, 1000),
            url: item.url || SJPL_URL,
            startTime: new Date(item.startDate),
            endTime: item.endDate ? new Date(item.endDate) : undefined,
            venueName: item.location?.name || "San Jose Public Library",
            city: "San Jose",
            tags: ["library", "community", "free"],
            isFree: true,
            price: "Free",
          });
        }
      } catch {
        // parse error
      }
    });
  } catch (err) {
    console.warn(`[sjpl] Failed:`, (err as Error).message);
  }

  console.log(`[sjpl] Scraped ${events.length} events`);
  return events;
}
