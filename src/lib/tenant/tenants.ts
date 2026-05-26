import type { TenantConfig } from "./types";

/**
 * v1.19.0 — Tenant-Registry.
 *
 * Heute genau ein Eintrag: `rcmkPilot`. Strukturell vorbereitet für
 * Multi-Tenant. Sobald Tenant 2 (z.B. ÖVT oder ein anderes Reisebüro)
 * kommt, einfach neuen Eintrag hier ergänzen + `current.ts`-Resolver
 * erweitern.
 *
 * Bewusste Trennung von `owner` (hp+, Plattform-Betreiber) und `agency`
 * (RCMK, Reisebüro-Pilot) — das ist die strategische hp+-Positionierung:
 *  - Code-IP + Plattform = hp+
 *  - Endkunden-Kontakt + Reise-Verkauf = Reisebüro (RCMK heute, andere später)
 */

export const RCMK_PILOT: TenantConfig = {
  id: "rcmk",
  brand: {
    name: "Travel Concierge",
    tagline: "Dein persönlicher Reisebegleiter",
    description: "Deine Reise – elegant in der Tasche",
    trademarkStatus: "working-name",
  },
  agency: {
    name: "ReiseCenter Mader-Kuoni",
    shortName: "RCMK",
    website: "www.meinreisecenter.at",
    city: "Wien-Liesing",
  },
  owner: {
    name: "hp+ consulting & marketing gmbh",
    city: "Leonding",
    country: "AT",
  },
  contact: {
    whatsapp: "4369918888002",
    phoneDisplay: "+43 699 18 88 80 02",
    displayName: "Harald, hp+",
  },
  // inspirations: wird in der Caller-Logik via `getInspirationsForTenant()`
  // auf den globalen Default aus `src/data/inspirations.ts` aufgelöst,
  // wenn hier nichts gesetzt ist. Für Tenant 2 kann hier ein eigenes
  // Set hinterlegt werden.
};

/**
 * Alle bekannten Tenants. Aktuell nur RCMK-Pilot — strukturell
 * vorbereitet für mehrere.
 */
export const TENANTS: Record<string, TenantConfig> = {
  [RCMK_PILOT.id]: RCMK_PILOT,
};
