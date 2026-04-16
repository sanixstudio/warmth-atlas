import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  LEARN_INTRO,
  PRODUCT_DATA_SOURCES,
  PRODUCT_GUARDS,
} from "@/lib/product/education-content";

export const metadata: Metadata = {
  title: "Educators — Warmth Atlas",
  description:
    "Classroom ideas, data sources, and trust practices for using Warmth Atlas in schools and colleges.",
};

function BulletList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="space-y-2">
      <h2 className="font-heading text-foreground text-lg">{title}</h2>
      <ul className="text-muted-foreground list-inside list-disc space-y-2 pl-0.5 text-sm leading-relaxed">
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function EducatorsPage() {
  return (
    <div className="bg-background min-h-dvh px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3">
          <p>
            <Link href="/" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
              ← Back to map
            </Link>
          </p>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">Warmth Atlas for educators</h1>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">{LEARN_INTRO}</p>
        </header>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Quick classroom uses</CardTitle>
            <CardDescription>Ages ~10+ with teacher guidance; scale depth for middle school vs. college.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
            <p>
              <span className="text-foreground font-medium">Compare & contrast: </span>
              Add two countries far apart in latitude. Ask: Why might the temperatures differ? (Season, ocean, land,
              elevation—capital point vs. whole country.)
            </p>
            <p>
              <span className="text-foreground font-medium">Data literacy: </span>
              Numbers are “current” at the capital’s coordinates, not an average for the entire country. Compare the
              observation time (info icon in the app) to local clock time when teaching time zones.
            </p>
            <p>
              <span className="text-foreground font-medium">Project hook: </span>
              Students pick five countries, fill a small table (country, capital, °F/°C, observation time), and write
              one sentence of interpretation.
            </p>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="font-heading text-foreground text-xl">Data sources (for citations)</h2>
          <ul className="text-muted-foreground space-y-2 text-sm leading-relaxed">
            <li>
              <span className="text-foreground font-medium">Weather: </span>
              {PRODUCT_DATA_SOURCES.weather.note}{" "}
              <a className="text-primary underline-offset-4 hover:underline" href={PRODUCT_DATA_SOURCES.weather.url}>
                {PRODUCT_DATA_SOURCES.weather.name}
              </a>
            </li>
            <li>
              <span className="text-foreground font-medium">Boundaries: </span>
              {PRODUCT_DATA_SOURCES.boundaries.note}{" "}
              <a className="text-primary underline-offset-4 hover:underline" href={PRODUCT_DATA_SOURCES.boundaries.url}>
                {PRODUCT_DATA_SOURCES.boundaries.name}
              </a>
            </li>
            <li>
              <span className="text-foreground font-medium">Countries: </span>
              {PRODUCT_DATA_SOURCES.countries.note}{" "}
              <a className="text-primary underline-offset-4 hover:underline" href={PRODUCT_DATA_SOURCES.countries.url}>
                {PRODUCT_DATA_SOURCES.countries.name}
              </a>
            </li>
            <li>
              <span className="text-foreground font-medium">Map: </span>
              {PRODUCT_DATA_SOURCES.map.note}{" "}
              <a className="text-primary underline-offset-4 hover:underline" href={PRODUCT_DATA_SOURCES.map.url}>
                {PRODUCT_DATA_SOURCES.map.name}
              </a>
            </li>
          </ul>
        </section>

        <Separator />

        <div className="space-y-10">
          <BulletList title={PRODUCT_GUARDS.safetyTrust.title} items={PRODUCT_GUARDS.safetyTrust.bullets} />
          <BulletList title={PRODUCT_GUARDS.citations.title} items={PRODUCT_GUARDS.citations.bullets} />
          <BulletList title={PRODUCT_GUARDS.accessibility.title} items={PRODUCT_GUARDS.accessibility.bullets} />
          <BulletList title={PRODUCT_GUARDS.offline.title} items={PRODUCT_GUARDS.offline.bullets} />
          <BulletList title={PRODUCT_GUARDS.equity.title} items={PRODUCT_GUARDS.equity.bullets} />
        </div>

        <p className="text-muted-foreground text-center text-sm">
          <Link href="/privacy" className="text-primary font-medium underline-offset-4 hover:underline">
            Privacy (MVP)
          </Link>
        </p>
      </div>
    </div>
  );
}
