"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Calendar, X } from "lucide-react";
import type { ReservationStatus } from "@/types/trip";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";

interface Props {
  open: boolean;
  reservationName: string;
  currentStatus: ReservationStatus;
  onPick: (status: ReservationStatus) => void;
  onClose: () => void;
}

const OPTIONS: Array<{
  status: ReservationStatus;
  label: string;
  description: string;
  icon: typeof Check;
  bg: string;
  text: string;
}> = [
  {
    status: "offen",
    label: "Offen",
    description: "Reservierung steht noch aus",
    icon: Clock,
    bg: "bg-warning/10",
    text: "text-warning",
  },
  {
    status: "reserviert",
    label: "Reserviert",
    description: "Tisch / Termin steht fix",
    icon: Calendar,
    bg: "bg-gold/15",
    text: "text-gold-600",
  },
  {
    status: "erledigt",
    label: "Erledigt",
    description: "Schon gemacht — Haken dran",
    icon: Check,
    bg: "bg-success/10",
    text: "text-success",
  },
];

/**
 * v1.3.1 — Apple-Way Action-Sheet für Reservation-Status.
 *
 * Ersetzt das frühere „Cycle"-Pattern (Tap rotiert offen→reserviert→
 * erledigt), das den ungeliebten Hint „(tippen zum Ändern)" brauchte.
 * Jetzt: Tap auf Status-Balken öffnet dieses Sheet, User wählt direkt
 * → sofortiges Anwenden + Schließen.
 */
export function ReservationStatusSheet({
  open,
  reservationName,
  currentStatus,
  onPick,
  onClose,
}: Props) {
  useDismissOnBack(open, onClose);

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
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                    Status ändern
                  </p>
                  <h2 className="font-display text-base font-semibold text-navy leading-tight mt-0.5 line-clamp-2">
                    {reservationName}
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

              <div className="space-y-2">
                {OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = opt.status === currentStatus;
                  return (
                    <button
                      key={opt.status}
                      type="button"
                      onClick={() => {
                        onPick(opt.status);
                        onClose();
                      }}
                      className={[
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left min-h-[56px] transition",
                        active
                          ? `${opt.bg} ${opt.text} border-current shadow-card`
                          : "bg-white text-ink-dark border-cream-200 hover:bg-cream-50",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          active ? "bg-white/40" : opt.bg,
                        ].join(" ")}
                      >
                        <Icon size={18} className={active ? "" : opt.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p
                          className={[
                            "text-[11px] leading-relaxed",
                            active ? "opacity-90" : "text-ink-mid",
                          ].join(" ")}
                        >
                          {opt.description}
                        </p>
                      </div>
                      {active && <Check size={18} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
