import { NextResponse } from "next/server";
import { z } from "zod";

import {
  openMeteoCurrentSchema,
  weatherCurrentResponseSchema,
} from "@/lib/schemas/weather";

const querySchema = z.object({
  lat: z.coerce.number().gte(-90).lte(90),
  lon: z.coerce.number().gte(-180).lte(180),
});

/** Cached current temperature from Open-Meteo (capital or given point). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid coordinates", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { lat, lon } = parsed.data;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Weather request failed", status: res.status },
      { status: 502 },
    );
  }

  const json: unknown = await res.json();
  const om = openMeteoCurrentSchema.safeParse(json);
  if (!om.success) {
    return NextResponse.json({ error: "Unexpected weather payload" }, { status: 502 });
  }

  const payload = weatherCurrentResponseSchema.parse({
    temperatureC: om.data.current.temperature_2m,
    observedAt: om.data.current.time,
  });

  return NextResponse.json(payload);
}
