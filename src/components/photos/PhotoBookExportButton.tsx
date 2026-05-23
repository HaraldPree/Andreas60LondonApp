"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Download,
  Loader2,
  Share2,
  RotateCcw,
} from "lucide-react";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";
import {
  buildPhotoBookZip,
  defaultZipFilename,
  type PhotoBookExportProgress,
} from "@/lib/photoBookExport";

interface Props {
  trip: Trip;
  photos: PhotoMeta[];
}

interface ReadyZip {
  blob: Blob;
  url: string;
  filename: string;
  sizeMb: string;
}

export function PhotoBookExportButton({ trip, photos }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<PhotoBookExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<ReadyZip | null>(null);
  const previousUrlRef = useRef<string | null>(null);
  // v1.10.5 — Feedback-State
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "trying" | "opened-tab" | "anchor-click"
  >("idle");

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
      const blob = await buildPhotoBookZip({
        trip,
        photos,
        onProgress: setProgress,
      });
      const url = URL.createObjectURL(blob);
      previousUrlRef.current = url;
      const filename = defaultZipFilename(trip);
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
        const file = new File([ready.blob], ready.filename, {
          type: ready.blob.type,
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
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
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

        {/* Ready state — v1.10.5 mit dreifachem Save-Pfad */}
        {ready && (
          <div className="space-y-2">
            <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-center">
              <p className="text-xs font-semibold text-success">
                ✓ ZIP bereit ({ready.sizeMb} MB)
              </p>
              <p className="text-[10px] text-ink-mid mt-0.5 leading-relaxed">
                Drei Wege zum Speichern — Hauptbutton zuerst probieren
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 transition shadow-sm"
            >
              <Download size={16} />
              ZIP speichern (Teilen-Sheet)
            </button>

            <button
              type="button"
              onClick={handleOpenInTab}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gold/15 text-gold-600 text-sm font-semibold hover:bg-gold/25 transition"
            >
              <Share2 size={14} />
              ZIP in neuem Tab öffnen
            </button>

            <a
              href={ready.url}
              download={ready.filename}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cream-100 text-ink-dark text-xs font-medium hover:bg-cream-200 transition"
            >
              <Download size={11} />
              Direct-Download (Desktop / Chrome)
            </a>

            <button
              type="button"
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-ink-mid hover:text-navy transition"
            >
              <RotateCcw size={11} />
              Neu erstellen (z.B. nach neuen Fotos)
            </button>

            {saveStatus === "opened-tab" && (
              <p className="text-[10px] text-info text-center mt-1 leading-relaxed">
                💡 ZIP wurde in neuem Tab geöffnet — dort speichern.
              </p>
            )}
            {saveStatus === "idle" && (
              <p className="text-[10px] text-ink-light text-center italic mt-1 leading-relaxed">
                Funktioniert nichts? Gold-Button → ZIP in Tab → Browser-Menü.
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-warning font-medium mt-2">{error}</p>
        )}

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
