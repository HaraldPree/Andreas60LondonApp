import type { Coordinates } from "./trip";

/**
 * A user-added place that supplements (but doesn't modify) the trip data.
 * E.g. a location identified from a friend's photo, added to a specific day.
 */
export interface UserPlace {
  id: string;
  tripSlug: string;
  /** 0-based index into trip.days, or undefined for "Allgemein/unsortiert" */
  dayIndex?: number;
  /** Optional time label, e.g. "14:30" or "Nachmittag" */
  time?: string;
  name: string;
  description?: string;
  category?: string;
  coordinates?: Coordinates;
  address?: string;
  notes?: string;
  /** Suggested transit options inherited from identification */
  transitOptions?: string[];
  addedAt: string;
}
