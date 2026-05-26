/**
 * v1.19.0 — Tenant-Branding-Vorbereitung (white-label-ready).
 *
 * Heute ein Tenant (RCMK-Pilot, betrieben von hp+ consulting).
 * Strukturell darauf vorbereitet dass künftig weitere Reisebüros /
 * Veranstalter (ÖVT, KTP, Einzelbüros) ohne Code-Änderung onboarded
 * werden können — jeweils mit eigenem Brand-Auftritt, eigenem Footer-
 * Reisebüro-Block, eigener Kontakt-Nummer, eigenen Inspirations.
 *
 * Strategischer Kontext: CLAUDE.md Hybrid-Strategie Phase 2 (Multi-
 * Tenant 2027) braucht diese Schicht.
 *
 * **Was heute schon abstrahiert ist**: Markenname, Tagline, Reisebüro-
 * Pilot-Info, Plattform-Eigner-Info, Kontakt-Daten, Inspirations-Set.
 *
 * **Was bewusst noch nicht**: Farben + Fonts. Die liegen heute in
 * tailwind.config.ts als Custom-Colors. Multi-Theme über CSS-Custom-
 * Properties wäre der nächste Schritt — kommt mit Tenant 2 wenn echte
 * Brand-Anforderung da ist.
 */

import type { InspirationEntry } from "@/data/inspirations";

export interface TenantConfig {
  /** Eindeutiger Slug — wird später z.B. zur Subdomain-Auflösung genutzt. */
  id: string;

  /** Was im User-sichtbaren Brand-Auftritt steht. */
  brand: BrandInfo;

  /** Wer den Pilot/das Reisebüro betreibt (Footer-Block, Anfragen-Routing). */
  agency: AgencyInfo;

  /** Wer die Plattform technisch betreibt (= hp+, Footer-Hinweis). */
  owner: OwnerInfo;

  /** Wohin Beratungs-Anfragen / Bug-Reports / Feedback gehen. */
  contact: ContactInfo;

  /**
   * Reise-Konzept-Karten für die Landing-Page „Inspirationen"-Sektion.
   * Optional — wenn nicht gesetzt, nimmt der Caller den globalen
   * Default aus `src/data/inspirations.ts`.
   */
  inspirations?: InspirationEntry[];
}

export interface BrandInfo {
  /** Marken-Name in User-sichtbaren Texten ("Travel Concierge"). */
  name: string;
  /** Tagline auf Landing-Page-Hero ("dein persönlicher Reisebegleiter"). */
  tagline: string;
  /** Untertitel auf Landing-Page ("Deine Reise – elegant in der Tasche"). */
  description: string;
  /**
   * Markenfreiheits-Hinweis — wenn der Marken-Name noch nicht final
   * geprüft ist (z.B. „Travel Concierge" 2026: Entwicklungs-Marke).
   * Wird intern für Doku/Warnung genutzt, nicht im UI angezeigt.
   */
  trademarkStatus?: "registered" | "in-progress" | "working-name";
}

export interface AgencyInfo {
  /** Voller Name ("ReiseCenter Mader-Kuoni"). */
  name: string;
  /** Abkürzung für Headers / Tabellen ("RCMK"). */
  shortName: string;
  /** Web-Präsenz (ohne Protokoll: "www.meinreisecenter.at"). */
  website: string;
  /** Standort als kurze Angabe ("Wien-Liesing"). */
  city: string;
}

export interface OwnerInfo {
  /** Firmenname ("hp+ consulting & marketing gmbh"). */
  name: string;
  /** Stadt ("Leonding"). */
  city: string;
  /** Land-Code ("AT"). */
  country: string;
}

export interface ContactInfo {
  /**
   * WhatsApp-Nummer im wa.me-Format (international, ohne `+`, ohne `00`).
   * Wird für „Beratung anfragen" + „Problem melden" + Feedback genutzt.
   */
  whatsapp: string;
  /** Optional: E-Mail. */
  email?: string;
  /** Human-friendly Telefon-Anzeige ("+43 699 18 88 80 02"). */
  phoneDisplay?: string;
  /** Wer kontaktiert wird ("Harald, hp+"). */
  displayName: string;
}
