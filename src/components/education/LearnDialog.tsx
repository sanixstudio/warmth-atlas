"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LEARN_INTRO,
  PRODUCT_DATA_SOURCES,
  PRODUCT_GUARDS,
} from "@/lib/product/education-content";
import { cn } from "@/lib/utils";

function GuardBlock({
  title,
  bullets,
}: {
  title: string;
  bullets: readonly string[];
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      <ul className="text-muted-foreground list-inside list-disc space-y-1.5 text-xs leading-relaxed sm:text-sm">
        {bullets.map((b, i) => (
          <li key={`${title}-${i}`}>{b}</li>
        ))}
      </ul>
    </section>
  );
}

export type LearnDialogProps = {
  /** Merges with the default trigger (e.g. compact header row on small screens). */
  triggerClassName?: string;
};

/**
 * In-app explanation: how Warmth Atlas works, data sources, and non-negotiable trust postures.
 */
export function LearnDialog({ triggerClassName }: LearnDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-9 min-h-9 gap-1.5 rounded-lg px-3 text-xs font-semibold sm:h-10 sm:min-h-10 sm:px-3.5 sm:text-sm",
          triggerClassName,
        )}
        onClick={() => setOpen(true)}
        aria-label="How Warmth Atlas works and where the data comes from"
      >
        How it works
      </Button>
      <DialogContent className="border-border/80 bg-card gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-border/60 space-y-2 border-b px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
          <DialogTitle className="font-heading text-lg sm:text-xl">How Warmth Atlas works</DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed">{LEARN_INTRO}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[min(70vh,520px)] px-4 py-4 sm:px-6">
          <div className="space-y-6 pr-3">
            <section className="space-y-2">
              <h3 className="text-foreground text-sm font-semibold">Data sources</h3>
              <ul className="text-muted-foreground space-y-2 text-xs leading-relaxed sm:text-sm">
                <li>
                  <span className="text-foreground font-medium">Weather: </span>
                  {PRODUCT_DATA_SOURCES.weather.note}{" "}
                  <a
                    href={PRODUCT_DATA_SOURCES.weather.url}
                    className="text-primary underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {PRODUCT_DATA_SOURCES.weather.name}
                  </a>
                </li>
                <li>
                  <span className="text-foreground font-medium">Boundaries: </span>
                  {PRODUCT_DATA_SOURCES.boundaries.note}{" "}
                  <a
                    href={PRODUCT_DATA_SOURCES.boundaries.url}
                    className="text-primary underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {PRODUCT_DATA_SOURCES.boundaries.name}
                  </a>
                </li>
                <li>
                  <span className="text-foreground font-medium">Countries: </span>
                  {PRODUCT_DATA_SOURCES.countries.note}{" "}
                  <a
                    href={PRODUCT_DATA_SOURCES.countries.url}
                    className="text-primary underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {PRODUCT_DATA_SOURCES.countries.name}
                  </a>
                </li>
                <li>
                  <span className="text-foreground font-medium">Cities: </span>
                  {PRODUCT_DATA_SOURCES.geocoding.note}{" "}
                  <a
                    href={PRODUCT_DATA_SOURCES.geocoding.url}
                    className="text-primary underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {PRODUCT_DATA_SOURCES.geocoding.name}
                  </a>
                </li>
                <li>
                  <span className="text-foreground font-medium">Flags: </span>
                  {PRODUCT_DATA_SOURCES.flags.note}{" "}
                  <a
                    href={PRODUCT_DATA_SOURCES.flags.url}
                    className="text-primary underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {PRODUCT_DATA_SOURCES.flags.name}
                  </a>
                </li>
                <li>
                  <span className="text-foreground font-medium">Map: </span>
                  {PRODUCT_DATA_SOURCES.map.note}{" "}
                  <a
                    href={PRODUCT_DATA_SOURCES.map.url}
                    className="text-primary underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {PRODUCT_DATA_SOURCES.map.name}
                  </a>
                </li>
              </ul>
            </section>

            <Separator />

            <GuardBlock title={PRODUCT_GUARDS.safetyTrust.title} bullets={PRODUCT_GUARDS.safetyTrust.bullets} />
            <Separator />
            <GuardBlock title={PRODUCT_GUARDS.citations.title} bullets={PRODUCT_GUARDS.citations.bullets} />
            <Separator />
            <GuardBlock title={PRODUCT_GUARDS.accessibility.title} bullets={PRODUCT_GUARDS.accessibility.bullets} />
            <Separator />
            <GuardBlock title={PRODUCT_GUARDS.offline.title} bullets={PRODUCT_GUARDS.offline.bullets} />
            <Separator />
            <GuardBlock title={PRODUCT_GUARDS.equity.title} bullets={PRODUCT_GUARDS.equity.bullets} />

            <p className="text-muted-foreground pb-2 text-xs">
              For lesson ideas and classroom use, see{" "}
              <Link href="/educators" className="text-primary font-medium underline-offset-4 hover:underline">
                Educators
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary font-medium underline-offset-4 hover:underline">
                Privacy
              </Link>
              .
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

