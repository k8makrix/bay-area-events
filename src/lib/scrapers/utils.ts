import axios from "axios";

export async function fetchPage(url: string, delayMs = 1000): Promise<string> {
  await new Promise((r) => setTimeout(r, delayMs));
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "BayAreaEventsBot/1.0 (local event aggregator; non-commercial)",
    },
    timeout: 15000,
  });
  return data;
}

export function normalizeCity(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim();

  const CITY_ALIASES: Record<string, string> = {
    "downtown san jose": "San Jose",
    "south san jose": "San Jose",
    "north san jose": "San Jose",
    "east san jose": "San Jose",
    "west san jose": "San Jose",
    "downtown campbell": "Campbell",
    "downtown los gatos": "Los Gatos",
    sf: "San Francisco",
    "san fran": "San Francisco",
    "mountain view": "Mountain View",
    "half moon bay": "Half Moon Bay",
    "redwood city": "Redwood City",
    "walnut creek": "Walnut Creek",
    "daly city": "Daly City",
    "palo alto": "Palo Alto",
    "santa clara": "Santa Clara",
  };

  const lower = cleaned.toLowerCase();
  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];

  // Title-case if single word
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function extractPrice(text: string): { isFree: boolean; price?: string } {
  const lower = text.toLowerCase();
  if (lower.includes("free") || lower.includes("no cost") || lower.includes("$0")) {
    return { isFree: true, price: "Free" };
  }
  const priceMatch = text.match(/\$[\d,.]+/);
  if (priceMatch) {
    return { isFree: false, price: priceMatch[0] };
  }
  return { isFree: false };
}
