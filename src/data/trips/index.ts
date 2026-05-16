import type { Trip } from "@/types/trip";
import { londonTrip } from "./london-2026";

export const trips: Trip[] = [londonTrip];

export function getTripBySlug(slug: string): Trip | undefined {
  return trips.find((trip) => trip.slug === slug);
}

export function getAllTripSlugs(): string[] {
  return trips.map((trip) => trip.slug);
}
