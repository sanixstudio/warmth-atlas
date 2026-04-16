import { describe, expect, it } from "vitest";

import { formatObservationTime } from "./observation-time";

describe("formatObservationTime", () => {
  it("returns a friendly message when time is missing", () => {
    expect(formatObservationTime(undefined)).toBe("Observation time not provided");
  });

  it("formats ISO timestamps", () => {
    const s = formatObservationTime("2024-06-15T14:30:00");
    expect(s.length).toBeGreaterThan(4);
  });
});
