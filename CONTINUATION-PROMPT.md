# Bay Area Events — Continuation Prompt

Copy everything below this line into a new Claude Code session to pick up where we left off.

---

## Project Context

I'm building **Bay Area Events**, a local event discovery app for the San Francisco Bay Area. Phases 1–5 are complete and deployed.

**Repo:** `/Users/katemak/Documents/bay-area-events-main`
**GitHub:** https://github.com/k8makrix/bay-area-events (public)
**Vercel:** https://bay-area-events-main.vercel.app
**Linear:** https://linear.app/k8mak/project/bay-area-events-8b66830cfcce
**Neon DB:** project `ancient-feather-89078180`, org `org-dry-shape-14154598`, us-east-1

## Tech Stack

- Next.js 16.1.6 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 with earth-tone design tokens in `globals.css`
- Prisma 7 with PrismaPg adapter (`prisma/schema.prisma`, `src/lib/db.ts`)
- PostgreSQL 16 — Docker locally, Neon (free tier) in production
- MapLibre GL JS + react-map-gl + OpenFreeMap tiles (no API key)
- 8 event scrapers in `src/lib/scrapers/`
- Preference scoring engine in `src/lib/scoring.ts`
- Cross-source dedup via Levenshtein distance in `src/lib/dedup.ts`

## What's Built (Phases 1–5)

1. **Database + scrapers**: Prisma schema, 8 scrapers (Eventbrite, Meetup, DoTheBay, Funcheap, Bandsintown, SJPL, Craigslist, museums), dedup engine
2. **Scoring engine**: Category/timeframe/scope preference weighting
3. **REST API**: `/api/events`, `/api/sources`, `/api/ingest`, `/api/health`
4. **Frontend**: Earth-tone UI, category-grouped event cards, filter bar, freshness badges
5. **Interactive map**: 5 tappable Bay Area regions (SF, East Bay, South Bay, Peninsula, North Bay) with popups linking to filtered event views

## What's Deployed

- Git committed + pushed to GitHub on `main`
- Vercel CLI deploy (not linked to GitHub integration yet — see K8-121)
- Neon cloud DB with migration `20260311160159_init` applied
- Env vars set on Vercel: `DATABASE_URL`, `INGEST_API_KEY`, `NEXT_PUBLIC_APP_URL`
- **Production DB is empty** — needs seeding via `/api/ingest` (K8-124)

## Key Architecture Notes

- `src/lib/db.ts` uses PrismaPg adapter pattern for Neon SSL compatibility
- `src/app/api/ingest/route.ts` runs all scrapers in-process — will timeout on Vercel's 10s hobby limit (K8-122)
- Map component is dynamically imported (`next/dynamic`, no SSR) in `src/app/page.tsx`
- `postinstall: prisma generate` in package.json for Vercel builds
- GeoJSON regions defined in `src/lib/geo/bay-area-regions.ts`

## Linear Project: Bay Area Events

### Production Ready (Todo/Urgent)
- K8-121: Set up Vercel GitHub integration (install Vercel GitHub App)
- K8-122: Refactor `/api/ingest` for serverless (streaming or background job)
- K8-123: Set up cron-based auto-ingestion
- K8-124: Seed production DB with initial event data

### User Experience (Backlog/Normal)
- K8-125: Event detail page with full description + venue info
- K8-126: Enhanced map — neighborhood zoom + event pin clustering
- K8-127: Search/text filter for events
- K8-128: User accounts + saved preference profiles
- K8-129: Mobile PWA support (manifest, service worker)

### Scraper Improvements (Backlog/Normal)
- K8-130: Bandsintown App ID for authenticated requests
- K8-131: Add more sources (SF Chronicle, Mercury News, Hoodline)
- K8-132: Scraper health monitoring dashboard
- K8-135: Eventbrite API key for better data quality

### Vision (Backlog/Low)
- K8-133: 3D terrain/globe view (MapLibre 3D + deck.gl)
- K8-134: Calendar integrations (Google Cal, iCal, Meetup, Facebook Events)
- K8-136: Social media feeds for hosts/venues
- K8-137: Venue claiming with social profiles
- K8-138: Push notifications for matching events
- K8-139: Community features (ratings, reviews, sharing)

## Immediate Next Steps

1. **Seed the production DB** (K8-124): Hit `/api/ingest` with the `INGEST_API_KEY` to populate events. Some scrapers may fail on Vercel due to timeout — that's expected and tracked in K8-122.
2. **Refactor ingest for serverless** (K8-122): Break `/api/ingest` into per-source endpoints or use Vercel background functions so each scraper runs independently within the 10s limit.
3. **Set up cron** (K8-123): Use Vercel Cron Jobs (`vercel.json`) to auto-ingest daily.
4. **Install Vercel GitHub App** (K8-121): Go to Vercel dashboard → project settings → Git → connect to `k8makrix/bay-area-events` for automatic deploys on push.
5. **Event detail page** (K8-125): Create `/events/[id]` route with full event description, venue info, map pin, and source attribution.

Pick up from step 1 or tell me which Linear issue to work on next.
