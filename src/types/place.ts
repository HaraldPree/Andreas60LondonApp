import type { Coordinates } from "./trip";

/**
 * v1.7.0 — Place-Library für Wunschliste-Tab.
 *
 * Erste Iteration des Travel-Live-Konzepts: pro Reise eine kuratierte
 * Liste von Sehenswürdigkeiten / Hidden Gems / Foodie-Spots, die der
 * User markieren kann (offen / will-sehen / erledigt).
 *
 * Bewusst getrennt von `ProgramItem`:
 *  - ProgramItem = Punkt im konkreten Tagesablauf (Zeit, Tag)
 *  - Place      = abstrakte Sehenswürdigkeit (zeitlos, mit Öffnungs-
 *                  zeiten und Verfügbarkeit)
 *
 * Cross-Trip-Bucket (in Travel Live Phase C) wird auf dieser Struktur
 * aufbauen — Places werden dann global statt pro Trip leben.
 */

export type PlaceCategory =
  | "classic"      // Klassische Sightseeing-Highlights
  | "hidden"       // Off-Beat / Hidden Gems
  | "film"         // Filmspots
  | "market"       // Märkte
  | "museum"       // Museen (alle gratis i.d.R.)
  | "park"         // Parks & grüne Lungen
  | "skyline"      // Aussichten / Skyline
  | "greenwich"    // Greenwich-Komplex
  | "westside"     // Notting Hill / West-London
  | "foodie"       // Foodie-Highlights mit Sehenswürdigkeits-Charakter
  | "transport";   // Transport-Erlebnisse (Boot, DLR, etc.)

export type PlaceAvailabilityType =
  | "always-open"        // 24/7 zugänglich (z.B. Außenfassade Big Ben)
  | "scheduled"          // Hat Öffnungszeiten
  | "by-appointment"     // Reservierung nötig
  | "closed-to-public";  // Aktuell geschlossen (Alice-Pattern)

export type WeekDay = "Mo" | "Di" | "Mi" | "Do" | "Fr" | "Sa" | "So";

export interface PlaceAvailability {
  type: PlaceAvailabilityType;
  /** Wenn type === "scheduled": an welchen Wochentagen offen */
  openDays?: WeekDay[];
  /** Öffnungs-Stunden als Freitext, z.B. "10:00-17:30" */
  openHours?: string;
  /** Zusätzliche Anmerkung (z.B. "nur Sonntag + Bank Holidays") */
  note?: string;
  /** Ob Reservierung empfohlen oder pflicht ist */
  reservationRequired?: boolean;
  /** ISO-Datum letzter Verifikation. Pflicht — verhindert Halluzinationen */
  lastVerified: string;
  /** Quelle der Info (offizielle Website, Reiseleiter, lokaler Hinweis) */
  source: string;
}

export interface Place {
  /** Stabile ID, slug-style: "tower-of-london", "borough-market", … */
  id: string;
  /** Anzeige-Name */
  name: string;
  category: PlaceCategory;
  /** Emoji oder Lucide-Icon-Name. Default: Kategorie-Icon */
  icon?: string;
  coordinates: Coordinates;
  /** 1-2 Sätze Beschreibung, sachlich, nicht halluziniert */
  description: string;
  /** Adresse als Freitext, optional */
  address?: string;
  /** Offizielle Website (Buchung / Info) */
  bookingUrl?: string;
  /** Wann + wie kann man hin */
  availability: PlaceAvailability;
  /** Kosten als Freitext, z.B. "gratis", "£35", "£12 + Pflicht-Drink" */
  cost?: string;
  /** Frei wählbare Tags für Filter (fotogen, indoor, outdoor, regen-tauglich, kinderfreundlich) */
  tags?: string[];
  /** Nur bei category === "film": Film-Referenz + Szene-Hinweis */
  filmContext?: string;
  /** IDs anderer Places die zusammen Sinn ergeben (Map-Nähe etc.) */
  related?: string[];
}

/**
 * User-Status pro Place. Vier mögliche Werte (v1.7.1).
 *
 *  - "open":      Default, nicht markiert
 *  - "wantToSee": 💭 Auf meine Wunschliste
 *  - "passed":    👁 Vorbei / gesehen (außen besichtigt, im Vorbeigehen)
 *  - "done":      ✓ Erledigt (vollständig erlebt — innen, drin, durchgemacht)
 *
 * Naming: bewusst „Vorbei" für die Außen-Variante (Variante A im
 * v1.7.1 Wording-Vorschlag). Klares mentales Modell: vorbeigegangen
 * ≠ erlebt.
 */
export type PlaceStatus = "open" | "wantToSee" | "passed" | "done";

/** Per-Person Status-Map (in localStorage). */
export type PlaceStatusMap = Record<string, PlaceStatus>;

/** Metadaten zu Kategorien — UI nutzt das für Header + Icon. */
export interface CategoryMeta {
  key: PlaceCategory;
  label: string;
  icon: string;
  description: string;
}

export const CATEGORY_META: CategoryMeta[] = [
  {
    key: "classic",
    label: "Klassische Highlights",
    icon: "🏰",
    description: "Die Must-See-Sehenswürdigkeiten von London",
  },
  {
    key: "hidden",
    label: "Hidden Gems",
    icon: "🎨",
    description: "Off-Beat-Spots abseits der Touristen-Routen",
  },
  {
    key: "film",
    label: "Filmspots",
    icon: "🎬",
    description: "Locations aus berühmten Filmen",
  },
  {
    key: "market",
    label: "Märkte",
    icon: "🥪",
    description: "Foodie-Märkte und Antiquitäten-Buden",
  },
  {
    key: "museum",
    label: "Museen",
    icon: "🏛️",
    description: "Die großen (kostenlosen) Museen",
  },
  {
    key: "park",
    label: "Parks & Grüne Lungen",
    icon: "🌳",
    description: "Pausen-Spots und Natur in der City",
  },
  {
    key: "skyline",
    label: "Aussichten & Skyline",
    icon: "🌇",
    description: "London von oben",
  },
  {
    key: "greenwich",
    label: "Greenwich",
    icon: "🚣",
    description: "Königliches Greenwich am Themse-Ufer",
  },
  {
    key: "westside",
    label: "Notting Hill / West",
    icon: "🌈",
    description: "Pastell-Häuser und West-London-Charme",
  },
  {
    key: "foodie",
    label: "Foodie-Highlights",
    icon: "🍝",
    description: "Restaurants und Bars mit Charakter",
  },
  {
    key: "transport",
    label: "Wege & Fahrten",
    icon: "🚆",
    description: "Boot, DLR, Doppeldecker — Transport als Erlebnis",
  },
];
