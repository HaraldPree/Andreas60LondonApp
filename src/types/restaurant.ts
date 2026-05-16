import type { Coordinates } from "./trip";

export type RestaurantPriceLevel = 1 | 2 | 3 | 4;
export type RestaurantBookingPlatform =
  | "thefork"
  | "opentable"
  | "quandoo"
  | "phone"
  | "walkin"
  | "website";

export interface Restaurant {
  id: string;
  name: string;
  /** Short cuisine label, e.g. "British Pub", "Italian", "Pâtisserie" */
  cuisine: string;
  /** 1 (£) – 4 (££££) */
  priceLevel: RestaurantPriceLevel;
  area: string;
  coordinates: Coordinates;
  address: string;
  bookingPlatform: RestaurantBookingPlatform;
  bookingUrl?: string;
  phone?: string;
  /** Optional: which trip day this restaurant fits best (0-based) */
  recommendedForDay?: number;
  /** Free-form: "Late Night", "Family", "Birthday", etc. */
  recommendedFor?: string;
  /** "Walk-in OK", "Reservation strongly recommended", etc. */
  note?: string;
  /** 1-2 sentence description with hook */
  description?: string;
}
