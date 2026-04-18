# Warmth Atlas — product map & features

## Positioning

**What it is:** A browser-based geography explorer that pairs **current air temperature** (2 m, Open-Meteo) with **map highlights** (Natural Earth countries / U.S. states, approximate disks for cities) on a **Mapbox globe**.

**Who it’s for:** Curious learners and educators (~ages 9–16), quick class demos, and anyone comparing “how warm is it there right now?”—**not** a replacement for official forecasts or safety-critical weather.

**Trust posture:** No accounts in MVP; public data APIs; rate-limited server routes; sources cited in Learn / Educators content (`src/lib/product/education-content.ts`).

---

## Core user journeys

| Journey | Outcome |
|--------|---------|
| **Search → add place** | User finds a country, U.S. state, or city; sees matches (debounced typeahead); adds one; globe flies; warmth color applied. |
| **Compare places** | Multiple rows in the sidebar; each has flag, temp, remove; globe shows last-added focus behavior. |
| **Understand the data** | Learn dialog + Educators page explain weather point vs whole country, boundaries, flags, rate limits, city disk approximation. |
| **Change units** | °C / °F toggle applies to list and labels. |

---

## Feature inventory (shipped)

### Map & geography

- Globe (Mapbox), dark/light with theme toggle.
- Country polygons (Natural Earth 110m), U.S. state polygons.
- City / town: geocoded center + **approximate circular highlight** (not official municipal boundaries).
- Temperature labels on the globe for selected places.
- Fit bounds / zoom per place kind.

### Data & APIs

- Weather: Open-Meteo current, server route + client fetch with caching.
- Search: REST Countries + bundled U.S. states + Open-Meteo geocoding; merge/rank rules (exact match narrowing, homonym caps).
- Rate limiting on search (and related security helpers).

### Client UX

- Debounced search, TanStack Query, abort-aware requests.
- Sidebar: search, suggestions panel, stacked place rows, unit toggle.
- Mobile layout tuned for short viewports (compact rows, help links in header).
- Learn dialog, Educators link, Privacy page.

### Quality / engineering

- Zod schemas, finite lat/lon, upstream timeouts, error helpers.
- Tests around search merge/rank, geocode parsing, guards.

---

## Planned / future (from product copy & gaps)

These are **not** all committed dates—they’re the honest backlog derived from `PRODUCT_GUARDS` and known limitations.

### Near term (high value, fits current stack)

1. **Accessibility — warmth not by color alone**  
   Pattern or numeric-primary mode for highlights / legend; respect `prefers-reduced-motion` where animations exist; ensure list remains the source of truth for numbers.

2. **Offline / flaky network UX**  
   Align UI with copy: clear “can’t refresh” / stale indicators when fetches fail (per-row or global), without pretending live data.

3. **City boundaries (optional tier)**  
   Replace or supplement the disk with real admin polygons for selected regions (e.g. Nominatim/Overpass or static extracts)—higher latency and ops cost; feature-flag friendly.

### Mid term

4. **Classroom / teacher hooks**  
   Saved “scenarios” or shareable URLs (still no PII if avoid accounts), or lightweight export (PNG / checklist).

5. **Accounts (only with policy work)**  
   Sign-in for classrooms only after COPPA/FERPA-aware docs and consent flows—explicitly deferred in product copy.

### Later / exploratory

- Additional datasets (population, climate normals) as **separate layers**, not mixed into “current temp” without labeling.
- Internationalization (locale + unit defaults).

---

## Phased roadmap (suggested)

| Phase | Focus | Exit criteria |
|-------|--------|----------------|
| **P0 — Done** | MVP: search, globe, multi-place, Learn, mobile, rate limits | Shipped |
| **P1 — Trust & a11y** | Legend + map don’t rely on color alone; honest offline/stale states | WCAG-oriented review passes for core flows |
| **P2 — Geography depth** | Optional real city boundaries; performance budget | Behind flag or subset of cities |
| **P3 — Classroom** | Scenarios / export; maybe auth | Only with privacy review |

---

## Metrics (lightweight)

- **Engagement:** places added per session (client-only; no analytics unless you add it).
- **Reliability:** search/weather error rate (server logs if deployed).
- **Education:** time-to-first-successful add from landing (qualitative in user tests).

---

## Suggested next sprint (first build after this doc)

**Start with P1 — accessibility foundation:**

1. Add a user-visible **“Temperature display”** or **“Accessibility”** control: *Color + numbers (default)* vs *Numbers & patterns* (or similar).
2. In **numbers/patterns** mode: ensure **fill patterns or thick outlines** on highlights; legend shows **numeric scale** as primary; document in Learn.

If you prefer a smaller first step: **stale/offline banner** when `fetch` fails or returns 408/503, matching the offline copy in `PRODUCT_GUARDS.offline`.

---

*Last updated: product map file introduced; align this doc when shipping major features.*
