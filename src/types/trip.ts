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
  /** Hint to find the front door / entrance (e.g. "neben Coco Nails"). */
  entranceHint?: string;
  /** Path under /public to an annotated photo showing the entrance +
   *  key-box location (typically what the host sent in WhatsApp). */
  entranceImage?: string;
  /** Alt text for the entrance image (accessibility). */
  entranceImageAlt?: string;
  /** Floor / unit info (e.g. "Top Floor, Flat 3 — kein Lift"). */
  floorInfo?: string;
  /** Key collection: where the lockbox is + the code + scramble reminder. */
  keyAccess?: {
    location: string;
    code: string;
    scrambleReminder?: string;
  };
  /** Step-by-step door-opening instructions if non-trivial. */
  doorInstructions?: string[];
  /** WiFi credentials shown prominently inside the flat. */
  wifi?: {
    network: string;
    password: string;
    note?: string;
  };
  /** Heating/AC operating instructions specific to the unit. */
  climate?: {
    heating?: string;
    cooling?: string;
    warning?: string;
  };
  /** House rules summary (smoking, noise, etc.). */
  houseRules?: string[];
  /** Local emergency contact (caretaker), separate from hosts. */
  emergencyContact?: {
    name: string;
    phone: string;
    note?: string;
  };
  /** Host details (booking platform contact, friendly names). */
  hosts?: {
    names: string;
    company?: string;
    contactNote?: string;
  };
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
  /** Booking reference / PNR (6-char code from Ryanair / airline). */
  bookingReference?: string;
  /** Whether check-in is already done online (boarding passes generated). */
  checkedIn?: boolean;
  /** Per-participant seat assignments. Key is participant.name. */
  seats?: Record<string, string>;
  /** Direct deep-link / URL for the airline check-in or "manage booking" tool. */
  manageUrl?: string;
  /** Airline mobile-app deep-link (e.g. "ryanair://"). */
  airlineAppUrl?: string;
  /** App Store / Play Store URL for the airline app (fallback). */
  airlineAppStoreUrl?: string;
  /** Free-text note about luggage / baggage / hand-carry rules. */
  baggageNote?: string;
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

export type DisruptionType = "strike" | "closure" | "delay" | "maintenance";

export interface TransportDisruption {
  id: string;
  type: DisruptionType;
  /** Service name e.g. "London Tube" */
  service: string;
  icon: string;
  /** ISO 8601 with timezone, e.g. "2026-05-19T12:00:00+01:00" */
  startIso: string;
  /** ISO 8601 with timezone, exclusive end (Strike ends BEFORE this time) */
  endIso: string;
  /** Short label for pill, e.g. "Tube-Streik" */
  shortLabel: string;
  /** Longer text for the alert banner */
  description: string;
  /** Recommended workarounds */
  alternatives: string[];
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
  /**
   * v1.7.1 — Verlinkung zur Place-Library für bidirektionalen Status-
   * Sync zwischen Programm-Tab und Wunschliste-Tab. Wenn gesetzt, zeigt
   * das TimelineItem rechts einen Status-Indikator (○ / 💭 / 👁 / ✓),
   * der bei Tap ein Action-Sheet öffnet.
   *
   * IDs müssen mit `trip.places[].id` matchen.
   */
  placeId?: string;
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
  /** Optional menu preview shown when the reservation is expanded. */
  menu?: ReservationMenu;
}

export interface ReservationMenu {
  /** Menu title, e.g. "goûtea — Afternoon Tea" */
  title: string;
  /** Optional subtitle (serving window, tagline). */
  subtitle?: string;
  /** Course list — ordered, displayed as the menu's main highlight. */
  courses?: ReservationMenuCourse[];
  /** Optional drink categories (Champagne, Coffee, Tea, etc). */
  drinkCategories?: ReservationMenuDrinkCategory[];
  /** Free-text footer, e.g. allergen advice / dress code reminder. */
  footnote?: string;
  /** Source URL or PDF for users wanting full detail. */
  sourceUrl?: string;
}

export interface ReservationMenuCourse {
  name: string;
  description?: string;
}

