"use client";

import { useState } from "react";
import {
  Download,
  Trash2,
  Lock,
  ChevronDown,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  exportAllDataForTrip,
  deleteAllDataForTrip,
  deleteAllGlobalSettings,
  downloadAsJson,
} from "@/lib/dataExport";
import { classNames } from "@/lib/formatters";

interface MyDataSectionProps {
  tripSlug: string;
  /** Called after data is fully wiped, e.g. to redirect or refresh */
  onAfterDelete?: () => void;
}

export function MyDataSection({ tripSlug, onAfterDelete }: MyDataSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setExportResult(null);
    try {
      const data = await exportAllDataForTrip(tripSlug);
      const filename = `andrea-london_meine-daten_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      downloadAsJson(data, filename);
      setExportResult(
        `${Object.keys(data.localStorage).length} Einträge + ${data.photos.length} Fotos exportiert.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Wirklich ALLE Daten für diese Reise von diesem Gerät löschen?\n\n" +
          "Davon betroffen:\n" +
          "• Identität / Profil\n" +
          "• Gesundheitskarte\n" +
          "• Packliste & Häkchen\n" +
          "• Reservierungs-Status\n" +
          "• Ausgaben\n" +
          "• Eigene Entdeckungen\n" +
          "• Foto-Galerie + KI-Erzählungen\n" +
          "• Erkennungs-History\n\n" +
          "NICHT rückgängig machbar. Vorher exportieren empfohlen!",
      )
    )
      return;

    try {
      await deleteAllDataForTrip(tripSlug);
      alert("Alle Daten für diese Reise wurden gelöscht.");
      onAfterDelete?.();
      // Reload to reset all hook state
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    }
  };

  const handleResetConsent = () => {
    if (!confirm("KI-Einwilligungen zurücksetzen? Du wirst beim nächsten KI-Call neu gefragt.")) {
      return;
    }
    deleteAllGlobalSettings();
    alert("Alle Einwilligungen + globalen Einstellungen zurückgesetzt.");
  };

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
          <Lock size={18} className="text-success" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-display text-base font-semibold text-navy">
            Meine Daten (DSGVO)
          </h3>
          <p className="text-[11px] text-ink-mid">
            Export + Löschung deiner lokal gespeicherten Daten
          </p>
        </div>
        <ChevronDown
          size={18}
          className={classNames(
            "text-ink-light transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-cream-200 pt-3">
              <div className="rounded-xl bg-success/5 border border-success/20 p-3 flex items-start gap-2">
                <ShieldCheck
                  size={14}
                  className="text-success flex-shrink-0 mt-0.5"
                />
                <p className="text-[11px] text-ink-dark leading-relaxed">
                  Alle deine Daten in dieser App liegen{" "}
                  <strong>ausschließlich auf deinem Gerät</strong> (Browser-Storage).
                  Wir haben keinen Server, der Backups macht. Volle{" "}
                  <a
                    href="/datenschutz"
                    className="text-navy underline"
                    target="_blank"
                    rel="noopener"
                  >
                    Datenschutz-Info
                  </a>
                  .
                </p>
              </div>

              {/* Export */}
              <div>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-600 transition disabled:opacity-50"
                >
                  {exporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {exporting
                    ? "Sammle deine Daten…"
                    : "Alle meine Daten exportieren (JSON)"}
                </button>
                {exportResult && (
                  <p className="text-[11px] text-success text-center mt-2">
                    ✓ {exportResult}
                  </p>
                )}
                <p className="text-[10px] text-ink-light text-center mt-1.5 italic">
                  Enthält localStorage + alle Fotos als base64 (DSGVO Art. 15, 20)
                </p>
              </div>

              {/* Reset consent */}
              <button
                type="button"
                onClick={handleResetConsent}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cream-200 text-ink-mid text-xs font-semibold hover:bg-cream-300 transition"
              >
                <RotateCcw size={12} />
                KI-Einwilligungen zurücksetzen
              </button>

              {/* Delete */}
              <div className="pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-warning/10 text-warning text-sm font-semibold hover:bg-warning/20 transition border border-warning/30"
                >
                  <Trash2 size={14} />
                  Alle Daten von diesem Gerät löschen
                </button>
                <p className="text-[10px] text-warning/80 text-center mt-1.5 italic">
                  Nicht rückgängig machbar – vorher exportieren! (DSGVO Art. 17)
                </p>
              </div>

              {error && (
                <p className="text-xs text-warning text-center">{error}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
