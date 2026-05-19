"use client";

import {
  ExternalLink,
  Check,
  CircleSlash,
  Circle,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import type { ProgramItem } from "@/types/trip";
import type { ItemState } from "@/types/itemState";
import { classNames, mapsUrl } from "@/lib/formatters";
import { TransportButtons } from "@/components/ui/TransportButtons";

interface TimelineItemProps {
  item: ProgramItem;
  isLast?: boolean;
  /** v1.3.0: persistierter User-State (erledigt / ausgelassen / Notiz). */
  state?: ItemState;
  /** Toggle „erledigt" mit einem Tap (idle ↔ done). */
  onToggleDone?: () => void;
  /** Action-Sheet öffnen für Skip / Notiz / Reset. */
  onOpenMenu?: () => void;
}

const TYPE_COLORS: Record<ProgramItem["type"], string> = {
  flight: "bg-info/15 text-info",
  activity: "bg-navy/10 text-navy",
  food: "bg-gold/15 text-gold-600",
  accom: "bg-success/10 text-success",
  alternative: "bg-ink-light/15 text-ink-mid",
  transport: "bg-info/10 text-info",
  free: "bg-cream-200 text-ink-mid",
};

export function TimelineItem({
  item,
  isLast = false,
  state,
  onToggleDone,
  onOpenMenu,
}: TimelineItemProps) {
  const mark = state?.mark;
  const isDone = mark === "done";
  const isSkipped = mark === "skipped";
  const isMarked = isDone || isSkipped;
  const hasControls = !!onToggleDone || !!onOpenMenu;

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div
        className={classNames(
          "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-opacity",
          TYPE_COLORS[item.type],
          item.highlight &&
            !isMarked &&
            "ring-2 ring-gold ring-offset-2 ring-offset-white",
          isMarked && "opacity-50",
        )}
      >
        {item.icon}
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-3 top-7 bottom-[-12px] w-px bg-cream-300" />
      )}

      <div className="pb-4">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={classNames(
                "text-[11px] font-mono uppercase tracking-wider transition-colors",
                isMarked ? "text-ink-light line-through" : "text-ink-light",
              )}
            >
              {item.time}
            </p>
            <p
              className={classNames(
                "text-sm leading-snug mt-0.5 transition-colors",
                item.highlight && !isMarked
                  ? "font-semibold text-navy"
                  : "text-ink-dark",
                isDone && "line-through text-ink-mid opacity-70",
                isSkipped && "line-through text-ink-light opacity-60",
              )}
            >
              {item.label}
            </p>
            {item.note && (
              <p
                className={classNames(
                  "text-xs mt-1 leading-relaxed transition-colors",
                  isMarked ? "text-ink-light opacity-70" : "text-ink-mid",
                )}
              >
                {item.note}
              </p>
            )}
            {/* User-Notiz (v1.3.0) */}
            {state?.note && (
              <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-gold/10 border border-gold/30 px-2 py-1.5">
                <Pencil
                  size={10}
                  className="text-gold-600 flex-shrink-0 mt-0.5"
                />
                <p className="text-[11px] text-ink-dark leading-relaxed italic">
                  {state.note}
                </p>
              </div>
            )}
          </div>

          {/* State-Controls (v1.3.0) — rechts neben dem Item */}
          {hasControls && (
            <div className="flex items-center gap-0.5 flex-shrink-0 pt-0.5">
              {onToggleDone && (
                <button
                  type="button"
                  onClick={onToggleDone}
                  className={classNames(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                    isDone
                      ? "bg-success text-white"
                      : isSkipped
                        ? "bg-ink-light/20 text-ink-mid"
                        : "bg-cream-100 text-ink-light hover:bg-cream-200 hover:text-ink-mid",
                  )}
                  aria-label={
                    isDone
                      ? "Markierung entfernen"
                      : "Als erledigt markieren"
                  }
                >
                  {isDone ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isSkipped ? (
                    <CircleSlash size={13} strokeWidth={2.2} />
                  ) : (
                    <Circle size={13} strokeWidth={1.8} />
                  )}
                </button>
              )}
              {onOpenMenu && (
                <button
                  type="button"
                  onClick={onOpenMenu}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-ink-light hover:bg-cream-100 hover:text-ink-mid transition-colors"
                  aria-label="Mehr Optionen"
                >
                  <MoreHorizontal size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {item.coordinates && (
            <>
              <a
                href={mapsUrl(
                  item.coordinates.lat,
                  item.coordinates.lng,
                  item.label,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={classNames(
                  "text-xs hover:text-gold transition-colors font-medium inline-flex items-center gap-1",
                  isMarked ? "text-ink-mid opacity-70" : "text-navy",
                )}
              >
                📍 Karte
              </a>
              <TransportButtons
                coordinates={item.coordinates}
                label={item.label}
                compact
              />
            </>
          )}
          {item.bookingUrl && (
            <a
              href={item.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={classNames(
                "text-xs hover:text-gold transition-colors font-medium inline-flex items-center gap-1",
                isMarked ? "text-ink-mid opacity-70" : "text-navy",
              )}
            >
              <ExternalLink size={11} /> Buchen
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
