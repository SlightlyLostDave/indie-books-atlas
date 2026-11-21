# Supabase Schema — Indie Books Atlas

This is a **documentation-only** reference for the frontend repo. There are no SQL migration
files in the pipeline repo — the actual DDL lives in Supabase (dashboard-managed) or the
frontend project. This file is generated from the pipeline's documented data contracts
(`AGENT.md`, `CLAUDE.md`) and field usage in `pipeline/db/` and `pipeline/transforms/`.

Extensions enabled: **PostGIS**, **pg_trgm**. The pipeline uses the Supabase **service role key**
(bypasses RLS) — the frontend should use the anon key with RLS policies below.

---

## `stores`

Canonical record per bookstore location.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid/bigint (PK) | |
| `slug` | text, unique | **Immutable after insert** — never update, it's the public URL |
| `location` | `geography(Point, 4326)` | Primary spatial column |
| `lat`, `lng` | numeric | Denormalized from `location` for convenience |
| `city`, `province`, `postal_code` | text | |
| `phone`, `website`, `instagram` | text, nullable | |
| `short_description` | text, nullable | |
| `hours_raw` | text, nullable | Raw OSM `opening_hours` string, verbatim source of truth |
| `hours_parsed` | jsonb, nullable | Structured hours (shape below); `null` if unparseable |
| `specialties` | text[] | Values restricted to `specialty_tags` vocabulary (app-enforced, not DB enum) |
| `source` | text | One of: `manual, ciba, alq, google_places, osm, wikidata, community_submission` |
| `data_quality_score` | int, 0–100 | Computed on every upsert, see below |
| `is_verified` | boolean | Pipeline never clears/overwrites this on update |
| `needs_review` | boolean | One-way flag: pipeline only ever sets `true`, never clears |
| `is_permanently_closed` | boolean | **Never set by pipeline code** — human-only via manual review |
| `is_deleted` | boolean | Soft delete |
| `deleted_at` | timestamptz, nullable | |
| `osm_id` | bigint, nullable | External dedup key |
| `google_place_id` | text, nullable | External dedup key |
| `created_at`, `updated_at` | timestamptz | |

**Immutable fields once set:** `slug`, `is_permanently_closed` (enforced in
`pipeline/db/stores.py`, not a DB constraint today — consider a trigger).

### `hours_parsed` shape

```json
{
  "mo": { "open": "10:00", "close": "18:00", "closed": false },
  "tu": { "open": "10:00", "close": "18:00", "closed": false },
  "we": { "open": "10:00", "close": "18:00", "closed": false },
  "th": { "open": "10:00", "close": "18:00", "closed": false },
  "fr": { "open": "10:00", "close": "18:00", "closed": false },
  "sa": { "open": "10:00", "close": "16:00", "closed": false },
  "su": { "closed": true }
}
```

- Valid day keys: `mo tu we th fr sa su ph` (`ph` = public holiday).
- Absent key = **unknown**, not closed.
- `24/7` stores: all days `{ "open": "00:00", "close": "23:59" }`.
- `"by appointment"` or unparseable strings → `hours_parsed = null`, `hours_raw` preserved.

### `data_quality_score` computation

| Condition | Points |
|---|---|
| `phone` not null | +20 |
| `website` not null | +20 |
| `hours_raw` not null | +20 |
| `is_verified = true` | +20 |
| `short_description` not null | +10 |
| `instagram` not null | +10 |

### `specialties[]` controlled vocabulary (`specialty_tags`)

```
used, antiquarian, childrens, francophone, indigenous, lgbtq,
genre_fiction, academic, art_design, multilingual, comics_graphic,
mystery_crime, sci_fi_fantasy, travel, religion_spirit,
nature_outdoors, history, feminist, zines
```

No free-text values allowed. `specialty_tags` is managed manually (dashboard / future admin
UI) — not written to by this pipeline.

---

## `store_sources`

One row per (store, external source). Used for dedup and re-fetch targeting.

| Column | Type | Notes |
|---|---|---|
| `store_id` | FK → `stores.id` | |
| `source` | text | Same enum as `stores.source` |
| `external_id` | text | e.g. `osm_id`, `google_place_id` |
| `raw_data` | jsonb | Raw API payload as received |

Unique constraint on `(store_id, source)` — pipeline upserts with
`on_conflict="store_id,source"`.

---

## `change_log`

Immutable audit trail. Never updated or deleted — every pipeline write (insert/update/flag)
produces a row here.

| Column | Type | Notes |
|---|---|---|
| `store_id` | FK → `stores.id` | |
| `operation` | text | One of: `insert, update, flag_review` |
| `source` | text | Which job/source triggered the write |
| `diff` | jsonb | See shapes below |
| `created_at` | timestamptz | |

`diff` shapes by operation:
- `insert`: full record snapshot
- `update`: `{"field": {"from": old_value, "to": new_value}, ...}`
- `flag_review`: `{"reason": "..."}`

---

## `submissions`

Community correction queue. **Public INSERT allowed via RLS, no public SELECT.** Pipeline
never writes here — human review required before a submission can affect a store record.

---

## `events`

Book fairs and literary events.

| Column | Notes |
|---|---|
| `linked_store_id` | Nullable — book fairs aren't always store-linked |
| `is_published` | Defaults `false` until manually reviewed |

Not managed by the pipeline.

---

## `spotlights`

Bookseller spotlight content for social posts. `is_published = false` until manually
approved. Not managed by the pipeline.

---

## Source priority (highest wins on conflict)

```
manual > ciba > alq > google_places > osm > wikidata > community_submission
```

---

## Caveats for the frontend team

- This document is derived from pipeline code/docs, **not** from `information_schema` or actual
  DDL — column types marked here are best-effort inference, not guaranteed exact (e.g. `id`
  type, nullability details beyond what's explicitly enforced in pipeline code).
- No enum types, CHECK constraints, or DB-level triggers exist for the "controlled vocabulary"
  and "immutable field" rules described above — they're enforced only in this pipeline's
  application code. If the frontend also writes to `stores`, it must independently respect
  `slug`/`is_permanently_closed` immutability and the `specialty_tags` vocabulary.
- For ground truth, pull the live schema directly, e.g.:
  ```bash
  supabase db dump --schema public -f schema.sql
  ```
  or query `information_schema.columns` for exact types/nullability.
