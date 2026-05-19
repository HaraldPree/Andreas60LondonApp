"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Loader2,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { PhotoMeta } from "@/types/photo";
import type {
  SharedPhotoView,
  SharedPhotoVisibility,
} from "@/types/sharedPhoto";
import { getFullBlob, getThumbnailBlob } from "@/lib/photoStorage";
import { hasFullConsent, readConsent } from "@/lib/consentStorage";
import { VisibilitySelector } from "./VisibilitySelector";
import { SharingConsentModal } from "./SharingConsentModal";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";

interface Props {
  open: boolean;
  photos: PhotoMeta[];
  tripSlug: string;
  currentUserName: string;
  celebrantName?: string | null;
  /** Bereits geteilte Fotos (für Update statt Neu-Upload) */
  alreadyShared: SharedPhotoView[];
  onClose: () => void;
  onShareOne: (args: {
    photoId: string;
    visibility: Exclude<SharedPhotoVisibility, "private">;
    fullBlob: Blob;
    thumbBlob: Blob;
    fileName: string;
    caption?: string;
    takenAt?: string;
    assignedDay?: number;
  }) => Promise<void>;
  onChangeVisibility: (
    photoId: string,
    next: SharedPhotoVisibility,
  ) => Promise<void>;
}

interface PerPhotoResult {
  photoId: string;
  fileName: string;
  status: "pending" | "ok" | "error";
  error?: string;
}

/**
 * v1.5.0 — Mehrere Fotos auf einmal teilen.
 *
 * Apple-Way: Bottom-Sheet öffnet sich aus dem Selection-Mode der
 * Fotos-Galerie. User wählt EINE gemeinsame Sichtbarkeit für ALLE
 * markierten Fotos. Upload läuft sequenziell mit sichtbarem Fortschritt.
 *
 * Behandelt zwei Cases pro Foto:
 *  - Noch nicht geteilt → vollständiger Upload via `onShareOne`
 *  - Bereits geteilt → nur Sichtbarkeit anpassen via
 *    `onChangeVisibility` (kein erneuter Bild-Upload)
 *
 * Consent (AGB+DSGVO) wird genau einmal abgefragt — analog zu
 * PhotoShareSection. Wenn der User zustimmt, läuft der Bulk-Upload.
 */
