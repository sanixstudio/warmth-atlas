import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/weather/current", () => {
  it("returns 400 when coordinates are invalid", async () => {
    const res = await GET(
      new Request("http://localhost/api/weather/current?lat=invalid&lon=0"),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when lat is out of range", async () => {
    const res = await GET(
      new Request("http://localhost/api/weather/current?lat=100&lon=0"),
    );
    expect(res.status).toBe(400);
  });
});
