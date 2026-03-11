import type { NormalizedEvent } from "@/lib/types";
import type { EventCategory } from "./categorize";
import { isLocal } from "./scopes";

export function generateMatchReason(
  event: NormalizedEvent,
  score: number,
  category: EventCategory
): string {
  const parts: string[] = [];

  // What type of event
  const categoryShort: Record<string, string> = {
    "Arts & Culture": "Art event",
    "Performance & Comedy": "Live show",
    "Food & Drink": "Food & drink event",
    "Community & Social": "Community event",
    "Learning & Workshops": "Workshop",
    "Music & Nightlife": "Music event",
    "Outdoors & Nature": "Outdoor event",
    "Markets & Fairs": "Market",
  };
  parts.push(categoryShort[category] || category);

  // Where
  if (event.city) {
    parts.push(`in ${event.city}`);
  }

  // Why it's a good match
  const highlights: string[] = [];
  const text = [event.title, event.description || "", ...event.tags].join(" ").toLowerCase();

  if (text.includes("workshop") || text.includes("hands-on") || text.includes("class")) {
    highlights.push("hands-on");
  }
  if (text.includes("lgbtq") || text.includes("queer") || text.includes("pride")) {
    highlights.push("LGBTQ+ friendly");
  }
  if (text.includes("live music") || text.includes("concert") || text.includes("band")) {
    highlights.push("live music");
  }
  if (text.includes("comedy") || text.includes("improv") || text.includes("stand-up")) {
    highlights.push("comedy");
  }
  if (text.includes("free") || event.isFree) {
    highlights.push("free");
  }
  if (isLocal(event.city)) {
    highlights.push("local");
  }
  if (text.includes("outdoor") || text.includes("hike") || text.includes("nature")) {
    highlights.push("outdoors");
  }
  if (text.includes("food") || text.includes("tasting") || text.includes("cooking")) {
    highlights.push("foodie");
  }

  if (highlights.length > 0) {
    parts.push("—");
    parts.push(highlights.slice(0, 3).join(", "));
  }

  return parts.join(" ");
}
