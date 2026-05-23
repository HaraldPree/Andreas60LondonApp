"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Loader2,
  Download,
  Share2,
  RotateCcw,
} from "lucide-react";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";

interface Props {
  trip: Trip;
  photos: PhotoMeta[];
}

type ProgressState =
  | { step: "loading-photos"; current: number; total: number }
  | { step: "compressing-hero"; current: number; total: number }
  | { step: "rendering-pdf"; current: number; total: number }
  | { step: "done"; current: number; total: number };

interface ReadyPdf {
  blob: Blob;
  url: string;
  filename: string;
  sizeMb: string;
}

export function PdfBookExportButton({ trip, photos }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<ReadyPdf | null>(null);
  const previousUrlRef = useRef<string | null>(null);

  // Revoke the previous blob URL when a new one replaces it or the
  // component unmounts. We deliberately KEEP the URL alive while the
  // ready state is present so the download link in the UI stays
  // tappable as long as the user looks at it.
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
    setProgress({ step: "loading-photos", current: 0, total: photos.length });
    try {
      const { buildPhotoBookPdf, defaultPdfFilename } = await import(
        "@/lib/photoBookPdfGenerator"
      );
      const blob = await buildPhotoBookPdf({
        trip,
        photos,
        onProgress: setProgress,
      });
      const url = URL.createObjectURL(blob);
      previousUrlRef.current = url;
      const filename = defaultPdfFilename(trip);
      const sizeMb = (blob.size / 1024 / 1024).toFixed(1);
      setReady({ blob, url, filename, sizeMb });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "PDF konnte nicht erstellt werden",
      );
    } finally {
      setExporting(false);
      setTimeout(() => setProgress(null), 2000);
    }
  };

  /**
   * v1.10.1 — Universeller Save-Handler. Try Share-API first (für
   * Samsung Internet + iOS Safari, wo <a download href="blob:"> einen
   * about:blank-Tab statt Download produziert — Harald A53 Bug).
   * Fallback: klassischer anchor-Click (Desktop, alte Browser).
   */
  const handleSave = async () => {
    if (!ready) return;
    // 1) Share API mit File-Support — Mobile-bevorzugt
    if (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      typeof File !== "undefined"
    ) {
      try {
        const file = new File([ready.blob], ready.filename, {
          type: ready.blob.type,
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: ready.filename,
          });
          return; // erfolgreich
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/abort|cancel/i.test(msg)) return; // User hat im Sheet abgebrochen
        console.warn("[PdfBookExportButton] share fehlgeschlagen, falle auf Download zurück:", e);
        // weiter zum Fallback
      }
    }
    // 2) Fallback: anchor download (Desktop, alte Browser)
    const a = document.createElement("a");
    a.href = ready.url;
    a.download = ready.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    progress?.step === "loading-photos"
      ? `Bilder einlesen… ${progress.current}/${progress.total}`
      : progress?.step === "compressing-hero"
        ? "Titelbild vorbereiten…"
        : progress?.step === "rendering-pdf"
          ? "PDF wird gesetzt… (dauert ~10-30 Sek)"
          : "Wird vorbereitet…";

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base font-semibold text-navy">
              PDF-Reise-Tagebuch
            </h3>
            <p className="text-[11px] text-ink-mid mt-0.5 leading-relaxed">
              Generiert ein elegantes PDF mit Cover, Tag-Trennern und
              chronologischen Foto-Seiten — sofort druckbar oder als
              digitale Erinnerung.
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
                  <FileText size={14} />
                  PDF generieren
                </>
              )}
            </button>

            {progress && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
          </>
        )}

        {/* Ready state — Share-based save + anchor fallback */}
        {ready && (
          <div className="space-y-2">
            <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-center">
              <p className="text-xs font-semibold text-success">
                ✓ PDF bereit ({ready.sizeMb} MB)
              </p>
              <p className="text-[10px] text-ink-mid mt-0.5 leading-relaxed">
                Auf Handy: Teilen-Sheet öffnet sich → „In Dateien speichern"
                oder App auswählen
              </p>
            </div>

            {/* v1.10.1 — Primärer Speichern-Button nutzt Share API auf
                Mobile (Samsung Internet öffnet sonst about:blank-Tab
                statt Download — Harald A53 Bug). Desktop: fällt auf
                klassischen <a download> Anchor zurück. */}
            <button
              type="button"
              onClick={handleSave}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 transition shadow-sm"
            >
              <Download size={16} />
              PDF speichern
            </button>

            {/* Fallback-Anchor für User die vom Share-Sheet zurück­kommen
                ohne gespeichert zu haben — direktes Download via Anchor. */}
            <a
              href={ready.url}
              download={ready.filename}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cream-100 text-ink-dark text-xs font-medium hover:bg-cream-200 transition"
            >
              <Share2 size={12} />
              Alternativ: Direkt-Download (Desktop / Chrome)
            </a>

            <button
              type="button"
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-ink-mid hover:text-navy transition"
            >
              <RotateCcw size={11} />
              Neu generieren (z.B. nach neuen Fotos)
            </button>

            <p className="text-[10px] text-ink-light text-center italic mt-1 leading-relaxed">
              💡 Samsung Internet / iOS Safari: bitte den blauen Hauptbutton
              nehmen — das Teilen-Sheet bietet „In Dateien speichern".
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-warning font-medium mt-2">{error}</p>
        )}

        <details className="mt-3 group">
          <summary className="text-[11px] text-ink-light cursor-pointer hover:text-ink-mid select-none">
            Wie sieht das PDF aus?
          </summary>
          <ul className="mt-2 text-[11px] text-ink-mid leading-relaxed space-y-1 pl-2 border-l-2 border-cream-200">
            <li>
              <strong>Cover</strong> — Hero-Bild + „{trip.destination}" +
              Teilnehmer
            </li>
            <li>
              <strong>Pro Tag</strong>: eine Trenner-Seite (Tag-Titel, Datum,
              Zusammenfassung)
            </li>
            <li>
              <strong>Foto-Seiten</strong>: 2 Fotos nebeneinander oder 1 großes
              (je nach Anzahl), mit Bildunterschriften und Uhrzeit
            </li>
            <li>
              <strong>Abschluss-Seite</strong>: Geburtstags-Widmung
            </li>
            <li>
              A4 quer, ca. 5-10 MB bei 50 Fotos. Ideal zum Drucken (z.B. dm,
              Müller) oder als digitales Reise-Tagebuch
            </li>
            <li className="italic pt-1">
              💡 Tipp: vorher in den Foto-Details Captions setzen (z.B. „Cedric
              Grolet Mittagessen") — die werden im PDF als Bildunterschrift
              verwendet.
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
}
