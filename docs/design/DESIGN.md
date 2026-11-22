# Indie Books Atlas design system

Direction A, **Plate**: every screen is a page from a printed national atlas. The home page is a plate with a neatline, a title block and credits in the margin. Content pages are gazetteer entries. The admin is the compilation office, the same system at a denser setting.

This file is the contract for UI work. [BRIEF.md](./BRIEF.md) sets the guardrails, and [AUDIT.md](./AUDIT.md) lists the patterns this system replaces. The tokens live in [app/globals.css](../../app/globals.css), and the primitives in [components/ui/](../../components/ui/) implement them. The direction mock is in `directions/a-plate/` (gitignored, local only).

## Principles

1. **The map is the plate.** The map gets the viewport. Title, controls and credits live in the plate's frame and margins, never in bars stacked around it.
2. **Print, not screen.** Square corners, hairline rules, flat tone. Layers separate by a rule and a tone step, never by a shadow, glow, blur or gradient.
3. **One job per typeface.** Playfair names things and speaks in the margins. Jost is for reading and doing. Plex Mono is for figures only: counts, coordinates, grid references and dates. Sentence case everywhere. Tracked capitals are kept for political labels on the map and the imprint line.
4. **Amber once per layout.** Moss carries structure, links and primary actions. Amber marks the one thing that matters on the screen: the selected store, the located point, or the review flag.
5. **Absence reads as absence.** An unknown value is set in Playfair italic in `ink-quiet` ("Not recorded"), never as an em dash, a zero or an alarm. A sparse record should look like a short entry, not an empty layout.

## Colour

Colour hexes are locked (BRIEF 2.1). Both themes flip through `:root` and `:root.light`. The roles are:

| Token | Role |
|---|---|
| `bg` | Page and plate ground, and field wells |
| `bg-raised` | Panels, title block, popovers and dialogs (one tone step up) |
| `bg-step` | Hover, the selected row, the current nav item, `code` |
| `ink`, `ink-dim` | Text and secondary text |
| `ink-quiet` | Small text that must still be read: notes, unknowns ("Not recorded"), marginal labels, placeholders. A `color-mix()` of 40% `ink-faint` into `ink-dim` that holds 4.5:1 on every ground in both themes |
| `ink-faint` | Not for reading text: neatlines, the strong hairline, field borders and disabled text. It is 3.2 to 3.9:1, which passes 3:1 for non-text and fails 4.5:1 for text |
| `moss` | Links, primary actions, focus, checked states and the current-section rule |
| `moss-deep` | Primary hover, light theme only (`--primary-hover`). In dark, `bg` on `moss-deep` is 3.65:1, so the dark primary hover keeps the moss fill and turns its border `ink` |
| `amber` | One highlight per layout (principle 4). Never link text |
| `line`, `line-strong` | Row rules, and control borders |
| `danger` | Destructive actions, invalid fields and the closed status |
| `scrim` | Dialog backdrop: `bg` at 82%, solid, no blur |

The shadcn bridge maps `accent` to `bg-step`, not amber, so menu and list highlights don't spend the amber.

## Type

Three families, no others: **Playfair Display**, **Jost**, **IBM Plex Mono** (BRIEF 2.2). Cinzel is retired (BRIEF 2.3).

### Scale

Sizes are tokens (`text-<name>`) backed by `--fs-*` variables, so the compact density can retune them without new classes. The names are registered with `tailwind-merge` in `lib/utils.ts`, so `cn()` keeps a size and a colour together. Register any new size token there too.

| Token | Comfortable | Compact | Leading | Typical role |
|---|---|---|---|---|
| `text-label` | 11px | 11px | 1.2 | Imprint caps, grid letters, keyboard hints |
| `text-meta` | 12.5px | 12px | 1.45 | Mono metadata, field hints and notes |
| `text-ui` | 14px | 13px | 1.45 | Controls, panels, tables and nav |
| `text-body` | 16px | 14px | 1.55 | Body text and field values |
| `text-prose` | 17px | 15px | 1.65 | Long-form reading (/about) and marginal labels |
| `text-lede` | 20px | 17px | 1.5 | Ledes and the place line on an entry |
| `text-heading` | 24px | 20px | 1.2 | Section heads and dialog titles |
| `text-title` | 30px | 26px | 1.1 | Entry names, the plate title and admin page titles |
| `text-page` | 38 to 54px | 34px | 1.04 | Page H1 on content routes (fluid) |

