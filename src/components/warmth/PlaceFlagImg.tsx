"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { PlaceSearchResult } from "@/lib/schemas/place";
import type { SelectedCountry } from "@/lib/store/country-store";
import {
  flagCdnFallbackFromSearchResult,
  flagCdnFallbackFromSelected,
  flagCdnUrlFromSearchResult,
  flagCdnUrlFromSelected,
} from "@/lib/geo/place-flag";

type Props = {
  className?: string;
} & ({ place: SelectedCountry } | { candidate: PlaceSearchResult });

/**
 * Flag image from [flagcdn.com](https://flagcdn.com) (PNG). Falls back on error.
 */
export function PlaceFlagImg(props: Props) {
  const primary =
    "place" in props ? flagCdnUrlFromSelected(props.place) : flagCdnUrlFromSearchResult(props.candidate);
  const fallback =
    "place" in props ? flagCdnFallbackFromSelected(props.place) : flagCdnFallbackFromSearchResult(props.candidate);

  const [src, setSrc] = useState(primary);

  useEffect(() => {
    setSrc(primary);
  }, [primary]);

  const handleError = useCallback(() => {
    setSrc((s) => (s === fallback ? s : fallback));
  }, [fallback]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- flagcdn PNGs; plain img avoids next/image remotePatterns
    <img
      src={src}
      alt=""
      width={32}
      height={24}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
      className={cn(
        "border-border/60 size-7 shrink-0 rounded-sm border object-cover shadow-sm sm:size-8",
        props.className,
      )}
    />
  );
}
