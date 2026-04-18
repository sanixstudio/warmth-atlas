import { describe, expect, it } from "vitest";

import { parseOpenMeteoGeocodeToPlaces } from "./open-meteo-geocode";

describe("parseOpenMeteoGeocodeToPlaces", () => {
  it("maps San Francisco (US) to a city place row", () => {
    const sample = {
      results: [
        {
          id: 5391959,
          name: "San Francisco",
          latitude: 37.77493,
          longitude: -122.41942,
          country_code: "US",
          country: "United States",
          admin1: "California",
          admin2: "San Francisco County",
          feature_code: "PPLA2",
        },
      ],
    };
    const rows = parseOpenMeteoGeocodeToPlaces(sample, 5);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.kind).toBe("city");
    expect(rows[0]?.id).toBe("city-5391959");
    expect(rows[0]?.iso2).toBe("US");
    expect(rows[0]?.iso3).toBe("USA");
    expect(rows[0]?.capital).toContain("California");
  });
});
