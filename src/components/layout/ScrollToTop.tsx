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
          // between them so they don't overlap.
          // Apple HIG: min 44pt Touch-Target → 44×44 (war 40×40, knapp drunter).
          className="fixed bottom-44 right-4 z-30 bg-navy/90 text-cream w-11 h-11 rounded-full shadow-elevated flex items-center justify-center hover:bg-navy transition-colors backdrop-blur-sm"
          aria-label="Nach oben scrollen"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
