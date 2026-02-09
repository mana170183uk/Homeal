/**
 * Parse cuisineTypes from API — handles both JSON arrays and comma-separated strings.
 */
export function parseCuisineTypes(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((s: string) => s.trim()).filter(Boolean);
  } catch {
    // not JSON, fall through to comma split
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
