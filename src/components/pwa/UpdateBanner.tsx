"use client";

import { RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useVersionCheck } from "@/hooks/useVersionCheck";

export function UpdateBanner() {
  const { updateAvailable } = useVersionCheck();
  const [dismissed, setDismissed] = useState(false);
  const [reloading, setReloading] = useState(false);

  const visible = updateAvailable && !dismissed;

  const reload = () => {
    setReloading(true);
    // Force a network fetch (browser will pick up new JS/HTML).
    // Doing both: hard reload + cache-bust query for stubborn iOS.
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("_v", Date.now().toString());
      window.location.replace(url.toString());
    } catch {
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="fixed top-0 left-0 right-0 z-[60]"
        >
          <div className="mx-auto max-w-app px-3 pt-2">
            <div className="rounded-xl bg-gradient-to-r from-gold to-gold-400 text-navy shadow-elevated px-3 py-2 flex items-center gap-2">
              <button
                type="button"
                onClick={reload}
                disabled={reloading}
                className="flex-1 flex items-center gap-2 text-left"
              >
                <RefreshCw
                  size={15}
                  className={reloading ? "animate-spin" : ""}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold leading-tight">
                    {reloading ? "Lade neue Version…" : "Neue Version verfügbar"}
                  </p>
                  {!reloading && (
                    <p className="text-[10px] leading-tight opacity-80">
                      Tippen zum Aktualisieren
                    </p>
                  )}
                </div>
              </button>
              {!reloading && (
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center flex-shrink-0"
                  aria-label="Hinweis ausblenden"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
