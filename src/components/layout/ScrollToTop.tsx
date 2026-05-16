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
          className="fixed bottom-24 right-4 z-30 bg-navy text-cream w-11 h-11 rounded-full shadow-elevated flex items-center justify-center hover:bg-navy-600 transition-colors"
          aria-label="Nach oben scrollen"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
