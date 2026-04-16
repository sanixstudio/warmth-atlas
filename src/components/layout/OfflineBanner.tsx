"use client";

import { useEffect, useState } from "react";

import { WifiOff } from "lucide-react";

/**
 * Warns when the device is offline; copy matches {@link PRODUCT_GUARDS.offline}.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="border-destructive/40 bg-destructive/15 text-destructive-foreground flex items-center justify-center gap-2 border-b px-3 py-2 text-center text-xs sm:text-sm"
    >
      <WifiOff className="size-3.5 shrink-0" aria-hidden />
      <span>
        You appear offline. Live temperatures and map tiles need a connection; numbers on your list reflect the last
        successful fetch (your browser may still show some cached map tiles). When you are back online, try adding a
        country again or refresh.
      </span>
    </div>
  );
}
