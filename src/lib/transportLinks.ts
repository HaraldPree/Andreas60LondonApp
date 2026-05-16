import type { Coordinates } from "@/types/trip";

export function googleDirectionsTransit(coords: Coordinates, label?: string): string {
  const dest = label
    ? `${encodeURIComponent(label)}/@${coords.lat},${coords.lng}`
    : `${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=transit`;
}

export function googleDirectionsWalking(coords: Coordinates, label?: string): string {
  const dest = label
    ? `${encodeURIComponent(label)}/@${coords.lat},${coords.lng}`
    : `${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=walking`;
}

export function uberDeepLink(coords: Coordinates, label?: string): string {
  const params = new URLSearchParams({
    action: "setPickup",
    "pickup": "my_location",
    "dropoff[latitude]": coords.lat.toString(),
    "dropoff[longitude]": coords.lng.toString(),
  });
  if (label) params.set("dropoff[nickname]", label);
  return `https://m.uber.com/ul/?${params.toString()}`;
}

export function appleMapsDirections(coords: Coordinates, label?: string): string {
  const params = new URLSearchParams();
  params.set("daddr", `${coords.lat},${coords.lng}`);
  params.set("dirflg", "r"); // r = transit
  if (label) params.set("q", label);
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
