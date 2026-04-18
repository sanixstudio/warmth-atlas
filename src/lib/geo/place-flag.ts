import type { PlaceSearchResult } from "@/lib/schemas/place";
import type { SelectedCountry } from "@/lib/store/country-store";

const FLAG_CDN_BASE = "https://flagcdn.com/w40";

/**
 * ISO 3166-1 alpha-2 → regional indicator flag emoji (e.g. `JP` → 🇯🇵). Empty if not two A–Z letters.
 */
export function iso2ToRegionalFlagEmoji(iso2: string): string {
  const cc = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  const base = 0x1f1e6; // Regional Indicator Symbol Letter A
  return String.fromCodePoint(base + cc.charCodeAt(0) - 65, base + cc.charCodeAt(1) - 65);
}

/** Primary flagcdn path for a selected map row. */
export function flagCdnUrlFromSelected(c: SelectedCountry): string {
  if (c.kind === "us_state") {
    return `${FLAG_CDN_BASE}/us-${c.iso2.toLowerCase()}.png`;
  }
  return `${FLAG_CDN_BASE}/${c.iso2.toLowerCase()}.png`;
}

/** Fallback when subdivision or rare code fails (flagcdn). */
export function flagCdnFallbackFromSelected(c: SelectedCountry): string {
  if (c.kind === "us_state") {
    return `${FLAG_CDN_BASE}/us.png`;
  }
  return `${FLAG_CDN_BASE}/xx.png`;
}

export function flagCdnUrlFromSearchResult(p: PlaceSearchResult): string {
  if (p.kind === "us_state") {
    return `${FLAG_CDN_BASE}/us-${p.iso2.toLowerCase()}.png`;
  }
  return `${FLAG_CDN_BASE}/${p.iso2.toLowerCase()}.png`;
}

export function flagCdnFallbackFromSearchResult(p: PlaceSearchResult): string {
  if (p.kind === "us_state") return `${FLAG_CDN_BASE}/us.png`;
  return `${FLAG_CDN_BASE}/xx.png`;
}

/** Two-line map label: regional flag emoji + temperature string. */
export function mapLabelWithFlagEmoji(c: SelectedCountry, tempLabel: string): string {
  const flag =
    c.kind === "us_state"
      ? iso2ToRegionalFlagEmoji("US")
      : iso2ToRegionalFlagEmoji(c.iso2);
  const prefix = flag || (c.kind === "us_state" ? "US" : c.iso2);
  return `${prefix}\n${tempLabel}`;
}
