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
  // v1.10.5 — Feedback-State für handleSave
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "trying" | "opened-tab" | "anchor-click"
  >("idle");

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
   * v1.10.5 — Robusterer Save-Handler.
   *
   * Samsung Internet bug: canShare() returnt true, aber share() öffnet
   * stillschweigend kein Sheet (Harald A53 v1.10.4 Bug). Lösung:
   *  1) navigator.share OHNE canShare-Check (Samsung lügt)
   *  2) Bei Share-Fail: window.open für PDF-Inline-Anzeige
   *  3) Bei Open-Fail: klassischer Anchor-Click (Desktop)
   *
   * Plus: feedback-State, damit User sieht ob's geklappt hat.
   */
  const handleSave = async () => {
    if (!ready) return;
    setSaveStatus("trying");

    // 1) Share API ohne canShare-Check — Samsung lügt manchmal
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
        console.warn("[Save] Share failed, will try open-in-tab:", e);
      }
    }

    // 2) Fallback: PDF in neuem Tab öffnen. Samsung Internet rendert
    //    PDF inline → User kann via 3-Dot-Menü "Seite speichern"
    try {
      const opened = window.open(ready.url, "_blank");
      if (opened) {
        setSaveStatus("opened-tab");
        return;
      }
    } catch (e) {
      console.warn("[Save] window.open failed:", e);
    }

    // 3) Letzter Fallback: Anchor-Click (Desktop)
    const a = document.createElement("a");
    a.href = ready.url;
    a.download = ready.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setSaveStatus("anchor-click");
  };

  /** v1.10.5 — Alternativer Direct-Path: PDF in neuem Tab via window.open.
   *  Sichtbar als Sekundär-Button damit User immer einen Weg hat. */
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

        {/* Ready state — v1.10.5 mit dreifachem Save-Pfad */}
        {ready && (
          <div className="space-y-2">
            <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-center">
              <p className="text-xs font-semibold text-success">
                ✓ PDF bereit ({ready.sizeMb} MB)
              </p>
              <p className="text-[10px] text-ink-mid mt-0.5 leading-relaxed">
                Drei Wege zum Speichern — Hauptbutton zuerst probieren
              </p>
            </div>

            {/* v1.10.5 — Primary Save (Share-Sheet) */}
            <button
              type="button"
              onClick={handleSave}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 transition shadow-sm"
            >
              <Download size={16} />
              PDF speichern (Teilen-Sheet)
            </button>

            {/* v1.10.5 — Wenn Share-Sheet nicht aufpoppt (Samsung-Bug),
                kann User PDF in neuem Tab öffnen und dort manuell speichern */}
            <button
              type="button"
              onClick={handleOpenInTab}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gold/15 text-gold-600 text-sm font-semibold hover:bg-gold/25 transition"
            >
              <Share2 size={14} />
              PDF in neuem Tab öffnen
            </button>

            {/* v1.10.5 — Direct-Download für Desktop / Chrome Android.
                Samsung Internet macht hier about:blank — daher kleiner Hint. */}
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
              Neu generieren (z.B. nach neuen Fotos)
            </button>

            {saveStatus === "opened-tab" && (
              <p className="text-[10px] text-info text-center mt-1 leading-relaxed">
                💡 PDF wurde in neuem Tab geöffnet — dort Browser-Menü
                (3 Punkte oben rechts) → „Seite speichern".
              </p>
            )}
            {saveStatus === "anchor-click" && (
              <p className="text-[10px] text-info text-center mt-1 leading-relaxed">
                💡 Download gestartet — bei Samsung Internet evtl. nur
                about:blank: dann gold-Button „in neuem Tab öffnen" nutzen.
              </p>
            )}
            {saveStatus === "idle" && (
              <p className="text-[10px] text-ink-light text-center italic mt-1 leading-relaxed">
                Funktioniert nichts? Gold-Button → PDF in Tab → Browser-Menü
                speichern.
              </p>
            )}
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
