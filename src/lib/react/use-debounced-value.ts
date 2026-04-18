import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stayed unchanged for `delayMs` milliseconds.
 * Useful for search fields to avoid hitting the API on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  const safeMs = Math.max(0, Number.isFinite(delayMs) ? delayMs : 0);

  useEffect(() => {
    const id = globalThis.setTimeout(() => setDebounced(value), safeMs);
    return () => globalThis.clearTimeout(id);
  }, [value, safeMs]);

  return debounced;
}
