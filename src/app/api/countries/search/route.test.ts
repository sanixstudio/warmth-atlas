import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/countries/search", () => {
  it("returns 400 when query is too short", async () => {
    const res = await GET(new Request("http://localhost/api/countries/search?q=a"));
    expect(res.status).toBe(400);
  });
});
