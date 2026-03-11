import type { NormalizedEvent } from "@/lib/types";

export const CATEGORIES = [
  "Arts & Culture",
  "Performance & Comedy",
  "Food & Drink",
  "Community & Social",
  "Learning & Workshops",
  "Music & Nightlife",
  "Outdoors & Nature",
  "Markets & Fairs",
] as const;

export type EventCategory = (typeof CATEGORIES)[number];

const CATEGORY_KEYWORDS: Record<EventCategory, string[]> = {
  "Arts & Culture": [
    "art", "museum", "gallery", "exhibition", "painting", "sculpture",
    "photography", "ceramics", "pottery", "printmaking", "dance",
    "cultural", "heritage", "history", "film", "cinema", "poetry",
    "literary", "book", "author",
  ],
  "Performance & Comedy": [
    "comedy", "stand-up", "standup", "improv", "theatre", "theater",
    "play", "musical", "opera", "ballet", "performance", "drag",
    "open mic", "spoken word", "sketch",
  ],
  "Food & Drink": [
    "food", "drink", "tasting", "brewery", "wine", "cocktail",
    "cooking", "chef", "restaurant", "bar", "dinner", "brunch",
    "beer", "spirits", "farm-to-table", "foodie", "culinary",
  ],
  "Community & Social": [
    "meetup", "social", "community", "volunteer", "volunteering",
    "networking", "mixer", "club", "group", "gathering", "lgbtq",
    "queer", "pride", "support group", "charity",
  ],
  "Learning & Workshops": [
    "workshop", "class", "course", "tutorial", "seminar", "lecture",
    "learn", "hands-on", "diy", "maker", "hack", "tech", "coding",
    "science", "education", "training", "skill",
  ],
  "Music & Nightlife": [
    "music", "concert", "live music", "band", "jazz", "acoustic",
    "dj", "nightlife", "karaoke", "dance party", "show",
    "festival", "tour", "album",
  ],
  "Outdoors & Nature": [
    "hike", "hiking", "outdoor", "nature", "park", "garden",
    "trail", "bike", "cycling", "camping", "beach", "kayak",
    "bird", "wildlife", "sustainability", "cleanup",
  ],
  "Markets & Fairs": [
    "market", "fair", "flea", "swap", "craft fair", "artisan",
    "farmers market", "vintage", "antique", "pop-up", "bazaar",
    "holiday market",
  ],
};

export function categorizeEvent(event: NormalizedEvent): EventCategory {
  const text = [event.title, event.description || "", ...event.tags]
    .join(" ")
    .toLowerCase();

  let bestCategory: EventCategory = "Community & Social";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter((kw) => text.includes(kw)).length;
    if (matches > bestScore) {
      bestScore = matches;
      bestCategory = category as EventCategory;
    }
  }

  return bestCategory;
}
