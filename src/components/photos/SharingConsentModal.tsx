"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, ExternalLink, AlertTriangle } from "lucide-react";
import {
  CURRENT_AGB_VERSION,
  CURRENT_DATENSCHUTZ_VERSION,
  acceptCurrentVersions,
} from "@/lib/consentStorage";

interface Props {
  open: boolean;
  tripSlug: string;
  userName: string;
  onAccept: () => void;
  onCancel: () => void;
}

/**
 * Einwilligungs-Modal vor erstem Foto-Sharing.
 *
 * Erscheint EINMAL pro (Reise + Person) bevor der/die Reisende
 * ein Foto in eine über-private Stufe hochlädt. Beide Checkboxen
 * (AGB + Datenschutz) müssen aktiv angeklickt sein — Privacy by
 * Design, kein versteckter Default-Akzept.
 *
 * Bei Annahme: persistiert in localStorage via acceptCurrentVersions().
 * Bei Cancel: User kehrt zur Foto-Auswahl zurück, Foto bleibt 🔒.
 */
export function SharingConsentModal({
  open,
  tripSlug,
  userName,
  onAccept,
  onCancel,
}: Props) {
  const [agbChecked, setAgbChecked] = useState(false);
  const [datenschutzChecked, setDatenschutzChecked] = useState(false);
  const bothChecked = agbChecked && datenschutzChecked;

  const handleAccept = () => {
    if (!bothChecked) return;
    acceptCurrentVersions(tripSlug, userName);
    onAccept();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-[55] bg-navy/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-[60] bg-white rounded-2xl shadow-elevated overflow-hidden flex flex-col max-h-[90vh] max-h-[90dvh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-navy to-navy-700 text-cream p-4 flex items-start gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-cream/70">
                  Einmalige Einwilligung — DSGVO Art. 6 Abs. 1 lit. a
                </p>
                <h3 className="font-display text-lg font-semibold leading-tight">
                  Foto-Sharing aktivieren
                </h3>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-cream/80 hover:text-cream flex-shrink-0"
                aria-label="Abbrechen"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
              <p className="text-sm text-ink-dark leading-relaxed">
                Du möchtest gerade ein Foto mit dem Geburtstagskind oder
                der ganzen Reisegruppe teilen. Bevor wir das tun, brauchen
                wir deine bewusste Einwilligung:
              </p>

              <div className="rounded-xl bg-gold/10 border border-gold/30 p-3 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agbChecked}
                    onChange={(e) => setAgbChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-gold flex-shrink-0"
                  />
                  <span className="text-xs text-ink-dark leading-relaxed">
                    Ich akzeptiere die{" "}
                    <Link
                      href="/agb"
                      target="_blank"
                      className="underline text-navy font-semibold inline-flex items-center gap-0.5"
                    >
                      Nutzungsbedingungen (AGB)
                      <ExternalLink size={9} />
                    </Link>{" "}
                    in Version {CURRENT_AGB_VERSION} — insbesondere die
                    Pflichten beim Foto-Upload (Abschnitt 3).
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={datenschutzChecked}
                    onChange={(e) => setDatenschutzChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-gold flex-shrink-0"
                  />
                  <span className="text-xs text-ink-dark leading-relaxed">
                    Ich habe die{" "}
                    <Link
                      href="/datenschutz"
                      target="_blank"
                      className="underline text-navy font-semibold inline-flex items-center gap-0.5"
                    >
                      Datenschutz-Erklärung
                      <ExternalLink size={9} />
                    </Link>{" "}
                    in Version {CURRENT_DATENSCHUTZ_VERSION} gelesen und
                    verstanden — Speicherung bei Vercel Blob (EU/USA),
                    Widerruf jederzeit möglich.
                  </span>
                </label>
              </div>

              <div className="rounded-lg bg-info/5 border border-info/20 p-2.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={12}
                    className="text-info flex-shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] text-ink-mid leading-relaxed">
                    <strong>Privacy by Default:</strong> Standardmäßig
                    bleiben deine Fotos privat. Pro Foto entscheidest du,
                    ob du teilen möchtest — dies hier ist nur die einmalige
                    Grund-Einwilligung dafür.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-ink-mid italic leading-relaxed">
                Du kannst die Einwilligung jederzeit widerrufen unter
                Info-Tab → Profil → „Foto-Sharing Einwilligung widerrufen".
              </p>
            </div>

            {/* Actions (fixed at bottom) */}
            <div className="bg-cream-50 border-t border-cream-200 p-3 flex flex-col gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleAccept}
                disabled={!bothChecked}
                className="w-full px-3 py-2.5 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Einwilligung erteilen &amp; Foto teilen
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full px-3 py-2 rounded-xl bg-cream-200 text-ink-mid text-xs font-semibold hover:bg-cream-300 transition"
              >
                Abbrechen — Foto bleibt privat
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
