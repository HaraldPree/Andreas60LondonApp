"use client";

import { useState } from "react";
import { Cloud, CloudRain, Sun, ChevronDown, Info } from "lucide-react";
import type { Trip } from "@/types/trip";
import type { TripVariant } from "@/hooks/useTripVariant";
import { classNames } from "@/lib/formatters";

interface Props {
  trip: Trip;
  variant: TripVariant;
  onChange: (next: TripVariant) => void;
}

/**
 * Switcher zwischen Original-Programm und Alternative.
 *
 * Erscheint nur wenn `trip.alternativeDays` + `alternativeDaysMeta`
 * gesetzt sind. Ansonsten nichts rendern.
 *
 * Design: prominente Pill am Anfang des Programm-Tabs damit die
 * 4 Mitreisenden klar sehen welche Version sie gerade lesen — vor
 * allem wichtig damit niemand versehentlich nach dem alten Programm
 * geht obwohl das geänderte aktiv ist.
 */
export function TripVariantSwitcher({ trip, variant, onChange }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const meta = trip.alternativeDaysMeta;
  if (!meta || !trip.alternativeDays) return null;

  const alternativeActive = variant === "alternative";

  return (
    <div
      className={classNames(
        "rounded-2xl border-2 overflow-hidden",
        alternativeActive
          ? "bg-info/5 border-info/40"
          : "bg-cream-50 border-cream-300",
      )}
    >
      <div className="p-3 flex items-start gap-3">
        <div
          className={classNames(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            alternativeActive ? "bg-info/15 text-info" : "bg-cream-200 text-ink-mid",
          )}
        >
          {alternativeActive ? <CloudRain size={18} /> : <Sun size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-ink-mid font-semibold">
            Aktive Programm-Version
          </p>
          <p className="font-display text-sm font-semibold text-navy leading-tight">
            {alternativeActive ? meta.label : "Original-Programm"}
          </p>
          <p className="text-[11px] text-ink-mid mt-0.5">
            {alternativeActive
              ? `${meta.affectedDayIndices.length} Tag(e) angepasst`
              : "Ursprüngliche Planung — keine Wetter-Anpassung"}
          </p>
        </div>
      </div>

      {/* Switcher-Pills */}
      <div className="px-3 pb-3 flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange("original")}
          className={classNames(
            "flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition",
            !alternativeActive
              ? "bg-navy text-cream shadow-sm"
              : "bg-cream-200 text-ink-mid hover:bg-cream-300",
          )}
        >
          <Cloud size={12} />
          Original
        </button>
        <button
          type="button"
          onClick={() => onChange("alternative")}
          className={classNames(
            "flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition",
            alternativeActive
              ? "bg-info text-white shadow-sm"
              : "bg-cream-200 text-ink-mid hover:bg-cream-300",
          )}
        >
          <CloudRain size={12} />
          {meta.label}
        </button>
      </div>

      {/* Details-Toggle */}
      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        className="w-full px-3 py-2 border-t border-cream-200 inline-flex items-center justify-center gap-1.5 text-[11px] text-ink-mid hover:text-navy transition"
      >
        <Info size={11} />
        Was wurde geändert?
        <ChevronDown
          size={11}
          className={classNames(
            "transition-transform",
            detailsOpen && "rotate-180",
          )}
        />
      </button>

      {detailsOpen && (
        <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-cream-200">
          <p className="text-xs text-ink-dark leading-relaxed">
            {meta.description}
          </p>
          <p className="text-[10px] text-ink-light italic">
            Quelle: {meta.source}
          </p>
          {meta.affectedDayIndices.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mt-1">
                Angepasste Tage:
              </p>
              <ul className="mt-1 space-y-0.5">
                {meta.affectedDayIndices.map((i) => {
                  const orig = trip.days[i];
                  const alt = trip.alternativeDays?.[i] ?? orig;
                  return (
                    <li key={i} className="text-[11px] text-ink-mid">
                      <strong>Tag {i + 1} ({orig?.date}):</strong>{" "}
                      <span className="text-ink-dark">{alt.title}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <p className="text-[10px] text-ink-light italic pt-1 border-t border-cream-200 mt-2">
            💡 Deine Wahl wird auf diesem Handy gespeichert. Andere
            Reisende können unabhängig wechseln.
          </p>
        </div>
      )}
    </div>
  );
}
