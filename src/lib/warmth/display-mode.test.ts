import { describe, expect, it } from "vitest";

import { isAccessibleWarmthMode } from "./display-mode";

describe("isAccessibleWarmthMode", () => {
  it("is true only for accessible", () => {
    expect(isAccessibleWarmthMode("accessible")).toBe(true);
    expect(isAccessibleWarmthMode("standard")).toBe(false);
  });
});
