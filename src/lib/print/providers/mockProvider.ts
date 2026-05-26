import type { PrintProvider } from "../PrintProvider";
import {
  PrintProviderUnavailableError,
  type PrintOrder,
  type PrintOrderOptions,
  type PrintPreview,
  type PrintSpec,
  type ProductCatalog,
} from "../types";
import {
  buildPhotoBookZip,
  defaultZipFilename,
} from "@/lib/photoBookExport";

/**
 * v1.15.0 — Mock-/Local-Provider (Default).
 *
 * Erzeugt das Foto-Buch **lokal als ZIP** für 3rd-Party-Designer
 * (HappyFoto Designer, CEWE Fotowelt, Saal Digital, Pixum, Pixelnet …).
 * User lädt die ZIP runter und uploaded sie manuell beim Anbieter
 * seiner Wahl.
 *
 * **Heute der einzige live-aktivierte Provider** — wird auch in
 * Produktion bleiben für Anbieter ohne offene API. Bei künftigem
 * direkten API-Anbindung (HappyFoto B2B-Partner-API, CEWE-Manufaktur-
 * API o.ä.) werden die anderen Provider in `providers/` aktiviert,
 * der Mock bleibt als Fallback erhalten.
 *
 * Implementierung: dünner Wrapper um die bestehende
 * `buildPhotoBookZip()`-Pipeline. Verhalten ist 1:1 wie vor v1.15.0.
 */
export const mockProvider: PrintProvider = {
  id: "mock",
  name: "Lokaler Export (ZIP für 3rd-Party-Designer)",
  description:
    "Erzeugt eine ZIP mit chronologisch benannten Fotos + README + Metadaten. Lädst du in den HappyFoto Designer, CEWE Fotowelt, Saal Designer etc. hoch und gestaltest dort das Buch.",

  async listProducts(): Promise<ProductCatalog> {
    return {
      providerId: "mock",
      providerName: "Lokaler Export",
      products: [
        {
          productType: "photoBook",
          formats: ["A4-portrait", "30x30", "20x28"],
          covers: ["softcover", "hardcover"],
          pages: { min: 24, max: 100 },
        },
      ],
    };
  },

  async createPreview(_spec: PrintSpec): Promise<PrintPreview> {
    // Mock liefert keinen Preview — der User sieht die Fotos beim
    // Import in den Designer des Anbieters.
    return { previewImages: [] };
  },

  async createOrder(
    spec: PrintSpec,
    opts: PrintOrderOptions = {},
  ): Promise<PrintOrder> {
    if (spec.productType !== "photoBook") {
      throw new PrintProviderUnavailableError(
        "mock",
        `createOrder(${spec.productType})`,
        "Mock-Provider kann nur photoBook. Für programGuide / postcardSet anderen Provider wählen.",
      );
    }
    if (!spec.photos || spec.photos.length === 0) {
      throw new Error("Keine Fotos zum Exportieren übergeben");
    }

    const blob = await buildPhotoBookZip({
      trip: spec.trip,
      photos: spec.photos,
      // Provider-übergreifender Progress-Callback wird 1:1 an die
      // ZIP-Pipeline durchgereicht — kompatibel weil PhotoBookExportProgress
      // shape passt zu PrintOrderProgress (current/total/step).
      onProgress: opts.onProgress,
    });

    const filename = defaultZipFilename(spec.trip);
    const orderId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      orderId,
      providerId: "mock",
      status: "ready-for-download",
      createdAt: new Date().toISOString(),
      localAsset: {
        blob,
        suggestedFilename: filename,
        mimeType: "application/zip",
      },
    };
  },

  async getOrderStatus(orderId: string): Promise<PrintOrder> {
    // Mock kennt keine persistierte Order-Historie — wir geben einen
    // pseudo-Status zurück. Caller soll sich auf createOrder-Ergebnis
    // verlassen, nicht auf Status-Abfragen.
    return {
      orderId,
      providerId: "mock",
      status: "ready-for-download",
      createdAt: new Date().toISOString(),
      message:
        "Mock-Orders haben keine Status-Verfolgung. Die ZIP wurde lokal generiert und ggf. vom User schon gedownloaded/geshared.",
    };
  },
};
