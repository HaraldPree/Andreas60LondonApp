"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Lightbulb,
  CloudRain,
  Sparkles,
  MapPin,
  Trash2,
  Check,
  CircleSlash,
  Eye,
  Heart,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Day } from "@/types/trip";
import type { UserPlace } from "@/types/userPlace";
import type { DayDisruptionWindow } from "@/lib/disruptions";
import type { ItemMark, ItemState } from "@/types/itemState";
import type { PlaceStatus } from "@/types/place";
import { classNames, mapsUrl } from "@/lib/formatters";
import { TimelineItem } from "./TimelineItem";
import { DisruptionPill } from "./DisruptionPill";
import { ItemActionSheet } from "./ItemActionSheet";
import { PlaceStatusActionSheet } from "@/components/places/PlaceStatusActionSheet";
import { TransportButtons } from "@/components/ui/TransportButtons";

interface DayCardProps {
  day: Day;
  dayNumber: number;
  defaultOpen?: boolean;
  /** If known (>=0..100), shows a "Plan B" banner when precipitation is high. */
  rainProbability?: number;
  /** Active service disruptions for this day */
  disruptions?: DayDisruptionWindow[];
  /** User-added places (from photo identification, etc.) for this day */
  userPlaces?: UserPlace[];
  /** Called when user wants to remove an own discovery */
  onRemoveUserPlace?: (id: string) => void;

  /**
   * v1.3.0 — In-App-Editor (Phase 1).
   * Wenn diese Props gesetzt sind, zeigt jedes TimelineItem die
   * State-Controls (Circle + Menu), und der DayCard-Header bekommt
   * ein Stats-Badge + Reset-Day-Option.
   */
  itemStateFor?: (itemIndex: number) => ItemState | undefined;
  onToggleItemDone?: (itemIndex: number) => void;
  onCommitItemState?: (
    itemIndex: number,
    next: { mark: ItemMark | null; note: string },
  ) => void;
  onClearItem?: (itemIndex: number) => void;
  onClearDay?: () => void;
  /**
   * v1.4.0 — Phase 2: „Ab hier Rest des Tages offen lassen".
   */
  onRestOfDayOpen?: (fromItemIndex: number) => void;

  /**
   * v1.7.1 — Place-Status-Sync (Wunschliste ↔ Programm).
   * Wenn ein Item ein `placeId` hat, kann diese Funktion den aktuellen
   * Status liefern bzw. setzen. Header zeigt zusätzliche Stats.
   */
  placeStatusOf?: (placeId: string) => PlaceStatus;
  onSetPlaceStatus?: (placeId: string, next: PlaceStatus) => void;
}

