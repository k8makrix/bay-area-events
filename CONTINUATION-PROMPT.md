# Bay Area Events — Continuation Prompt

Copy everything below this line into a new Claude Code session to pick up where we left off.

---

## Project Context

I'm building **Bay Area Events**, a local event discovery app for the San Francisco Bay Area. The app is live in production with auto-deploy, daily cron ingestion, and 19 tracked issues across 4 milestones in Linear.

**Repo:** `/Users/katemak/Documents/bay-area-events-main`
**GitHub:** https://github.com/k8makrix/bay-area-events (public, auto-deploys to Vercel on push)
**Vercel:** https://bay-area-events-main.vercel.app
**Linear:** https://linear.app/k8mak/project/bay-area-events-8b66830cfcce
**Neon DB:** project `ancient-feather-89078180`, org `org-dry-shape-14154598`, us-east-1

## Tech Stack

- Next.js 16.1.6 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 with earth-tone design tokens in `globals.css`
- Prisma 7 with PrismaPg adapter (`prisma/schema.prisma`, `src/lib/db.ts`)
- PostgreSQL 16 — Docker locally, Neon (free tier) in production
- MapLibre GL JS + react-map-gl + OpenFreeMap tiles (no API key needed)
- 8 event scrapers in `src/lib/scrapers/`
- Preference scoring engine in `src/lib/scoring.ts`
- Cross-source dedup via Levenshtein distance in `src/lib/dedup.ts`

## What's Built & Deployed

1. **Database + scrapers**: Prisma schema, 8 scrapers (Eventbrite, Meetup, DoTheBay, Funcheap, Bandsintown, SJPL, Craigslist, museums), dedup engine
2. **Scoring engine**: Category/timeframe/scope preference weighting
3. **REST API**: `/api/events`, `/api/sources`, `/api/ingest`, `/api/ingest/[source]`, `/api/health`
4. **Frontend**: Earth-tone UI, category-grouped event cards, filter bar, freshness badges
5. **Interactive map**: 5 tappable Bay Area regions (SF, East Bay, South Bay, Peninsula, North Bay) with popups linking to filtered event views
6. **Production infra**: Vercel auto-deploy via GitHub integration, Neon cloud DB, Vercel Cron daily at 06:00 UTC, per-source serverless ingest endpoints

## Current State

- **Production Ready milestone**: 100% complete (K8-121 through K8-124 all Done)
- **Vercel GitHub integration**: Connected — push to `main` = auto-deploy
- **Cron ingestion**: `vercel.json` runs `/api/ingest` daily at 06:00 UTC, fans out to 8 per-source endpoints
- **Production DB**: Seeded with events, auto-refreshing daily
- **Env vars on Vercel**: `DATABASE_URL`, `INGEST_API_KEY`, `NEXT_PUBLIC_APP_URL`

## Linear Backlog — What's Next

### User Experience (next priority)
- **K8-125** Event detail page with full description, venue info, directions
- **K8-126** Enhanced map: neighborhood zoom + event pin clustering
- **K8-127** Search / text filter for events
- **K8-128** User accounts + saved preference profiles
- **K8-129** Mobile PWA support (manifest, service worker, offline)

### Scraper Improvements
- **K8-130** Bandsintown App ID for authenticated requests
- **K8-131** Add more sources: SF Chronicle, Mercury News, Hoodline
- **K8-132** Scraper health monitoring dashboard
- **K8-135** Eventbrite API key for better data quality

### Vision
- **K8-133** 3D terrain/globe view with MapLibre 3D + deck.gl
- **K8-134** Calendar integrations (Google Cal, iCal, Meetup, Facebook Events)
- **K8-136** Social media feeds for hosts/venues (TikTok, Instagram)
- **K8-137** Venue claiming with social profiles
- **K8-138** Push notifications for matching events
- **K8-139** Community features: ratings, reviews, sharing

## Suggested Next Session

Start with: "Read the Linear backlog for Bay Area Events and let's tackle the User Experience milestone. Start with K8-125 (event detail page) — build a `/events/[id]` route with full event info, venue details, map pin, and a back button. Then move to K8-127 (search/text filter). Commit after each issue, push when done."

## Key Architecture Notes

- `src/lib/db.ts` uses PrismaPg adapter pattern for Neon SSL compatibility
- `src/app/api/ingest/[source]/route.ts` — per-source serverless endpoints (each runs one scraper within Vercel's 10s limit)
- `src/app/api/ingest/route.ts` — orchestrator that fans out to per-source endpoints
- Map component is dynamically imported (`next/dynamic`, no SSR) in `src/app/page.tsx`
- `postinstall: prisma generate` in package.json for Vercel builds
- GeoJSON regions defined in `src/lib/geo/bay-area-regions.ts`
- INGEST_API_KEY required as Bearer token for all `/api/ingest` endpoints
