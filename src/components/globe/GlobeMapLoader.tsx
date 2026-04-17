"use client";

import dynamic from "next/dynamic";

const GlobeMap = dynamic(() => import("@/components/globe/GlobeMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-muted/80 flex h-full w-full items-center justify-center">
      <div className="text-muted-foreground text-sm font-medium tracking-wide">
        Getting your globe ready…
      </div>
    </div>
  ),
});

/**
 * Client-only wrapper so the Mapbox bundle never loads on the server.
 */
export function GlobeMapLoader() {
  return <GlobeMap />;
}
