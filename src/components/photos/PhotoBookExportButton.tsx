"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Download,
  Loader2,
  Share2,
  RotateCcw,
  Filter,
} from "lucide-react";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";
import type { SharedPhotoView } from "@/types/sharedPhoto";
// v1.15.0 — Aufruf jetzt über Print-Provider-Abstraktion statt direkter
// Lib-Import. Heute liefert der Default-Provider („mock") intern dieselbe
// `buildPhotoBookZip`-Pipeline wie vorher — verhalten 1:1 identisch.
// Vorteil: künftige Provider (HappyFoto-/CEWE-/Saal-API) werden ohne
// UI-Refactor einfach über die env-Var `NEXT_PUBLIC_PRINT_PROVIDER`
// aktiviert.
import { getActivePrintProvider } from "@/lib/print/registry";
import type { PrintOrderProgress } from "@/lib/print/types";
import { combineForExport } from "@/lib/exportPhotosAdapter";
import { PhotoSelectionSheet } from "@/components/photos/PhotoSelectionSheet";

interface Props {
  trip: Trip;
  photos: PhotoMeta[];
  /** v1.11.0 — Geteilte Fotos aus der gemeinsamen Galerie (optional). */
  sharedPhotos?: SharedPhotoView[];
}

interface ReadyZip {
  blob: Blob;
  url: string;
  filename: string;
  sizeMb: string;
}

