# Indie Books Atlas

A living, data-driven map of every independent bookstore in Canada - shipping at **indiebooksatlas.ca**.

Indie Books Atlas pulls store data from OpenStreetMap, the CIBA member directory, ALQ, Wikidata, Google Places, and community submissions into one canonical, PostGIS-backed dataset, and presents it as a clustered, filterable map with a page per store and a curated events calendar for Canadian book fairs. It's built to be community infrastructure first - a resource the Canadian literary world can rely on - and a geospatial showcase second.

This repo is the **Next.js site**. Data ingestion (OSM sync, Google Places enrichment, source merging) lives in the sibling [`indie-books-atlas-pipeline`](https://github.com/SlightlyLostDave/indie-books-atlas-pipeline) repo.

## Status

Phase 1 (Data Foundation) is nearly complete upstream: the Supabase/PostGIS schema is provisioned and the pipeline repo is scaffolded, with the seed/sync/enrich jobs as the live next step there. This app repo is pre-MVP-build - currently the default `create-next-app` scaffold, with the map, store pages, events calendar, and submission form still to come.

## Stack

- **Next.js** (App Router)
- **Supabase** - Postgres + PostGIS, auth, RLS (`@supabase/ssr`)
- **Mapbox GL JS** - clustered map
- **Tailwind** - styling
- **Resend** - transactional email (submissions, digests)
- **Vercel** - hosting, preview deployments per PR

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Env vars (not yet configured in this repo - wiring is a Phase 2 step):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
RESEND_API_KEY=
```

## Contributing

See [`AGENTS.md`](./AGENTS.md) for working with this codebase - this project tracks Next.js closely and pins to docs bundled in `node_modules/next/dist/docs/` rather than assuming API stability across versions. See [`CLAUDE.md`](./CLAUDE.md) for the full architecture and data contract.
