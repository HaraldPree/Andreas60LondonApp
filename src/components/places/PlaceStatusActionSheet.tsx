"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Circle, Heart, Eye, Check, X } from "lucide-react";
import type { PlaceStatus } from "@/types/place";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";

interface Props {
  open: boolean;
  placeName: string;
  /** Optionaler Untertitel z.B. „Zeit / Kategorie / Tag" */
  subtitle?: string;
  currentStatus: PlaceStatus;
  onSelect: (next: PlaceStatus) => void;
  onClose: () => void;
}

/**
 * v1.7.1 — Action-Sheet für Place-Status (4 Stufen).
 *
 * Wird im Programm-Tab beim Tap auf den Status-Indikator pro Item
 * geöffnet. In der Wunschliste werden die 3 großen Status-Buttons
 * direkt inline gezeigt (anderes Pattern, weil dort Bulk-Markieren
 * schneller sein soll).
 *
 * Apple-Action-Sheet-Pattern: 4 große horizontale Optionen mit Icon
 * + Label, klare Trennung des aktuell aktiven Status.
 */
export function PlaceStatusActionSheet({
  open,
  placeName,
  subtitle,
  currentStatus,
  onSelect,
  onClose,
}: Props) {
  useDismissOnBack(open, onClose);

  const options: Array<{
    value: PlaceStatus;
    icon: React.ReactNode;
    label: string;
    sub: string;
    color: string;
    bgActive: string;
  }> = [
    {
      value: "open",
      icon: <Circle size={20} strokeWidth={1.8} />,
      label: "Offen",
      sub: "Nicht markiert",
      color: "text-ink-light",
      bgActive: "bg-cream-200",
    },
    {
      value: "wantToSee",
      icon: <Heart size={20} fill="currentColor" strokeWidth={0} />,
      label: "Wunsch",
      sub: "Will ich noch sehen",
      color: "text-gold-600",
      bgActive: "bg-gold/15 border-gold/40",
    },
    {
      value: "passed",
      icon: <Eye size={20} strokeWidth={2} />,
      label: "Vorbei",
      sub: "Außen gesehen, im Vorbeigehen",
      color: "text-info",
      bgActive: "bg-info/15 border-info/40",
    },
    {
      value: "done",
      icon: <Check size={20} strokeWidth={3} />,
      label: "Erledigt",
      sub: "Vollständig erlebt — innen / drin",
      color: "text-success",
      bgActive: "bg-success/15 border-success/40",
    },
  ];

  const handleSelect = (next: PlaceStatus) => {
    onSelect(next);
    onClose();
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
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  {subtitle && (
                    <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                      {subtitle}
                    </p>
                  )}
                  <h2 className="font-display text-base font-semibold text-navy leading-tight mt-0.5 line-clamp-2">
                    {placeName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-11 h-11 -m-2 rounded-full text-ink-mid flex items-center justify-center flex-shrink-0"
                  aria-label="Schließen"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 4 Status-Optionen */}
              <div className="space-y-1.5">
                {options.map((opt) => {
                  const isActive = currentStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={[
                        "w-full text-left flex items-center gap-3 px-3 py-2.5 min-h-[56px] rounded-xl border transition",
                        isActive
                          ? `${opt.bgActive} shadow-sm`
                          : "bg-white border-cream-200/70 hover:bg-cream-50",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          isActive
                            ? `${opt.color}`
                            : "text-ink-light bg-cream-100",
                        ].join(" ")}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={[
                            "text-sm font-semibold leading-tight",
                            isActive ? opt.color : "text-ink-dark",
                          ].join(" ")}
                        >
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-ink-mid leading-relaxed mt-0.5">
                          {opt.sub}
                        </p>
                      </div>
                      {isActive && (
                        <div className="flex-shrink-0 text-[10px] font-mono uppercase tracking-wider text-ink-light">
                          aktiv
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Cancel-Footer */}
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
