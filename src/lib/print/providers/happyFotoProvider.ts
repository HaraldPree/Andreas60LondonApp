import type { PrintProvider } from "../PrintProvider";
import { PrintProviderUnavailableError } from "../types";

/**
 * v1.15.0 STUB — HappyFoto (Freistadt, OÖ).
 *
 * **Strategische Wahl**: HappyFoto ist räumlich 40 km von hp+ Leonding
 * entfernt → Pilot-Anbieter für persönliche Partnerschaft. Print-Partner-
 * Recherche (Mai 2026) hat HappyFoto wegen DACH-Verankerung +
 * Print-Qualität als Pilot-Kandidat empfohlen.
 *
 * **Status**: noch nicht aktiv. Brauchen:
 * - B2B-Partnervertrag mit HappyFoto
 * - API-Zugang (HappyFoto hat eine Designer-Datei-API + REST für
 *   Bestell-Submission)
 * - Format-Mapping HappyFoto-Produktkatalog → unsere PrintFormat
 * - Authentication-Layer (API-Key in env, server-side proxy)
 *
 * Sobald aktiv: `listProducts` liest aus HappyFoto-API, `createOrder`
 * submitted Order direkt + liefert `trackingUrl` für User.
 */
export const happyFotoProvider: PrintProvider = {
  id: "happyfoto",
  name: "HappyFoto Freistadt",
  description:
    "Print-Pilotpartner (40 km von Leonding). DACH-Markt, gute Qualität, Tradition. Direkte Bestellung + Versand vom Anbieter. (Noch nicht aktiviert — wartet auf Partnervertrag + API-Zugang.)",

  async listProducts() {
    throw new PrintProviderUnavailableError(
      "happyfoto",
      "listProducts",
      "Stub — siehe Provider-Doku oben. Aktuell Mock-Provider nutzen.",
    );
  },

  async createPreview() {
    throw new PrintProviderUnavailableError(
      "happyfoto",
      "createPreview",
      "Stub — siehe Provider-Doku oben.",
    );
  },

  async createOrder() {
    throw new PrintProviderUnavailableError(
      "happyfoto",
      "createOrder",
      "Stub — siehe Provider-Doku oben.",
    );
  },

  async getOrderStatus(orderId: string) {
    throw new PrintProviderUnavailableError(
      "happyfoto",
      `getOrderStatus(${orderId})`,
      "Stub — siehe Provider-Doku oben.",
    );
  },
};
