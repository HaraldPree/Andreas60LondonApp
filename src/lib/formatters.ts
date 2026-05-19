/**
 * Google Maps "?q=..." URL.
 *
 * IMPORTANT — we deliberately DROP the label even if passed.
 * The original implementation used `${label}@${lat},${lng}` which is
 * an undocumented format — Google sometimes ignored the coords and
 * geocoded the label literally. Concrete real-world failure: with
 * `label="Duplex Flat near Oxford Street"` Google routed users to
 * Oxford Street instead of the actual flat 200m north on Great
 * Portland Street. Pure coordinates are unambiguous and always work.
 *
 * The `label` parameter is kept for API compatibility (and might be
 * used by callers for ARIA labels / display text) but never enters
 * the URL.
 */
export function mapsUrl(
  lat: number,
  lng: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _label?: string,
): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export function appleMapsUrl(
  lat: number,
  lng: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _label?: string,
): string {
  // Apple Maps: `ll` (lat,lng) is the truth; we deliberately do NOT
  // set `q` (name) for the same geocoder-confusion reason as the
  // Google fix above.
  const params = new URLSearchParams();
  params.set("ll", `${lat},${lng}`);
  return `https://maps.apple.com/?${params.toString()}`;
}

export function isDateActive(
  validFrom?: string,
  validUntil?: string,
  now: Date = new Date(),
): boolean {
  if (validFrom) {
    const from = new Date(validFrom);
    if (now < from) return false;
  }
  if (validUntil) {
    const until = new Date(validUntil);
    until.setHours(23, 59, 59, 999);
    if (now > until) return false;
  }
  return true;
}

export function classNames(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}
