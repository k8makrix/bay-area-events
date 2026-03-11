import * as cheerio from "cheerio";
import type { NormalizedEvent } from "@/lib/types";
import { fetchPage, normalizeCity, extractPrice } from "./utils";

const CRAIGSLIST_URL = "https://sfbay.craigslist.org/search/sby/eve";

export async function scrapeCraigslist(): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = [];

  try {
    const html = await fetchPage(CRAIGSLIST_URL, 2000); // Extra delay for politeness
    const $ = cheerio.load(html);

    $(".cl-static-search-result, .result-row, li.result-info").each((_, el) => {
      const $row = $(el);
      const title = $row.find(".title, a.titlestring, a.result-title").first().text().trim();
      const link = $row.find("a").first().attr("href");
      const dateStr = $row.find("time, .date, .datetime").first().attr("datetime")
        || $row.find("time, .date").first().text().trim();
      const priceText = $row.find(".priceinfo, .result-price").first().text().trim();
      const location = $row.find(".location, .result-hood").first().text().replace(/[()]/g, "").trim();

      if (!title || !link) return;
      const fullUrl = link.startsWith("http") ? link : `https://sfbay.craigslist.org${link}`;

      const priceInfo = priceText ? extractPrice(priceText) : { isFree: false };

      events.push({
        externalId: link.split("/").filter(Boolean).pop()?.replace(".html", "") || title,
        source: "craigslist",
        title,
        url: fullUrl,
        startTime: dateStr ? new Date(dateStr) : new Date(),
        city: normalizeCity(location) || undefined,
        tags: [],
        ...priceInfo,
      });
    });
  } catch (err) {
    console.warn(`[craigslist] Failed:`, (err as Error).message);
  }

  console.log(`[craigslist] Scraped ${events.length} events`);
  return events;
}
