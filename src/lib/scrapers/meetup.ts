import * as cheerio from "cheerio";
import type { NormalizedEvent } from "@/lib/types";
import { fetchPage, normalizeCity, extractPrice } from "./utils";

const MEETUP_URLS = [
  "https://www.meetup.com/find/?location=us--ca--San%20Jose&source=EVENTS&eventType=inPerson",
  "https://www.meetup.com/find/?location=us--ca--Campbell&source=EVENTS&eventType=inPerson",
];

export async function scrapeMeetup(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = [];

  for (const url of MEETUP_URLS) {
    try {
      const html = await fetchPage(url);
      const $ = cheerio.load(html);

      // Meetup renders events in JSON-LD script tags
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html() || "");
          const items = Array.isArray(json) ? json : [json];

          for (const item of items) {
            if (item["@type"] !== "Event") continue;

            const priceInfo = extractPrice(
              item.offers?.price?.toString() || item.isAccessibleForFree ? "Free" : ""
            );

            events.push({
              externalId: item.url?.split("/").filter(Boolean).pop() || item.name,
              source: "meetup",
              title: item.name,
              description: item.description?.slice(0, 1000),
              url: item.url,
              imageUrl: item.image?.[0] || item.image,
              startTime: new Date(item.startDate),
              endTime: item.endDate ? new Date(item.endDate) : undefined,
              venueName: item.location?.name,
              venueAddress: item.location?.address?.streetAddress,
              city: normalizeCity(
                item.location?.address?.addressLocality
              ),
              lat: item.location?.geo?.latitude,
              lng: item.location?.geo?.longitude,
              tags: [],
              ...priceInfo,
            });
          }
        } catch {
          // JSON parse failed for this script tag
        }
      });

      // Fallback: parse event cards from HTML
      if (events.length === 0) {
        $("[data-testid='categoryResults-eventCard']").each((_, el) => {
          const $card = $(el);
          const title = $card.find("h2, h3").first().text().trim();
          const link = $card.find("a").first().attr("href");
          const dateText = $card.find("time").attr("datetime");

          if (title && link) {
            events.push({
              externalId: link.split("/").filter(Boolean).pop() || title,
              source: "meetup",
              title,
              url: link.startsWith("http") ? link : `https://www.meetup.com${link}`,
              startTime: dateText ? new Date(dateText) : new Date(),
              tags: [],
              isFree: false,
            });
          }
        });
      }

      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.warn(`[meetup] Failed for ${url}:`, (err as Error).message);
    }
  }

  console.log(`[meetup] Scraped ${events.length} events`);
  return events;
}