export function PhotoBookExportButton({
  trip,
  photos,
  sharedPhotos = [],
}: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<PrintOrderProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<ReadyZip | null>(null);
  const previousUrlRef = useRef<string | null>(null);
  // v1.10.5 — Feedback-State
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "trying" | "opened-tab" | "anchor-click"
  >("idle");
  // v1.11.0 — Toggle für geteilte Fotos
  const [includeShared, setIncludeShared] = useState(false);
  // v1.11.2 — Explizite Auswahl via Selection-Sheet.
  const [explicitSelection, setExplicitSelection] = useState<Set<string> | null>(
    null,
  );
  const [selectionSheetOpen, setSelectionSheetOpen] = useState(false);

  const allCombined = useMemo(
    () => combineForExport(photos, sharedPhotos, trip.slug, includeShared),
    [photos, sharedPhotos, trip.slug, includeShared],
  );

  useEffect(() => {
    setExplicitSelection(null);
  }, [includeShared]);

  const exportPhotos = useMemo(() => {
    if (!explicitSelection) return allCombined;
    return allCombined.filter((p) => explicitSelection.has(p.id));
  }, [allCombined, explicitSelection]);

  const sharedAvailable = sharedPhotos.length > 0;
  const extraSharedCount = allCombined.length - photos.length;
  const hasCustomSelection = !!explicitSelection;

  useEffect(() => {
    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
        previousUrlRef.current = null;
      }
    };
  }, []);

  if (photos.length === 0) return null;

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setReady(null);
    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current);
      previousUrlRef.current = null;
    }
    setProgress({ current: 0, total: photos.length, step: "collecting" });
    try {
      // v1.15.0 — Route über aktiven Print-Provider. Heute „mock":
      // erzeugt ZIP exakt wie vorher. Künftige Provider (HappyFoto etc.)
      // könnten stattdessen direkt an deren API submitten und
      // `trackingUrl` statt `localAsset` zurückgeben.
      const provider = getActivePrintProvider();
      const order = await provider.createOrder(
        {
          trip,
          productType: "photoBook",
          photos: exportPhotos, // v1.11.0 — eigene + (optional) geteilte
        },
        { onProgress: setProgress },
      );
      if (!order.localAsset) {
        throw new Error(
          `Provider „${provider.name}" hat kein lokales Asset zurückgegeben — möglicherweise wurde die Order an einen externen Anbieter geschickt (heute noch nicht unterstützt im UI).`,
        );
      }
      const { blob, suggestedFilename: filename } = order.localAsset;
      const url = URL.createObjectURL(blob);
      previousUrlRef.current = url;
      const sizeMb = (blob.size / 1024 / 1024).toFixed(1);
      setReady({ blob, url, filename, sizeMb });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export fehlgeschlagen");
    } finally {
      setExporting(false);
      setTimeout(() => setProgress(null), 2500);
    }
  };

  /**
   * v1.10.5 — Robusterer Save-Handler (analog PdfBookExportButton).
   * 3-Stufen-Fallback: Share-API → window.open → anchor-click.
   */
  const handleSave = async () => {
    if (!ready) return;
    setSaveStatus("trying");

    if (typeof navigator.share === "function" && typeof File !== "undefined") {
      try {
        // v1.10.5 — Expliziter MIME-Type für ZIP — sonst lehnt Samsung
        // Internet die Datei stillschweigend ab.
        const file = new File([ready.blob], ready.filename, {
          type: "application/zip",
        });
        await navigator.share({
          files: [file],
          title: ready.filename,
        });
        setSaveStatus("idle");
        return;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/abort|cancel/i.test(msg)) {
          setSaveStatus("idle");
          return;
        }
        console.warn("[Save ZIP] Share failed:", e);
      }
    }

    try {
      const opened = window.open(ready.url, "_blank");
      if (opened) {
        setSaveStatus("opened-tab");
        return;
      }
    } catch (e) {
      console.warn("[Save ZIP] window.open failed:", e);
    }

    const a = document.createElement("a");
    a.href = ready.url;
    a.download = ready.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setSaveStatus("anchor-click");
  };

  const handleOpenInTab = () => {
    if (!ready) return;
    window.open(ready.url, "_blank");
  };

  const handleReset = () => {
    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current);
      previousUrlRef.current = null;
    }
    setReady(null);
    setError(null);
  };

  const progressPct =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;
  const stepLabel =
    progress?.step === "collecting"
      ? `Bilder sammeln… ${progress.current}/${progress.total}`
      : progress?.step === "compressing"
        ? "ZIP wird gebaut…"
        : "Wird vorbereitet…";

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} className="text-gold-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base font-semibold text-navy">
              Foto-Buch exportieren
            </h3>
            <p className="text-[11px] text-ink-mid mt-0.5 leading-relaxed">
              Lädt alle {photos.length}{" "}
              {photos.length === 1 ? "Foto" : "Fotos"} als ZIP — nach
              Reisetag und Aufnahmezeit sortiert. Importierbar in
              HappyFoto Designer, CEWE, Pixum, Saal Digital &amp; Co.
            </p>
          </div>
        </div>

        {/* Initial / generating state */}
        {!ready && (
          <>
            {/* v1.11.0 — Toggle: geteilte Fotos mit aufnehmen */}
            {sharedAvailable && !exporting && (
              <label className="flex items-start gap-2 mb-2 p-2 rounded-lg bg-cream-50 border border-cream-200 cursor-pointer hover:bg-cream-100 transition">
                <input
                  type="checkbox"
                  checked={includeShared}
                  onChange={(e) => setIncludeShared(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-gold-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-ink-dark leading-tight">
                    Auch geteilte Fotos einbeziehen
                  </p>
                  <p className="text-[10px] text-ink-mid mt-0.5 leading-snug">
                    {includeShared
                      ? `${photos.length} eigene + ${extraSharedCount} aus der Gemeinsamen Galerie = ${exportPhotos.length} im ZIP`
                      : `${sharedPhotos.length} geteilte Fotos verfügbar — aktivieren um sie mit aufzunehmen`}
                  </p>
                </div>
              </label>
            )}

            {/* v1.11.2 — Per-Foto-Auswahl-Trigger. */}
            {allCombined.length > 0 && !exporting && (
              <button
                type="button"
                onClick={() => setSelectionSheetOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 mb-2 rounded-xl bg-gold/10 text-gold-600 text-xs font-semibold hover:bg-gold/20 transition border border-gold/30"
              >
                <Filter size={12} />
                {hasCustomSelection
                  ? `Auswahl ändern (${exportPhotos.length} von ${allCombined.length} Fotos)`
                  : `Bilder einzeln auswählen (aktuell alle ${allCombined.length})`}
              </button>
            )}

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || exportPhotos.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {exporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {stepLabel}
                </>
              ) : (
                <>
                  <BookOpen size={14} />
                  ZIP erstellen
                  {(includeShared && extraSharedCount > 0) || hasCustomSelection ? (
                    <span className="text-[10px] opacity-80">
                      ({exportPhotos.length} {exportPhotos.length === 1 ? "Foto" : "Fotos"})
                    </span>
                  ) : null}
                </>
              )}
            </button>

            {progress && progress.step !== "done" && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
          </>
        )}

        {/* Ready state — v1.10.7: Open-in-Tab als Primary, Direct-Download entfernt. */}
        {ready && (
          <div className="space-y-2">
            <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-center">
              <p className="text-xs font-semibold text-success">
                ✓ ZIP bereit ({ready.sizeMb} MB)
              </p>
              <p className="text-[10px] text-ink-mid mt-0.5 leading-relaxed">
                Auf Handy: blauer Button öffnet ZIP — dann Browser-Menü → speichern
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenInTab}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 transition shadow-sm"
            >
              <Download size={16} />
              ZIP öffnen + speichern
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gold/15 text-gold-600 text-sm font-semibold hover:bg-gold/25 transition"
            >
              <Share2 size={14} />
              Teilen / Senden (iOS Safari, WhatsApp)
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-ink-mid hover:text-navy transition"
            >
              <RotateCcw size={11} />
              Neu erstellen (z.B. nach neuen Fotos)
            </button>

            <p className="text-[10px] text-ink-light text-center italic mt-1 leading-relaxed">
              💡 Samsung: blauer Button → ZIP im Tab → 3-Punkte-Menü → speichern.
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-warning font-medium mt-2">{error}</p>
        )}

        {/* v1.11.2 — Selection-Sheet als Modal */}
        <PhotoSelectionSheet
          open={selectionSheetOpen}
          photos={allCombined}
          currentSelection={explicitSelection}
          onConfirm={(next) => {
            setExplicitSelection(next);
            setSelectionSheetOpen(false);
          }}
          onClose={() => setSelectionSheetOpen(false)}
          exportLabel="ZIP"
        />

        <details className="mt-3 group">
          <summary className="text-[11px] text-ink-light cursor-pointer hover:text-ink-mid select-none">
            Wie erstelle ich daraus ein gedrucktes Buch?
          </summary>
          <div className="mt-2 text-[11px] text-ink-mid leading-relaxed space-y-1 pl-2 border-l-2 border-cream-200">
            <p>
              <strong>1.</strong> ZIP herunterladen + entpacken
            </p>
            <p>
              <strong>2.</strong> HappyFoto Designer (gratis) installieren:{" "}
              <a
                href="https://www.happyfoto.at/designer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-600 underline"
              >
                happyfoto.at/designer
              </a>
            </p>
            <p>
              <strong>3.</strong> Neues Foto-Buch → &quot;Bilder
              hinzufügen&quot; → entpackten Ordner wählen
            </p>
            <p>
              <strong>4.</strong> &quot;Auto-Befüllen&quot; — Fotos werden
              chronologisch auf die Seiten verteilt
            </p>
            <p className="italic pt-1">
              💡 In <code className="bg-cream-100 px-1 rounded">metadata.json</code>{" "}
              im ZIP findest du Bildunterschriften zum Übernehmen.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
