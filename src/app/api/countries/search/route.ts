import { NextResponse } from "next/server";
import { z } from "zod";

import { parseRestCountriesArray } from "@/lib/schemas/country";
import { placeSearchResponseSchema } from "@/lib/schemas/place";
import { searchUsStates } from "@/lib/search/us-states-search";

const querySchema = z.object({
  q: z.string().min(2, "Use at least 2 characters").max(120),
});

/**
 * Proxies REST Countries name search and returns normalized candidates for the client.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { q } = parsed.data;
  const upstream = encodeURIComponent(q.trim());
  const res = await fetch(
    `https://restcountries.com/v3.1/name/${upstream}?fields=cca2,cca3,name,capital,capitalInfo,latlng`,
    { next: { revalidate: 3600 } },
  );

  const states = searchUsStates(q);

  if (res.status === 404) {
    const body = placeSearchResponseSchema.parse({ results: states });
    return NextResponse.json(body, { status: 200 });
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "Country lookup failed", status: res.status },
      { status: 502 },
    );
  }

  const json: unknown = await res.json();
  const countries = parseRestCountriesArray(json);
  const results = [...countries, ...states];
  const body = placeSearchResponseSchema.parse({ results });

  return NextResponse.json(body);
}
