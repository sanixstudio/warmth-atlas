import { describe, expect, it } from "vitest";

import { getErrorMessage, isAbortError } from "./guards";

describe("isAbortError", () => {
  it("detects AbortError by name", () => {
    const e = new Error("aborted");
    e.name = "AbortError";
    expect(isAbortError(e)).toBe(true);
  });

  it("returns false for ordinary errors", () => {
    expect(isAbortError(new Error("network"))).toBe(false);
    expect(isAbortError(null)).toBe(false);
  });
});

describe("getErrorMessage", () => {
  it("reads Error.message", () => {
    expect(getErrorMessage(new Error("oops"))).toBe("oops");
  });

  it("accepts string", () => {
    expect(getErrorMessage("plain")).toBe("plain");
  });

  it("uses fallback for unknown", () => {
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });
});
