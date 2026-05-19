"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { TripParticipant } from "@/types/trip";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";

interface PersonPickerProps {
  open: boolean;
  destination: string;
  participants: TripParticipant[];
  onPick: (name: string) => void;
  onSkip: () => void;
}

export function PersonPicker({
  open,
  destination,
  participants,
  onPick,
  onSkip,
}: PersonPickerProps) {
  // Swipe-back / Browser-back schließt = "Skip" (= als Gast weiter)
  useDismissOnBack(open, onSkip);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto bg-cream rounded-t-3xl shadow-elevated"
          >
            <div className="mx-auto max-w-app p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="text-center mb-4">
                <Sparkles size={20} className="text-gold mx-auto mb-2" />
                <h2 className="font-display text-xl font-semibold text-navy">
                  Willkommen in {destination}!
                </h2>
                <GoldDivider width="sm" className="mx-auto my-2" />
                <p className="text-sm text-ink-mid">
                  Wer bist du? Damit wir die App für dich persönlich machen können.
                </p>
              </div>

              <ul className="space-y-2">
                {participants.map((p) => {
                  const isCelebrant = p.role === "celebrant";
                  return (
                    <li key={p.name}>
                      <button
                        type="button"
                        onClick={() => onPick(p.name)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-2xl bg-white border border-cream-200 hover:border-gold hover:bg-gold/5 transition active:scale-[0.99] shadow-card"
                      >
                        <div
                          className="w-14 h-14 rounded-full overflow-hidden bg-cover bg-center flex items-center justify-center text-white font-semibold text-base flex-shrink-0"
                          style={{
                            backgroundColor: p.avatarColor ?? "#003366",
                            backgroundImage: p.avatarImage
                              ? `url('${p.avatarImage}')`
                              : undefined,
                          }}
                        >
                          {!p.avatarImage && p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-base font-semibold text-navy">
                            {p.name}
                          </p>
                          {isCelebrant && (
                            <p className="text-[11px] uppercase tracking-wider text-gold-600 font-bold">
                              🎂 Geburtstagskind
                            </p>
                          )}
                          {p.bio && !isCelebrant && (
                            <p className="text-[11px] text-ink-mid mt-0.5">
                              {p.bio}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={onSkip}
                className="w-full mt-4 text-xs text-ink-light underline hover:text-ink-mid py-2"
              >
                Lieber nicht zuordnen – einfach so verwenden
              </button>

              <p className="text-[10px] text-ink-light text-center mt-3">
                Deine Auswahl wird nur lokal auf deinem Gerät gespeichert.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