export interface ReservationMenuDrinkCategory {
  label: string;
  items: string[];
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

export interface EmergencyContact {
  label: string;
  phone: string;
  description?: string;
  urgent?: boolean;
}

export interface Embassy {
  name: string;
  address: string;
  coordinates?: Coordinates;
  phone: string;
  emergencyPhone?: string;
  website?: string;
  openingHours?: string;
}

export type MedicalType = "pharmacy" | "hospital" | "doctor" | "dentist";

export interface MedicalLocation {
  type: MedicalType;
  name: string;
  address: string;
  coordinates: Coordinates;
  open24h?: boolean;
  phone?: string;
  note?: string;
}

export interface EmergencyInfo {
  country: string;
  countryCode: string;
  contacts: EmergencyContact[];
  embassy?: Embassy;
  medical: MedicalLocation[];
  insuranceTips?: string[];
}

export type RouteDifficulty = "easy" | "moderate" | "challenging";
export type RouteSurface = "park" | "street" | "mixed";

export interface RunningRoute {
  id: string;
  name: string;
  shortDescription: string;
  distanceKm: number;
  estimatedMinutes: number;
  difficulty: RouteDifficulty;
  surface: RouteSurface;
  loop: boolean;
  startCoordinates: Coordinates;
  /** Google Maps directions URL (multi-waypoint OK). */
  mapsUrl: string;
  highlights: string[];
  bestTime?: string;
  /** Suggested by (e.g. a participant name). */
  suggestedBy?: string;
  notes?: string;
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

  /**
   * Optionale alternative Tage-Liste (z.B. vom KI-Companion aufgrund
   * Wetter / Streik / spontaner Änderung erstellt).
   *
   * Array hat dieselbe Länge wie `days`. An Indizes wo nichts geändert
   * werden soll: `null` einsetzen → fällt auf `days[i]` zurück.
   *
   * Aktiv/Inaktiv-Wahl liegt im Client (localStorage via useTripVariant).
   */
  alternativeDays?: Array<Day | null>;

  /**
   * Beschreibt die Alternative für den Variant-Switcher im UI.
   * Nur relevant wenn `alternativeDays` gesetzt ist.
   */
  alternativeDaysMeta?: {
    /** Kurzlabel für die Toggle-Pill der ALTERNATIVE-Variante
     *  (z.B. "Original-Programm", "Regen-Variante") */
    label: string;
    /** Kurzlabel für die Toggle-Pill der ORIGINAL-Variante.
     *  Default: "Original". Wenn `days` die "Leger"-Version enthält
     *  und `alternativeDays` das ursprünglich Geplante, kann man hier
     *  z.B. "Leger" setzen damit der Switcher sinnvolle Labels zeigt. */
    originalLabel?: string;
    /** Sub-Text wenn ORIGINAL-Variante aktiv (was bedeutet das) */
    originalSubtitle?: string;
    /** Sub-Text wenn ALTERNATIVE-Variante aktiv */
    alternativeSubtitle?: string;
    /** Erklärtext was geändert wurde + warum */
    description: string;
    /** Wer hat's vorgeschlagen (z.B. "KI-Companion, 21.05.2026") */
    source: string;
    /** Welche Day-Indizes sind tatsächlich anders (für UI-Anzeige) */
    affectedDayIndices: number[];
  };

  /**
   * Welche Variante new visitors als Default sehen (nur wenn noch keine
   * localStorage-Wahl getroffen wurde). Standard: "original".
   */
  defaultVariant?: "original" | "alternative";
  /** Structured transport/service disruptions with exact 24h time windows */
  disruptions?: TransportDisruption[];
  days: Day[];
  reservations: Reservation[];
  hiddenPlaces: HiddenPlace[];

  /**
   * v1.7.0 — Kuratierte Place-Library für die Wunschliste-Tab.
   * Sehenswürdigkeiten, Hidden Gems, Filmspots, Foodie-Spots etc.
   * mit Verfügbarkeits-Info (Öffnungszeiten, Reservation).
   *
   * In Travel Live (Phase C) wird das in eine globale Place-DB
   * migrieren — heute noch pro Trip.
   */
  places?: import("./place").Place[];

  /**
   * v1.9.0 — Zeitlich gebundene Events während des Reisezeitraums.
   * Wiederkehrende Annual-Events (Chelsea Flower Show, Wimbledon),
   * Sonderausstellungen, Konzerte, Pop-Ups.
   *
   * Banner im Programm-Tab matched Events automatisch gegen
   * Reise-Daten — User sieht nur was zur Reise passt.
   *
   * Anlass: Live-London-Reise hat Chelsea Flower Show verpasst weil
   * keine Event-Daten in der App waren.
   */
  events?: import("./event").Event[];

  quickActions: QuickAction[];
  emergencyInfo?: EmergencyInfo;
  runningRoutes?: RunningRoute[];
  restaurants?: import("./restaurant").Restaurant[];

  mapCenter: Coordinates;
  mapZoom: number;

  weatherLocation: {
    lat: number;
    lng: number;
    name: string;
    timezone: string;
  };
  /** Primary currency at the destination, e.g. "GBP". Default "EUR" if omitted. */
  currency?: string;
  /** Traveler's home currency, e.g. "EUR". Default "EUR". */
  homeCurrency?: string;
}