export function BulkShareSheet({
  open,
  photos,
  tripSlug,
  currentUserName,
  celebrantName,
  alreadyShared,
  onClose,
  onShareOne,
  onChangeVisibility,
}: Props) {
  const [visibility, setVisibility] = useState<SharedPhotoVisibility>("group");
  const [consentOpen, setConsentOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<PerPhotoResult[]>([]);
  const [done, setDone] = useState(false);

  useDismissOnBack(open && !uploading, onClose);

  // Reset bei jedem Öffnen
  useEffect(() => {
    if (open) {
      setVisibility("group");
      setUploading(false);
      setResults([]);
      setDone(false);
    }
  }, [open]);

  const consentGiven = hasFullConsent(
    readConsent(tripSlug, currentUserName),
  );

  const handleStart = async () => {
    if (visibility === "private") {
      // Nichts zu teilen — Sheet einfach schließen
      onClose();
      return;
    }
    if (!consentGiven) {
      setConsentOpen(true);
      return;
    }
    await runBulkUpload();
  };

  const runBulkUpload = async () => {
    setUploading(true);
    const initialResults: PerPhotoResult[] = photos.map((p) => ({
      photoId: p.id,
      fileName: p.fileName,
      status: "pending",
    }));
    setResults(initialResults);

    const sharedIds = new Set(alreadyShared.map((p) => p.id));

    // Sequenziell — schont das Netz auf Mobil-Verbindungen
    for (let i = 0; i < photos.length; i += 1) {
      const photo = photos[i];
      try {
        if (sharedIds.has(photo.id)) {
          // Schon online — nur Sichtbarkeit ändern
          await onChangeVisibility(photo.id, visibility);
        } else {
          const fullBlob = await getFullBlob(photo.id);
          const thumbBlob = await getThumbnailBlob(photo.id);
          if (!fullBlob || !thumbBlob) {
            throw new Error("lokale Daten nicht (mehr) verfügbar");
          }
          await onShareOne({
            photoId: photo.id,
            visibility: visibility as Exclude<
              SharedPhotoVisibility,
              "private"
            >,
            fullBlob,
            thumbBlob,
            fileName: photo.fileName,
            caption: photo.caption,
            takenAt: photo.takenAt,
            assignedDay: photo.assignedDay,
          });
        }
        setResults((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: "ok" } : r)),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: "error", error: msg } : r,
          ),
        );
      }
    }

    setUploading(false);
    setDone(true);
  };

  const progress = {
    total: photos.length,
    ok: results.filter((r) => r.status === "ok").length,
    error: results.filter((r) => r.status === "error").length,
    pending: results.filter((r) => r.status === "pending").length,
  };

  // Bei Erfolg ohne Fehler nach kurzer Pause auto-close
  useEffect(() => {
    if (done && progress.error === 0 && progress.ok > 0) {
      const t = setTimeout(onClose, 1200);
      return () => clearTimeout(t);
    }
  }, [done, progress.error, progress.ok, onClose]);

  const photoCountLabel = `${photos.length} ${photos.length === 1 ? "Foto" : "Fotos"}`;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={uploading ? undefined : onClose}
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
                      {done ? "Fertig" : uploading ? "Wird hochgeladen…" : "Mehrere Fotos teilen"}
                    </p>
                    <h2 className="font-display text-base font-semibold text-navy leading-tight mt-0.5">
                      {photoCountLabel}
                    </h2>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-11 h-11 -m-2 rounded-full text-ink-mid flex items-center justify-center flex-shrink-0"
                      aria-label="Schließen"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {!uploading && !done && (
                  <>
                    <p className="text-[11px] text-ink-mid mb-3 leading-relaxed">
                      Eine Sichtbarkeit für alle ausgewählten Fotos:
                    </p>
                    <VisibilitySelector
                      value={visibility}
                      onChange={setVisibility}
                      celebrantName={celebrantName}
                      hideCelebrant={!celebrantName}
                      compact
                    />

                    <button
                      type="button"
                      onClick={handleStart}
                      disabled={visibility === "private"}
                      className="w-full min-h-[44px] mt-3 px-3 py-2.5 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                    >
                      <Share2 size={14} />
                      {visibility === "private"
                        ? "Wähle eine Sichtbarkeit"
                        : `${photoCountLabel} jetzt teilen`}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full min-h-[44px] mt-2 px-3 py-2 rounded-xl bg-cream-200 text-ink-mid text-xs font-semibold hover:bg-cream-300 transition"
                    >
                      Abbrechen
                    </button>

                    {!consentGiven && (
                      <p className="text-[10px] text-ink-light italic text-center mt-2 leading-relaxed">
                        Beim Klick auf „jetzt teilen" wirst du einmalig
                        nach AGB/Datenschutz-Einwilligung gefragt.
                      </p>
                    )}
                  </>
                )}

                {(uploading || done) && (
                  <div className="space-y-3">
                    {/* Progress-Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-ink-mid mb-1">
                        <span>
                          {progress.ok + progress.error} / {progress.total}
                        </span>
                        <span className="font-mono">
                          {Math.round(
                            ((progress.ok + progress.error) / progress.total) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-cream-200 rounded-full overflow-hidden flex">
                        <div
                          className="bg-success transition-all"
                          style={{
                            width: `${(progress.ok / progress.total) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-warning transition-all"
                          style={{
                            width: `${(progress.error / progress.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {uploading && (
                      <div className="flex items-center gap-2 text-xs text-ink-mid">
                        <Loader2 size={14} className="animate-spin" />
                        Sequenzieller Upload — bitte App nicht schließen
                      </div>
                    )}

                    {done && progress.error === 0 && (
                      <div className="flex items-center gap-2 text-sm text-success font-semibold">
                        <CheckCircle2 size={16} />
                        Alle {progress.ok} Fotos geteilt
                      </div>
                    )}

                    {done && progress.error > 0 && (
                      <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-warning font-semibold">
                          <AlertTriangle size={16} />
                          {progress.error} {progress.error === 1 ? "Foto" : "Fotos"} fehlgeschlagen
                          {progress.ok > 0 &&
                            ` (${progress.ok} ${progress.ok === 1 ? "Foto" : "Fotos"} erfolgreich)`}
                        </div>
                        <ul className="text-[11px] text-ink-dark space-y-1 max-h-32 overflow-y-auto">
                          {results
                            .filter((r) => r.status === "error")
                            .map((r) => (
                              <li key={r.photoId} className="leading-relaxed">
                                <span className="font-mono text-[10px] text-ink-mid">
                                  {r.fileName}
                                </span>
                                <br />
                                <span className="text-warning">→ {r.error}</span>
                              </li>
                            ))}
                        </ul>
                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full min-h-[44px] mt-1 px-3 py-2 rounded-xl bg-warning text-white text-xs font-semibold hover:bg-warning/90 transition"
                        >
                          Verstanden
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SharingConsentModal
        open={consentOpen}
        tripSlug={tripSlug}
        userName={currentUserName}
        onAccept={() => {
          setConsentOpen(false);
          void runBulkUpload();
        }}
        onCancel={() => setConsentOpen(false)}
      />
    </>
  );
}