export function DayCard({
  day,
  dayNumber,
  defaultOpen = false,
  rainProbability,
  disruptions = [],
  userPlaces = [],
  onRemoveUserPlace,
  itemStateFor,
  onToggleItemDone,
  onCommitItemState,
  onClearItem,
  onClearDay,
  onRestOfDayOpen,
  placeStatusOf,
  onSetPlaceStatus,
}: DayCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showRainy, setShowRainy] = useState(false);

  // Action-Sheet-State: welcher Item-Index ist gerade offen?
  const [sheetIndex, setSheetIndex] = useState<number | null>(null);
  const sheetItem = sheetIndex !== null ? day.items[sheetIndex] : null;
  const sheetState =
    sheetIndex !== null && itemStateFor ? itemStateFor(sheetIndex) : undefined;

  // v1.7.1 — Place-Status Action-Sheet (für Items mit placeId)
  const [placeStatusSheetIndex, setPlaceStatusSheetIndex] = useState<
    number | null
  >(null);
  const placeStatusSheetItem =
    placeStatusSheetIndex !== null
      ? day.items[placeStatusSheetIndex]
      : null;
  const placeStatusSheetCurrent: PlaceStatus =
    placeStatusSheetItem?.placeId && placeStatusOf
      ? placeStatusOf(placeStatusSheetItem.placeId)
      : "open";

  // v1.7.1 — Per-Day Place-Stats
  const placeStats = useMemo(() => {
    if (!placeStatusOf) return null;
    let wantToSee = 0;
    let passed = 0;
    let done = 0;
    let withPlace = 0;
    for (const item of day.items) {
      if (!item.placeId) continue;
      withPlace += 1;
      const s = placeStatusOf(item.placeId);
      if (s === "wantToSee") wantToSee += 1;
      else if (s === "passed") passed += 1;
      else if (s === "done") done += 1;
    }
    return { wantToSee, passed, done, withPlace };
  }, [day.items, placeStatusOf]);

  // Stats für den Header-Badge
  const stats = useMemo(() => {
    if (!itemStateFor) return null;
    let done = 0;
    let skipped = 0;
    let touched = 0;
    for (let i = 0; i < day.items.length; i += 1) {
      const s = itemStateFor(i);
      if (!s) continue;
      touched += 1;
      if (s.mark === "done") done += 1;
      else if (s.mark === "skipped") skipped += 1;
    }
    return { done, skipped, touched, total: day.items.length };
  }, [day.items, itemStateFor]);

  const rainLikely =
    typeof rainProbability === "number" && rainProbability >= 40;

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      {/* Colored top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: day.color }} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: `${day.color}15` }}
        >
          {day.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light">
              Tag {dayNumber + 1}
            </span>
            <span className="text-[10px] font-mono text-ink-light">
              · {day.date}
            </span>
            {day.weatherHint && (
              <span className="text-[10px] text-ink-light italic">
                · {day.weatherHint}
              </span>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold text-navy leading-tight mt-0.5">
            {day.title}
          </h3>
          <p className="text-xs text-ink-mid mt-0.5 line-clamp-2">{day.summary}</p>
          {disruptions.length > 0 && (
            <div className="mt-1.5">
              <DisruptionPill windows={disruptions} />
            </div>
          )}
          {/* v1.7.1 Place-Stats — wenn Items mit placeId existieren UND
              mindestens einer markiert ist */}
          {placeStats &&
            placeStats.withPlace > 0 &&
            (placeStats.wantToSee + placeStats.passed + placeStats.done >
              0) && (
              <div className="mt-1.5 inline-flex items-center gap-2 text-[10px] font-mono">
                {placeStats.done > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-success">
                    <Check size={10} strokeWidth={3} />
                    {placeStats.done}
                  </span>
                )}
                {placeStats.passed > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-info">
                    <Eye size={10} strokeWidth={2.2} />
                    {placeStats.passed}
                  </span>
                )}
                {placeStats.wantToSee > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-gold-600">
                    <Heart size={10} fill="currentColor" strokeWidth={0} />
                    {placeStats.wantToSee}
                  </span>
                )}
                <span className="text-ink-light">
                  / {placeStats.withPlace} Punkt(e)
                </span>
              </div>
            )}
          {/* v1.3.0 Stats-Badge — nur sichtbar wenn mind. 1 Item markiert */}
          {stats && stats.touched > 0 && (
            <div className="mt-1.5 inline-flex items-center gap-2 text-[10px] font-mono">
              {stats.done > 0 && (
                <span className="inline-flex items-center gap-0.5 text-success">
                  <Check size={10} strokeWidth={3} />
                  {stats.done}
                </span>
              )}
              {stats.skipped > 0 && (
                <span className="inline-flex items-center gap-0.5 text-ink-mid">
                  <CircleSlash size={10} strokeWidth={2.5} />
                  {stats.skipped}
                </span>
              )}
              <span className="text-ink-light">
                / {stats.total} Punkte
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          size={20}
          className={classNames(
            "text-ink-light flex-shrink-0 mt-2 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="h-px bg-cream-200 mb-4" />

              {/* Timeline */}
              <div className="space-y-0">
                {day.items.map((item, i) => (
                  <TimelineItem
                    key={i}
                    item={item}
                    isLast={i === day.items.length - 1}
                    state={itemStateFor ? itemStateFor(i) : undefined}
                    onToggleDone={
                      onToggleItemDone ? () => onToggleItemDone(i) : undefined
                    }
                    onOpenMenu={
                      onCommitItemState ? () => setSheetIndex(i) : undefined
                    }
                    placeStatus={
                      item.placeId && placeStatusOf
                        ? placeStatusOf(item.placeId)
                        : undefined
                    }
                    onOpenPlaceStatus={
                      item.placeId && onSetPlaceStatus
                        ? () => setPlaceStatusSheetIndex(i)
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* v1.3.0 — Day-Reset wenn Items markiert sind */}
              {stats && stats.touched > 0 && onClearDay && (
                <div className="mt-3 -mb-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `Alle ${stats.touched} Markierung(en) und Notizen für „${day.title}" zurücksetzen?`,
                        )
                      ) {
                        onClearDay();
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-ink-light hover:text-warning transition-colors"
                  >
                    <RotateCcw size={11} />
                    Tag zurücksetzen
                  </button>
                </div>
              )}

              {/* User-added discoveries */}
              {userPlaces.length > 0 && (
                <div className="mt-4 rounded-xl bg-gold/5 border border-gold/30 overflow-hidden">
                  <div className="px-3 py-2 bg-gold/10 border-b border-gold/20">
                    <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider inline-flex items-center gap-1.5">
                      <Sparkles size={12} /> Eure Entdeckungen ({userPlaces.length})
                    </p>
                  </div>
                  <ul className="divide-y divide-gold/10">
                    {userPlaces.map((p) => (
                      <li key={p.id} className="p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {p.time && (
                                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light">
                                  {p.time}
                                </span>
                              )}
                              {p.category && (
                                <span className="text-[9px] uppercase tracking-wider bg-navy/10 text-navy font-bold px-1.5 py-0.5 rounded">
                                  {p.category}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-ink-dark leading-tight mt-0.5">
                              {p.name}
                            </p>
                            {p.description && (
                              <p className="text-xs text-ink-mid mt-1 leading-relaxed">
                                {p.description}
                              </p>
                            )}
                            {p.address && (
                              <p className="text-[10px] text-ink-light italic mt-0.5">
                                📍 {p.address}
                              </p>
                            )}
                            {p.notes && (
                              <p className="text-[11px] text-ink-mid italic mt-1">
                                💡 {p.notes}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {p.coordinates && (
                                <>
                                  <a
                                    href={mapsUrl(p.coordinates.lat, p.coordinates.lng, p.name)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-navy hover:text-gold transition-colors font-medium inline-flex items-center gap-1"
                                  >
                                    <MapPin size={11} /> Karte
                                  </a>
                                  <TransportButtons
                                    coordinates={p.coordinates}
                                    label={p.name}
                                    compact
                                  />
                                </>
                              )}
                            </div>
                          </div>
                          {onRemoveUserPlace && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`"${p.name}" wieder entfernen?`)) {
                                  onRemoveUserPlace(p.id);
                                }
                              }}
                              className="text-ink-light hover:text-warning flex-shrink-0 p-1"
                              aria-label="Entfernen"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              {day.tips.length > 0 && (
                <div className="mt-4 p-3 bg-gold/5 border border-gold/20 rounded-xl">
                  <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Lightbulb size={12} /> Tipps für heute
                  </p>
                  <ul className="space-y-1.5">
                    {day.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="text-xs text-ink-mid leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gold"
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rainy Alternative */}
              {day.rainyAlternative && (
                <div
                  className={classNames(
                    "mt-3 rounded-xl border overflow-hidden",
                    rainLikely
                      ? "bg-info/5 border-info/40"
                      : "bg-cream-50 border-cream-200",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setShowRainy((v) => !v)}
                    className="w-full text-left px-3 py-2.5 flex items-start gap-2"
                  >
                    <CloudRain
                      size={16}
                      className={classNames(
                        "flex-shrink-0 mt-0.5",
                        rainLikely ? "text-info" : "text-ink-light",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={classNames(
                          "text-xs font-semibold uppercase tracking-wider",
                          rainLikely ? "text-info" : "text-ink-mid",
                        )}
                      >
                        {rainLikely
                          ? `Regen wahrscheinlich (${rainProbability}%) – Plan B`
                          : "Plan B bei Regen"}
                      </p>
                      <p className="text-xs text-ink-dark leading-tight mt-0.5">
                        {day.rainyAlternative.title}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={classNames(
                        "text-ink-light flex-shrink-0 mt-1 transition-transform",
                        showRainy && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {showRainy && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1">
                          {day.rainyAlternative.note && (
                            <p className="text-[11px] text-ink-mid italic mb-2">
                              {day.rainyAlternative.note}
                            </p>
                          )}
                          <div className="bg-white rounded-lg p-3 border border-cream-200">
                            {day.rainyAlternative.items.map((item, i) => (
                              <TimelineItem
                                key={i}
                                item={item}
                                isLast={
                                  i ===
                                  (day.rainyAlternative?.items.length ?? 0) - 1
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* v1.3.0 — Action-Sheet pro Item (Phase 1)
          v1.4.0 — + Schnell-Aktion „Ab hier Rest offen" (Phase 2) */}
      {sheetItem && onCommitItemState && sheetIndex !== null && (
        <ItemActionSheet
          open={sheetIndex !== null}
          itemTime={sheetItem.time}
          itemLabel={sheetItem.label}
          currentState={sheetState}
          onClose={() => setSheetIndex(null)}
          onCommit={(next) => onCommitItemState(sheetIndex, next)}
          onClearAll={() => onClearItem?.(sheetIndex)}
          onRestOfDayOpen={
            onRestOfDayOpen ? () => onRestOfDayOpen(sheetIndex) : undefined
          }
          hasSubsequentItems={sheetIndex < day.items.length - 1}
          subsequentCount={day.items.length - 1 - sheetIndex}
        />
      )}

      {/* v1.7.1 — Place-Status Action-Sheet (Programm ↔ Wunschliste-Sync) */}
      {placeStatusSheetItem &&
        placeStatusSheetItem.placeId &&
        onSetPlaceStatus && (
          <PlaceStatusActionSheet
            open={placeStatusSheetIndex !== null}
            placeName={placeStatusSheetItem.label}
            subtitle={`${placeStatusSheetItem.time} · ${day.date}`}
            currentStatus={placeStatusSheetCurrent}
            onSelect={(next) =>
              onSetPlaceStatus(placeStatusSheetItem.placeId!, next)
            }
            onClose={() => setPlaceStatusSheetIndex(null)}
          />
        )}
    </div>
  );
}
