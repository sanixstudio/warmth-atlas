"use client";

import { useSyncExternalStore } from "react";

import { WifiOff } from "lucide-react";

function subscribeOnline(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/** Hide banner during SSR; first client paint uses real {@link Navigator.onLine}. */
function getOnlineServerSnapshot() {
  return true;
}

/**
 * Warns when the device is offline; copy matches {@link PRODUCT_GUARDS.offline}.
 */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);

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
