import { NextResponse } from "next/server";

const EVENT_SOURCES = [
  { name: "Eventbrite", url: "https://www.eventbrite.com/d/ca--san-jose/events/", region: "South Bay" },
  { name: "Meetup", url: "https://www.meetup.com/find/?location=us--ca--San%20Jose&source=EVENTS", region: "South Bay" },
  { name: "DoTheBay", url: "https://dothebay.com/events/today", region: "Bay Area" },
  { name: "DoTheBay South Bay", url: "https://southbay.dothebay.com/events/today", region: "South Bay" },
  { name: "Funcheap", url: "https://sf.funcheap.com/region/south-bay/", region: "South Bay" },
  { name: "Bandsintown", url: "https://www.bandsintown.com/?came_from=257&utm_medium=web&utm_source=home&utm_campaign=search_bar", region: "Bay Area" },
  { name: "SJPL Events", url: "https://sjpl.bibliocommons.com/v2/events", region: "San Jose" },
  { name: "Craigslist Events", url: "https://sfbay.craigslist.org/search/sby/eve", region: "South Bay" },
  { name: "SJ Museum of Art", url: "https://sjmusart.org/calendar", region: "San Jose" },
  { name: "ICA San Jose", url: "https://www.icasanjose.org/events", region: "San Jose" },
];

export async function GET() {
  return NextResponse.json({ sources: EVENT_SOURCES });
}
