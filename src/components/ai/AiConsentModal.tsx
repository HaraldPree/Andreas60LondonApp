"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Globe, Lock, Brain } from "lucide-react";
import type { ConsentChoice } from "@/hooks/useAiConsent";

interface AiConsentModalProps {
  open: boolean;
  title: string;
  /** Specific action description, e.g. "Foto an Claude Vision senden" */
  actionDescription: string;
  /** Provider name shown in disclosure, e.g. "Anthropic (USA)" */
  provider?: string;
  /** What data is being sent */
  dataSent: string[];
  onDecide: (choice: ConsentChoice) => void;
}

export function AiConsentModal({
  open,
  title,
  actionDescription,
  provider = "Anthropic (Claude, USA)",
  dataSent,
  onDecide,
}: AiConsentModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onDecide("never")}
            className="fixed inset-0 z-[55] bg-navy/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            // Flex column with a hard max-height so the modal can't
            // exceed the viewport. Header + actions stay fixed, body
            // becomes scrollable when content overflows.
            // top-1/2 + -translate-y-1/2 centers vertically when the
            // content fits; max-h-[90vh] keeps it inside the viewport
            // when it doesn't.
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-[60] bg-white rounded-2xl shadow-elevated overflow-hidden flex flex-col max-h-[90vh] max-h-[90dvh]"
          >
            {/* Header (fixed) */}
            <div className="bg-gradient-to-br from-info to-info/80 text-white p-4 flex items-start gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider opacity-80">
                  Einwilligung nötig (EU AI Act)
                </p>
                <h3 className="font-display text-lg font-semibold leading-tight">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onDecide("never")}
                className="text-white/80 hover:text-white flex-shrink-0"
                aria-label="Abbrechen"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
              <p className="text-sm text-ink-dark leading-relaxed">
                {actionDescription}
              </p>

              <div className="rounded-xl bg-cream-50 border border-cream-200 p-3 space-y-2">
                <DisclosureRow
                  icon={<Globe size={12} />}
                  label="Empfänger"
                  value={provider}
                />
                <DisclosureRow
                  icon={<Brain size={12} />}
                  label="Wird gesendet"
                  value={dataSent.join(", ")}
                />
                <DisclosureRow
                  icon={<Lock size={12} />}
                  label="Speicherung"
                  value="Anthropic speichert Inputs nicht standardmäßig für Training (per Datenschutz-Policy)"
                />
              </div>

              <p className="text-[11px] text-ink-mid leading-relaxed">
                <strong>Wichtig:</strong> KI-Antworten können Fehler enthalten.
                Sensible Daten (Gesundheit, Personenbezug) NICHT teilen.
              </p>
            </div>

            {/* Actions (fixed at bottom — always visible, even on short screens) */}
            <div className="bg-cream-50 border-t border-cream-200 p-3 flex flex-col gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => onDecide("always")}
                className="w-full px-3 py-2.5 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-600 transition"
              >
                Ja, immer (nicht mehr fragen)
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDecide("once")}
                  className="flex-1 px-3 py-2 rounded-xl bg-gold/15 text-gold-600 text-xs font-semibold hover:bg-gold/25 transition"
                >
                  Nur diesmal
                </button>
                <button
                  type="button"
                  onClick={() => onDecide("never")}
                  className="flex-1 px-3 py-2 rounded-xl bg-cream-200 text-ink-mid text-xs font-semibold hover:bg-cream-300 transition"
                >
                  Abbrechen
                </button>
              </div>
              <p className="text-[10px] text-ink-light text-center italic">
                Diese Einwilligung kannst du jederzeit unter Info → Meine Daten widerrufen.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DisclosureRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-ink-light mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
          {label}
        </p>
        <p className="text-xs text-ink-dark leading-relaxed">{value}</p>
      </div>
    </div>
  );
}