### Roles

| Role | Family and weight | Case | Example |
|---|---|---|---|
| Titles and names | Playfair 700 | As written | Plate title, store name, page H1 |
| Section heads | Playfair 600 | Sentence | "How stores are found" |
| Marginal voice | Playfair *italic* 400 | Sentence | Running heads, the tagline, "Compilation office", unknown values, "planned" |
| Reading and UI | Jost 400, actions 500 | Sentence | Body, buttons, links, nav, field labels |
| Imprint and political labels | Jost 500, `uppercase`, +0.2em | Caps | "INDIE BOOKS ATLAS" imprint, province names on the map. This is the only tracked caps in the system |
| Figures | Plex Mono 400 | No caps, no tracking | "852", "H7", "45°30′N", "2026-11-21", keyboard hints |

Figures use `tabular-nums lining-nums` wherever they align in a column. Playfair's old-style numerals are fine in running text but not in tables or tallies.

## Spacing

A 4px base, using Tailwind's default spacing scale. Use these steps and avoid the rest: **2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80** (`0.5` to `20`).

Repeated distances are role tokens, so density can change them in one place:

| Token | Comfortable | Compact | Use |
|---|---|---|---|
| `--control-h` | 36px | 30px | Button, input and select height |
| `--control-h-sm` | 30px | 26px | Small button and small select |
| `--control-px` | 14px | 10px | Button side padding |
| `--field-px` | 10px | 8px | Input and select side padding |
| `--row-y` | 10px | 6px | Table cell and ruled-row vertical padding |
| `--gap-stack` | 12px | 8px | Between a label and its value, or related lines |
| `--gap-block` | 24px | 16px | Between fields, list groups and dialog parts |
| `--gap-section` | 64px | 32px | Between page sections |
| `--gutter` | 32px | 24px | Page side padding (18px under 768px) |

Hierarchy comes from unequal spacing. Keep more space above a heading than below it, keep related lines at `--gap-stack`, and never separate every block by the same rule and padding (AUDIT F-SPACE-1).

## Shape: radius and borders

- **Radius is 0** for every UI element: buttons, fields, switches, checkboxes, badges, menus, dialogs, toasts and avatars. All `--radius-*` tokens resolve to 0.
- **Circles are cartographic symbols only**: proportional cluster circles, the locator ring and map points. They never shape a control or a container.
- **Rules** come in five weights, each with one job:

| Rule | Spec | Job |
|---|---|---|
| Row hairline | 1px `line` | Between rows, list items and table rows |
| Field border | 1px `ink-faint` | Inputs, textareas, select triggers, checkboxes, the switch track and the Find line. The border is what identifies a field, so it needs 3:1 (WCAG 1.4.11); `line-strong` is only 1.5 to 1.7:1 |
| Control border | 1px `line-strong` | Outline buttons and segmented controls, whose words identify them |
| Neatline | 1px `ink-faint` | Plate frame, panel edges, running heads and the dialog border |
| Plate rule | 2px `ink` | Under a title block or entry header, and above a save bar |
| Double rule | 3px double `ink-faint` | Above a withdrawal (destructive) zone |

- A destructive dialog carries a 3px `danger` top rule. A confirming dialog carries the 2px plate rule.
- A dashed border means "not on the plate": an unlocated store or an unavailable placeholder. Don't use it as decoration.
- Avoid nested boxes. A section is a rule plus a heading. Only the title block, the correction slip and dialogs are boxed.

## Elevation

There are no shadows. All shadow and blur tokens are reset in `globals.css`.

