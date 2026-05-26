/**
 * v1.15.0 — Print-Export-Abstraktion: Type-Definitionen.
 *
 * Strategischer Kontext: hp+ Hybrid-Strategie Phase 1 (Reisebüro-Addon)
 * braucht eine vertrieblich verkaufbare Print-Komponente. Welche genau
 * — Foto-Buch nach Reise (Polarsteps-Modell) oder Programm-Heft vor
 * Reise (Reiseführer-Ersatz-Modell, vermutlicher Pivot 25.05.2026) —
 * ist strategisch noch offen.
 *
 * Diese Abstraktion deckt **beide Produkte** ab und macht den
 * konkreten Print-Anbieter (HappyFoto/CEWE/Saal Digital/…) tauschbar.
 * Heute liefert nur `mockProvider` (lokale ZIP für 3rd-Party-Designer);
 * echte Provider werden später eingehängt sobald Strategie + API-Keys
 * stehen.
 */

import type { Trip } from "@/types/trip";
import type { ExportPhoto } from "@/types/photo";

// ═══════════════════════════════════════════════════════════════
// Produkt-Typen
// ═══════════════════════════════════════════════════════════════

/**
 * Welche Print-Produkte können wir liefern.
 *
 * `photoBook`      = klassisches Foto-Buch nach Reise (Polarsteps-Modell)
 * `programGuide`   = Programm-/Reiseführer-Heft vor Abreise
 *                    (hp+ Hybrid-Strategie 25.05.2026 Pivot-Kandidat —
 *                    ersetzt den Marco-Polo den das Reisebüro heute
 *                    seinem Kunden mitgibt)
 * `postcardSet`    = Set von Reise-Postkarten (Up-Sell-Idee)
 */
export type PrintProductType = "photoBook" | "programGuide" | "postcardSet";

/**
 * Druck-Formate. Bewusst eng gehalten — die meisten Provider liefern
 * 4–6 Formate; mehr Auswahl überfordert User.
 */
export type PrintFormat =
  | "A5-portrait"
  | "A4-portrait"
  | "A4-landscape"
  | "30x30"
  | "20x28"
  | "13x18"; // typisches Postkarten-Format

export type PrintCoverStyle = "hardcover" | "softcover" | "lay-flat";

// ═══════════════════════════════════════════════════════════════
// Spec — was geht an den Provider rein
// ═══════════════════════════════════════════════════════════════

export interface PrintSpec {
  trip: Trip;
  productType: PrintProductType;
  /**
   * Bei `photoBook` + `postcardSet`: die zu druckenden Fotos.
   * Bei `programGuide`: optional, wenn Programmheft Fotos enthält.
   */
  photos?: ExportPhoto[];
  /** Gewünschte Seitenzahl — wenn weglässt, Provider macht Auto-Layout. */
  pages?: number;
  format?: PrintFormat;
  cover?: PrintCoverStyle;
  shippingAddress?: ShippingAddress;
  customerNote?: string;
  /**
   * `download` = lokales Asset (ZIP/PDF) für 3rd-Party-Upload oder
   *              Eigen-Druck. Mock-Provider liefert das immer.
   * `ship`     = direkt vom Provider verschicken. Echte Provider mit
   *              API-Integration.
   */
  deliveryMode?: "download" | "ship";
}

export interface ShippingAddress {
  name: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
}

// ═══════════════════════════════════════════════════════════════
// Order — was kommt zurück
// ═══════════════════════════════════════════════════════════════

export type PrintOrderStatus =
  | "draft"
  | "ready-for-download" // Mock: ZIP/PDF liegt bereit
  | "submitted"
  | "in-production"
  | "shipped"
  | "delivered"
  | "failed";

export interface PrintOrder {
  orderId: string;
  providerId: string;
  status: PrintOrderStatus;
  createdAt: string;
  /**
   * Bei lokalen Provider (mock) oder „download"-Delivery:
   * fertiges Asset zum Speichern/Teilen.
   */
  localAsset?: {
    blob: Blob;
    suggestedFilename: string;
    mimeType: string;
  };
  /** Bei remote/ship: URL zum Tracking beim Anbieter. */
  trackingUrl?: string;
  /** Geschätzte Lieferzeit in Werktagen (wenn `ship`). */
  estimatedShippingDays?: number;
  /** Brutto-Preis in EUR (wenn Provider quotable). */
  priceEur?: number;
  /** Provider-spezifische Nachricht (z.B. Fehlertext). */
  message?: string;
}

// ═══════════════════════════════════════════════════════════════
// Preview — Vorschau vor Order
// ═══════════════════════════════════════════════════════════════

export interface PrintPreview {
  /** URLs (Object-URL oder Data-URL) für Vorschau-Bilder. */
  previewImages: string[];
  /** Auto-Layout-Schätzung wenn `pages` in Spec leer war. */
  estimatedPages?: number;
  /** Geschätzter Brutto-Preis. */
  estimatedPriceEur?: number;
  /** Optional: vollständiges PDF-Preview als Blob. */
  pdfPreview?: { blob: Blob; pageCount: number };
}

// ═══════════════════════════════════════════════════════════════
// Catalog — was kann ein Provider
// ═══════════════════════════════════════════════════════════════

export interface ProductEntry {
  productType: PrintProductType;
  formats: PrintFormat[];
  covers: PrintCoverStyle[];
  pages: { min: number; max: number };
  /** Basispreis ab €. */
  fromPriceEur?: number;
  /** Lieferzeit in Werktagen für `ship`. */
  shippingDays?: number;
}

export interface ProductCatalog {
  providerId: string;
  providerName: string;
  products: ProductEntry[];
}

// ═══════════════════════════════════════════════════════════════
// Optional aufruf-spezifische Optionen (z.B. Progress-Callback)
// ═══════════════════════════════════════════════════════════════

export interface PrintOrderProgress {
  current: number;
  total: number;
  /** Welcher Schritt ist gerade aktiv (provider-spezifisch). */
  step: string;
}

export interface PrintOrderOptions {
  /**
   * Provider-übergreifender Progress-Callback. Provider die Progress
   * liefern können (z.B. Mock-ZIP-Build, künftig Multi-Photo-Upload an
   * remote API) rufen den auf. Optional — wer's nicht braucht, ignoriert.
   */
  onProgress?: (p: PrintOrderProgress) => void;
}

// ═══════════════════════════════════════════════════════════════
// Errors
// ═══════════════════════════════════════════════════════════════

/**
 * Wird geworfen wenn ein Provider eine Operation nicht unterstützt
 * (z.B. Stub-Provider ohne API-Key, oder Mock-Provider bei
 * `getOrderStatus`).
 */
export class PrintProviderUnavailableError extends Error {
  constructor(
    public readonly providerId: string,
    public readonly operation: string,
    extra?: string,
  ) {
    super(
      `Print-Provider „${providerId}" ist für „${operation}" nicht verfügbar.${extra ? ` ${extra}` : ""}`,
    );
    this.name = "PrintProviderUnavailableError";
  }
}
