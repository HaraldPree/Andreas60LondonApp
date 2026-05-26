import type {
  PrintOrder,
  PrintOrderOptions,
  PrintPreview,
  PrintSpec,
  ProductCatalog,
} from "./types";

/**
 * v1.15.0 — Provider-Interface für alle Print-Anbieter.
 *
 * Jeder Anbieter (Mock, HappyFoto, CEWE, Saal Digital …) implementiert
 * dieses Interface. Die App nutzt nur die Abstraktion, nie direkt einen
 * konkreten Provider — das macht den Wechsel oder Multi-Provider-Setup
 * trivial.
 *
 * **Aufruf-Pattern**:
 * ```ts
 * import { getActivePrintProvider } from "@/lib/print/registry";
 *
 * const provider = getActivePrintProvider();
 * const order = await provider.createOrder({ trip, productType: "photoBook", photos });
 * if (order.localAsset) {
 *   downloadOrShareBlob(order.localAsset.blob, order.localAsset.suggestedFilename);
 * } else if (order.trackingUrl) {
 *   window.open(order.trackingUrl, "_blank");
 * }
 * ```
 *
 * **Fehler-Konvention**: Operationen die ein Provider nicht unterstützt,
 * werfen `PrintProviderUnavailableError`. Andere Fehler (Netzwerk,
 * Validierung, Provider-API-Fehler) sind normale `Error`-Subklassen.
 */
export interface PrintProvider {
  /** Eindeutiger Provider-Key (für Registry + Logging). Kebab-case. */
  readonly id: string;

  /** Anzeige-Name für UI ("HappyFoto Freistadt"). */
  readonly name: string;

  /**
   * Kurze Beschreibung was der Provider liefert — wird ggf. im UI
   * angezeigt damit der User die Wahl versteht.
   */
  readonly description: string;

  /**
   * Liefert den Produktkatalog (welche Print-Typen, Formate, Cover,
   * Preise/Lieferzeiten der Anbieter beherrscht).
   */
  listProducts(): Promise<ProductCatalog>;

  /**
   * Erzeugt einen Preview ohne Order anzulegen. Wird vor `createOrder`
   * aufgerufen um dem User Layout/Preis zu zeigen. Optional — Mock-
   * Provider liefert hier nur ein leeres Result.
   */
  createPreview(spec: PrintSpec): Promise<PrintPreview>;

  /**
   * Erzeugt eine konkrete Order. Bei lokalen Providern (`mock`) wird
   * sofort ein Asset (ZIP/PDF) in `localAsset` zurückgegeben. Bei
   * remote Providern wird die Order an deren API submittet und
   * `trackingUrl` + Status zurückgegeben.
   *
   * Optional `opts.onProgress` für UI-Feedback während längerer
   * Operationen (Foto-Aggregation, Upload).
   */
  createOrder(spec: PrintSpec, opts?: PrintOrderOptions): Promise<PrintOrder>;

  /**
   * Status-Abfrage nach Order. Mock liefert immer `ready-for-download`.
   * Remote Provider machen einen API-Call.
   */
  getOrderStatus(orderId: string): Promise<PrintOrder>;
}
