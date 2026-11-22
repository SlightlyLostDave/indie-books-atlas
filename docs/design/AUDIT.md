# Design audit: Indie Books Atlas (Phase 1, read-only)

Captured 21 Nov 2026 on branch `about-page` at `ce9b86a`, against the local dev server, with read-only Supabase queries. Guardrails for every later phase are in [BRIEF.md](./BRIEF.md).

Screenshots are in [before/](./before/), named `<route>-<state>-<width>-<theme>.png` (1440x900 and 390x844, `dark` and `light`). References below use the short name, for example `home-national-1440-dark`. The small round "N" in the lower left of each screenshot is the Next.js dev indicator, not part of the site.

How to read an entry: **pattern**, then where it lives, the screenshot that shows it, and why it reads as generic or default. Entries tagged **[bug]** are defects found along the way. They're listed so later phases don't design around broken behaviour, not because this pass should fix them.

---

## Top 12 by impact

1. **Light mode ships a dark map** [bug]. Both maps render `dark-v11` under light chrome on first load (F-MAP-4). Every light screenshot with a map shows it.
2. **The frame is a SaaS dashboard**, with a header bar, a boxed map, a right sidebar and a footer bar. The map gets 749 of 900px at desktop, and the footer is pushed below the fold (F-FRAME-1).
3. **Stock Mapbox on a globe**, with US and European places labelled as prominently as Canadian ones and the globe's black space showing at national zoom (F-MAP-1, F-MAP-2).
4. **Mapbox-example clusters** at radius 50 stay clustered to zoom 13, so 61% of mapped stores read as two bubbles (286 and 238) over the Windsor to Quebec City corridor (F-MAP-3).
5. **The sidebar contradicts its own data** [bug]. "Not yet available" rows sit over address, phone and website that are already in the loaded GeoJSON, and the description fallback always shows because `short_description` isn't in the payload (F-SIDE-2).
6. **The browse panel is a disabled mock-up.** Search, province, open now and specialties are `disabled` at 30% opacity under a "Coming soon" pill, with chip contrast of 1.45:1 in dark and 1.25:1 in light (F-BROWSE-1). On mobile the panel doesn't exist (F-BROWSE-4).
7. **Mono uppercase `tracking-widest` is the default voice** across 42 usages in 20 files: labels, links, buttons, footers, eyebrows and the freshness line (F-TYPE-1).
8. **Amber is spent everywhere.** Twenty-one amber text links, the store count, markers and the close button all use it, against the brand guide's "spend the amber in one place per layout" and "moss for links". In light mode amber text is 3.71:1, below AA for the 12px mono links (F-COLOR-1).
9. **The same three components repeat on every route**: a rounded-full moss pill, a `rounded-md border bg-bg-raised` box, and a mono caps label or link (F-REPEAT-1).
10. **Untouched shadcn base-nova** tokens and primitives: `--radius: 0.625rem`, `ring-3 ring-ring/50`, `rounded-4xl` badges, lucide icons and dialog backdrop blur (F-FOUND-1 to F-FOUND-4).
11. **The admin is stock**: a mono-caps top nav, a six-tile metric grid, a TanStack table with coloured badges, red text below 40, "Coming soon" pages, and a stock Clerk sign-in (admin sections below).
12. **Sign-in never shows the styled page.** `/admin/sign-in` redirects to Clerk's hosted portal, so the `appearance` config in the repo is never seen (F-CLERK-1).

---

## Checklist status

The status column uses these meanings. **Verified** means seen in code and screenshots. **Partly** means confirmed with a nuance. **Code only** means it couldn't be captured, and the reason is given.

| Item | Status | Entry |
|---|---|---|
| Default shadcn radius, ring, shadow tokens | Verified | F-FOUND-1 |
| `rounded-full` everywhere | Verified | F-SHAPE-1 |
| Mono uppercase `tracking-widest` overuse | Verified | F-TYPE-1 |
| Lucide icons, untouched shadcn primitives | Verified | F-FOUND-2, F-FOUND-3 |
| Header/map/sidebar/footer frame | Verified | F-FRAME-1 |
| Stock Mapbox style and globe projection | Verified (`getProjection()` returns `globe`) | F-MAP-1, F-MAP-2 |
| Stock circle markers and clusters | Verified | F-MAP-3, F-MAP-5 |
| "Coming soon" pills and pages | Verified | F-COPY-1 |
| Low-contrast inactive states | Verified, with ratios | F-BROWSE-1 |
| Generic empty, loading, error states | Verified (loading and public error: code only) | F-STATE-* |
| Uniform spacing, no hierarchy | Verified | F-SPACE-1 |
| Patterns repeated across routes | Verified | F-REPEAT-1 |
| Status-dot freshness line | Verified | F-FRESH-1 |
| Store page mini map | Verified, plus the light-mode bug | F-STORE-6 |
| Admin top nav bar | Verified | F-ADMIN-1 |
| Metric tile grid dashboard | Verified | F-ADMIN-2 |
| Stock data table | Verified | F-ADMIN-3 |
| Coloured status badges | Verified | F-ADMIN-4 |
| Quality score only as red text below 40 | Verified | F-ADMIN-5 |
| Stock Clerk UserButton and sign-in | Verified (sign-in is the hosted portal) | F-CLERK-* |
| Default sonner toasts and alert dialogs | Dialogs: see admin. Toast: code only (no writes) | F-ADMIN-8, F-TOAST-1 |
| Frame wastes map height | Verified | F-FRAME-1 |
| US places labelled as prominently as Canadian | Verified | F-MAP-2 |
| Filter chips look disabled | Verified (they are disabled) | F-BROWSE-1 |
| Close button is a ✕ in a pill | Verified | F-SIDE-3 |
| Clusters pile up over the corridor | Verified (519 of 852 mapped stores) | F-MAP-3 |
| Selected store only a white ring | Verified (larger dot plus `#ece4d6` ring) | F-MAP-5 |
| Sidebar detail floats with dead space | Verified | F-SIDE-1 |
| Sidebar stub rows disagree with the store page | Verified, and worse than noted | F-SIDE-2 |
| Store, about and submit reuse the same patterns | Verified | F-REPEAT-1 |
| Freshness line uses a generic status dot | Verified | F-FRESH-1 |
| Admin dashboard is the six-tile grid | Verified | F-ADMIN-2 |
| Three admin sections are "Coming soon" | Verified | F-ADMIN-9 |
| "Filters applied" screenshot | **Not capturable**: no filter works yet | F-BROWSE-1 |
| Permanently closed store page | **Not capturable**: zero closed stores exist. Treatment audited from code | F-STORE-3 |
| Toast | **Not captured**: needs a write. Audited from code | F-TOAST-1 |

---

## 1. Foundations

