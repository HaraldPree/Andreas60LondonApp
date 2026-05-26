import type { PrintProvider } from "../PrintProvider";
import { PrintProviderUnavailableError } from "../types";

/**
 * v1.15.0 STUB — Saal Digital.
 *
 * **Strategische Wahl**: Premium-/Substitut-Strategie. Saal Digital ist
 * für gehobene Qualität bekannt (Lay-Flat-Bindung, Hahnemühle-Papier).
 * Print-Partner-Recherche (Mai 2026) hat Saal als „Premium-Linie" /
 * „Substitut-Trumpf gegen Polarsteps" eingeordnet.
 *
 * **Status**: noch nicht aktiv. Brauchen:
 * - Saal Digital Partner-API (existiert für Studios/Wiederverkäufer)
 * - Format-Mapping Saal-Produkte → unsere PrintFormat
 *
 * Geplant als Premium-Option in Phase 1/2, als Default sobald Phase 3
 * (eigene B2C-Marke gegen Polarsteps) startet — Saal-Qualität ist
 * dort das Verkaufs-Argument.
 */
export const saalProvider: PrintProvider = {
  id: "saal",
  name: "Saal Digital",
  description:
    "Premium-Qualität (Lay-Flat-Bindung, Hahnemühle-Papier). Geplant für gehobene Linie + Phase-3-Substitut. (Noch nicht aktiviert — wartet auf Partner-API.)",

  async listProducts() {
    throw new PrintProviderUnavailableError(
      "saal",
      "listProducts",
      "Stub — siehe Provider-Doku oben. Aktuell Mock-Provider nutzen.",
    );
  },

  async createPreview() {
    throw new PrintProviderUnavailableError(
      "saal",
      "createPreview",
      "Stub — siehe Provider-Doku oben.",
    );
  },

  async createOrder() {
    throw new PrintProviderUnavailableError(
      "saal",
      "createOrder",
      "Stub — siehe Provider-Doku oben.",
    );
  },

  async getOrderStatus(orderId: string) {
    throw new PrintProviderUnavailableError(
      "saal",
      `getOrderStatus(${orderId})`,
      "Stub — siehe Provider-Doku oben.",
    );
  },
};
