/**
 * v1.18.0 — Inspirations-Liste für die Landing-Page.
 *
 * Heute statisch — bewusst generisch gehalten (keine konkreten Daten/
 * Preise/Termine, das wäre Anti-Halluzinations-Verstoß: wir wissen
 * nicht ob ein bestimmtes Hotel oder ein bestimmter Preis stimmt).
 *
 * Inspiration-Karten zeigen Reise-Konzepte als Anker für das Beratungs-
 * gespräch beim Reisebüro — „so könnte deine Travel-Concierge-Reise
 * aussehen". Konkrete Buchungs-Daten kommen mit Phase 2 (echte
 * Reisebüro-API + Tenant-Branding).
 *
 * Harald kann später echte Daten einspielen — die Struktur ist trip-
 * konzept-agnostisch.
 */

export type InspirationCategory =
  | "city-break"     // Städtereise
  | "nature"         // Wandern, Outdoor
  | "culture"        // Kultur-/Bildungsreise
  | "premium"        // Luxus/Cruise
  | "family"         // Familien-Klassiker
  | "adventure";     // Aktiv/Exotik

export interface InspirationEntry {
  /** Slug für stabile keys, falls später Detail-Seite kommt. */
  id: string;
  title: string;
  /** Kurzbeschreibung (1-2 Sätze, kein Werbe-Sprech). */
  description: string;
  /** Emoji als visueller Anker. */
  icon: string;
  category: InspirationCategory;
  /** Tagesabschätzung als Range, generisch (kein konkretes Datum). */
  durationLabel: string;
  /** Was Travel Concierge dabei besonders unterstützt. */
  highlights: string[];
  /**
   * Optional: Quelle / Veranstalter — wenn von Reisebüro vorgeschlagen.
   * Heute überall „RCMK-Pilot-Vorschlag" — später per Tenant.
   */
  source?: string;
}

export const INSPIRATIONS: InspirationEntry[] = [
  {
    id: "city-london",
    title: "Städtereise London",
    description:
      "Highlights, Hidden Gems und Foodie-Spots in 4–5 Tagen. Klassisches Travel-Concierge-Beispiel — die RCMK-Pilot-Reise hat genau dieses Format.",
    icon: "🇬🇧",
    category: "city-break",
    durationLabel: "4–5 Tage",
    highlights: [
      "Place-Library mit kuratierten Sehenswürdigkeiten",
      "Live-Wetter + TfL-Tube-Status",
      "AI-Concierge für spontane Fragen",
    ],
    source: "RCMK-Pilot-Vorschlag",
  },
  {
    id: "city-paris",
    title: "Wochenende Paris",
    description:
      "Verlängertes Wochenende rund um ein Highlight (Geburtstag, Jahrestag). Travel Concierge bündelt Reservierungen + Foto-Galerie.",
    icon: "🗼",
    category: "city-break",
    durationLabel: "3 Tage",
    highlights: [
      "Reservierungs-Tracker für Restaurants",
      "Mehrsprachen-Phrasebook",
      "Gemeinsame Foto-Galerie der Reisegruppe",
    ],
    source: "Inspirations-Vorschlag",
  },
  {
    id: "nature-dolomites",
    title: "Wandern in den Dolomiten",
    description:
      "Hütten-Tour mit Tages-Etappen, Höhenmeter-Tracking und Wetter-Warnungen. Die App wird zum digitalen Wanderführer.",
    icon: "🏔️",
    category: "nature",
    durationLabel: "5–7 Tage",
    highlights: [
      "Tages-Etappen mit Höhenprofil",
      "Wetter-Frühwarnung über Open-Meteo",
      "Notfall-Kontakte + Bergrettungs-Nummern",
    ],
    source: "Inspirations-Vorschlag",
  },
  {
    id: "culture-tuscany",
    title: "Toskana-Rundreise",
    description:
      "Florenz, Siena, San Gimignano über 10 Tage mit Mietwagen. Travel Concierge kuratiert Sehenswürdigkeiten + Restaurants pro Etappe.",
    icon: "🍷",
    category: "culture",
    durationLabel: "8–10 Tage",
    highlights: [
      "Etappen-Programm pro Stadt",
      "Restaurant-Reservierungs-Manager",
      "Reise-Rückblick nach Aufenthalt",
    ],
    source: "Inspirations-Vorschlag",
  },
  {
    id: "premium-norway",
    title: "Norwegen Fjord-Reise",
    description:
      "Kombination aus Stadtkern (Bergen/Oslo) und Fjord-Erlebnissen. Hochwertig kuratiert mit Hurtigruten- oder Cruise-Anschluss.",
    icon: "⛴️",
    category: "premium",
    durationLabel: "7–10 Tage",
    highlights: [
      "Cruise-Routen-Integration",
      "Wal-/Polarlicht-Hinweise",
      "Offline-fähig für Funklöcher",
    ],
    source: "Inspirations-Vorschlag",
  },
  {
    id: "adventure-marocco",
    title: "Marokko Königsstädte",
    description:
      "Marrakesch, Fes, Chefchaouen + Wüsten-Übernachtung. Travel Concierge bündelt Phrasebook (DE↔AR), Währungs-Konverter, Sicherheits-Hinweise.",
    icon: "🐪",
    category: "adventure",
    durationLabel: "10–14 Tage",
    highlights: [
      "Mehrsprachen-Phrasebook (DE/EN/AR)",
      "Währungs-Umrechnung MAD",
      "Sicherheits- + Notfall-Kontakte",
    ],
    source: "Inspirations-Vorschlag",
  },
];
