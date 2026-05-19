"use client";

import { useCallback, useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatPanel } from "./ChatPanel";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";

interface CompanionWidgetProps {
  tripSlug: string;
  destination: string;
  currentUserName?: string | null;
}

export function CompanionWidget({
  tripSlug,
  destination,
  currentUserName,
}: CompanionWidgetProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Close on iOS swipe-back / browser back
  useDismissOnBack(open, close);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="fixed bottom-24 right-4 z-30 bg-gradient-to-br from-gold to-gold-400 text-navy w-14 h-14 rounded-full shadow-elevated flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="KI-Reisebegleiter öffnen"
      >
        <Sparkles size={24} strokeWidth={2.2} />
        <span className="sr-only">KI-Reisebegleiter</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full ring-2 ring-cream animate-pulse" />
      </motion.button>

      {/* Slide-up panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-elevated overflow-hidden flex flex-col"
              style={{ height: "85vh", maxHeight: "700px" }}
            >
              <div className="mx-auto max-w-app w-full h-full flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-br from-navy to-navy-700 text-cream px-4 py-3.5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                      <Sparkles size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold leading-tight">
                        Dein {destination}-Companion
                      </p>
                      <p className="text-[10px] text-cream/70 uppercase tracking-wider">
                        Powered by Claude
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"
                    aria-label="Schließen"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Chat */}
                <ChatPanel
                  tripSlug={tripSlug}
                  destination={destination}
                  currentUserName={currentUserName}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
