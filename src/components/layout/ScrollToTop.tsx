"use client";

import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export function ScrollToTop() {
  const scrollY = useScrollPosition();
  const visible = scrollY > 400;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          // Position: stacked ABOVE the AI-Companion sparkle button
          // (which sits at bottom-24 right-4 with size 56px). 24px gap
          // between them so they don't overlap. Smaller (40px instead
          // of 44px) to read as the secondary control.
          // Reported by Martin May 21 2026: the previous bottom-24
          // position was identical to the AI button → invisible.
          className="fixed bottom-44 right-4 z-30 bg-navy/90 text-cream w-10 h-10 rounded-full shadow-elevated flex items-center justify-center hover:bg-navy transition-colors backdrop-blur-sm"
          aria-label="Nach oben scrollen"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
