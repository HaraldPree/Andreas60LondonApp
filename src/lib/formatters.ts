export function mapsUrl(lat: number, lng: number, label?: string): string {
  const query = label
    ? `${encodeURIComponent(label)}@${lat},${lng}`
    : `${lat},${lng}`;
  return `https://maps.google.com/?q=${query}`;
}

export function appleMapsUrl(lat: number, lng: number, label?: string): string {
  const params = new URLSearchParams();
  params.set("ll", `${lat},${lng}`);
  if (label) params.set("q", label);
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
