"use client";

import { useState } from "react";
import { X, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trip } from "@/types/trip";

interface DayPickerModalProps {
  open: boolean;
  trip: Trip;
  /** Pre-fill text for the time */
  defaultTime?: string;
  onClose: () => void;
  onConfirm: (params: { dayIndex: number; time?: string }) => void;
  title?: string;
  hint?: string;
}

export function DayPickerModal({
  open,
  trip,
  defaultTime,
  onClose,
  onConfirm,
  title = "An welchem Tag?",
  hint = "Wähle einen Reisetag, dem du diesen Ort zuordnen möchtest.",
}: DayPickerModalProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [time, setTime] = useState<string>(defaultTime ?? "");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-navy/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-y-auto bg-cream rounded-t-3xl shadow-elevated"
          >
            <div className="mx-auto max-w-app p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-semibold text-navy">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-cream-200 text-ink-mid flex items-center justify-center"
                  aria-label="Schließen"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-ink-mid mb-4">{hint}</p>

              <ul className="space-y-2">
                {trip.days.map((day, i) => {
                  const isSelected = selectedDay === i;
                  return (
                    <li key={day.date}>
                      <button
                        type="button"
                        onClick={() => setSelectedDay(i)}
                        className={`w-full text-left rounded-2xl border p-3 flex items-center gap-3 transition ${
                          isSelected
                            ? "bg-gold/15 border-gold shadow-card"
                            : "bg-white border-cream-200 hover:border-gold/40"
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ backgroundColor: `${day.color}15` }}
                        >
                          {day.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                            Tag {i + 1} · {day.date}
                          </p>
                          <p className="font-display text-sm font-semibold text-navy leading-tight">
                            {day.title}
                          </p>
                        </div>
                        {isSelected && (
                          <Sparkles size={14} className="text-gold flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {selectedDay !== null && (
                <div className="mt-4 space-y-2">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold inline-flex items-center gap-1">
                      <Calendar size={10} /> Uhrzeit (optional)
                    </span>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="z.B. 14:30 oder Nachmittag"
                      className="w-full px-2.5 py-2 text-sm rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      onConfirm({
                        dayIndex: selectedDay,
                        time: time.trim() || undefined,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-600 transition"
                  >
                    Zu Tag {selectedDay + 1} hinzufügen
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
