import { describe, expect, it } from "vitest";

import { checkRateLimit } from "./simple-rate-limit";

describe("checkRateLimit", () => {
  it("allows requests up to max within the window", () => {
    const key = `t-${Math.random()}`;
    const opts = { max: 3, windowMs: 10_000 };
    expect(checkRateLimit(key, opts)).toBe(true);
    expect(checkRateLimit(key, opts)).toBe(true);
    expect(checkRateLimit(key, opts)).toBe(true);
    expect(checkRateLimit(key, opts)).toBe(false);
  });

  it("tracks keys independently", () => {
    expect(checkRateLimit("a-ip", { max: 1, windowMs: 60_000 })).toBe(true);
    expect(checkRateLimit("a-ip", { max: 1, windowMs: 60_000 })).toBe(false);
    expect(checkRateLimit("b-ip", { max: 1, windowMs: 60_000 })).toBe(true);
  });
});
