"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, CloudRain } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Day } from "@/types/trip";
import { classNames } from "@/lib/formatters";
import { TimelineItem } from "./TimelineItem";

interface DayCardProps {
  day: Day;
  dayNumber: number;
  defaultOpen?: boolean;
  /** If known (>=0..100), shows a "Plan B" banner when precipitation is high. */
  rainProbability?: number;
}

export function DayCard({
  day,
  dayNumber,
  defaultOpen = false,
  rainProbability,
}: DayCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showRainy, setShowRainy] = useState(false);

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
                  />
                ))}
              </div>

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
    </div>
  );
}
