import type { TenantConfig } from "./types";
import type { InspirationEntry } from "@/data/inspirations";
import { INSPIRATIONS } from "@/data/inspirations";
import { RCMK_PILOT, TENANTS } from "./tenants";

/**
 * v1.19.0 — Liefert den aktuell aktiven Tenant.
 *
 * Heute: immer `RCMK_PILOT`. Strukturell vorbereitet für Auflösung
 * via env-Variable (`NEXT_PUBLIC_TENANT_ID`) oder Subdomain in Phase 2.
 *
 * Server- und Client-kompatibel (kein React-State, kein Window-
 * Zugriff). Damit auch aus `manifest.ts`, server-actions, API-Routes
 * heraus aufrufbar.
 */
export function getCurrentTenant(): TenantConfig {
  if (typeof process !== "undefined") {
    const envId = process.env.NEXT_PUBLIC_TENANT_ID;
    if (envId && TENANTS[envId]) return TENANTS[envId];
  }
  return RCMK_PILOT;
}

/**
 * Liefert die Inspirations-Liste für einen Tenant. Wenn der Tenant
 * keinen eigenen Set hat, kommt der globale Default aus
 * `src/data/inspirations.ts`. Wrapped damit Caller nie nullable
 * Inspirations händeln müssen.
 */
export function getInspirationsForTenant(
  tenant: TenantConfig,
): InspirationEntry[] {
  return tenant.inspirations && tenant.inspirations.length > 0
    ? tenant.inspirations
    : INSPIRATIONS;
}

/**
 * Convenience-Re-Export: Brand-Name. In vielen Komponenten wird nur
 * der Name gebraucht, direkter Aufruf kompakter als
 * `getCurrentTenant().brand.name`.
 */
export function getBrandName(): string {
  return getCurrentTenant().brand.name;
}
