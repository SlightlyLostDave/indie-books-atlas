# Design pass brief: guardrails

Every phase of the Indie Books Atlas design pass follows these rules. Read this file and [AUDIT.md](./AUDIT.md) before starting a phase. When a rule and a design idea conflict, the rule wins; stop and ask instead of working around it.

Scope: the public routes (`/`, `/stores/[slug]` and its not-found page, `/about`, `/submit`) and the admin (`/admin` and everything under it, including sign-in).

Goal: keep the Moss and Amber colours and the three font families exactly as CLAUDE.md specifies them, and change everything else so the site looks designed for its subject (an atlas of Canada's independent bookstores) rather than assembled from shadcn, Clerk and Mapbox defaults.

## 1. Authority

1.1. **CLAUDE.md wins.** If a design change conflicts with CLAUDE.md, including its Design direction section, propose a CLAUDE.md amendment and stop for Dave's OK. Don't break it, and don't edit CLAUDE.md without that OK.

1.2. The archaeological-greece.vercel.app reference is mood input, not a template. Take structure and mood from it (editorial, field guide, generous whitespace). Don't reproduce its card layouts or its palette.

## 2. Locked foundations

2.1. **Colour hex values in `app/globals.css` are locked**, in both `:root` (dark) and `:root.light`. New tokens may only be alpha or tint variants of existing hexes (for example `rgba()` of `--moss`, or a `color-mix()` of two existing tokens). No new hues.

2.2. **Font families are locked: Playfair Display, Jost and IBM Plex Mono.** These three are the complete set. Weights, sizes, roles, case and tracking are open.

2.3. **Cinzel is retired.** It is currently loaded as `--font-eyebrow` and used on several routes (see AUDIT.md, Foundations). Each later phase that touches one of those surfaces replaces Cinzel with a role from the three locked families, and the last phase removes the font load. Don't add new Cinzel usages.

2.4. **Flat rendering only.** No baked gradients, glows, bevels, glassmorphism or backdrop blur. This includes the existing `body` radial gradient, the loading-bar gradient and the dialog `backdrop-blur-xs` (see AUDIT.md).

## 3. Data and code boundaries

3.1. **The public site only reads from Supabase and must never write to `stores`.**

3.2. Don't change data fetching, `lib/stores.ts`, `lib/freshness.ts`, API routes (`app/api/*`), `lib/structuredData.ts`, the sitemap, Supabase or auth unless a phase explicitly says to. Even then, propose the change and wait for Dave's OK.

3.3. **The admin is presentation-only in this pass.** Never change `lib/admin/*`, server actions (`app/admin/(dashboard)/stores/actions.ts`), zod schemas, change log behaviour, `requireAdminPage`, Clerk configuration or `proxy.ts`. If a design needs data the admin doesn't already load, list it in the phase summary instead of adding it.

3.4. Style Clerk components through Clerk's `appearance` API only, not CSS overrides of Clerk internals. Note: the in-app sign-in page is currently never shown, because `/admin/sign-in` redirects to Clerk's hosted portal (AUDIT.md, Clerk). Fixing that is a Clerk or proxy configuration change, so rule 3.3 applies: propose it and wait.

3.5. **Hours are displayed from `hours_parsed` via `lib/hours.ts`.** Never re-parse `hours_raw`, on the server or the client. An absent day key means unknown, not closed.

## 4. Character of the two surfaces

4.1. The public site is an atlas: map first, editorial, sparse-first (most records are thin; see AUDIT.md, Content reality).

4.2. **The admin is a work tool.** It shares the design system but runs at a denser setting where scan speed, keyboard use and clarity beat atmosphere.

## 5. Copy

5.1. **No em dashes in any UI copy you write.**

5.2. Don't rewrite Dave's existing copy (the sidebar intro, Under the hood, `/about`) unless a phase says to. List every copy change, however small, in the phase summary.

5.3. Existing em dashes in Dave's copy are listed in AUDIT.md. Leave them unless a phase says to change them.

## 6. Performance

6.1. No new runtime dependencies without written justification in the phase summary.

6.2. Keep the single GeoJSON source with client-side filtering that CLAUDE.md describes.

6.3. No DOM markers on the main map. No layout thrash.

6.4. Store pages stay SSG with ISR (`generateStaticParams`, `revalidate = 86400`).

## 7. Process

7.1. **Git:** before creating branch `design/atlas-pass` in Phase 3, run `git status`. If anything is uncommitted, stop and ask Dave to commit it. Commit at the end of each phase.

7.2. **End each phase with screenshots** at 1440 and 390 widths in both themes, plus a short summary. Before-screenshots live in `docs/design/before/`. Capture against a stable tree: if the branch or HEAD changes during a capture run, discard and recapture.

7.3. Admin screenshots need Dave to sign in. Never create accounts or change Clerk settings. Never trigger a write to capture a state (no saves, no status actions, no confirm buttons).

## Where things are

- [AUDIT.md](./AUDIT.md): every generic pattern with file and line references, the checklist status, known bugs found along the way, and the Content reality section that designs must fit.
- [before/](./before/): screenshots of the current site, named `<route>-<state>-<width>-<theme>.png`.
- [reference/](./reference/): mood references (archaeological-greece).
