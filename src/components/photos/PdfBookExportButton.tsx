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
import type { SharedPhotoView } from "@/types/sharedPhoto";
import { combineForExport } from "@/lib/exportPhotosAdapter";

interface Props {
  trip: Trip;
  photos: PhotoMeta[];
  /** v1.11.0 — Geteilte Fotos aus der gemeinsamen Galerie (optional). */
  sharedPhotos?: SharedPhotoView[];
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

export function PdfBookExportButton({ trip, photos, sharedPhotos = [] }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<ReadyPdf | null>(null);
  const previousUrlRef = useRef<string | null>(null);
  // v1.10.5 — Feedback-State für handleSave
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "trying" | "opened-tab" | "anchor-click"
  >("idle");
  // v1.11.0 — Toggle: auch geteilte Fotos mit einbeziehen
  const [includeShared, setIncludeShared] = useState(false);

  // Effektiv exportierte Fotos = eigene + (optional) geteilte
  const exportPhotos = combineForExport(
    photos,
    sharedPhotos,
    trip.slug,
    includeShared,
  );
  const sharedAvailable = sharedPhotos.length > 0;
  const extraSharedCount = exportPhotos.length - photos.length;

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
        photos: exportPhotos, // v1.11.0 — eigene + (optional) geteilte
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
        // v1.10.5 — Expliziter MIME-Type: react-pdf liefert manchmal
        // ein Blob mit leerem .type, dann lehnt Samsung Internet die
        // Datei stillschweigend ab.
        const file = new File([ready.blob], ready.filename, {
          type: "application/pdf",
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
            {/* v1.11.0 — Toggle: geteilte Fotos einbeziehen.
                Nur sichtbar wenn überhaupt geteilte Fotos da sind. */}
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
                      ? `${photos.length} eigene + ${extraSharedCount} aus der Gemeinsamen Galerie = ${exportPhotos.length} im PDF`
                      : `${sharedPhotos.length} geteilte Fotos verfügbar — aktivieren um sie mit aufzunehmen`}
                  </p>
                </div>
              </label>
            )}

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
                  {includeShared && extraSharedCount > 0 && (
                    <span className="text-[10px] opacity-80">
                      ({exportPhotos.length} Fotos)
                    </span>
                  )}
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

        {/* Ready state — v1.10.7: Open-in-Tab als Primary, Share als Secondary,
            Direct-Download komplett entfernt (funktionierte auf Samsung nicht). */}
        {ready && (
          <div className="space-y-2">
            <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-center">
              <p className="text-xs font-semibold text-success">
                ✓ PDF bereit ({ready.sizeMb} MB)
              </p>
              <p className="text-[10px] text-ink-mid mt-0.5 leading-relaxed">
                Auf Handy: blauer Button öffnet PDF — dann Browser-Menü → speichern
              </p>
            </div>

            {/* v1.10.7 — PRIMARY: PDF in Tab öffnen.
                Funktioniert auf Samsung A53, iOS Safari, Chrome, Edge.
                User kann dann via Browser-Menü „Speichern" wählen. */}
            <button
              type="button"
              onClick={handleOpenInTab}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 transition shadow-sm"
            >
              <Download size={16} />
              PDF öffnen + speichern
            </button>

            {/* v1.10.7 — SECONDARY: Teilen-Sheet via Share-API.
                Funktioniert auf iOS Safari sehr gut, Samsung Internet
                buggy. Daher als sekundäre Option. */}
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
              Neu generieren (z.B. nach neuen Fotos)
            </button>

            <p className="text-[10px] text-ink-light text-center italic mt-1 leading-relaxed">
              💡 Samsung: blauer Button → PDF im Tab → 3-Punkte-Menü oben rechts →
              „Seite speichern".
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