**F-FOUND-1. shadcn default radius, ring and shadow tokens.**
Where: [globals.css:45](../../app/globals.css#L45) sets `--radius: 0.625rem`, the shadcn base value. [globals.css:118-124](../../app/globals.css#L118-L124) is the stock radius scale from sm to 4xl. [globals.css:44](../../app/globals.css#L44) is `--ring`, and [globals.css:166](../../app/globals.css#L166) applies `outline-ring/50` to everything. The style is `base-nova` ([components.json:3](../../components.json#L3)).
Why generic: 10px corners plus a soft 3px translucent focus halo (`ring-3 ring-ring/50` in every primitive) is the default look of every shadcn app. Nothing about the radius or focus treatment says atlas, print or bookshop. Colours were bridged onto the palette ([globals.css:23-53](../../app/globals.css#L23-L53)), but shape, focus and elevation were not.

**F-FOUND-2. Untouched shadcn primitives.**
Where: every file in `components/ui/` is the base-nova output. Examples are [button.tsx:7](../../components/ui/button.tsx#L7) (`rounded-lg`, `ring-3`, `active:translate-y-px`, `disabled:opacity-50`), [badge.tsx:8](../../components/ui/badge.tsx#L8) (`rounded-4xl`), [input.tsx:12](../../components/ui/input.tsx#L12), [select.tsx:44](../../components/ui/select.tsx#L44), [switch.tsx:19](../../components/ui/switch.tsx#L19) and [table.tsx:59-61](../../components/ui/table.tsx#L59-L61).
Why generic: the press-nudge, the 50% disabled fade, pill badges and `hover:bg-muted/50` rows are shadcn signatures. The destructive button ([button.tsx:19](../../components/ui/button.tsx#L19)) is a 10% tint of danger, which reads as soft and pinkish rather than serious.
Unused primitives: `dialog`, `dropdown-menu` (no imports outside `components/ui/`). `label` and `separator` are only used inside `field.tsx`.

**F-FOUND-3. Lucide icons.**
Where: [components.json:13](../../components.json#L13), [sonner.tsx:5](../../components/ui/sonner.tsx#L5) (CircleCheck, Info, TriangleAlert, OctagonX, Loader2), [select.tsx:7](../../components/ui/select.tsx#L7), [checkbox.tsx:6](../../components/ui/checkbox.tsx#L6), [dialog.tsx:8](../../components/ui/dialog.tsx#L8) and [dropdown-menu.tsx:7](../../components/ui/dropdown-menu.tsx#L7). App code uses no icons at all; it uses text glyphs instead (`←`, `→`, `↗`, `✕`).
Why generic: lucide's toast icons are recognisably "sonner default". The app's own glyph arrows are a sensible instinct, but they're always paired with mono caps, so they read as a developer-portfolio pattern, not an atlas.

**F-FOUND-4. Gradients and blur against flat rendering.**
Where: the `body` radial gradient ([globals.css:127-136](../../app/globals.css#L127-L136)), the loading bar's `linear-gradient` sweep ([globals.css:156-162](../../app/globals.css#L156-L162)), and the `supports-backdrop-filter:backdrop-blur-xs` dialog overlays ([dialog.tsx:34](../../components/ui/dialog.tsx#L34), [alert-dialog.tsx:33](../../components/ui/alert-dialog.tsx#L33)). Dialogs also `zoom-in-95` ([alert-dialog.tsx:55](../../components/ui/alert-dialog.tsx#L55)).
Why generic: a moss glow at the top of every page and blurred modal backdrops are the "AI landing page" defaults. Both break BRIEF 2.4. The glow is visible behind the header in every light screenshot (`store-rich-1440-light`).

**F-FONT-1. A fourth font family (Cinzel), now retired by BRIEF 2.3.**
Where: loaded in [layout.tsx:2](../../app/layout.tsx#L2) and [layout.tsx:27-31](../../app/layout.tsx#L27-L31), mapped to `--font-eyebrow` at [globals.css:90](../../app/globals.css#L90). Used at [stores/[slug]/page.tsx:120](../../app/stores/[slug]/page.tsx#L120) (place eyebrow), [about/page.tsx:83](../../app/about/page.tsx#L83), [submit/page.tsx:60](../../app/submit/page.tsx#L60), [loading.tsx:5](../../app/loading.tsx#L5) and [AdminNav.tsx:25](../../components/admin/AdminNav.tsx#L25).
Why it matters: CLAUDE.md names three families. Cinzel comes from Dave's personal brand guide ("Label · Eyebrow"), not the atlas spec. It's an extra network font for five eyebrows, and the eyebrow-over-H1 pattern it serves is itself a template move.

**F-TYPE-1. Mono uppercase tracked caps as the default voice.**
Where: 42 `tracking-widest` usages in 20 files, and 43 lines combining `font-mono` with `uppercase`. The heaviest are [BrowseSidebar.tsx](../../components/map/BrowseSidebar.tsx) (7), [Footer.tsx](../../components/layout/Footer.tsx) (5, every link), [about/page.tsx](../../app/about/page.tsx) (5), [StoreSidebar.tsx](../../components/store/StoreSidebar.tsx) (3), [stores/[slug]/page.tsx](../../app/stores/[slug]/page.tsx) (3, including `monoLinkClass` at line 70, reused for every link) and [not-found.tsx](../../app/stores/[slug]/not-found.tsx) (3). The tagline under the H1 is mono caps too ([page.tsx:20](../../app/page.tsx#L20)).
Why generic: when the site title tagline, field labels, links, buttons, the theme toggle, footer credits and status lines all share one treatment, it stops marking anything. "Mono caps on every label" is the most recognisable AI-built-site tell. CLAUDE.md assigns Plex Mono to "labels/metadata", which is a narrower role than everything that isn't a heading or a paragraph.

**F-COLOR-1. Amber overspent, and below AA in light mode.**
Where: 21 `text-amber` usages outside `components/ui`, covering every link class ([stores/[slug]/page.tsx:69-70](../../app/stores/[slug]/page.tsx#L69-L70), [about/page.tsx:30-31](../../app/about/page.tsx#L30-L31)), the store count ([BrowseSidebar.tsx:53](../../components/map/BrowseSidebar.tsx#L53)), every footer link and the close ✕ ([StoreSidebar.tsx:58](../../components/store/StoreSidebar.tsx#L58)). Unclustered markers are amber too ([StoreMap.tsx:99](../../components/map/StoreMap.tsx#L99)).
Why it matters: the brand guide says "Spend the amber in one place per layout", "Use moss for structure, links", and "Amber … a highlight only". With 10 or more amber items per view, nothing is highlighted. Light-mode amber `#a9701f` on `#f6f1e7` is **3.71:1**, below the 4.5:1 AA threshold for the 12px mono links that use it.
Other measured pairs (WCAG):

| Pair | Dark | Light |
|---|---|---|
| `ink-faint` on `bg-raised` (all small labels such as ADDRESS, HOURS) | 3.55 | 3.88 |
| `moss` on `moss-deep/40` specialty pill | 3.68 | **2.73** |
| Disabled filter chip (opacity 30%) | **1.45** | **1.25** |
| Disabled filter label (opacity 30%) | **1.37** | **1.41** |
| `ink-dim` on `bg-raised` | 6.96 | 7.45 |

**F-SHAPE-1. `rounded-full` as the only shape.**
Where: specialty pills ([stores/[slug]/page.tsx:135](../../app/stores/[slug]/page.tsx#L135), [StoreSidebar.tsx:73](../../components/store/StoreSidebar.tsx#L73), [BrowseSidebar.tsx:110](../../components/map/BrowseSidebar.tsx#L110)), the Coming soon pill ([BrowseSidebar.tsx:119](../../components/map/BrowseSidebar.tsx#L119)), the close button ([StoreSidebar.tsx:58](../../components/store/StoreSidebar.tsx#L58)), the fake toggle ([BrowseSidebar.tsx:100-102](../../components/map/BrowseSidebar.tsx#L100-L102)), the freshness dot ([DataFreshness.tsx:24](../../components/layout/DataFreshness.tsx#L24)), the mini-map DOM marker ([StoreLocationMap.tsx:41](../../components/store/StoreLocationMap.tsx#L41)), and the Switch ([switch.tsx:19](../../components/ui/switch.tsx#L19), [switch.tsx:26](../../components/ui/switch.tsx#L26)). Everything else is `rounded-md` or `rounded-lg`.
Why generic: with pills for tags and soft rectangles for everything else, there are no rules, ticks, insets or square corners, none of the vocabulary of printed maps or catalogue cards.

**F-SPACE-1. Uniform spacing with no hierarchy.**
Where: sections are separated by the same `mt-6 border-t border-line pt-6` ([BrowseSidebar.tsx:57](../../components/map/BrowseSidebar.tsx#L57), [BrowseSidebar.tsx:125](../../components/map/BrowseSidebar.tsx#L125)). Detail rows all use `py-4` ([stores/[slug]/page.tsx:60](../../app/stores/[slug]/page.tsx#L60)). /about uses `gap-16` between every section ([about/page.tsx:109](../../app/about/page.tsx#L109)). Body text sizes jump between `text-sm`, `text-xs` and `text-lg` with no scale.
Why generic: every block sits at the same distance from its neighbours, so intro copy, controls and footnotes carry equal weight. The browse panel's Under the hood paragraph is `text-xs text-ink-faint` ([BrowseSidebar.tsx:129](../../components/map/BrowseSidebar.tsx#L129)), which demotes Dave's best copy to fine print.

---

## 2. Public: the map home (`/`)

**F-FRAME-1. Header, boxed map, sidebar, footer.**
Where: [page.tsx:14-35](../../app/page.tsx#L14-L35) stacks a header bar (title, mono tagline, theme toggle), then `MapExplorer` boxed in `rounded-md border` ([MapExplorer.tsx:19](../../components/map/MapExplorer.tsx#L19)), then a fixed 380px sidebar, then `Footer` with `min-h-screen`.
Seen: `home-national-1440-dark`. The map is 1059x749 of a 1440x900 viewport. The footer sits below the fold, so the page scrolls even though the map is the whole product. At 390 (`home-national-390-light`) the header takes about 110px and the footer pokes into view under the map.
Why generic: this is the admin-dashboard skeleton applied to a map. The plan doc says "The map is the product". An atlas plate carries its title block and credits inside the frame.

**F-MAP-1. Stock Mapbox styles.**
Where: [lib/map.ts:1-5](../../lib/map.ts#L1-L5) uses `dark-v11` and `light-v11`, with the TODO still in place. Cluster count labels use DIN Offc Pro ([StoreMap.tsx:85](../../components/map/StoreMap.tsx#L85)), the Mapbox sample font.
Why generic: `dark-v11` is the most recognisable basemap on the web. Its neutral grey ignores the warm ink and moss palette entirely, so the map reads as a different product from the chrome around it.

**F-MAP-2. Globe projection, and labels that aren't about Canada.**
Where: the map is created with no `projection` ([StoreMap.tsx:46-51](../../components/map/StoreMap.tsx#L46-L51)), so Mapbox v3 defaults to `globe`. This was confirmed at runtime: `map.getProjection().name === "globe"` at z3 and z15. Centre `[-96, 56]`, zoom 3.
Seen: `home-national-1440-dark` shows black space-void corners, Europe (Denmark, Germany, United Kingdom) labelled, and Montana, Chicago, California and Texas labelled as strongly as Saskatchewan and Ontario. In `home-southern-ontario-1440-light`, New York State labels (Rochester, Syracuse, NEW YORK) are as prominent as Ontario's. At 390 (`home-national-390-light`) the default view crops BC and the Atlantic provinces out of frame.
Why generic: it's a world map that happens to have Canadian dots on it, rather than a map of Canada.

**F-MAP-3. Mapbox-example clusters.**
Where: [StoreMap.tsx:56-63](../../components/map/StoreMap.tsx#L56-L63) sets `clusterRadius: 50` and `clusterMaxZoom: 13`. [StoreMap.tsx:65-76](../../components/map/StoreMap.tsx#L65-L76) uses step radii 16/22/28 and a 2px ink stroke, which is the Mapbox "Create and style clusters" example almost verbatim. The colours are hardcoded hexes.
Seen: `home-national-1440-dark` shows 286 and 238 bubbles overlapping over the corridor. `home-southern-ontario-1440-light` shows a 104 bubble over Toronto. `home-city-toronto-1440-dark` shows a 27 cluster still downtown at z11.5. The plan doc wants clusters to dissolve "past about zoom 10".
Data: 519 of 852 mapped stores (61%) are in the Windsor to Quebec City corridor and 117 (14%) are in Metro Vancouver and Victoria, so at national zoom three bubbles stand for three quarters of the atlas. See Content reality.

**F-MAP-4. Light mode loads the dark basemap** [bug].
Where: `initialThemeRef = useRef(theme)` ([StoreMap.tsx:34](../../components/map/StoreMap.tsx#L34)) captures the hydration-time value from `useSyncExternalStore`, whose server snapshot is always `'dark'` ([useTheme.ts:9-11](../../lib/useTheme.ts#L9-L11)). The map is created with `dark-v11`. When the client snapshot flips to `light`, the theme effect returns early because `!map.isStyleLoaded()` ([StoreMap.tsx:174-178](../../components/map/StoreMap.tsx#L174-L178)), and it never retries. [StoreLocationMap.tsx:20](../../components/store/StoreLocationMap.tsx#L20) and [StoreLocationMap.tsx:53-57](../../components/store/StoreLocationMap.tsx#L53-L57) have the same pattern.
Seen: every `*-light` screenshot with a map, for example `home-national-1440-light` and `store-rich-1440-light`. Toggling the theme after load does switch styles.
Design consequence: no light-theme map has been seen by anyone yet. Phase 6 work on per-theme map styling can't be judged until this is fixed.

**F-MAP-5. Stock circle markers, with selection as a ring.**
Where: unclustered points are 6px amber circles with a 1.5px ink stroke ([StoreMap.tsx:93-119](../../components/map/StoreMap.tsx#L93-L119)). Selected is radius 10 with a 2.5px `#ece4d6` stroke ([StoreMap.tsx:100-117](../../components/map/StoreMap.tsx#L100-L117)). There's no hover state, only a cursor change. Paint is hardcoded dark-theme hexes, so the light theme uses dark-theme amber and an ink stroke.
Seen: `home-selected-rich-1440-dark`, centre of the map. The selected pin is a bigger copy of every other pin with a cream ring. On mobile (`home-selected-rich-390-light`) the selected pin sits on the top edge of the 70vh sheet. The map doesn't pad for the sheet, so a pin tapped in the lower half is hidden under it.
Why generic: plain circles are the Mapbox default. The plan doc calls for "a small open book or bookmark glyph … crisp at 16 to 24px. This is where the map stops looking generic."
Also seen: L'Euguélionne exists twice at the same coordinate (`l-euguelionne-montreal-qc` and a record named "Librairie féministe l'Euguélionne"), and a real click picked the second. Coincident points have no treatment. See Content reality, duplicates.

**F-BROWSE-1. The browse panel's controls are a disabled mock-up.**
Where: [BrowseSidebar.tsx:57-123](../../components/map/BrowseSidebar.tsx#L57-L123). Search, province `<select>`, open-now fake toggle and specialty chips are all `disabled` inside `pointer-events-none select-none opacity-30` ([BrowseSidebar.tsx:58](../../components/map/BrowseSidebar.tsx#L58)), under an absolutely positioned "Coming soon" pill ([BrowseSidebar.tsx:118-122](../../components/map/BrowseSidebar.tsx#L118-L122)).
Seen: `home-browse-panel-1440-dark` and `-light`. Chip contrast is 1.45:1 (dark) and 1.25:1 (light), and label contrast is 1.37:1 and 1.41:1. The "filters applied" state can't be captured because no filter is wired.
Why generic: a ghosted form under a "Coming soon" pill is a wireframe placeholder. It takes about 300px of the panel's best real estate to say nothing works yet.
Data drift: `PROVINCES` ([BrowseSidebar.tsx:5-19](../../components/map/BrowseSidebar.tsx#L5-L19)) duplicates `lib/format.ts`. `SPECIALTIES` ([BrowseSidebar.tsx:21-32](../../components/map/BrowseSidebar.tsx#L21-L32)) lists 10 of the 19 tags with labels that differ from [lib/specialties.ts](../../lib/specialties.ts) ("Used" vs "Used books", "Rare & antiquarian" vs "Antiquarian"). Only 8 tags are actually in use, on 84 stores (Content reality).

**F-BROWSE-2. The store count.**
Where: [BrowseSidebar.tsx:53-55](../../components/map/BrowseSidebar.tsx#L53-L55) renders "852 STORES MAPPED" in mono amber caps.
Why generic: a stat rendered as a badge-like label. It also disagrees with /about, which says "1,072 stores mapped" ([about/page.tsx:101-104](../../app/about/page.tsx#L101-L104), counting all slugs rather than features with coordinates). Same words, two numbers.

**F-BROWSE-3. The "How this works" link and Under the hood.** Mono caps amber link ([BrowseSidebar.tsx:138-143](../../components/map/BrowseSidebar.tsx#L138-L143)). The section heading is mono caps ([BrowseSidebar.tsx:126](../../components/map/BrowseSidebar.tsx#L126)). See F-TYPE-1 and F-SPACE-1.

**F-BROWSE-4. No browse panel on mobile.** It's `hidden md:block` ([BrowseSidebar.tsx:43](../../components/map/BrowseSidebar.tsx#L43)). At 390 there's no intro, no count, no Under the hood and no way to filter (`home-national-390-*`). The plan doc says "treat mobile as a first class concern" and "Collapsible on mobile".

**F-FRESH-1. The status-dot freshness line.**
Where: [DataFreshness.tsx:18-24](../../components/layout/DataFreshness.tsx#L18-L24) renders a 6px moss dot plus mono caps "STORE DATA LAST SYNCED: NOVEMBER 21, 2026". It's used in the browse panel and twice on /about ([about/page.tsx:105](../../app/about/page.tsx#L105), [about/page.tsx:261](../../app/about/page.tsx#L261)).
Why generic: the green status dot is the uptime-page "operational" idiom. At 1440x900 the line is clipped at the bottom of the browse panel (`home-national-1440-dark`), so the panel scrolls to reach it.

---

## 3. Public: sidebar store detail

**F-SIDE-1. A floating card with dead space below.**
Where: [StoreSidebar.tsx:41-48](../../components/store/StoreSidebar.tsx#L41-L48) sets desktop `md:h-full`, but the content block isn't laid out to fill it.
Seen: `home-selected-rich-1440-dark` shows a dark card ending at about 490px with a different-coloured empty column below. Because the aside's background is `bg-bg-raised` and the page background shows beneath it, it reads as a card floating in a column.
Mobile: a `fixed` bottom sheet, `max-h-[70vh]`, `rounded-t-lg` and `shadow-2xl` (`home-selected-*-390-*`). It has no handle, no peek, half or full states, and no dismiss gesture.

**F-SIDE-2. Hardcoded stubs over data that's already loaded** [bug].
Where: `StubRow` ([StoreSidebar.tsx:25-34](../../components/store/StoreSidebar.tsx#L25-L34)) renders "Not yet available" for Address, Hours, Phone and Website ([StoreSidebar.tsx:85-90](../../components/store/StoreSidebar.tsx#L85-L90)) for every store.
Worse than noted: the live `stores_geojson` payload already includes `address_line1`, `phone`, `website`, `instagram` and `hours_raw` (Content reality). The sidebar throws them away. Meanwhile [lib/types.ts:1-9](../../lib/types.ts#L1-L9) declares `short_description` on `StoreFeatureProperties`, which the payload does **not** include, so the description fallback "No description available yet." ([StoreSidebar.tsx:81-83](../../components/store/StoreSidebar.tsx#L81-L83)) shows for every store, including L'Euguélionne, which has one (`home-selected-rich-1440-dark` vs `store-rich-1440-dark`).
Hours: only `hours_raw` is in the payload, not `hours_parsed`. BRIEF 3.5 forbids parsing raw hours, so hours need either a payload change or a fetch (the Phase 4 decision).
No correction link: the plan doc says the panel should carry "a suggest a correction link". It doesn't.

**F-SIDE-3. The ✕ in a pill.** [StoreSidebar.tsx:54-61](../../components/store/StoreSidebar.tsx#L54-L61) is a `rounded-full border` button holding an amber ✕ glyph. It's the generic modal-close affordance, and it's amber (F-COLOR-1).

**F-SIDE-4. "Location unknown" in mono caps.** [StoreSidebar.tsx:64-66](../../components/store/StoreSidebar.tsx#L64-L66). This shows for the 43% of stores with no province (`home-selected-sparse-390-dark`, "32 Books"). The fallback is mono caps shouting an absence.

---

## 4. Public: store page (`/stores/[slug]`)

**F-STORE-1. The header.** A Cinzel eyebrow (place) over a Playfair H1, a lead paragraph, then pills ([stores/[slug]/page.tsx:118-142](../../app/stores/[slug]/page.tsx#L118-L142)). The eyebrow, H1, lede and tags stack is the stock "hero" template. It's handsome on L'Euguélionne (`store-rich-1440-dark`) and hollow on the 56% of stores with only a name and place (`store-sparsest-unmapped-1440-dark`).

**F-STORE-2. The details box.** `rounded-md border bg-bg-raised` holding a `dl` of mono-caps-labelled rows ([stores/[slug]/page.tsx:157-237](../../app/stores/[slug]/page.tsx#L157-L237), `DetailRow` at [stores/[slug]/page.tsx:58-67](../../app/stores/[slug]/page.tsx#L58-L67)). On a sparse store the box holds two rows and sits alone on a mostly empty page (`store-sparsest-unmapped-1440-dark`).
Address assembly gap: when only the province is known, `addressLines` ([stores/[slug]/page.tsx:83-88](../../app/stores/[slug]/page.tsx#L83-L88)) renders "ON" as the whole address, directly under an "ONTARIO" eyebrow (`store-sparsest-unmapped-1440-dark`).

**F-STORE-3. The permanently closed notice.** [stores/[slug]/page.tsx:144-155](../../app/stores/[slug]/page.tsx#L144-L155) is a `rounded-md border-danger/50 bg-danger/10` alert box with a mono caps label. It's the stock "alert" component shape. It can't be screenshotted because no store is closed (Content reality). Note that one store's raw hours are literally `closed` (`better-buy-books`), so `hours_parsed` is null and the page says "Hours not listed yet" or "Hours vary". That may be a closed store the data doesn't flag.

**F-STORE-4. The hours list.**
Where: [stores/[slug]/page.tsx:211-235](../../app/stores/[slug]/page.tsx#L211-L235), using `formatHoursRows` ([lib/hours.ts:85-101](../../lib/hours.ts#L85-L101)).
Seen: `store-rich-1440-dark` shows "Wed noon – 6:30 pm / Thu – Sat 10:30 am – 6:30 pm". Sun, Mon and Tue are silently omitted. The schema says an absent day is unknown, not closed, but the page gives no sign that days are missing, so readers will assume closed. Today isn't highlighted. `store-full-week-holiday-1440-dark` shows the Holidays row, which renders fine.
Data: L'Euguélionne's `hours_raw` lists Tuesday (`Tu, Th-Sa 10:30-18:30; We 12:00-18:30`) but `hours_parsed` has no `tu`. That's an upstream parser bug for the pipeline repo, not this one.
Copy: the fallback "Hours vary — call ahead to confirm." ([stores/[slug]/page.tsx:231](../../app/stores/[slug]/page.tsx#L231)) contains an em dash (existing copy, BRIEF 5.3). See `store-raw-hours-only-1440-dark`.

**F-STORE-5. Specialty pills.** [stores/[slug]/page.tsx:131-141](../../app/stores/[slug]/page.tsx#L131-L141). See F-REPEAT-1. In light mode the pill text is 2.73:1 (F-COLOR-1).

**F-STORE-6. The mini map.**
Where: [StoreLocationMap.tsx](../../components/store/StoreLocationMap.tsx) is a 280px interactive Mapbox map at z15 with stock style, a `NavigationControl` with +/- buttons ([StoreLocationMap.tsx:37](../../components/store/StoreLocationMap.tsx#L37)), and a DOM marker with hardcoded hexes and `shadow-md` ([StoreLocationMap.tsx:40-44](../../components/store/StoreLocationMap.tsx#L40-L44)) in a `rounded-md border` box.
Seen: `store-rich-1440-light` shows the same light-mode bug (F-MAP-4), a dark street map on a cream page. There's no scale or neighbourhood context; it's just streets and a dot. It loads all of mapbox-gl on every SSG store page. 21% of stores have no coordinates, and their page simply has no map, leaving an empty right column (`store-sparsest-unmapped-1440-dark`).
Why generic: an embedded zoomable map widget with stock controls is the default "location" block on any listing site.

**F-STORE-7. Back link, theme toggle, footnote and actions.** The header is the same mono caps "← BACK TO THE ATLAS" plus a "LIGHT MODE" text toggle as every content route ([stores/[slug]/page.tsx:109-114](../../app/stores/[slug]/page.tsx#L109-L114)). The bottom aside puts OSM attribution, "Improve this listing" and "Suggest a correction" in mono caps amber ([stores/[slug]/page.tsx:246-272](../../app/stores/[slug]/page.tsx#L246-L272)). The correction link, the most useful action on a sparse page, gets the same weight as the attribution.

---

## 5. Public: `/about`, `/submit` and not-found

**F-ABOUT-1. Cards, numbered headings and boxes.**
Where: `cardClass` ([about/page.tsx:33](../../app/about/page.tsx#L33)) is reused for the stat bar ([about/page.tsx:99-106](../../app/about/page.tsx#L99-L106)), the sources `dl` ([about/page.tsx:121](../../app/about/page.tsx#L121)) and the two help cards ([about/page.tsx:273-295](../../app/about/page.tsx#L273-L295)). The "How it flows" box has an amber border ([about/page.tsx:193](../../app/about/page.tsx#L193)). `SectionHeading` prints "01 / 05" in mono ([about/page.tsx:37-48](../../app/about/page.tsx#L37-L48)).
Seen: `about-1440-dark`. It's competent but templated: numbered sections plus bordered cards plus a two-up card grid is the standard "how it works" landing page. Sources read like a pricing table rather than a methods appendix.
Content: "Only verified stores appear on the map" ([about/page.tsx:238](../../app/about/page.tsx#L238)) is not currently true. Zero stores are verified and all 1,072 are publicly readable (Content reality). That's a data and RLS issue, not a design one, but the page makes the claim.

**F-SUBMIT-1. A form in a card.**
Where: [submit/page.tsx:79](../../app/submit/page.tsx#L79) is a `rounded-md border` card around shadcn `Field`, `Input` and `Textarea`. A native `<select>` uses a hand-copied class string ([submit/page.tsx:41-42](../../app/submit/page.tsx#L41-L42), [submit/page.tsx:100-109](../../app/submit/page.tsx#L100-L109)). A disabled moss `Button` sits next to "SUBMISSIONS OPEN SOON" in mono caps ([submit/page.tsx:139-144](../../app/submit/page.tsx#L139-L144)).
Seen: `submit-1440-light`, `submit-prefilled-1440-dark`. The native select's OS chevron next to shadcn inputs is a visible mismatch. The disabled button reads as a faded pill. The prefilled store appears as a read-only text input, the least informative way to show "you're correcting this store".

**F-NOTFOUND-1. The store not-found page.** [not-found.tsx:7-30](../../app/stores/[slug]/not-found.tsx#L7-L30) is a mono "404 · NOT IN THE ATLAS" eyebrow over a Playfair H1 and two mono amber links, vertically centred. It has no header or theme toggle, unlike the other content routes (`store-not-found-1440-dark`). The copy is good; the layout is the centred error template. There's also no root `app/not-found.tsx`, so any other bad URL gets Next's stock white "404 | This page could not be found", which ignores the theme.

---

## 6. States

**F-STATE-1. Loading.** [app/loading.tsx](../../app/loading.tsx) is centred: Cinzel wordmark, then a gradient sweep bar, then mono caps "LOADING THE ATLAS…". It's the centred-spinner template, with a gradient (BRIEF 2.4). Code only; it's too brief to capture reliably.

**F-STATE-2. Public error.** [app/error.tsx](../../app/error.tsx) is centred: Playfair line, the raw `error.message` in mono ([error.tsx:13](../../app/error.tsx#L13)), and a bordered "TRY AGAIN" button. It's the centred icon-less error template, and it leaks internal error text. Code only; there's no safe trigger.

**F-STATE-3. A failed load looks like an empty atlas** [bug, data]. `getStoresGeoJSON` returns an empty collection on any error ([lib/stores.ts:16-25](../../lib/stores.ts#L16-L25)), so the map renders empty and the panel says "0 stores mapped". The admin deliberately does the opposite ([lib/admin/stores.ts:19-24](../../lib/admin/stores.ts#L19-L24)).

**F-STATE-4. No map without a token.** [StoreLocationMap.tsx:59-67](../../components/store/StoreLocationMap.tsx#L59-L67) shows a grey box saying "MAP UNAVAILABLE" in mono caps. `StoreMap` only logs to the console ([StoreMap.tsx:40-43](../../components/map/StoreMap.tsx#L40-L43)), leaving a blank map area.

---

## 7. Patterns repeated across routes

**F-REPEAT-1. Three components make up every page.**

| Pattern | Home panel | Sidebar | Store page | About | Submit | Not-found | Admin |
|---|---|---|---|---|---|---|---|
| `rounded-full bg-moss-deep/40` mono caps pill | [110](../../components/map/BrowseSidebar.tsx#L110) | [73](../../components/store/StoreSidebar.tsx#L73) | [135](../../app/stores/[slug]/page.tsx#L135) | | | | Badge |
| `rounded-md/lg border bg-bg-raised` box | inputs | | [147](../../app/stores/[slug]/page.tsx#L147), [160](../../app/stores/[slug]/page.tsx#L160), map [72](../../components/store/StoreLocationMap.tsx#L72) | [33](../../app/about/page.tsx#L33), [193](../../app/about/page.tsx#L193) | [79](../../app/submit/page.tsx#L79) | | tiles, table, actions, error |
| Mono caps `tracking-widest` label or link | 7 | 3 | 3 | 5 | 2 | 3 | 7 |
| "← BACK TO THE ATLAS" plus text theme toggle header | | | [109](../../app/stores/[slug]/page.tsx#L109) | [73](../../app/about/page.tsx#L73) | [49](../../app/submit/page.tsx#L49) | (missing) | |
| Footer of mono caps amber links | [page.tsx:34](../../app/page.tsx#L34) | | [276](../../app/stores/[slug]/page.tsx#L276) | [330](../../app/about/page.tsx#L330) | [150](../../app/submit/page.tsx#L150) | [31](../../app/stores/[slug]/not-found.tsx#L31) | |

Why generic: when one pill, one box and one label style do every job, each route looks like the same template filled with different text. Nothing marks the store page as the atlas's signature page, /about as its methods, or /submit as a correction slip.

**F-FOOTER-1.** [Footer.tsx:7-43](../../components/layout/Footer.tsx#L7-L43) is a copyright plus four mono caps amber links, with "Github" mis-cased ([Footer.tsx:31](../../components/layout/Footer.tsx#L31)). It's identical on every public route, and on the home page it pushes below the map (F-FRAME-1).

**F-TOGGLE-1.** [ThemeToggle.tsx:9-17](../../components/layout/ThemeToggle.tsx#L9-L17) is a mono caps text button reading "LIGHT MODE" or "DARK MODE". At 390 it wraps to two lines (`home-national-390-light`).

**F-COPY-1. "Coming soon" and "soon".** Browse panel pill ([BrowseSidebar.tsx:120](../../components/map/BrowseSidebar.tsx#L120)), aria-label "(coming soon)" ([BrowseSidebar.tsx:99](../../components/map/BrowseSidebar.tsx#L99)), "SUBMISSIONS OPEN SOON" ([submit/page.tsx:143](../../app/submit/page.tsx#L143)), "ALQ · coming" ([about/page.tsx:135](../../app/about/page.tsx#L135)), and the three admin pages (F-ADMIN-9).

---

## 8. Admin (`/admin`)

Captured signed in, read-only. Server-action requests were blocked at the network layer during capture; none were attempted. Dialogs were opened and cancelled. The validation state was produced by client-side zod, which never sends a request.

**F-ADMIN-1. A top nav bar of mono caps links.**
Where: [AdminNav.tsx:20-55](../../components/admin/AdminNav.tsx#L20-L55). The brand line is Cinzel caps amber ([AdminNav.tsx:25](../../components/admin/AdminNav.tsx#L25)). The links are mono caps, and the active one differs only by colour, moss vs `ink-dim` ([AdminNav.tsx:41-45](../../components/admin/AdminNav.tsx#L41-L45)). The content is centred in `max-w-6xl` ([layout.tsx:15](../../app/admin/(dashboard)/layout.tsx#L15)).
Seen: `admin-dashboard-1440-dark`. The current section is hard to spot, and in light mode the active and inactive colours are close. At 390 (`admin-stores-390-dark`) the brand wraps to five lines, the nav overflows, and Events, Users and the UserButton are off-screen.
Why generic: it's the stock SaaS top bar. Nothing marks this as the atlas's back office. A 1152px content column on a 1440 screen also wastes width that a data tool needs. The admin has no theme toggle; it inherits whatever the public site last stored.

**F-ADMIN-2. The six-tile metric grid.**
Where: `MetricTile` ([page.tsx:5-35](../../app/admin/(dashboard)/page.tsx#L5-L35)) in a 3-column grid ([page.tsx:47-79](../../app/admin/(dashboard)/page.tsx#L47-L79)). The figures are Playfair `text-3xl`, with old-style numerals that descend ("1072", "911").
Seen: `admin-dashboard-1440-dark`. Six equal tiles fill the top third. The rest of the page is empty.
Why generic: this is the default analytics dashboard. Every number gets equal weight, so "Total stores 1072" (context) is as loud as "Needs review 250" (work to do). The real figures make it worse. "Quality score < 40: 770" is 72% of the catalogue, so it reads as an alarm when it's the normal state of the data. "Pending submissions 0" links to a "Coming soon" page.
The "approximate" caveat uses a stock `Badge variant="secondary"` ([page.tsx:23-25](../../app/admin/(dashboard)/page.tsx#L23-L25)) that renders as a tiny dark pill.
Two definitions of sync: "Last pipeline sync" is the latest non-manual `updated_at` ([lib/admin/dashboard.ts:60-68](../../lib/admin/dashboard.ts#L60-L68)), shown via `toLocaleDateString()` as "2026-11-21" ([page.tsx:72-76](../../app/admin/(dashboard)/page.tsx#L72-L76)). The public freshness line uses the GitHub Actions run and "November 21, 2026" format. The same idea has two sources and two formats.

**F-ADMIN-3. The stock data table.**
Where: [StoresTable.tsx](../../components/admin/StoresTable.tsx) is TanStack plus the shadcn `Table`. Headers are mono caps with text arrows (" ↑", " ↓") on click ([StoresTable.tsx:113-119](../../components/admin/StoresTable.tsx#L113-L119)). It sits in a `rounded-lg border` wrapper ([StoresTable.tsx:107](../../components/admin/StoresTable.tsx#L107)) with `hover:bg-muted/50` rows ([table.tsx:59-61](../../components/ui/table.tsx#L59-L61)).
Seen: `admin-stores-1440-dark`, `admin-stores-low-quality-1440-light`. All 1,072 rows render in one page with no row count shown and no sticky header, so scrolling loses the columns. Sortable columns aren't marked until clicked. Missing city shows "—". Source shows raw ids in mono (`osm`, `ciba`, `wikidata`). Duplicate records sit next to each other ("770 rue Saint-Jean" ×2, "A Novel Spot" ×2) with nothing to tell them apart. At 390 only the Name column is visible, with a horizontal scrollbar.
Why generic: it's the shadcn data-table example with nothing added for triage.

**F-ADMIN-4. Coloured status badges.**
Where: [StoresTable.tsx:61-73](../../components/admin/StoresTable.tsx#L61-L73) shows Verified, Needs review and Closed as `bg-<colour>/15 text-<colour>` rounded-4xl Badges.
Why generic: the status is distinguished by hue alone (moss, amber, danger), in pill shape. Today only "Needs review" ever appears, because nothing is verified or closed.

**F-ADMIN-5. Quality as red text below 40.**
Where: [StoresTable.tsx:49-56](../../components/admin/StoresTable.tsx#L49-L56).
Seen: `admin-stores-low-quality-1440-light`, a column of red 0s and 20s. Since 72% of stores are below 40, red is the norm, so it carries no signal. The number alone doesn't say which of the six components are missing.

**F-ADMIN-6. The filter bar hides active filters.**
Where: [StoresFilterBar.tsx:32-66](../../components/admin/StoresFilterBar.tsx#L32-L66) has a search input and two shadcn Selects. The page accepts `province`, `specialty` and `maxQualityScore` ([stores/page.tsx:8-15](../../app/admin/(dashboard)/stores/page.tsx#L8-L15)), but the bar has no controls for them.
Seen: `admin-stores-low-quality-1440-light`, opened from the dashboard's "Quality score < 40" tile. The list is filtered, but the bar shows "all / all", so the filter is invisible and can't be cleared from the UI. Both Selects display the raw value `all` instead of their labels ("All stores", "All").
Search pushes a route on every keystroke ([StoresFilterBar.tsx:34-39](../../components/admin/StoresFilterBar.tsx#L34-L39)). That's a behaviour note, out of scope for a presentation-only pass.
Empty state: "No stores match these filters." in a bordered box ([StoresTable.tsx:98-104](../../components/admin/StoresTable.tsx#L98-L104)), with no clear-filters action (`admin-stores-empty-1440-dark`). Loading: plain "Loading…" text ([stores/page.tsx:51](../../app/admin/(dashboard)/stores/page.tsx#L51)).

**F-ADMIN-7. The store edit page.**
Where: the header is H1 plus a mono caps line "/slug · quality N · source X" ([stores/[slug]/page.tsx:20-29](../../app/admin/(dashboard)/stores/[slug]/page.tsx#L20-L29)). The form ([StoreEditForm.tsx](../../components/admin/StoreEditForm.tsx)) is a single column of shadcn `Field`s.
Seen: `admin-store-edit-1440-dark`, `admin-store-edit-needs-review-1440-dark`.
- `orientation="responsive"` on six fields ([StoreEditForm.tsx:72-113](../../components/admin/StoreEditForm.tsx#L72-L113)) right-aligns inputs whose left edges land at six different x positions, so the form is ragged.
- No grouping (identity, location, contact, hours, specialties). No required or optional marking; only Name and Website validate.
- Specialties are raw slugs in mono (`genre_fiction`, `sci_fi_fantasy`) ([StoreEditForm.tsx:138-155](../../components/admin/StoreEditForm.tsx#L138-L155)), although `lib/specialties.ts` has labels.
- Hours is a raw textarea labelled "Hours (raw OSM opening_hours string)" ([StoreEditForm.tsx:122-129](../../components/admin/StoreEditForm.tsx#L122-L129)), with no view of what parsed.
- Address lines can't be seen or edited (not in `STORE_COLUMNS`). There's no map, no link to the public page, and no sign of which score components are missing.
- Validation (`admin-store-edit-validation-1440-light`): "Name is required" and "Must be a valid URL" render inline in danger text, but the invalid input shows the amber focus ring rather than a danger state.

**F-ADMIN-8. Status actions and alert dialogs.**
Where: [StoreStatusActions.tsx](../../components/admin/StoreStatusActions.tsx) is a `rounded-lg border` panel ([StoreStatusActions.tsx:45](../../components/admin/StoreStatusActions.tsx#L45)) containing a "VERIFIED" mono label with a Switch that writes immediately ([StoreStatusActions.tsx:46-60](../../components/admin/StoreStatusActions.tsx#L46-L60)), an outline "Clear needs-review flag" button, and two `variant="destructive"` buttons ([StoreStatusActions.tsx:76](../../components/admin/StoreStatusActions.tsx#L76), [StoreStatusActions.tsx:127](../../components/admin/StoreStatusActions.tsx#L127)).
Seen: `admin-store-edit-needs-review-1440-dark`. The panel stretches to the full height of the form (grid default stretch) and is mostly empty. "Mark permanently closed" and "Delete store" are identical soft-red pills side by side. "Unmark permanently closed", a restorative action, would use the same destructive style.
Dialogs (`admin-dialog-delete-1440-light`, `admin-dialog-closed-1440-dark`): the stock shadcn alert dialog, small, `rounded-xl`, on a **blurred** backdrop (F-FOUND-4). The confirm button is the default primary variant, so **"Delete" is styled as the moss primary action**, the safe-looking button. The closed dialog's confirm just says "Confirm" ([StoreStatusActions.tsx:108](../../components/admin/StoreStatusActions.tsx#L108)). The delete copy has an em dash ([StoreStatusActions.tsx:136](../../components/admin/StoreStatusActions.tsx#L136)). `setPermanentlyClosedSchema` accepts a `reason`, but the dialog offers no field for it (presentation only; no schema change implied).

**F-TOAST-1. Default sonner toasts** (code only; showing one requires a write).
Where: [sonner.tsx](../../components/ui/sonner.tsx) uses lucide status icons ([sonner.tsx:5](../../components/ui/sonner.tsx#L5)), `--border-radius: var(--radius)`, and default position and motion. Messages are generic ("Updated", [StoreStatusActions.tsx:104](../../components/admin/StoreStatusActions.tsx#L104)), and errors surface raw server text.
**[bug]**: the theme comes from `next-themes` `useTheme()` ([sonner.tsx:3](../../components/ui/sonner.tsx#L3), [sonner.tsx:8](../../components/ui/sonner.tsx#L8)), but the app never mounts a next-themes provider. It uses `lib/useTheme.ts`. So `theme` falls back to `"system"` and toasts follow the OS setting, not the admin's theme.

**F-ADMIN-9. Three bare "Coming soon" pages.**
Where: [submissions/page.tsx](../../app/admin/(dashboard)/submissions/page.tsx), [events/page.tsx](../../app/admin/(dashboard)/events/page.tsx), [users/page.tsx](../../app/admin/(dashboard)/users/page.tsx). Each is an H1 plus "Coming soon."
Seen: `admin-submissions-1440-light`. A heading over an empty page, with the public glow visible behind it. They don't say what each section will do or what it's waiting on (for Submissions, the undocumented `submissions` columns).

**F-ADMIN-10. The admin error page leaks internals** [bug].
Where: [error.tsx](../../app/admin/(dashboard)/error.tsx) is a `rounded-lg border-danger/40 bg-danger/10` box with "Something went wrong", the raw `error.message` ([error.tsx:15](../../app/admin/(dashboard)/error.tsx#L15)), and a mono caps "TRY AGAIN".
Seen: `admin-error-1440-dark`, triggered by `/admin/stores?maxQualityScore=abc`. It shows `Failed to load stores list: invalid input syntax for type smallint: "NaN"`. Any non-numeric `maxQualityScore` in the URL crashes the list, because `Number()` yields NaN ([stores/page.tsx:30](../../app/admin/(dashboard)/stores/page.tsx#L30)). That's a behaviour bug outside this pass's scope.

**F-ADMIN-11. Admin not-found drops the shell.** `/admin/stores/<unknown>` calls `notFound()`, and with no `not-found.tsx` under `app/admin` or at the root, Next renders its stock white "404 | This page could not be found" with no nav, theme or way back (`admin-store-not-found-1440-dark`).

### Clerk

**F-CLERK-1. Sign-in is Clerk's hosted portal, not the styled page** [config].
Where: `proxy.ts` protects `/admin(.*)` ([proxy.ts:3](../../proxy.ts#L3), [proxy.ts:6-8](../../proxy.ts#L6-L8)), which includes `/admin/sign-in` itself, and no `NEXT_PUBLIC_CLERK_SIGN_IN_URL` is set. Signed-out visits to `/admin` and `/admin/sign-in` both redirect to `*.accounts.dev/sign-in`. The in-app page with its `appearance` config ([sign-in page:6-17](../../app/admin/sign-in/[[...sign-in]]/page.tsx#L6-L17)) never renders.
Seen: `admin-sign-in-1440-light` and the others. It's stock Clerk: white page, purple Continue button, "Development mode", and a **"Don't have an account? Sign up"** link, while [lib/admin/auth.ts:7-9](../../lib/admin/auth.ts#L7-L9) describes the instance as invite-only. All four sign-in shots look the same, because theme doesn't reach Clerk's domain. Rechecked after Dave's Clerk settings change: still the hosted portal, now asking for email and password.
Fixing this is a Clerk or proxy configuration change (BRIEF 3.3 and 3.4): propose it, don't apply it.

**F-CLERK-2. Stock UserButton.** [AdminNav.tsx:53](../../components/admin/AdminNav.tsx#L53). `ClerkProvider` has no `appearance` ([admin/layout.tsx:8](../../app/admin/layout.tsx#L8)). Seen in `admin-userbutton-open-1440-dark`: a purple default avatar and a white popover with "Development mode", in the dark admin. Note that this screenshot shows the signed-in account's email; consider that before committing it to a public repo.

**F-CLERK-3. The in-app sign-in hardcodes dark hexes.** [sign-in page:9-14](../../app/admin/sign-in/[[...sign-in]]/page.tsx#L9-L14). If the page were reachable, light mode would show a dark card on a light page. It should map to tokens, through the appearance API (BRIEF 3.4).

---

## 9. Content reality

Every design has to fit this data. All figures come from read-only queries on 21 Nov 2026. "Public" means rows the publishable key can read (what the site shows). "All" means every non-deleted row, read with the secret key, SELECT only.

### Headline numbers

| | Count |
|---|---|
| Store rows (none soft-deleted) | **1,072** |
| Publicly readable | **1,072** (see the RLS note below) |
| On the map (have coordinates, in `stores_geojson`) | **852** (79%) |
| Verified (`is_verified = true`) | **0** |
| Needs review | 250 |
| Permanently closed | 0 |
| By source | osm 711, ciba 333, wikidata 28 |
| Submissions / events rows | 0 / 0 |
| `stores_geojson` payload | 852 features, **372 KB** uncompressed JSON, passed inline to the client as `initialData` |

**RLS note** [data, not design]: CLAUDE.md says "public read on verified stores only", and comments in `lib/stores.ts` and `lib/supabase/public.ts` assume it. With zero verified stores, the publishable key still returns all 1,072 rows. Either the policy isn't "verified only", or it isn't enabled. The /about copy promises otherwise. This needs a decision before launch and is out of scope for the design pass.

### Field coverage (public, n = 1,072)

| Field | Has value | Notes for design |
|---|---|---|
| name | 100% | Median 17 chars, max 63 ("The Celestial Boutique Metaphysical, Books and Curious Oddities"), min 1 |
| lat/lng | 79% | 220 stores have a page but no map pin and no mini map |
| province | 57% | **43% have no province**. Any province filter or index has a large "unknown" bucket |
| city | 55% | 45% have no city. Top: Toronto 61, Montréal 38, Vancouver 30, Halifax 17 |
| address_line1 | 39% | |
| postal_code | 24% | |
| address_line2 | 4% | |
| website | 31% | |
| hours_raw | 29% | |
| hours_parsed | 28% | 11 stores have raw hours that didn't parse. Of the 295 parsed: all 7 days known in 57%, Sunday known in 71%, Monday in 81%, a public-holiday row in 6% |
| phone | 28% | |
| specialties | **8%** (84 stores) | 79 have one tag. Only 8 of 19 tags are in use: used 55, comics_graphic 23, childrens 6, antiquarian 2, religion_spirit 2, feminist 1, art_design 1, travel 1 |
| instagram | 2% | |
| short_description | **1.5%** (16 stores) | Median 38 chars, max 231. Some are in French |
| is_featured | 0% true | In the GeoJSON payload, not in SUPABASE_SCHEMA.md |

### `data_quality_score` distribution (all 1,072, none verified)

| Score | Stores | Share |
|---|---|---|
| 0 | 599 | 56% |
| 10 | 5 | <1% |
| 20 | 164 | 15% |
| 30 | 2 | <1% |
| 40 | 125 | 12% |
| 50 | 5 | <1% |
| 60 | 151 | 14% |
| 70 | 21 | 2% |
| 80 to 100 | 0 | 0% |

- The score moves in steps: phone, website, hours_raw and verified are worth 20 each, description and instagram 10 each ([lib/admin/dataQuality.ts](../../lib/admin/dataQuality.ts)). The formula matches the stored score on all but 2 rows.
- With no store verified, **70 is the effective maximum**, and **72% of stores (770) are below 40**. That's the population the admin currently colours red.
- 599 stores (56%) have nothing but a name and some location: no phone, website, hours or description.

### Which fields reach which surface

| Field | Schema | `stores_geojson` (live) | `StoreFeatureProperties` type | Sidebar shows | `PublicStore` / store page | Admin list | Admin edit form |
|---|---|---|---|---|---|---|---|
| name, slug | ✓ | ✓ | ✓ | ✓ | ✓ | name (link) | name, slug read-only in header |
| city, province | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (joined) | ✓ (free text) |
| address_line1 | ✓ | ✓ | – | stub | ✓ | – | **– (not selected)** |
| address_line2, postal_code | ✓ | – | – | stub | ✓ | – | postal only |
| lat, lng | ✓ | geometry | – | map | ✓ (mini map) | – | – (loaded, not shown) |
| phone, website | ✓ | ✓ | – | **stub, though in payload** | ✓ | – | ✓ |
| instagram | ✓ | ✓ | – | – | JSON-LD only, not displayed | – | ✓ |
| short_description | ✓ | **–** | ✓ (declared, never present) | always "No description" | ✓ | – | ✓ |
| hours_raw | ✓ | ✓ | – | stub | fallback text only | – | ✓ (raw OSM string) |
| hours_parsed | ✓ | – | – | stub | ✓ (hours list) | – | – (loaded, not shown) |
| specialties | ✓ | ✓ | ✓ | ✓ pills | ✓ pills | – | ✓ checkboxes (raw slugs) |
| data_quality_score | ✓ | ✓ | ✓ | – | – | ✓ | header text |
| is_verified | ✓ | ✓ | – | – | – | badge | Switch |
| needs_review | ✓ | – | – | – | – | badge | clear button |
| is_permanently_closed | ✓ | – | – | – | notice | badge | dialog |
| is_deleted | ✓ | – | – | – | – | – (filtered out) | delete/restore |
| source | ✓ | – | – | – | – | ✓ | header text |
| osm_id, google_place_id | ✓ | – | – | – | – (OSM edit link uses lat/lng) | – | – (loaded, not shown) |
| updated_at | ✓ | – | – | – | – (sitemap only) | – | – |

### Shape of the data on the map

- 519 of 852 mapped stores (61%) fall in a Windsor to Quebec City box, and 117 (14%) in Metro Vancouver and Victoria. All 852 sit inside Canada's bounding box.
- Coincident and duplicate records exist: `770-rue-saint-jean-qc` / `-2`, `a-novel-spot-etobicoke-on` / `-2`, `larkspur-books-on` / `-2`, and two L'Euguélionne records at one point. Records the exclusion rules should catch are present (for example `acadia-university-bookstore`). These are pipeline issues, but the map and the admin table need a treatment for stacked points and lookalike rows.

### Design implications

1. **Design sparse-first.** The typical store is a name and a dot. Over half have nothing else, and fewer than a third have phone, website or hours. A fully filled record is under 2% of the atlas. Any layout that looks empty with only a name and a place fails most of the time.
2. **Descriptions are not a layout element.** At 16 stores they can't anchor the sidebar or the store page header.
3. **Specialties don't yet justify a big filter UI.** 92% of stores have none, and one tag ("used") covers two thirds of the tagged ones. The specialty control should be compact and honest about coverage.
4. **Province needs an "unknown" path** (43%). A gazetteer-style province index needs per-province counts and an "unplaced" entry, or a derivation from coordinates (a data change, so propose it first).
5. **Hours are a minority feature** (28%), usually with unknown days. An "open now" filter would match at most about 295 stores, and day-level unknowns must read as unknown.
6. **The quality score is a 0 to 70 scale in practice**, mostly 0 or 20. Show it as discrete steps or as the components present, not a continuous gauge. "Below 40" is the majority case, not an exception.
7. **Two counts exist** (852 mapped, 1,072 total). The site should say which one it's showing.
8. **The sidebar can show address, phone and website now** without any new fetch, since they're in the payload. Descriptions and parsed hours can't be shown without a payload or fetch change (Phase 4 decision).

---

## 10. Doc drift and cross-repo notes (flag only, not fixed)

Proposed CLAUDE.md amendments, for Dave's OK (none applied):

- **Plan doc link**: [CLAUDE.md:5](../../CLAUDE.md#L5) and [CLAUDE.md:55](../../CLAUDE.md#L55) link `./indie-books-atlas.html`, but the file is at `docs/indie-books-atlas.html` and is gitignored, so the link is dead for anyone cloning the repo.
- **Quality score components**: [CLAUDE.md:45](../../CLAUDE.md#L45) says "phone, website, hours, verification, photo". The formula has no photo; it uses instagram and short_description.
- **Dataset size**: [CLAUDE.md:51](../../CLAUDE.md#L51) says "~400–700 stores". The live figures are 852 mapped and 1,072 total. `docs/design-pass.md` says "about 850 verified", but none are verified.
- **RLS**: [CLAUDE.md:46](../../CLAUDE.md#L46) "public read on verified stores only" doesn't match observed behaviour (section 9).
- **Routes**: [CLAUDE.md:34](../../CLAUDE.md#L34) lists `/events`, which doesn't exist yet. There's also no root `app/not-found.tsx` (F-NOTFOUND-1, F-ADMIN-11).
- **Fonts**: no amendment needed. Cinzel is retired per BRIEF 2.3.

Pipeline repo (for information):

- L'Euguélionne's `hours_raw` "Tu, Th-Sa …" parses without Tuesday.
- `better-buy-books` has `hours_raw = "closed"`, which may be a closed store.
- Duplicate slugs (`-2` suffixes) at identical coordinates, and university bookstores present despite the exclusion rule.
- `is_featured` exists in `stores_geojson` but isn't documented in SUPABASE_SCHEMA.md.
- `data_quality_score` is a `smallint` (from the admin error text), documented as "int".

Existing em dashes in UI copy (BRIEF 5.3: leave unless a phase says otherwise):

- [stores/[slug]/page.tsx:231](../../app/stores/[slug]/page.tsx#L231) "Hours vary — call ahead to confirm."
- [StoreStatusActions.tsx:136](../../components/admin/StoreStatusActions.tsx#L136) "This is a soft delete — the store is hidden…"
- Metadata titles use " — " ([stores/[slug]/page.tsx:32-37](../../app/stores/[slug]/page.tsx#L32-L37)). These aren't on-page UI but show in browser tabs and search results.
- "—" as an empty-value placeholder ([StoresTable.tsx:42](../../components/admin/StoresTable.tsx#L42), [admin page.tsx:75](../../app/admin/(dashboard)/page.tsx#L75)).

---

## Appendix: capture notes

- 58 public and 70 admin screenshots (66 signed in, plus 4 of the hosted sign-in). Map states were driven through the StoreMap component's own map instance in dev; selection was applied only after the map was idle.
- Not captured: "filters applied" (no filter is wired), a permanently closed store page (none exist), a toast (needs a write), and the public loading and error states (no safe trigger). Each is audited from code above.
- The store not-found shot uses `/stores/this-store-does-not-exist`. Store picks: rich `l-euguelionne-montreal-qc`, full week plus holiday `book-warehouse-vancouver-bc`, raw hours only `drawn-quarterly-montreal-qc`, sparse but mapped `32-books`, sparsest `larkspur-books-on` (no coordinates, no city). Admin edit shots use `l-euguelionne-montreal-qc` and `a-novel-spot-etobicoke-on` (needs review).

---

## Reference: archaeological-greece.vercel.app (mood input only)

Captured in [reference/](./reference/) (`archaeological-greece-home-1440.png`, `-390.png`). It's a single-page app, so no detail page has its own URL.

CLAUDE.md describes it as "serif display headers, mono accents, generous whitespace". The live site is closer to an **instrument panel**. JetBrains Mono at 8 to 10px with tracking sets almost every label, button and status line, and the UI text is in snake_case (`ALL_SITES`, `SYSTEM_STATE: OPERATIONAL`, `FILTERED: 424/424`). Playfair italic appears only for the intro line and the "Select a site…" placeholder. Its corners are square, it uses hairline rules, and its top bar and bottom status bar are thin.

Worth taking (structure and mood):
- **The map is the page.** A thin top bar and a one-line status bar give nearly the full viewport to the map. Compare F-FRAME-1.
- **A flat, custom basemap where the subject country is filled and neighbours are muted**, on a dotted grid-paper ground. Compare F-MAP-1 and F-MAP-2.
- **Points coloured by category**, small and unclustered at national zoom, so the distribution reads at a glance. Compare F-MAP-3.
- **Square corners and hairline rules** instead of pills and soft boxes. Compare F-SHAPE-1.
- Plate-like marginalia: survey-area caption with coordinates, "SITE 1 OF 424", a record count.

Not worth taking:
- Its pervasive mono caps and snake_case UI text are the same pattern this audit flags as generic (F-TYPE-1), taken further. Taking its mood should not mean taking its label voice.
- The card layouts (BRIEF 1.2) and the parchment, sepia and aegean palette (CLAUDE.md).
