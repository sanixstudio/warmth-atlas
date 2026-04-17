/**
 * Shared copy for Learn dialog, educator outreach, and in-app trust boundaries.
 * Keep factual and version with product changes (data sources, features).
 */

export const PRODUCT_DATA_SOURCES = {
  weather: {
    name: "Open-Meteo",
    url: "https://open-meteo.com/",
    note: "Current air temperature (2 m) near each capital coordinates.",
  },
  boundaries: {
    name: "Natural Earth (110m admin)",
    url: "https://www.naturalearthdata.com/",
    note: "Country polygons for map highlights.",
  },
  countries: {
    name: "REST Countries",
    url: "https://restcountries.com/",
    note: "Country names, ISO codes, and capital coordinates.",
  },
  flags: {
    name: "flagcdn.com",
    url: "https://flagcdn.com/",
    note: "Small PNG flag images in the sidebar (and related UI); your browser requests these from their CDN when you view a place.",
  },
  map: {
    name: "Mapbox",
    url: "https://www.mapbox.com/",
    note: "Base map, globe, and labeling.",
  },
} as const;

/** Non-negotiable product posture for schools / youth safety — surface in Learn + Ed pages. */
export const PRODUCT_GUARDS = {
  safetyTrust: {
    title: "Safety & trust",
    bullets: [
      "No user accounts are required to explore the map (MVP). That limits what we collect: we don't run chat, forums, or public feeds in this app.",
      "If we ever add sign-in for classrooms, we will document data practices and age-appropriate consent (including COPPA / FERPA awareness for U.S. school contexts) before turning features on.",
      "There is no user-generated public content in early versions—only your local session and public data APIs.",
    ],
  },
  citations: {
    title: "Citations & freshness",
    bullets: [
      "Each country uses a single temperature reading for the capital area (not an average for the whole country). The API returns an observation timestamp when available—hover the info icon on a country row or open Learn.",
      "Country outlines and names come from open geographic and reference datasets; weather is computed for the capital point Open-Meteo exposes for “current” conditions.",
      "Map attribution appears on the map (Mapbox); we list software and data sources in Learn and on the Educators page.",
      "Flag thumbnails in the list load from flagcdn.com; labels on the globe may combine regional-indicator emoji with the temperature text—rendering can vary slightly by device.",
      "Server routes apply basic per-IP rate limits to reduce abuse of upstream weather and country search APIs; very heavy classroom use on one IP may occasionally see a short retry window.",
    ],
  },
  accessibility: {
    title: "Accessibility & reading the map",
    bullets: [
      "Temperature numbers appear in the list and on the map; the color scale is an extra cue, not the only signal.",
      "The warmth legend describes the color ramp; we note that color alone is not ideal for all vision types—use °C/°F and numeric labels.",
      "We aim for touch-friendly controls and readable type on phones for equity of access (e.g. Title I / rural 1:1 device scenarios). A pattern or numeric-only highlight mode is a future enhancement.",
      "Labels use plain language where we can so students are not blocked by jargon; numbers stay the source of truth for color on the map.",
    ],
  },
  offline: {
    title: "Offline & flaky Wi-Fi",
    bullets: [
      "You need internet for live temperature lookups and map tiles. If the connection drops, the app shows an offline notice at the top of the screen.",
      "Even a short “last cached / may be stale” message helps classrooms spot flaky Wi-Fi: after a successful load your browser may briefly reuse cached map or boundary assets, but fresh weather always needs a new request—when offline, the timestamp on each row reflects the last successful fetch, not live conditions.",
    ],
  },
  equity: {
    title: "Equity & access",
    bullets: [
      "Core exploration is free to use in the browser—no paywall in this open version (bring your own Mapbox token when self-hosting or forking).",
      "The layout is responsive so students can use phones, tablets, or shared classroom machines.",
    ],
  },
} as const;

/** One friendly line under the app title (sidebar). Concrete, low jargon—good for ages ~9–16. */
export const APP_TAGLINE =
  "Search a place, see today's air temperature, and watch the globe light up in color. Built for curiosity—not official forecasts.";

export const LEARN_INTRO =
  "Warmth Atlas is a geography playground with real data: compare current air temperature near capitals on a 3D globe. Great for class demos and 'what if?' questions—not a replacement for official forecasts.";
