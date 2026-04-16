/**
 * Formats Open-Meteo `current.time` (ISO 8601) for display in UI.
 */
export function formatObservationTime(iso: string | null | undefined): string {
  if (!iso || typeof iso !== "string") {
    return "Observation time not provided";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
