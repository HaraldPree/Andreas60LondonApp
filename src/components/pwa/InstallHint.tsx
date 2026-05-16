"use client";

import { Share, MoreVertical, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function InstallHint() {
  const { platform, shouldShow, dismiss } = useInstallPrompt();

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-3"
        >
          <div className="rounded-2xl bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/30 p-3 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
              <Smartphone size={16} className="text-gold-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy leading-tight">
                Als App installieren
              </p>
              {platform === "ios" ? (
                <p className="text-[11px] text-ink-mid leading-relaxed mt-1">
                  Tippe unten in Safari auf{" "}
                  <Share size={11} className="inline text-info" />{" "}
                  <strong>Teilen</strong> →{" "}
                  <strong>&quot;Zum Home-Bildschirm&quot;</strong>. Schon hast
                  du ein eigenes App-Icon!
                </p>
              ) : (
                <p className="text-[11px] text-ink-mid leading-relaxed mt-1">
                  Tippe oben rechts auf{" "}
                  <MoreVertical size={11} className="inline text-info" />{" "}
                  <strong>Menü</strong>:
                  <br />
                  <span className="text-[10px]">
                    • <strong>Samsung Internet:</strong> Mehr →{" "}
                    <strong>&quot;App zum Startbildschirm hinzufügen&quot;</strong>
                  </span>
                  <br />
                  <span className="text-[10px]">
                    • <strong>Chrome:</strong>{" "}
                    <strong>&quot;App installieren&quot;</strong> oder &quot;Zum
                    Startbildschirm hinzufügen&quot;
                  </span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="text-ink-light hover:text-warning flex-shrink-0 p-1"
              aria-label="Hinweis ausblenden"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
