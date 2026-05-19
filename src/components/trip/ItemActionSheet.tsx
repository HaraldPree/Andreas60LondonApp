"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  CircleSlash,
  Pencil,
  Trash2,
  SkipForward,
} from "lucide-react";
import type { ItemMark, ItemState } from "@/types/itemState";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";

interface ItemActionSheetProps {
  open: boolean;
  itemTime: string;
  itemLabel: string;
  /** Aktueller persistierter Zustand des Items, oder undefined wenn unmarkiert. */
  currentState: ItemState | undefined;
  onClose: () => void;
  onCommit: (next: { mark: ItemMark | null; note: string }) => void;
  onClearAll: () => void;
  /**
   * v1.4.0 Phase 2 — „Ab hier Rest des Tages offen lassen".
   * Wenn gesetzt, erscheint im Sheet ein zusätzlicher Schnell-Action-Button.
   * Wird disabled wenn der Item das letzte des Tages ist (kein Sinn).
   */
  onRestOfDayOpen?: () => void;
  hasSubsequentItems?: boolean;
  subsequentCount?: number;
}

/**
 * v1.3.0 — Action-Sheet für Item-Editor (Phase 1).
 *
 * Bottom-Sheet das beim Tap auf „•••" pro Item erscheint. Bietet:
 *  - Mutually-exclusive Toggle „Erledigt" / „Ausgelassen"
 *  - Freitext-Notiz (optional)
 *  - „Markierung entfernen" (resettet alles)
 *  - Speichern / Abbrechen
 *
 * Pattern wie andere Modals (DayPickerModal, SharingConsentModal):
 *  - AnimatePresence + motion.div für Smooth-Animation
 *  - Backdrop-Click + X-Button + Swipe-Back schließen via
 *    useDismissOnBack
 *  - max-h-[85vh] für Tastatur-Sichtbarkeit auf kleinen Screens
 */
export function ItemActionSheet({
  open,
  itemTime,
  itemLabel,
  currentState,
  onClose,
  onCommit,
  onClearAll,
  onRestOfDayOpen,
  hasSubsequentItems = false,
  subsequentCount = 0,
}: ItemActionSheetProps) {
  // Lokaler Form-State, wird mit dem currentState gesynct wenn das
  // Sheet öffnet — so kann der User mehrmals toggeln ohne dass jeder
  // Tap sofort persistiert wird.
  const [mark, setMark] = useState<ItemMark | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setMark(currentState?.mark ?? null);
      setNote(currentState?.note ?? "");
    }
  }, [open, currentState]);

  useDismissOnBack(open, onClose);

  const hasAnyState =
    !!currentState?.mark || !!currentState?.note;

  const handleSave = () => {
    onCommit({ mark, note });
    onClose();
  };

  const handleClearAll = () => {
    onClearAll();
    onClose();
  };

  const toggleMark = (next: ItemMark) => {
    setMark((curr) => (curr === next ? null : next));
  };

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
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] max-h-[85dvh] overflow-y-auto bg-cream rounded-t-3xl shadow-elevated"
          >
            <div className="mx-auto max-w-app p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                    Item bearbeiten · {itemTime}
                  </p>
                  <h2 className="font-display text-base font-semibold text-navy leading-tight mt-0.5 line-clamp-2">
                    {itemLabel}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-cream-200 text-ink-mid flex items-center justify-center flex-shrink-0"
                  aria-label="Schließen"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Mark-Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => toggleMark("done")}
                  className={[
                    "flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl border transition",
                    mark === "done"
                      ? "bg-success text-white border-success shadow-card"
                      : "bg-white text-ink-dark border-cream-200 hover:bg-cream-50",
                  ].join(" ")}
                >
                  <Check size={20} strokeWidth={2.5} />
                  <span className="text-xs font-semibold">Erledigt</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleMark("skipped")}
                  className={[
                    "flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl border transition",
                    mark === "skipped"
                      ? "bg-ink-mid text-white border-ink-mid shadow-card"
                      : "bg-white text-ink-dark border-cream-200 hover:bg-cream-50",
                  ].join(" ")}
                >
                  <CircleSlash size={20} strokeWidth={2.2} />
                  <span className="text-xs font-semibold">Ausgelassen</span>
                </button>
              </div>

              {/* Note Editor */}
              <label className="block mb-3">
                <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold inline-flex items-center gap-1">
                  <Pencil size={10} /> Notiz (optional)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder='z.B. „war super", „abgebrochen weil zu voll"'
                  rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-cream-200 text-sm text-ink-dark placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 resize-none"
                />
              </label>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 transition"
                >
                  Speichern
                </button>
                {hasAnyState && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-warning/10 text-warning text-xs font-semibold border border-warning/30 hover:bg-warning/15 transition inline-flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={12} />
                    Markierung &amp; Notiz entfernen
                  </button>
                )}
              </div>

              {/* v1.4.0 Phase 2 — Schnell-Aktion: Ab hier Rest des Tages offen */}
              {onRestOfDayOpen && hasSubsequentItems && (
                <>
                  <div className="my-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-ink-light">
                    <div className="flex-1 h-px bg-cream-200" />
                    <span>Schnell-Aktion</span>
                    <div className="flex-1 h-px bg-cream-200" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onRestOfDayOpen();
                      onClose();
                    }}
                    className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-gold/15 text-gold-600 text-sm font-semibold border border-gold/40 hover:bg-gold/20 transition inline-flex items-center justify-center gap-2"
                  >
                    <SkipForward size={14} strokeWidth={2.5} />
                    Ab hier Rest des Tages offen lassen
                    <span className="text-[10px] font-normal opacity-80">
                      ({subsequentCount + 1} Items)
                    </span>
                  </button>
                  <p className="text-[10px] text-ink-light italic text-center mt-1.5 leading-relaxed">
                    Markiert dieses Item + alle danach als ausgelassen.
                    Einzeln rückgängig machbar.
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] mt-3 px-3 py-2 rounded-xl bg-cream-200 text-ink-mid text-xs font-semibold hover:bg-cream-300 transition"
              >
                Abbrechen
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
