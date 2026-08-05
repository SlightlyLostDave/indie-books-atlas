@AGENTS.md

# Indie Books Atlas — App Repo

A live, data-driven map of every indie bookstore in Canada, shipping at **indiebooksatlas.ca**. This repo is the Next.js site. The full phased build plan (data foundation → MVP → launch → community → sustain) lives in [`indie-books-atlas.html`](./indie-books-atlas.html) — treat it as the source of truth for scope and sequencing, and keep this file in sync with it as phases complete.

## Repo boundaries

This repo is the **site only** (public map, store/event pages, submission form, admin views). All data ingestion — OSM seed/sync, Google Places enrichment, source merging — lives in the sibling [`indie-books-atlas-pipeline`](https://github.com/SlightlyLostDave/indie-books-atlas-pipeline) repo, a standalone Python project with its own `AGENT.md`/`CLAUDE.md`. Do not add scraping, sync, or seed jobs here — this app only reads from Supabase.

The pipeline merges data from seven sources by priority: `manual > ciba > alq > google_places > osm > wikidata > community_submission`, and excludes chain stores, university bookstores, and religious bookstores.

## Current status

Phase 1 (Data Foundation) is nearly done: the Supabase schema is provisioned with PostGIS, and the pipeline repo is scaffolded. The live next step upstream is pipeline step 1.4 (writing the seed/sync/enrich jobs). This app repo itself is pre-2.1 — still the default `create-next-app` scaffold, nothing built yet.

## Stack

- **Next.js** (App Router). The plan was originally written against Next 15; this repo is already on Next 16 — per `AGENTS.md`, confirm current API shapes in `node_modules/next/dist/docs/` rather than assuming from training data or from the plan doc.
- **Supabase** for data and auth — use `@supabase/ssr`, not the legacy `auth-helpers`.
- **Mapbox GL JS** for the map.
- **Tailwind** for styling.
- **Resend** for form email (submissions, weekly digest).
- **Vercel** for hosting, with preview deployments per PR.

Env vars needed (Supabase URL/anon key, Mapbox token, Resend key) are not yet configured in this repo.

## Routes

Flat structure, no nesting:

- `/` — map home
- `/stores/[slug]` — store detail (SSG via `generateStaticParams`, ISR revalidate ~24h)
- `/events` — book fairs and events calendar
- `/about` — method, trust, how to contribute
- `/submit` — correction / add-a-store form

## Data contract

This app reads from a Supabase/PostGIS schema owned by the pipeline repo's migrations:

- **Tables**: `stores` (canonical record), `store_sources` (one row per source per store), `events`, `submissions` (community queue), `change_log` (audit trail), `spotlights`, `specialty_tags` (controlled vocabulary with French labels).
- **PostGIS functions**: `stores_near` (radius search), `stores_geojson` (map data source).
- **Hours**: stored twice — the raw OSM opening-hours string as source of truth, plus a parsed JSONB column for the "open now" filter and display. Never derive display hours by re-parsing the raw string client-side; use the JSONB.
- **`data_quality_score`** (0–100): completeness signal (phone, website, hours, verification, photo) — use it to sort/triage, e.g. in an admin queue.
- **RLS**: public read on verified stores only; writes go through the pipeline's service role or land in `submissions` for review. This app should never write to `stores` directly from user-facing code.
- **Soft deletes**: `stores` uses `is_deleted`/`deleted_at`; other tables hard-delete with a `change_log` entry as the audit trail.

## Map architecture

Load the full dataset from `stores_geojson` **once** on mount, via a Next.js API route or Supabase Edge Function. Render it as a single Mapbox GeoJSON source with clustering, and run every filter (specialty, province, open-now, text search) **client-side** against the already-loaded data — no round trips per filter change. At the current dataset size (~400–700 stores) this is the right call; don't reach for server-side filtering or pagination here.

## Design direction

Visual language and copy tone should match [`indie-books-atlas.html`](./indie-books-atlas.html) — the dark warm palette (moss green `#7c9a55`, amber `#d49a4a`, deep ink background), Playfair Display for display type, Jost for body, IBM Plex Mono for labels/metadata.

For layout and editorial feel, take inspiration from [archaeological-greece.vercel.app](https://archaeological-greece.vercel.app/) — a map-atlas site with a warm, muted, card-based editorial style (serif display headers, mono accents, generous whitespace, a "field guide" rather than "directory" feel). Adapt the *structure and mood*, not the palette — Indie Books Atlas keeps its own moss/amber identity, not the Greek site's parchment/sepia/aegean colors.

## Keeping this file current

As phases in `indie-books-atlas.html` are completed (steps marked done), update the "Current status" section above to match. This file is the contract for AI-assisted sessions in this repo, the same way `AGENT.md` is for the pipeline repo — keep it accurate rather than aspirational.