- Stacking is shown by a **tone step** (`bg` to `bg-raised`) plus a **neatline**.
- Overlays (popover, menu, select list, toast) are `bg-raised` with a 1px `ink-faint` border.
- Modals sit on the solid `scrim`. No blur, no zoom.
- z-order: map 0, plate furniture 10, panel and sheet 20, popover and menu 40, dialog 50, toast 60.

## Focus and states

- **Focus**: a 2px solid `moss` outline (`--ring`), offset 2px, square. Fields draw it at an offset of -1px, so it sits on the border.
- **Hover**: borders go to `moss`, ghost surfaces to `bg-step`, and links thicken their underline. There's no colour fade on text.
- **Disabled**: `ink-faint` text and a `line-strong` border on a transparent ground (WCAG exempts inactive controls from the text minimum; `ink-faint` is what marks them as inactive). Never fade by opacity: a 50% fade drops below readable contrast (AUDIT F-BROWSE-1).
- **Invalid**: a `danger` border, a `danger` focus outline and a `text-meta` message in `danger` under the field.
- **Current** (nav, selected row): a 2px `moss` rule on the leading edge plus `bg-step`, and `font-medium`. Never colour alone.
- **Links**: `moss` text with a 1px underline in `line-strong`, offset 3px. Hovering turns the underline `currentColor`. Never amber, never mono caps.
- **Navigation links** (running heads, breadcrumbs, credits, the admin rail) are quieter: `ink-dim`, no underline, `moss` on hover. The current page is `ink` with `aria-current`.

## Iconography

- **Custom inline SVG**, drawn like map symbols: a 16px grid, 1.5px `currentColor` stroke, square caps, mitre joins, and no fills except where a mark is solid.
- Every icon lives in [components/ui/icons.tsx](../../components/ui/icons.tsx) and is decorative (`aria-hidden`). The control carries the label.
- **Identity icons** belong to the atlas: the open-book glyph (a store), the plate mark (the map, used as the way back) and the status marks (✓ verified, ■ review, × closed, · unverified).
- **Utility icons** are the chevrons, tick, close and the loading trace. They're drawn the same way. lucide is no longer used by any primitive.
- Text arrows stay in running links: `→` next, `←` back, `↗` leaves the site. Set them in the link's own face, not mono.
- No icon without a word, except the dialog close button (which has an `sr-only` label) and the theme control's pressed state.

## Motion

Motion explains a change of state and nothing else. There are four transitions, listed below, plus the loading trace, which is the only thing that loops. Anything not listed doesn't move: no hover scale, no bounce, no staggered entrances, no counting-up figures.

### Tokens

| Token | Value | Use |
|---|---|---|
| `--dur-quick` | 120ms | Hover colour, the switch thumb, overlay fades |
| `--dur-move` | 200ms | Panel swap, the bottom sheet, the theme crossfade |
| `--dur-camera` | 1400ms | The cap on a map camera move (a fly-to); shorter moves are fractions of it |
| `--ease-plate` | `cubic-bezier(0.2, 0, 0, 1)` | Everything that moves |

Code that animates outside CSS (the Mapbox camera and paint) reads these through [lib/motion.ts](../../lib/motion.ts), so reduced motion and density apply there too.

### The four transitions

