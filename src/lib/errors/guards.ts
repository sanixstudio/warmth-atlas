/**
 * Returns true when `e` is an abort from `fetch`/`AbortController` (cancelled requests).
 */
export function isAbortError(e: unknown): boolean {
  if (e == null || typeof e !== "object") return false;
  const name = "name" in e && typeof (e as { name: unknown }).name === "string" ? (e as { name: string }).name : "";
  return name === "AbortError";
}

/**
 * Safe string for user-facing error toasts and UI (handles non-`Error` throws).
 */
export function getErrorMessage(e: unknown, fallback = "Something went wrong"): string {
  if (e instanceof Error && e.message.trim()) return e.message;
  if (typeof e === "string" && e.trim()) return e;
  return fallback;
}
