"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import type {
  FillLayerSpecification,
  LineLayerSpecification,
  Map as MapboxMap,
  SymbolLayerSpecification,
} from "mapbox-gl";
import type { Feature, FeatureCollection, Point } from "geojson";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  NavigationControl,
  type MapRef,
  Source,
} from "react-map-gl/mapbox";

import {
  featureBBox,
  findCountryFeature,
  getCountryLabelLngLat,
} from "@/lib/geo/country-features";
import type { SelectedCountry } from "@/lib/store/country-store";
import { useCountryStore } from "@/lib/store/country-store";
import type { TemperatureDisplayUnit } from "@/lib/warmth/colorFromTemp";
import { formatTemperature } from "@/lib/warmth/colorFromTemp";

const MAP_STYLE_DARK = "mapbox://styles/mapbox/dark-v11";
const MAP_STYLE_LIGHT = "mapbox://styles/mapbox/light-v11";
const COUNTRIES_URL = "/data/ne_110m_admin_0_countries.geojson";

const fillPaint: NonNullable<FillLayerSpecification["paint"]> = {
  "fill-color": ["get", "warmthFill"],
  "fill-opacity": 1,
};

const linePaint: NonNullable<LineLayerSpecification["paint"]> = {
  "line-color": ["get", "warmthOutline"],
  "line-width": 2.5,
  "line-opacity": 0.95,
};

function buildHighlightData(
  world: FeatureCollection | null,
  countries: SelectedCountry[],
): FeatureCollection {
  if (!world) {
    return { type: "FeatureCollection", features: [] };
  }

  const features = [];
  for (const c of countries) {
    const base = findCountryFeature(world, c.iso2, c.iso3);
    if (!base) continue;
    features.push({
      type: "Feature" as const,
      geometry: base.geometry,
      properties: {
        ...base.properties,
        warmthFill: c.warmthFill,
        warmthOutline: c.warmthOutline,
        iso2: c.iso2,
      },
    });
  }
  return { type: "FeatureCollection", features };
}

function buildTemperatureLabelPoints(
  world: FeatureCollection | null,
  countries: SelectedCountry[],
  unit: TemperatureDisplayUnit,
): FeatureCollection {
  if (!world) {
    return { type: "FeatureCollection", features: [] };
  }

  const features: Feature<Point>[] = [];
  for (const c of countries) {
    const base = findCountryFeature(world, c.iso2, c.iso3);
    if (!base) continue;
    const [lon, lat] = getCountryLabelLngLat(base);
    const geometry: Point = { type: "Point", coordinates: [lon, lat] };
    features.push({
      type: "Feature",
      geometry,
      properties: {
        tempLabel: formatTemperature(c.tempC, unit, 1),
        iso2: c.iso2,
      },
    });
  }
  return { type: "FeatureCollection", features };
}

const labelLayout: NonNullable<SymbolLayerSpecification["layout"]> = {
  "text-field": ["get", "tempLabel"],
  "text-size": 15,
  "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
  "text-anchor": "center",
  "text-allow-overlap": true,
  "text-ignore-placement": true,
};

const labelPaintDark: NonNullable<SymbolLayerSpecification["paint"]> = {
  "text-color": "#f8fafc",
  "text-halo-color": "rgba(15, 23, 42, 0.94)",
  "text-halo-width": 2.4,
  "text-halo-blur": 0.35,
};

const labelPaintLight: NonNullable<SymbolLayerSpecification["paint"]> = {
  "text-color": "#0f172a",
  "text-halo-color": "rgba(255, 255, 255, 0.92)",
  "text-halo-width": 2.2,
  "text-halo-blur": 0.25,
};

/**
 * Full-viewport Mapbox globe with country warmth polygons for all selected entries.
 */
export default function GlobeMap() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const countries = useCountryStore((s) => s.countries);
  const tempDisplayUnit = useCountryStore((s) => s.tempDisplayUnit);
  const mapRef = useRef<MapRef>(null);
  const [world, setWorld] = useState<FeatureCollection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const mapStyle = isLight ? MAP_STYLE_LIGHT : MAP_STYLE_DARK;

  const highlight = useMemo(() => buildHighlightData(world, countries), [world, countries]);
  const labelPoints = useMemo(
    () => buildTemperatureLabelPoints(world, countries, tempDisplayUnit),
    [world, countries, tempDisplayUnit],
  );

  const labelPaint = useMemo(
    () => (isLight ? labelPaintLight : labelPaintDark),
    [isLight],
  );

  const applyGlobeFog = useCallback((map: MapboxMap | undefined) => {
    if (!map) return;
    if (isLight) {
      map.setFog({
        range: [0.78, 2],
        color: "#dde8f5",
        "high-color": "#f6f9fc",
        "space-color": "#b8c9dc",
        "horizon-blend": 0.08,
        "star-intensity": 0.02,
      });
    } else {
      map.setFog({
        range: [0.65, 2],
        color: "#111018",
        "high-color": "#1b1b2f",
        "space-color": "#000005",
        "horizon-blend": 0.06,
        "star-intensity": 0.12,
      });
    }
  }, [isLight]);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    applyGlobeFog(map);
  }, [applyGlobeFog]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    applyGlobeFog(map);
  }, [applyGlobeFog]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(COUNTRIES_URL);
        if (!res.ok) throw new Error(`GeoJSON HTTP ${res.status}`);
        const json: unknown = await res.json();
        if (cancelled) return;
        if (
          typeof json === "object" &&
          json !== null &&
          "type" in json &&
          (json as { type: string }).type === "FeatureCollection"
        ) {
          setWorld(json as FeatureCollection);
        } else {
          throw new Error("Invalid GeoJSON root");
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load boundaries");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Pan/zoom to the most recently added country. */
  useEffect(() => {
    if (!world || countries.length === 0) return;
    const last = countries[countries.length - 1];
    const feat = findCountryFeature(world, last.iso2, last.iso3);
    if (!feat) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const b = featureBBox(feat);
    map.fitBounds(
      [
        [b[0], b[1]],
        [b[2], b[3]],
      ],
      { padding: { top: 100, bottom: 100, left: 100, right: 120 }, maxZoom: 5.5, duration: 1400 },
    );
  }, [world, countries]);

  if (!token) {
    return (
      <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center p-8 text-center text-sm">
        Set <code className="bg-foreground/10 mx-1 rounded px-1.5 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
        in <code className="bg-foreground/10 mx-1 rounded px-1.5 py-0.5">.env.local</code> (see Mapbox
        account access tokens).
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-destructive/15 text-destructive-foreground flex h-full w-full items-center justify-center p-6 text-center text-sm">
        {loadError}
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      mapStyle={mapStyle}
      initialViewState={{
        longitude: 0,
        latitude: 18,
        zoom: 1.35,
        pitch: 0,
        bearing: 0,
      }}
      projection="globe"
      reuseMaps
      style={{ width: "100%", height: "100%" }}
      onLoad={onMapLoad}
    >
      <NavigationControl position="top-left" showCompass={false} />
      <Source id="warmth-countries" type="geojson" data={highlight}>
        <Layer id="warmth-fill" type="fill" paint={fillPaint} />
        <Layer
          id="warmth-outline"
          type="line"
          layout={{ "line-join": "round" }}
          paint={linePaint}
        />
      </Source>
      <Source id="warmth-temperature-labels" type="geojson" data={labelPoints}>
        <Layer id="warmth-temp-symbols" type="symbol" layout={labelLayout} paint={labelPaint} />
      </Source>
    </Map>
  );
}
