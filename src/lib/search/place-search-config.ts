/**
 * Single source of truth for place search limits. Keep client, API route, and Zod
 * validation aligned (minimum query length must match everywhere).
 */
export const PLACE_SEARCH_MIN_QUERY_LEN = 2;
export const PLACE_SEARCH_QUERY_MAX_LEN = 120;

/** After merge + rank, JSON never returns more than this many rows. */
export const PLACE_SEARCH_RESULTS_MAX = 14;

/** Open-Meteo `count` when the user is in pure city mode (no REST country hits). */
export const PLACE_SEARCH_GEOCODE_COUNT_CITY_FOCUS = 14;

/** Open-Meteo `count` when geocoding only augments state homonyms. */
export const PLACE_SEARCH_GEOCODE_COUNT_AUX = 10;

/** Max cities appended when a U.S. state name matches a geocoded city (e.g. New York). */
export const PLACE_SEARCH_HOMONYM_CITY_MAX = 6;

/**
 * When many geocoder rows share one label (same normalized city name), cap how many we keep.
 */
export const PLACE_SEARCH_CITY_EXACT_DEDUPE_MAX = 6;
