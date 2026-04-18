import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stayed unchanged for `delayMs` milliseconds.
 * Useful for search fields to avoid hitting the API on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
