export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Accommodation {
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  coordinates: Coordinates;
  mapUrl: string;
  image?: string;
  notes?: string;
  phone?: string;
}

export interface Flight {
  date: string;
  departure: string;
  arrival: string;
  from: string;
  to: string;
  flightNumber?: string;
  airline?: string;
  terminal?: string;
  duration?: string;
}

export type AlertType = "warning" | "info" | "success";

export interface Alert {
  type: AlertType;
  icon: string;
  title?: string;
  text: string;
  validFrom?: string;
  validUntil?: string;
}

export type ProgramItemType =
  | "flight"
  | "activity"
  | "food"
  | "accom"
  | "alternative"
  | "transport"
  | "free";

export interface ProgramItem {
  time: string;
  label: string;
  type: ProgramItemType;
  icon: string;
  highlight?: boolean;
  coordinates?: Coordinates;
  bookingUrl?: string;
  note?: string;
  duration?: string;
}

export type MapPointCategory =
  | "sight"
  | "food"
  | "transport"
  | "accommodation"
  | "hidden";

export interface MapPoint {
  name: string;
  coordinates: Coordinates;
  category: MapPointCategory;
  icon?: string;
  day?: number;
}

export interface RainyAlternative {
  title: string;
  note?: string;
  items: ProgramItem[];
}

export interface Day {
  /** Display label like "Mo, 18. Mai". */
  date: string;
  /** ISO date (YYYY-MM-DD) used for weather matching. */
  isoDate?: string;
  title: string;
  icon: string;
  color: string;
  summary: string;
  weatherHint?: string;
  items: ProgramItem[];
  mapPoints: MapPoint[];
  tips: string[];
  rainyAlternative?: RainyAlternative;
}

export type ReservationStatus = "offen" | "reserviert" | "erledigt";
export type ReservationPriority = "hoch" | "mittel" | "niedrig";

export interface Reservation {
  id: string;
  name: string;
  when: string;
  day: number;
  status: ReservationStatus;
  priority: ReservationPriority;
  icon: string;
  note?: string;
  bookingUrl?: string;
  phone?: string;
  address?: string;
  coordinates?: Coordinates;
}

export interface HiddenPlace {
  name: string;
  description: string;
  icon: string;
  coordinates: Coordinates;
  image?: string;
  bestTime?: string;
  category?: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  href: string;
  description?: string;
  color?: "navy" | "gold" | "warning" | "success" | "info";
}

export type ParticipantRole = "celebrant" | "organizer" | "companion";

export interface TripParticipant {
  /** First name only is fine for display ("Andrea"). */
  name: string;
  role: ParticipantRole;
  /** Optional short bio shown on tap or in AI context. */
  bio?: string;
  /** Brand-friendly accent color (hex) for avatar background fallback. */
  avatarColor?: string;
  /** Optional emoji marker (e.g. cake for celebrant). */
  emoji?: string;
  /** Photo URL (preferred over color+initial when set). E.g. "/images/Andrea.jpg" */
  avatarImage?: string;
}

export interface TripOccasion {
  /** Headline: "60. Geburtstag von Andrea" */
  title: string;
  /** Why this trip exists / what makes it special. */
  reason?: string;
  /** Optional: which day/item is the highlight. */
  highlightLabel?: string;
  icon?: string;
}

export interface Trip {
  slug: string;
  destination: string;
  subtitle: string;
  /** Path to hero image in /public, e.g. "/images/london-hero.jpg" */
  heroImage?: string;
  /** Optional fallback color gradient (CSS), used when heroImage is missing. */
  heroGradient?: string;
  /**
   * If true (default when heroImage is set), the image is assumed to contain
   * the trip title/dates baked in – so the overlay text is suppressed.
   * Set explicitly to false for plain photos that still need a text overlay.
   */
  heroImageContainsTitle?: boolean;
  group: string;
  occasion?: string;
  /** Structured occasion data – preferred over the legacy `occasion` string. */
  occasionDetails?: TripOccasion;
  /** Named travellers – enables personalization in UI + AI. */
  participants?: TripParticipant[];

  accommodation: Accommodation;
  flights: { outbound: Flight; inbound: Flight };
  alerts: Alert[];
  days: Day[];
  reservations: Reservation[];
  hiddenPlaces: HiddenPlace[];
  quickActions: QuickAction[];

  mapCenter: Coordinates;
  mapZoom: number;

  weatherLocation: {
    lat: number;
    lng: number;
    name: string;
    timezone: string;
  };
}
