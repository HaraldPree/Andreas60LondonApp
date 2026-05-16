"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Trash2,
  Sparkles,
  MapPin,
  Calendar,
  Square,
  Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PhotoMeta } from "@/types/photo";
import { useBlobUrl } from "@/hooks/useBlobUrl";
import { getFullBlob } from "@/lib/photoStorage";
import { blobToDataUrl } from "@/lib/photoProcessing";
import { mapsUrl } from "@/lib/formatters";
import { useAiConsent } from "@/hooks/useAiConsent";
import { AiConsentModal } from "@/components/ai/AiConsentModal";

interface PhotoDetailProps {
  photo: PhotoMeta;
  tripSlug: string;
  dayLabel?: string;
  onClose: () => void;
  onDelete: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onNarrativeChange: (id: string, narrative: string) => void;
}

export function PhotoDetail({
  photo,
  tripSlug,
  dayLabel,
  onClose,
  onDelete,
  onCaptionChange,
  onNarrativeChange,
}: PhotoDetailProps) {
  const fullUrl = useBlobUrl(photo.id, getFullBlob);
  const [narrative, setNarrative] = useState(photo.aiNarrative ?? "");
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [captionEditing, setCaptionEditing] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const consent = useAiConsent("photo-narration");

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const requestNarrate = () => {
    if (consent.persistent) {
      void doNarrate();
    } else {
      setConsentOpen(true);
    }
  };

  const doNarrate = async () => {
    const blob = await getFullBlob(photo.id);
    if (!blob) return;

    setNarrative("");
    setNarrativeLoading(true);
    setNarrativeError(null);
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const dataUrl = await blobToDataUrl(blob);
      const base64 = dataUrl.split(",")[1];
      const mimeMatch = dataUrl.match(/^data:(.*?);/);
      const mediaType = (mimeMatch?.[1] as "image/jpeg") ?? "image/jpeg";

      const res = await fetch("/api/photo-narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripSlug,
          imageBase64: base64,
          mediaType,
          assignedDay: photo.assignedDay,
          caption: photo.caption,
          coordinates: photo.coordinates,
        }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`API ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let final = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            const payload = JSON.parse(json) as {
              type: string;
              text?: string;
              message?: string;
            };
            if (payload.type === "text" && payload.text) {
              final += payload.text;
              setNarrative((s) => s + payload.text);
            } else if (payload.type === "error" && payload.message) {
              setNarrativeError(payload.message);
            }
          } catch {
            // skip malformed
          }
        }
      }

      if (final) {
        onNarrativeChange(photo.id, final);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setNarrativeError(e instanceof Error ? e.message : "Unbekannt");
      }
    } finally {
      setNarrativeLoading(false);
      abortRef.current = null;
    }
  };

  const saveCaption = () => {
    onCaptionChange(photo.id, caption.trim());
    setCaptionEditing(false);
  };

  return (
    <>
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="min-h-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sticky top-0 bg-black/70 backdrop-blur z-10">
            <div className="text-cream text-xs space-y-0.5">
              {dayLabel && (
                <p className="font-semibold inline-flex items-center gap-1">
                  <Calendar size={11} /> {dayLabel}
                </p>
              )}
              <p className="opacity-70 font-mono text-[10px]">
                {new Date(photo.takenAt).toLocaleString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Foto wirklich löschen?")) {
                    onDelete(photo.id);
                    onClose();
                  }
                }}
                className="w-8 h-8 rounded-full bg-warning/80 text-white flex items-center justify-center"
                aria-label="Löschen"
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center"
                aria-label="Schließen"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-3">
            {fullUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fullUrl}
                alt={photo.caption ?? photo.fileName}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-elevated"
              />
            ) : (
              <div className="w-full h-48 bg-cream-300/30 rounded-lg animate-pulse" />
            )}
          </div>

          {/* Caption */}
          <div className="px-4 py-3 bg-black/40">
            {captionEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Bildunterschrift…"
                  className="flex-1 px-3 py-1.5 text-sm rounded-md bg-white/90 text-ink-dark"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveCaption}
                  className="px-3 py-1.5 text-xs rounded-md bg-gold text-navy font-semibold"
                >
                  Speichern
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCaptionEditing(true)}
                className="w-full text-left text-cream text-sm inline-flex items-center gap-2"
              >
                <Edit3 size={12} className="opacity-60 flex-shrink-0" />
                <span className={caption ? "" : "italic opacity-60"}>
                  {caption || "Bildunterschrift hinzufügen…"}
                </span>
              </button>
            )}
          </div>

          {/* Actions row */}
          <div className="px-4 py-2 bg-black/50 flex flex-wrap gap-2">
            {photo.coordinates && (
              <a
                href={mapsUrl(
                  photo.coordinates.lat,
                  photo.coordinates.lng,
                  photo.fileName,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-full bg-white/15 text-cream inline-flex items-center gap-1.5"
              >
                <MapPin size={11} /> Auf Karte
              </a>
            )}
          </div>

          {/* AI Narrator */}
          <div className="bg-cream p-4 space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-gold-600 font-semibold inline-flex items-center gap-1.5">
                <Sparkles size={12} /> KI-Erzählung
              </p>
              {narrativeLoading ? (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className="text-xs px-2 py-1 rounded bg-warning text-white inline-flex items-center gap-1"
                >
                  <Square size={10} fill="currentColor" /> Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={requestNarrate}
                  className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-400 to-gold text-navy font-semibold inline-flex items-center gap-1.5 hover:scale-[1.02] transition"
                >
                  <Sparkles size={12} />
                  {narrative ? "Neu erzählen" : "Erzähl mir was"}
                </button>
              )}
            </div>

            {narrative ? (
              <p className="text-sm text-ink-dark leading-relaxed whitespace-pre-wrap">
                {narrative}
                {narrativeLoading && (
                  <span className="inline-block w-1 h-3 bg-navy/40 ml-0.5 animate-pulse" />
                )}
              </p>
            ) : (
              !narrativeLoading && (
                <p className="text-xs text-ink-mid italic">
                  Tipp auf &quot;Erzähl mir was&quot; – die KI erkennt das Foto und
                  gibt dir warmen Kontext zur Reise.
                </p>
              )
            )}

            {narrativeError && (
              <p className="text-xs text-warning">{narrativeError}</p>
            )}
          </div>
        </div>
      </motion.div>
      </AnimatePresence>

      <AiConsentModal
        open={consentOpen}
        title="Foto an Claude Vision senden"
        actionDescription="Das Foto wird komprimiert und einmalig an Claude Vision (Anthropic, USA) gesendet, um eine kurze Erzählung zum Ort zu erstellen."
        dataSent={[
          "Komprimiertes Foto",
          "Tag + Bildunterschrift als Kontext",
          "GPS falls vorhanden",
        ]}
        onDecide={(choice) => {
          setConsentOpen(false);
          if (choice === "never") return;
          consent.grant(choice);
          void doNarrate();
        }}
      />
    </>
  );
}
