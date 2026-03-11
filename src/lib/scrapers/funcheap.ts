import * as cheerio from "cheerio";
import type { NormalizedEvent } from "@/lib/types";
import { fetchPage, normalizeCity, extractPrice } from "./utils";

const FUNCHEAP_URLS = [
  "https://sf.funcheap.com/region/south-bay/",
  "https://sf.funcheap.com/today/",
];

export async function scrapeFuncheap(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = [];
  const seen = new Set<string>();

  for (const url of FUNCHEAP_URLS) {
    try {
      const html = await fetchPage(url);
      const $ = cheerio.load(html);

      $(".entry, article, .post").each((_, el) => {
        const $card = $(el);
        const title = $card.find("h2 a, h3 a, .entry-title a").first().text().trim();
        const link = $card.find("h2 a, h3 a, .entry-title a").first().attr("href");
        const dateText = $card.find(".date, time, .event-date, .meta-date").first().text().trim();
        const description = $card.find(".entry-content, .excerpt, p").first().text().trim();
        const imageUrl = $card.find("img").first().attr("src");

        if (!title || !link) return;

        const key = title.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);

        const priceInfo = extractPrice(title + " " + description);

        // Try to extract location from text
        let city: string | undefined;
        const cityMatch = description.match(
          /(?:in|at)\s+(San Jose|Campbell|Santa Clara|Sunnyvale|Mountain View|Los Gatos|Cupertino|San Francisco|Oakland|Berkeley|Palo Alto)/i
        );
        if (cityMatch) {
          city = normalizeCity(cityMatch[1]);
        }

        events.push({
          externalId: link.split("/").filter(Boolean).pop() || title,
          source: "funcheap",
          title,
          description: description.slice(0, 1000) || undefined,
          url: link,
          imageUrl: imageUrl || undefined,
          startTime: dateText ? new Date(dateText) : new Date(),
          city,
          tags: priceInfo.isFree ? ["free"] : [],
          ...priceInfo,
        });
      });

      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.warn(`[funcheap] Failed for ${url}:`, (err as Error).message);
    }
  }

  console.log(`[funcheap] Scraped ${events.length} events`);
  return events;
}
