"use client";

import { useState } from "react";
import {
  Footprints,
  ChevronDown,
  Clock,
  TrendingUp,
  Trees,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { RouteDifficulty, RunningRoute } from "@/types/trip";
import { classNames } from "@/lib/formatters";

interface RunningRoutesProps {
  routes: RunningRoute[];
}

const DIFFICULTY_LABEL: Record<RouteDifficulty, string> = {
  easy: "Leicht",
  moderate: "Mittel",
  challenging: "Anspruchsvoll",
};

const DIFFICULTY_COLOR: Record<RouteDifficulty, string> = {
  easy: "bg-success/15 text-success",
  moderate: "bg-gold/15 text-gold-600",
  challenging: "bg-warning/15 text-warning",
};

export function RunningRoutes({ routes }: RunningRoutesProps) {
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  if (routes.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 py-3 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
          <Footprints size={18} className="text-success" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-display text-base font-semibold text-navy">
            Laufrouten
          </h3>
          <p className="text-[11px] text-ink-mid">
            {routes.length} kuratierte Strecken vom Apartment aus
          </p>
        </div>
        <ChevronDown
          size={18}
          className={classNames(
            "text-ink-light transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="border-t border-cream-200">
              {routes.map((r) => {
                const isOpen = openId === r.id;
                return (
                  <li key={r.id} className="border-b border-cream-200 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : r.id)}
                      className="w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-cream-50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-ink-dark leading-tight">
                            {r.name}
                          </p>
                          {r.suggestedBy && (
                            <span className="text-[9px] uppercase tracking-wider bg-gold/15 text-gold-600 font-bold px-1.5 py-0.5 rounded">
                              Tipp: {r.suggestedBy}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 mt-1 text-[11px] text-ink-mid flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <TrendingUp size={10} />
                            {r.distanceKm.toFixed(1)} km
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={10} />
                            {r.estimatedMinutes} Min
                          </span>
                          <span
                            className={classNames(
                              "px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold text-[9px]",
                              DIFFICULTY_COLOR[r.difficulty],
                            )}
                          >
                            {DIFFICULTY_LABEL[r.difficulty]}
                          </span>
                          {r.loop && (
                            <span className="text-[10px] text-success">↻ Loop</span>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        size={16}
                        className={classNames(
                          "text-ink-light flex-shrink-0 mt-1 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden bg-cream-50"
                        >
                          <div className="px-4 py-3 space-y-2.5">
                            <p className="text-xs text-ink-dark leading-relaxed">
                              {r.shortDescription}
                            </p>
                            {r.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {r.highlights.map((h) => (
                                  <span
                                    key={h}
                                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white border border-cream-300 text-ink-mid"
                                  >
                                    <Trees size={9} />
                                    {h}
                                  </span>
                                ))}
                              </div>
                            )}
                            {r.bestTime && (
                              <p className="text-[11px] text-ink-mid italic inline-flex items-center gap-1">
                                <Sparkles size={10} className="text-gold-600" />
                                Beste Zeit: {r.bestTime}
                              </p>
                            )}
                            {r.notes && (
                              <p className="text-[11px] text-ink-mid italic leading-snug">
                                {r.notes}
                              </p>
                            )}
                            <a
                              href={r.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-navy text-cream text-xs font-semibold hover:bg-navy-600 transition"
                            >
                              Route in Google Maps öffnen
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
            <p className="px-4 py-2 text-[10px] text-ink-light italic text-center">
              💡 Mit dem KI-Companion können neue Routen besprochen werden
              (&quot;Hat jemand Lust auf 10 km am Themse-Ufer?&quot;).
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
