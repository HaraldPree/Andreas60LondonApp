"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Check, Copy } from "lucide-react";
import type { Place, PlaceStatus } from "@/types/place";
import {
  POLL_TEMPLATES,
  generatePollText,
  sharePollText,
} from "@/lib/wunschPoll";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";

interface Props {
  open: boolean;
  /** Alle Places der Reise */
  places: Place[];
  /** Status-Lookup pro Place-ID — wird genutzt um Default-Auswahl zu bilden (alle 💭) */
  statusOf: (placeId: string) => PlaceStatus;
  authorName: string;
  destination: string;
  onClose: () => void;
}

/**
 * v1.7.2 — Bottom-Sheet zum Erstellen + Teilen eines WhatsApp-Polls
 * aus der eigenen Wunschliste.
 *
 * Apple-Way: minimaler Konfigurations-Aufwand. Beim Öffnen sind alle
 * 💭-Wünsche automatisch ausgewählt + ein Standard-Template aktiv.
 * User kann individuelle Places abhaken und Template wechseln.
 */
export function WunschPollShare({
  open,
  places,
  statusOf,
  authorName,
  destination,
  onClose,
}: Props) {
  // Standardmäßig alle 💭-Wünsche selektiert
  const initialSelected = useMemo(() => {
    const set = new Set<string>();
    for (const p of places) {
      if (statusOf(p.id) === "wantToSee") set.add(p.id);
    }
    return set;
    // open wird bewusst dependency — neue Berechnung beim erneuten Öffnen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, places]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelected);
  const [templateKey, setTemplateKey] = useState<string>("tomorrow");
  const [customQuestion, setCustomQuestion] = useState("");
  const [shareState, setShareState] = useState<
    "idle" | "sharing" | "done" | "error"
  >("idle");

  // Reset beim Öffnen
  useEffect(() => {
    if (open) {
      setSelectedIds(initialSelected);
      setTemplateKey("tomorrow");
      setCustomQuestion("");
      setShareState("idle");
    }
  }, [open, initialSelected]);

  useDismissOnBack(open, onClose);

  const template = POLL_TEMPLATES.find((t) => t.key === templateKey);
  const question =
    templateKey === "custom"
      ? customQuestion.trim() || "Wer kommt mit zu folgenden Punkten?"
      : template?.question ?? "Wer kommt mit?";

  // Selektierte Places in Reise-Reihenfolge (nicht zufällig)
  const selectedPlaces = useMemo(
    () => places.filter((p) => selectedIds.has(p.id)),
    [places, selectedIds],
  );

  const previewText = useMemo(
    () =>
      generatePollText({
        question,
        places: selectedPlaces,
        authorName,
        destination,
      }),
    [question, selectedPlaces, authorName, destination],
  );

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = async () => {
    setShareState("sharing");
    try {
      const result = await sharePollText(previewText);
      if (result === "cancelled") {
        setShareState("idle");
      } else {
        setShareState("done");
        // Auto-close nach kurzer Zeit
        setTimeout(onClose, 1200);
      }
    } catch {
      setShareState("error");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
      setShareState("done");
      setTimeout(() => setShareState("idle"), 1500);
    } catch {
      setShareState("error");
    }
  };

  // Welche Wünsche gibt's überhaupt?
  const wantToSeeCount = useMemo(
    () => places.filter((p) => statusOf(p.id) === "wantToSee").length,
    [places, statusOf],
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-navy/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[90vh] max-h-[90dvh] overflow-y-auto bg-cream rounded-t-3xl shadow-elevated"
          >
            <div className="mx-auto max-w-app p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                    Gruppen-Poll teilen
                  </p>
                  <h2 className="font-display text-lg font-semibold text-navy leading-tight mt-0.5">
                    Wünsche per WhatsApp abstimmen
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-11 h-11 -m-2 rounded-full text-ink-mid flex items-center justify-center flex-shrink-0"
                  aria-label="Schließen"
                >
                  <X size={16} />
                </button>
              </div>

              {wantToSeeCount === 0 ? (
                <div className="rounded-xl bg-info/10 border border-info/30 p-3 mb-3">
                  <p className="text-xs text-info font-semibold">
                    Noch keine 💭-Wünsche markiert
                  </p>
                  <p className="text-[11px] text-ink-mid mt-1 leading-relaxed">
                    Markiere zuerst Places die du der Gruppe vorschlagen
                    willst (Herz-Button in der Wunschliste). Dann kann ich
                    daraus einen Poll bauen.
                  </p>
                </div>
              ) : (
                <>
                  {/* Template-Auswahl */}
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-1.5">
                      Welche Frage?
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {POLL_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.key}
                          type="button"
                          onClick={() => setTemplateKey(tmpl.key)}
                          className={[
                            "px-2 py-2 min-h-[44px] rounded-lg text-[11px] font-semibold text-left transition border",
                            templateKey === tmpl.key
                              ? "bg-navy text-cream border-navy shadow-sm"
                              : "bg-white border-cream-200 text-ink-dark hover:bg-cream-50",
                          ].join(" ")}
                        >
                          {tmpl.label}
                        </button>
                      ))}
                    </div>
                    {templateKey === "custom" && (
                      <input
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="z.B. 'Tower of London diese Reise noch?'"
                        className="mt-2 w-full px-3 py-2 rounded-xl bg-white border border-cream-200 text-sm text-ink-dark placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
                      />
                    )}
                  </div>

                  {/* Place-Auswahl */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                        Welche Wünsche? ({selectedIds.size} ausgewählt)
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedIds.size === wantToSeeCount) {
                            setSelectedIds(new Set());
                          } else {
                            setSelectedIds(initialSelected);
                          }
                        }}
                        className="text-[10px] text-navy hover:text-gold transition font-medium"
                      >
                        {selectedIds.size === wantToSeeCount
                          ? "Alle ab"
                          : "Alle 💭-Wünsche"}
                      </button>
                    </div>
                    <div className="rounded-xl border border-cream-200 bg-white max-h-44 overflow-y-auto">
                      {places
                        .filter((p) => statusOf(p.id) === "wantToSee")
                        .map((p) => {
                          const isSelected = selectedIds.has(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggle(p.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-cream-50 transition border-b border-cream-100 last:border-b-0 min-h-[44px]"
                            >
                              <div
                                className={[
                                  "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition border",
                                  isSelected
                                    ? "bg-navy text-white border-navy"
                                    : "bg-white text-transparent border-ink-light/40",
                                ].join(" ")}
                              >
                                <Check size={12} strokeWidth={3} />
                              </div>
                              <span className="text-xs flex-shrink-0">
                                {p.icon ?? "📍"}
                              </span>
                              <span className="text-xs font-medium text-ink-dark flex-1 min-w-0 line-clamp-1">
                                {p.name}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Vorschau */}
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-1.5">
                      Vorschau
                    </p>
                    <div className="rounded-xl bg-white border border-cream-200 p-3">
                      <pre className="text-[11px] text-ink-dark whitespace-pre-wrap font-sans leading-relaxed">
                        {previewText}
                      </pre>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      disabled={
                        selectedIds.size === 0 || shareState === "sharing"
                      }
                      className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-success text-white text-sm font-semibold hover:bg-success/90 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={14} />
                      {shareState === "sharing"
                        ? "Wird geteilt…"
                        : shareState === "done"
                          ? "✓ Geteilt"
                          : "In WhatsApp teilen"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={selectedIds.size === 0}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-cream-200 text-ink-dark text-xs font-semibold hover:bg-cream-300 disabled:opacity-40 transition inline-flex items-center justify-center gap-1.5"
                    >
                      <Copy size={12} />
                      Text in Zwischenablage kopieren
                    </button>
                    {shareState === "error" && (
                      <p className="text-[11px] text-warning text-center">
                        ⚠️ Konnte nicht geteilt werden — versuch's mit
                        Kopieren + manuell einfügen
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