| Transition | What moves | How |
|---|---|---|
| 1. Panel open and close | The index panel's contents | When the index gives way to a store entry, or back, the new contents fade up over `--dur-move` (`.plate-in`). Nothing slides. The panel scrolls to its top, and if focus was in the panel it moves to the new heading. On mobile the sheet's height eases over `--dur-move`. The first contents of a page don't fade. |
| 2. Store select, with fly-to | The map camera | From the index, the camera travels to the store. If it's already on screen at zoom 9 or closer, it eases (`--dur-camera` × 0.45). Otherwise it flies, out and back in (`flyTo`, `--dur-camera`), so the reader sees where in the country the store is. The selected symbol appears at once, with no pulse. A click on the map selects without moving the camera. |
| 3. Filter change | The map camera, sometimes | Choosing a province turns to its regional plate: the camera fits the province's stores (2nd to 98th percentile, so one misplaced point can't stretch it) over `--dur-camera` × 0.6. "All of Canada" and "Unplaced" turn back to the national plate. Search and specialty filters move nothing: the points redraw in one frame and the counts change in place. |
| 4. Theme switch | The whole page | One crossfade over `--dur-move` (View Transitions, in [lib/useTheme.ts](../../lib/useTheme.ts)), while the map diffs its new palette in over the same duration (the style's `transition`). Browsers without View Transitions swap at once. |

### Reduced motion and the admin

- `prefers-reduced-motion: reduce` removes every CSS transition and animation, the sheet snaps, the theme swaps without a crossfade, and every camera move becomes a jump (`jumpTo`). The loading trace stops, as a static segment.
- **The admin has no motion.** Compact density sets `--dur-quick` and `--dur-move` to 0 on `:root` (through `:has()`, so dialogs and toasts portalled to `<body>` get it too), and sonner's slide is turned off. Dialogs, toasts, the switch and hover all change state instantly. The one exception is the loading trace, which says work is in progress.
- Overlays fade only. No zoom-in, no slide-in-from, no press-nudge (`translate-y-px`).

## States

Every state is set in the direction's voice: a short entry with a marginal note, the head, a sentence under the plate rule, and the ways on. **Never the centred icon, heading and subtext template.** A state says what happened, what still works, and what to do, in that order. A failure never shows the raw error message (the digest is shown, for matching logs).

| State | Where | Treatment |
|---|---|---|
| Page loading | [app/loading.tsx](../../app/loading.tsx) | The plate itself, drawn in place: frame, title block (legend line reads *counting the stores…*), and the index column with one status line. Nothing moves when the map arrives. Content routes use [ShellLoading](../../components/layout/ShellLoading.tsx) (the page shell and one status line) so they never flash the plate. |
| Page error | [app/error.tsx](../../app/error.tsx) | The page shell, marginal *Didn't load*, "This page didn't load", what it means, the digest, Try again and ← Back to Plate 1. |
| No such page | [app/not-found.tsx](../../app/not-found.tsx), the store not-found | [NoEntry](../../components/layout/NoEntry.tsx): marginal *No entry 404*, the head, a sentence, and the way on. |
| Store layer failed | Home ([StoresUnavailable](../../components/map/StoresUnavailable.tsx)) | **A failed load never looks like an empty atlas.** The legend line reads *stores not loaded*, never a zero; the index panel says the stores didn't load, that nothing was removed, and offers Try again (a server refresh). `getStoresGeoJSON` returns `null` on a failed query (and the API route a 503), so a failure is never an empty collection. |
| Zero filter results | Index panel | Says where it looked ("No store or town in Quebec matches…"), how many match elsewhere, and offers Search all of Canada and Suggest a store. The legend line reads *none of 852 shown*. |
| Entry didn't load | Store entry in the panel | What the map knows stays; a line under it says the rest (address, hours, description) didn't load, with Try again and Open the full entry. |
| Sync date unknown | [DataFreshness](../../components/layout/DataFreshness.tsx) | The sentence keeps its shape: "Store data last synced: *date not available just now*". It never guesses a date or claims a schedule. |
| Form not live | /submit | Says plainly that it doesn't send, what it's waiting on, and what works today (editing OpenStreetMap). |
| Empty filtered list | Admin stores | The count line reads 0, and offers Search every store (when a search is combined with other filters) and Clear all filters. The filters themselves stay in the bar above. |
| Slow list | Admin stores | First load: the ruled column heads in place and one row, *Reading the catalogue…*. A filter change on its way: the rows on screen turn `ink-quiet` and the count line adds *these rows are from the last filter*. Instant, both ways. |
| Failed save or status action | Admin store page | A toast (danger top rule) **and** an inline line that outlasts it: the save bar's rule turns danger and reads "× Not saved." with the reason; a failed status action gets "× Not changed." under its control. Both say nothing was changed. |
| Admin error | [admin error.tsx](../../app/admin/(dashboard)/error.tsx) | The office shell, a short entry, the digest, and the message behind a disclosure for development. |

## Density

The admin is the same system at the **compact** setting: `data-density="compact"` on the admin root (`app/admin/(dashboard)/layout.tsx`). It retunes the `--fs-*` sizes, control heights, row padding and gaps listed above. Families, colours, rules and radius don't change. Primitives read only the tokens, so every primitive works in both densities without a prop.

Comfortable is the default everywhere else. Don't set density per component. If a public surface needs to be tighter, it uses a smaller role token instead.

## Accessibility

- **Contrast** (WCAG AA, checked in both themes; density changes sizes, not colours, and no compact size reaches the large-text threshold, so every text pair must meet 4.5:1 there):

| Pair | Dark | Light |
|---|---|---|
| `ink` on `bg` / `bg-raised` / `bg-step` | 15.27 / 14.40 / 14.92 | 14.54 / 16.12 / 13.43 |
| `ink-dim` on the same | 7.38 / 6.96 / 7.21 | 6.73 / 7.45 / 6.21 |
| `ink-quiet` on the same | 5.72 / 5.40 / 5.59 | 5.11 / 5.66 / 4.72 |
| `moss` (links) on the same | 6.07 / 5.72 / 5.93 | 4.69 / 5.19 / **4.33** |
| `danger` on the same | 4.80 / 4.52 / 4.69 | 5.85 / 6.48 / 5.40 |
| `bg` on `moss` (primary button) | 6.07 | 4.69 |
| `bg` on `moss-deep` (light primary hover) | not used | 6.50 |
| `ink-faint` (field borders, rules) on `bg` | 3.77 (non-text, 3:1) | 3.50 |
| `amber` (review mark, a glyph) on `bg` | 7.82 | 3.71 (non-text, 3:1) |

  Moss link text on light `bg-step` is 4.33:1, so links never sit on `bg-step` (the /submit notice uses `bg`). Hover and focus rows that are `bg-step` carry `ink` text.
- **Focus**: every interactive element shows the 2px square moss outline (4.3:1 or better against every ground; 3:1 is the bar for a focus indicator). The map canvas draws it inset, since the plate clips anything outside. Programmatic focus on a heading (after a panel swap) uses the same outline, offset 4px, and only appears for keyboard users.
- **Keyboard**: the province index is a native radio group (arrow keys move and choose) and specialties are checkboxes. In Find, Enter opens the top match and the down arrow moves into the matches. Escape returns from an entry to the index. The admin table moves with j and k, opens with Enter, and / jumps to search.
- **Labels**: the map canvas is named for what it is and how to use it ("Map of Canada's independent bookstores. Arrow keys pan, plus and minus zoom. The index panel lists every store on the map."), through Mapbox's `locale`. The index panel is the accessible way to every store; points on the map are not reachable one by one.
- **Live regions**: the index's "Showing N of 852" line, the admin table's count and sort line ("Sorted by completeness, lowest first"), loading lines (`role="status"`) and inline failures (`role="alert"`).
- **Tables**: hours are a `table` with a hidden caption, day names as row headers, today marked with `aria-current="date"` and the word "today", and the unknown-days note tied on with `aria-describedby`. Admin columns carry `aria-sort`.
- **Dialogs**: alert dialogs trap focus, open on Cancel (first in the DOM), close on Escape, and return focus to their trigger.

## Layout frames

- **Plate (home)**: the map fills a double neatline (outer `line-strong`, inner `ink-faint`). The title block sits inside the top-left corner, the theme control top right, and the credits run along the foot margin under the inner neatline. The index panel (384px) sits to the right behind a single neatline. Under 768px the map fills the screen inside a single thin neatline, with a compact title box, and the panel becomes a bottom sheet with peek, half and full states.
- **Page shell (content routes)**: a running head (wordmark, a breadcrumb starting from the plate mark and "Plate 1", About, Suggest a store, theme) over a neatline, the page, then a colophon. The plate mark plus "Plate 1" is the way back to the map.
- **Compilation office (admin)**: a 216px left rail (wordmark, *Compilation office*, nav with a moss current rule, and at the foot the theme control, the public-atlas link and the Clerk UserButton), with content at full width. Under 768px the rail becomes a top strip with scrolling tabs.

## Do and don't

These ban the patterns in AUDIT.md. Each line names its entry.

| Don't | Do instead |
|---|---|
| Mono uppercase `tracking-widest` for labels, links, buttons, taglines or status lines (F-TYPE-1) | Sentence-case Jost for labels and links. Mono only for figures |
| `rounded-full` pills for tags, toggles or close buttons (F-SHAPE-1) | Square: a moss bullet plus a word for tags, the square switch and segmented control |
| A `rounded-md border bg-bg-raised` box around every block (F-REPEAT-1, F-ABOUT-1) | A rule plus a heading. Box only the title block, slips and dialogs |
| A header bar, a boxed map and a footer bar around the map (F-FRAME-1) | The plate frame, with the title block and credits inside it |
| Radial glows, gradient bars, backdrop blur or shadows (F-FOUND-4) | Flat tone steps and neatlines |
| The shadcn `ring-3 ring-ring/50` halo or 10px corners (F-FOUND-1) | The 2px square moss outline and radius 0 |
| Amber links, amber counts, amber close buttons (F-COLOR-1) | Moss links. Amber once, for the selected or located thing |
| Status by hue alone in pill badges (F-ADMIN-4) | Glyph plus word: ✓ Verified, ■ Review, × Closed, · Unverified |
| A metric-tile grid where every number weighs the same (F-ADMIN-2) | Work outstanding as large figures, context as a ledger |
| Red text for the normal state, for example a score below 40 (F-ADMIN-5) | Show which parts are present. Reserve danger for real danger |
| Destructive confirms styled as the primary moss button (F-ADMIN-8) | `variant="destructive-solid"` on the confirm and `tone="danger"` on the alert dialog, with the button named for the action |
| A green status dot for "last synced" (F-FRESH-1) | A plain sentence with the date in mono |
| "Coming soon" pills, or controls ghosted at 30% (F-COPY-1, F-BROWSE-1) | Ship it, leave it out, or say *planned* in italic with what it's waiting on |
| "Not yet available", "—" or mono caps for missing data (F-SIDE-2, F-SIDE-4) | Playfair italic "Not recorded", or one line listing what's missing with a correction link |
| A Cinzel eyebrow over the H1, or "01 / 05" section numbers (F-FONT-1, F-ABOUT-1) | A breadcrumb in the running head, and marginal labels in Playfair italic |
| The centred error or 404 template with the raw `error.message` (F-STATE-2, F-NOTFOUND-1) | The page shell with a short entry and a way back to the plate |
| A ✕ in a pill to close a panel (F-SIDE-3) | "← Back to the index" |
| lucide icons or sonner's default toast icons (F-FOUND-3) | The custom marks in `icons.tsx` |
| `disabled:opacity-50`, or the press-nudge `active:translate-y-px` (F-FOUND-2) | `ink-faint` on `line-strong`, and no movement on press |
| DOM markers on the main map (BRIEF 6.3) | Mapbox symbol and circle layers on the single GeoJSON source |
| `ink-faint` for text anyone has to read (fails 4.5:1) | `ink-quiet`. Keep `ink-faint` for rules, field borders and disabled text |
| "0 stores" when a load failed (F-STATE-3) | Say it didn't load, say nothing was removed, offer Try again |
| Motion for its own sake: hover scale, bounce, staggered lists | The four transitions under Motion, and none in the admin |
| Em dashes in any UI copy (BRIEF 5.1) | A full stop, a colon or a middle dot (·) |
| CSS overrides of Clerk internals (BRIEF 3.4) | `lib/clerkAppearance.ts`, through the `appearance` API |
