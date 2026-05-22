import type { Coordinates } from "./trip";

/**
 * v1.9.0 — Event-Datenklasse für Reise-Begleiter.
 *
 * Anlass: Lukas-/Harald-Feedback nach London-Reise — die Chelsea Flower
 * Show 19.–23. Mai 2026 war GENAU während der Reise, aber nirgendwo
 * in der App sichtbar. Place-Library hat nur permanente Sehenswürdig-
 * keiten, zeitlich gebundene Events fehlten komplett.
 *
 * Drei Daten-Klassen werden unterschieden:
 *  1. Annual-Recurring: Chelsea Flower Show, Wimbledon, Notting Hill
 *     Carnival, Trooping the Colour … — kommt jedes Jahr
 *  2. Saisonal: Winter Wonderland, Sakura, Bonfire Night
 *  3. One-Off: Konzerte, Pop-Up-Ausstellungen, Premieren
 *
 * Phase v1.9.0: alle drei manuell pflegen.
 * Phase v1.10.0: AI-Pre-Trip-Recherche füllt es vor, User kuratiert.
 *
 * Anti-Halluzinations-Disziplin: jedes Event MUSS `source` + `lastVerified`
 * Felder haben — analog Place-Library.
 */

export type EventCategory =
  | "festival"      // Chelsea Flower Show, Glastonbury (Music-Fest mit Charakter)
  | "exhibition"    // Sonder-Ausstellung im V&A / Tate
  | "sport"         // Wimbledon, Marathon, Boat Race
  | "music"         // BST Hyde Park, BBC Proms, Konzerte
  | "culture"       // BAFTA, Royal Trooping, Lord Mayor's Show
  | "seasonal"      // Winter Wonderland, Sakura-Blüte
  | "market"        // Pop-Up-Märkte, Weihnachtsmärkte
  | "fireworks"     // Bonfire Night, NYE
  | "pride"         // Pride London, etc.
  | "other";

/** Recurring-Pattern für Annual-Events. Hilft beim Matchen mit Reisedatum. */
export type EventRecurring =
  | "annual-fixed-date"     // immer derselbe Termin (z.B. NYE 31.12.)
  | "annual-fixed-week"     // immer dieselbe Woche (z.B. Chelsea = 3. Mai-Woche)
  | "annual-bank-holiday"   // Notting Hill Carnival = August Bank Holiday
  | "biennial"              // alle 2 Jahre
  | "one-off"               // nur dieses Mal
  | "weekly"                // wiederkehrender Wochen-Event
  | null;

export interface Event {
  /** Stabile Slug-ID */
  id: string;
  name: string;
  category: EventCategory;
  /** Emoji oder spezifisches Icon */
  icon?: string;

  /** ISO-Datum (YYYY-MM-DD) — Beginn */
  startDate: string;
  /** ISO-Datum (YYYY-MM-DD) — Ende. Bei 1-Tages-Event = startDate */
  endDate: string;

  /** Veranstaltungs-Ort als Freitext (kann mehrere Locations haben) */
  location: string;
  /** Optional: präzise Koordinaten */
  coordinates?: Coordinates;

  /** 1-3 Sätze Beschreibung */
  description: string;
  /** Optional: Hinweise / Tipps für Besucher */
  visitorTips?: string[];

  /** Offizielle Website / Buchungs-URL */
  bookingUrl?: string;
  /** Kosten als Freitext: "gratis", "ab £45", "ticket-pflichtig" */
  cost?: string;
  /** Reservierung pflicht oder optional? */
  bookingRequired?: boolean;

  /** Wiederkehrendes Pattern (für künftige Reisen) */
  recurring?: EventRecurring;

  /** ISO-Datum letzter Verifikation. Anti-Halluzination */
  lastVerified: string;
  /** Quelle der Daten (offizielle Website, etc.) */
  source: string;

  /** Optional: nur sichtbar wenn Reise diese Stadt besucht */
  city?: string;

  /** Tags für Filter (fotogen, kostenlos, royal, kinderfreundlich) */
  tags?: string[];
}

/** Helper: matched ein Event mit einem Trip-Datums-Range? */
export function eventOverlapsTrip(
  event: Pick<Event, "startDate" | "endDate">,
  tripStartDate: string,
  tripEndDate: string,
): boolean {
  // Überlappung wenn event.start <= trip.end UND event.end >= trip.start
  return event.startDate <= tripEndDate && event.endDate >= tripStartDate;
}

/** Helper: ist ein Event an einem konkreten Reisetag aktiv? */
export function eventActiveOnDate(
  event: Pick<Event, "startDate" | "endDate">,
  date: string,
): boolean {
  return event.startDate <= date && event.endDate >= date;
}

/** Kategorie-Metadaten für UI-Anzeige */
export const EVENT_CATEGORY_META: Record<
  EventCategory,
  { label: string; icon: string }
> = {
  festival: { label: "Festival", icon: "🌸" },
  exhibition: { label: "Ausstellung", icon: "🖼️" },
  sport: { label: "Sport", icon: "🎾" },
  music: { label: "Musik", icon: "🎵" },
  culture: { label: "Kultur", icon: "🎭" },
  seasonal: { label: "Saisonal", icon: "🍂" },
  market: { label: "Markt", icon: "🥨" },
  fireworks: { label: "Feuerwerk", icon: "🎆" },
  pride: { label: "Pride", icon: "🏳️‍🌈" },
  other: { label: "Sonstiges", icon: "📅" },
};
