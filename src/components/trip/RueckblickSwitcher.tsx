"use client";

import { CalendarCheck, Camera, MapPin } from "lucide-react";
import { classNames } from "@/lib/formatters";

export type RueckblickMode = "geplant" | "erlebt";

interface Props {
  mode: RueckblickMode;
  onChange: (next: RueckblickMode) => void;
  totalPhotos: number;
  matchedStops: number;
  unmatchedStops: number;
  photosWithGps: number;
}

/**
 * v1.14.0 — Switcher zwischen „Geplant" (Original-Tagesprogramm) und
 * „Erlebt" (Rückblick aus Foto-EXIF rekonstruiert).
 *
 * Erscheint nur wenn die Reise vorbei ist und genug Fotos für eine
 * Rekonstruktion vorhanden sind (Entscheidung im Parent — ProgrammTab).
 *
 * Ersetzt den alten TripVariantSwitcher (Original/Leger) der nach
 * Reise-Ende nicht mehr nützlich war.
 */
export function RueckblickSwitcher({
  mode,
  onChange,
  totalPhotos,
  matchedStops,
  unmatchedStops,
  photosWithGps,
}: Props) {
  const erlebtActive = mode === "erlebt";

  return (
    <div
      className={classNames(
        "rounded-2xl border-2 overflow-hidden",
        erlebtActive
          ? "bg-success/5 border-success/40"
          : "bg-cream-50 border-cream-300",
      )}
    >
      <div className="p-3 flex items-start gap-3">
        <div
          className={classNames(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            erlebtActive
              ? "bg-success/15 text-success"
              : "bg-navy/10 text-navy",
          )}
        >
          {erlebtActive ? <Camera size={18} /> : <CalendarCheck size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-ink-mid font-semibold">
            Programm-Ansicht
          </p>
          <p className="font-display text-sm font-semibold text-navy leading-tight">
            {erlebtActive ? "Erlebt" : "Geplant"}
          </p>
          <p className="text-[11px] text-ink-mid mt-0.5">
            {erlebtActive
              ? `${totalPhotos} ${totalPhotos === 1 ? "Foto" : "Fotos"} · ${matchedStops} ${matchedStops === 1 ? "erkannter Stop" : "erkannte Stops"}${unmatchedStops > 0 ? ` · ${unmatchedStops} ohne Match` : ""}`
              : "Was wir uns vorgenommen hatten"}
          </p>
        </div>
      </div>

      {/* Switcher-Pills */}
      <div className="px-3 pb-3 flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange("geplant")}
          className={classNames(
            "flex-1 inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-lg text-[11px] font-semibold transition",
            !erlebtActive
              ? "bg-navy text-cream shadow-sm"
              : "bg-cream-200 text-ink-mid hover:bg-cream-300",
          )}
        >
          <CalendarCheck size={12} />
          Geplant
        </button>
        <button
          type="button"
          onClick={() => onChange("erlebt")}
          className={classNames(
            "flex-1 inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-lg text-[11px] font-semibold transition",
            erlebtActive
              ? "bg-success text-white shadow-sm"
              : "bg-cream-200 text-ink-mid hover:bg-cream-300",
          )}
        >
          <Camera size={12} />
          Erlebt
        </button>
      </div>

      {/* Erklär-Text wenn „Erlebt" aktiv + Daten-Lücken */}
      {erlebtActive && photosWithGps < totalPhotos && totalPhotos > 0 && (
        <div className="px-3 pb-3 pt-1 border-t border-cream-200">
          <p className="text-[10px] text-ink-mid leading-relaxed inline-flex items-start gap-1">
            <MapPin size={10} className="mt-[1px] flex-shrink-0 text-ink-light" />
            <span>
              {totalPhotos - photosWithGps} von {totalPhotos} Fotos haben kein
              GPS — die werden gruppiert, aber ohne Ort-Erkennung gezeigt.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
