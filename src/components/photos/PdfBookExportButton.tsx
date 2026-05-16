"use client";

import { useState } from "react";
import { FileText, Loader2, Download, CheckCircle2 } from "lucide-react";
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

export function PdfBookExportButton({ trip, photos }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (photos.length === 0) return null;

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setDoneAt(null);
    setProgress({ step: "loading-photos", current: 0, total: photos.length });
    try {
      // Dynamic import — both the React-PDF library AND our generator
      // module are loaded lazily so the ~600KB cost only hits users who
      // actually generate a book.
      const { buildPhotoBookPdf, defaultPdfFilename, triggerDownload } =
        await import("@/lib/photoBookPdfGenerator");
      const blob = await buildPhotoBookPdf({
        trip,
        photos,
        onProgress: setProgress,
      });
      triggerDownload(blob, defaultPdfFilename(trip));
      setDoneAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF konnte nicht erstellt werden");
    } finally {
      setExporting(false);
      setTimeout(() => setProgress(null), 3000);
    }
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
          : progress?.step === "done"
            ? "Fertig — Download gestartet"
            : "";

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

        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {exporting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {stepLabel || "Wird vorbereitet…"}
            </>
          ) : doneAt ? (
            <>
              <CheckCircle2 size={14} />
              PDF heruntergeladen — nochmal generieren
            </>
          ) : (
            <>
              <Download size={14} />
              PDF generieren
            </>
          )}
        </button>

        {progress && progress.step !== "done" && (
          <div className="mt-2 h-1.5 w-full rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
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
