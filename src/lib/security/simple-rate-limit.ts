/**
 * Fixed-window style limiter keyed by caller (e.g. client IP).
 * Best-effort for a single Node process; on multi-instance hosts each instance has its own counters.
 */

type Options = {
  max: number;
  windowMs: number;
};

const buckets = new Map<string, number[]>();

function prune(stamps: number[], now: number, windowMs: number): number[] {
  return stamps.filter((t) => now - t < windowMs);
}

/**
 * @returns `true` if the request is allowed, `false` if the limit was exceeded.
 */
export function checkRateLimit(key: string, { max, windowMs }: Options): boolean {
  const now = Date.now();
  const prev = buckets.get(key) ?? [];
  const fresh = prune(prev, now, windowMs);
  if (fresh.length >= max) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh.length > max * 3 ? fresh.slice(-max * 2) : fresh);
  return true;
}

/** Client-ish key from standard proxy headers (first hop). */
export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
