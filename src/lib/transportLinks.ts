import type { Coordinates } from "@/types/trip";

/**
 * Google Maps direction URLs.
 *
 * IMPORTANT — destination format choice:
 *   Original implementation used `${label}/@${lat},${lng}` as the
 *   destination, hoping Google would treat the label as a display
 *   hint and the coords as the truth. In practice (May 2026 trip
 *   anecdote) Google's parser sometimes IGNORED the coords and
 *   geocoded the label literally — so "Duplex Flat near Oxford
 *   Street" got routed to Oxford Street instead of the actual
 *   apartment 200m away on Great Portland Street.
 *
 *   Fix: send ONLY the coordinates. They're unambiguous and Google
 *   never mis-geocodes them. The label still controls the button
 *   text in the UI (purely visual) but never enters the URL.
 */

export function googleDirectionsTransit(
  coords: Coordinates,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _label?: string,
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=transit`;
}

export function googleDirectionsWalking(
  coords: Coordinates,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _label?: string,
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=walking`;
}

export function uberDeepLink(coords: Coordinates, label?: string): string {
  const params = new URLSearchParams({
    action: "setPickup",
    pickup: "my_location",
    "dropoff[latitude]": coords.lat.toString(),
    "dropoff[longitude]": coords.lng.toString(),
  });
  if (label) params.set("dropoff[nickname]", label);
  return `https://m.uber.com/ul/?${params.toString()}`;
}

export function appleMapsDirections(
  coords: Coordinates,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _label?: string,
): string {
  // Apple Maps `daddr` (destination address) accepts plain "lat,lng".
  // We deliberately drop the `q` (name) param — same reason as the
  // Google fix above: Apple sometimes prefers the q-name and routes
  // wrong if the name resolves to a different known place.
  const params = new URLSearchParams();
  params.set("daddr", `${coords.lat},${coords.lng}`);
  params.set("dirflg", "r"); // r = transit
  return `https://maps.apple.com/?${params.toString()}`;
}

export function openTableUrl(restaurantName: string, city = "London"): string {
  const q = encodeURIComponent(`${restaurantName} ${city}`);
  return `https://www.opentable.co.uk/s?term=${q}`;
}

export function theForkUrl(restaurantName: string): string {
  const q = encodeURIComponent(restaurantName);
  return `https://www.thefork.co.uk/search?cityId=415144&searchText=${q}`;
}
