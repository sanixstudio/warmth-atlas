"use client";

import { Info, Trash2 } from "lucide-react";
import { memo, useCallback } from "react";

import { PlaceFlagImg } from "@/components/warmth/PlaceFlagImg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatObservationTime } from "@/lib/format/observation-time";
import type { SelectedCountry } from "@/lib/store/country-store";
import type { TemperatureDisplayUnit } from "@/lib/warmth/colorFromTemp";
import { formatTemperature } from "@/lib/warmth/colorFromTemp";

export type SelectedPlaceRowProps = {
  place: SelectedCountry;
  tempDisplayUnit: TemperatureDisplayUnit;
  onRemove: (place: SelectedCountry) => void;
};

/**
 * One selected place in the sidebar: flag, warmth strip, labels, info tooltip, remove.
 */
export const SelectedPlaceRow = memo(function SelectedPlaceRow({
  place,
  tempDisplayUnit,
  onRemove,
}: SelectedPlaceRowProps) {
  const handleRemove = useCallback(() => {
    onRemove(place);
  }, [onRemove, place]);

  return (
    <li className="border-border/70 flex items-center gap-2 rounded-2xl border bg-muted/50 p-2.5 sm:gap-3 sm:p-3 dark:bg-white/5">
      <PlaceFlagImg place={place} className="!size-7 shrink-0 sm:!size-8" />
      <span
        className="ring-foreground/15 h-9 w-2 shrink-0 self-stretch rounded-full ring-2 sm:h-10 dark:ring-white/20"
        style={{ background: place.warmthFill }}
        aria-hidden
      />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="truncate text-[15px] font-semibold sm:text-base">{place.name}</span>
          <Badge variant="secondary" className="font-mono text-[10px] uppercase">
            {place.kind === "country" ? place.iso2 : place.id}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-xs sm:text-sm">
          {place.kind === "country"
            ? `${place.capital} · ${formatTemperature(place.tempC, tempDisplayUnit)}`
            : `Natural Earth reference · ${formatTemperature(place.tempC, tempDisplayUnit)}`}
        </p>
        {place.observedAt ? (
          <p className="text-muted-foreground/85 mt-0.5 max-w-full truncate text-[10px] sm:text-xs">
            Observed {formatObservationTime(place.observedAt)}
            {place.kind === "country" ? " (capital area, Open-Meteo)" : " (NE reference, Open-Meteo)"}
          </p>
        ) : null}
      </div>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground size-9 shrink-0 touch-manipulation sm:size-8"
              aria-label={`Data details for ${place.name}`}
            >
              <Info className="size-4" />
            </Button>
          }
        />
        <TooltipContent side="bottom" className="max-w-[min(90vw,22rem)] text-left text-xs leading-relaxed">
          <p className="font-medium">Current air temperature (2 m)</p>
          <p className="text-muted-foreground mt-1">
            {place.kind === "country" ? (
              <>
                Near {place.capital} coordinates from REST Countries. Source: Open-Meteo (current).
              </>
            ) : (
              <>
                Natural Earth reference coordinates for this U.S. state (not the legislative capital). Source:
                Open-Meteo (current).
              </>
            )}
            {place.observedAt ? (
              <> Timestamp: {formatObservationTime(place.observedAt)}.</>
            ) : (
              <> Observation time not returned for this request.</>
            )}
          </p>
        </TooltipContent>
      </Tooltip>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="text-muted-foreground hover:text-destructive size-11 shrink-0 touch-manipulation sm:size-9"
        onClick={handleRemove}
        aria-label={`Remove ${place.name}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
});
