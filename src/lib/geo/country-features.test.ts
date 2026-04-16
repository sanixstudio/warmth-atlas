import { describe, expect, it } from "vitest";

import { getCountryLabelLngLat } from "./country-features";

describe("getCountryLabelLngLat", () => {
  it("prefers Natural Earth LABEL_X / LABEL_Y when set", () => {
    const f = {
      type: "Feature" as const,
      properties: { LABEL_X: 10.5, LABEL_Y: 51.2 },
      geometry: { type: "Point" as const, coordinates: [0, 0] },
    };
    expect(getCountryLabelLngLat(f)).toEqual([10.5, 51.2]);
  });
});
