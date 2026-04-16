import { describe, expect, it } from "vitest";

import { searchUsStates } from "./us-states-search";

describe("searchUsStates", () => {
  it("finds Texas by name", () => {
    const r = searchUsStates("Texas");
    const tx = r.find((x) => x.id === "US-TX");
    expect(tx?.kind).toBe("us_state");
    expect(tx?.name).toBe("Texas");
  });

  it("finds CA by postal code alone", () => {
    const r = searchUsStates("CA");
    expect(r.some((x) => x.id === "US-CA")).toBe(true);
  });
});
