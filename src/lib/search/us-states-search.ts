import type { PlaceSearchResult } from "@/lib/schemas/place";
import usMeta from "@/lib/data/us-states-meta.json";

type MetaRow = {
  p: string;
  n: string;
  lat: number;
  lon: number;
  u: string;
};

const rows = usMeta as MetaRow[];

function score(query: string, r: MetaRow): number {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return 0;
  const n = r.n.toLowerCase();
  const p = r.p.toLowerCase();
  if (n === q) return 120;
  if (p === q) return 110;
  if (n.startsWith(q)) return 90;
  if (p.startsWith(q)) return 85;
  if (n.includes(q)) return 60;
  return 0;
}

/**
 * US state search over bundled Natural Earth-derived metadata (name + postal, + label lat/lon).
 * Uses the same reference coordinates as the map boundaries (interior label points).
 */
export function searchUsStates(rawQuery: string): PlaceSearchResult[] {
  const q = rawQuery.trim();
  if (q.length < 2) return [];

  const scored: { row: MetaRow; score: number }[] = [];
  for (const r of rows) {
    const s = score(q, r);
    if (s > 0) scored.push({ row: r, score: s });
  }
  scored.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const out: PlaceSearchResult[] = [];
  for (const { row } of scored) {
    if (seen.has(row.u)) continue;
    seen.add(row.u);
    out.push({
      kind: "us_state",
      id: row.u,
      name: row.n,
      /** Interior label lat/lon from Natural Earth (boundary + weather point). */
      capital: "Natural Earth reference",
      lat: row.lat,
      lon: row.lon,
      iso2: row.p,
      iso3: "USA",
    });
    if (out.length >= 25) break;
  }
  return out;
}
