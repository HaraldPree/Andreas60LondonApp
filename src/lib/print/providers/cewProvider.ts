import type { PrintProvider } from "../PrintProvider";
import { PrintProviderUnavailableError } from "../types";

/**
 * v1.15.0 STUB — CEWE (Oldenburg, DE).
 *
 * **Strategische Wahl**: CEWE ist Markt-Marktführer in DACH, börsen-
 * notiert, gute Skaleneffekte. Print-Partner-Recherche (Mai 2026) hat
 * CEWE als Rollout-Partner empfohlen — für die breitere Vermarktung
 * nach Phase-2-Multi-Tenant.
 *
 * **Status**: noch nicht aktiv. Brauchen:
 * - CEWE Manufaktur-API-Zugang (existiert für B2B)
 * - oder Partner-Integration über Affiliate-Programm
 * - Format-Mapping CEWE-Produkte → unsere PrintFormat
 *
 * CEWE wird vermutlich der Default-Provider sobald Phase 2 läuft —
 * HappyFoto bleibt für persönliche Kunden + Premium-Linie als Backup.
 */
export const cewProvider: PrintProvider = {
  id: "cewe",
  name: "CEWE Fotobücher",
  description:
    "DACH-Marktführer, breite Produkt-Palette, ausgereiftes Lieferketten-Setup. Geplant für Rollout-Phase. (Noch nicht aktiviert — wartet auf Manufaktur-API.)",

  async listProducts() {
    throw new PrintProviderUnavailableError(
      "cewe",
      "listProducts",
      "Stub — siehe Provider-Doku oben. Aktuell Mock-Provider nutzen.",
    );
  },

  async createPreview() {
    throw new PrintProviderUnavailableError(
      "cewe",
      "createPreview",
      "Stub — siehe Provider-Doku oben.",
    );
  },

  async createOrder() {
    throw new PrintProviderUnavailableError(
      "cewe",
      "createOrder",
      "Stub — siehe Provider-Doku oben.",
    );
  },

  async getOrderStatus(orderId: string) {
    throw new PrintProviderUnavailableError(
      "cewe",
      `getOrderStatus(${orderId})`,
      "Stub — siehe Provider-Doku oben.",
    );
  },
};
