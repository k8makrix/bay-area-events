import type { NormalizedEvent } from "@/lib/types";
import { isLocal } from "./scopes";

// Keyword lists per category weight
const HIGH_WEIGHT_KEYWORDS = [
  "lgbtq", "queer", "pride", "drag", "arts", "crafts", "art",
  "comedy", "stand-up", "standup", "improv", "open mic",
  "live music", "concert", "band", "jazz", "acoustic",
  "theatre", "theater", "play", "musical", "opera", "ballet",
  "painting", "pottery", "ceramics", "printmaking", "sculpture",
];

const MEDIUM_WEIGHT_KEYWORDS = [
  "food", "drink", "tasting", "brewery", "wine", "cocktail",
  "tech", "product", "ux", "design", "startup", "hackathon",
  "science", "maker", "diy", "3d print", "electronics",
  "sustainability", "garden", "gardening", "composting", "climate",
  "volunteer", "volunteering", "community service", "cleanup",
  "cooking", "chef", "farm-to-table",
];

const STANDARD_WEIGHT_KEYWORDS = [
  "festival", "cultural", "heritage", "lunar new year", "diwali",
  "market", "flea market", "makers market", "craft fair", "artisan",
  "board game", "tabletop", "geek", "cosplay", "comic",
  "wellness", "meditation", "mindfulness", "yoga", "sound bath",
  "dog", "pet", "animal", "dog-friendly",
];

const NEGATIVE_KEYWORDS = [
  "kids only", "children only", "ages 2-5", "ages 3-6", "preschool",
  "edm", "rave", "bass drop", "dubstep",
  "corporate networking", "business mixer", "professional networking",
  "church service", "bible study", "worship service", "sermon",
  "mlm", "network marketing",
];

const INTERACTIVE_KEYWORDS = [
  "workshop", "hands-on", "interactive", "class", "tutorial",
  "hands on", "make your own", "diy", "create",
];

function countKeywordMatches(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw)).length;
}

export function scoreEvent(event: NormalizedEvent): number {
  const text = [event.title, event.description || "", ...event.tags].join(" ");

  let score = 30; // Base score

  // Weighted category matches
  score += countKeywordMatches(text, HIGH_WEIGHT_KEYWORDS) * 12;     // 3x
  score += countKeywordMatches(text, MEDIUM_WEIGHT_KEYWORDS) * 8;    // 2x
  score += countKeywordMatches(text, STANDARD_WEIGHT_KEYWORDS) * 4;  // 1x
  score -= countKeywordMatches(text, NEGATIVE_KEYWORDS) * 8;         // -2x

  // Bonuses
  if (event.isFree) score += 5;
  if (isLocal(event.city)) score += 10;
  if (countKeywordMatches(text, INTERACTIVE_KEYWORDS) > 0) score += 5;

  // Clamp to 0–100
  return Math.max(0, Math.min(100, score));
}
