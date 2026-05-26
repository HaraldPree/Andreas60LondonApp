/**
 * v1.15.0 — Print-Provider Registry.
 *
 * Zentrale Stelle die alle verfügbaren Provider kennt + den aktiven
 * Provider liefert. App-Code soll **immer** über `getActivePrintProvider()`
 * gehen statt direkt einen Provider zu importieren — dann ist der
 * Wechsel via env-Variable trivial.
 *
 * Provider-Auswahl-Reihenfolge:
 *  1. `NEXT_PUBLIC_PRINT_PROVIDER` env-Variable (wenn gesetzt + bekannt)
 *  2. Default: `mock`
 *
 * Künftige Multi-Tenant-Variante (Phase 2): Provider-Auswahl pro
 * Tenant aus Datenbank/Config statt env. Dann wird hier nur die
 * Resolver-Logik geändert, App-Code bleibt unangetastet.
 */

import type { PrintProvider } from "./PrintProvider";
import { mockProvider } from "./providers/mockProvider";
import { happyFotoProvider } from "./providers/happyFotoProvider";
import { cewProvider } from "./providers/cewProvider";
import { saalProvider } from "./providers/saalProvider";

const PROVIDERS: Record<string, PrintProvider> = {
  [mockProvider.id]: mockProvider,
  [happyFotoProvider.id]: happyFotoProvider,
  [cewProvider.id]: cewProvider,
  [saalProvider.id]: saalProvider,
};

const DEFAULT_PROVIDER_ID = "mock";

/**
 * Liefert den aktuellen aktiven Provider. App-Code nutzt das.
 *
 * In Server-Komponenten + Client-Komponenten gleich aufrufbar.
 * `NEXT_PUBLIC_*` damit der Wert auch im Browser bekannt ist
 * (build-time-replacement durch Next.js).
 */
export function getActivePrintProvider(): PrintProvider {
  const envId =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_PRINT_PROVIDER
      : undefined;
  if (envId && PROVIDERS[envId]) return PROVIDERS[envId];
  return PROVIDERS[DEFAULT_PROVIDER_ID];
}

/**
 * Liefert einen spezifischen Provider per ID. Nutze das für Multi-
 * Provider-UI (Provider-Picker, Vergleichs-Ansicht).
 */
export function getPrintProvider(id: string): PrintProvider | null {
  return PROVIDERS[id] ?? null;
}

/**
 * Liefert alle registrierten Provider — sortiert: aktiver Provider
 * zuerst, dann Stubs.
 */
export function listAvailableProviders(): PrintProvider[] {
  const active = getActivePrintProvider();
  const rest = Object.values(PROVIDERS).filter((p) => p.id !== active.id);
  return [active, ...rest];
}
