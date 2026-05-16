"use client";

import { useState } from "react";
import { BookOpen, Download, Loader2, CheckCircle2 } from "lucide-react";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";
import {
  buildPhotoBookZip,
  defaultZipFilename,
  triggerDownload,
  type PhotoBookExportProgress,
} from "@/lib/photoBookExport";

interface Props {
  trip: Trip;
  photos: PhotoMeta[];
}

export function PhotoBookExportButton({ trip, photos }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<PhotoBookExportProgress | null>(null);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (photos.length === 0) return null;

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setDoneAt(null);
    setProgress({ current: 0, total: photos.length, step: "collecting" });
    try {
      const blob = await buildPhotoBookZip({
        trip,
        photos,
        onProgress: setProgress,
      });
      triggerDownload(blob, defaultZipFilename(trip));
      setDoneAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export fehlgeschlagen");
    } finally {
      setExporting(false);
      // clear progress after a moment so the "done" tick stays briefly
      setTimeout(() => setProgress(null), 2500);
    }
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
        : progress?.step === "done"
          ? "Fertig — Download gestartet"
          : "";

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
              Download gestartet — nochmal exportieren
            </>
          ) : (
            <>
              <Download size={14} />
              ZIP herunterladen
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
