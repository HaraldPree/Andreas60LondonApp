"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import type { Trip } from "@/types/trip";
import type { SharedPhotoView } from "@/types/sharedPhoto";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";

interface Props {
  open: boolean;
  trip: Trip;
  sharedPhotos: SharedPhotoView[];
  /** Reisende-Name fürs Header-Personalisieren */
  currentUserName?: string | null;
  onClose: () => void;
}

/**
 * v1.8.0 — Goodbye-Reel zum Abschied einer Reise.
 *
 * Auto-Slideshow durch alle freigegebenen Foto-Highlights der Gruppe.
 * Konfetti im Hintergrund, Andrea-Geburtstags-Bezug. Pause / Vor / Zurück
 * verfügbar. Auto-Loop nach Ende.
 *
 * Bewusste Beschränkung auf SharedPhotos (geteilte Highlights) statt
 * aller eigenen — das sind die Gruppen-Erinnerungen die alle sehen
 * sollen. Privacy + UX sauberer.
 */
export function GoodbyeReel({
  open,
  trip,
  sharedPhotos,
  currentUserName,
  onClose,
}: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Fotos sortiert chronologisch (takenAt kann fehlen → ans Ende)
  const photos = useMemo(() => {
    return [...sharedPhotos].sort((a, b) => {
      const ta = a.takenAt ? new Date(a.takenAt).getTime() : Infinity;
      const tb = b.takenAt ? new Date(b.takenAt).getTime() : Infinity;
      return ta - tb;
    });
  }, [sharedPhotos]);

  const total = photos.length;
  const current = photos[index];

  // Auto-Advance alle 2.8 Sek wenn playing
  useEffect(() => {
    if (!open || !playing || total === 0) return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % total);
    }, 2800);
    return () => clearTimeout(t);
  }, [open, playing, index, total]);

  // Reset bei jedem Öffnen
  useEffect(() => {
    if (open) {
      setIndex(0);
      setPlaying(true);
    }
  }, [open]);

  useDismissOnBack(open, onClose);

  // Konfetti-Emojis (random delay + duration für staggered Fall)
  const confettiPieces = useMemo(() => {
    const emojis = ["🎂", "🎉", "🎊", "✨", "🎈", "👑", "💕", "🌟"];
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 6,
      size: 18 + Math.random() * 14,
    }));
  }, []);

  const celebrantName =
    trip.participants?.find((p) => p.role === "celebrant")?.name ?? "Andrea";

  const prev = () => {
    setPlaying(false);
    setIndex((i) => (i - 1 + total) % total);
  };
  const next = () => {
    setPlaying(false);
    setIndex((i) => (i + 1) % total);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-gradient-to-br from-navy via-navy-700 to-gold-700 flex flex-col overflow-hidden"
        >
          {/* Konfetti-Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((p) => (
              <span
                key={p.id}
                className="absolute top-[-10vh] confetti-piece"
                style={{
                  left: `${p.left}%`,
                  fontSize: `${p.size}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              >
                {p.emoji}
              </span>
            ))}
          </div>

          {/* Inline CSS für Konfetti-Animation */}
          <style jsx>{`
            .confetti-piece {
              animation-name: confetti-fall;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
              user-select: none;
            }
            @keyframes confetti-fall {
              from {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 0.8;
              }
              to {
                transform: translateY(110vh) rotate(720deg);
                opacity: 0;
              }
            }
          `}</style>

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between p-4 text-cream">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
                Tschüss London
              </p>
              <h2 className="font-display text-2xl font-semibold leading-tight mt-1">
                🎂 {celebrantName} · 60 Jahre
              </h2>
              <p className="text-[11px] text-cream/80 mt-1">
                {total} Foto-Erinnerungen aus 5 Tagen
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 -m-2 rounded-full bg-white/10 hover:bg-white/20 text-cream flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
              aria-label="Schließen"
            >
              <X size={18} />
            </button>
          </div>

          {/* Slideshow-Bereich */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-4 min-h-0">
            {total === 0 ? (
              <div className="text-center text-cream/80 max-w-[280px]">
                <p className="text-base font-semibold">
                  Noch keine geteilten Fotos
                </p>
                <p className="text-xs mt-2 leading-relaxed">
                  Sobald jemand Fotos mit der Gruppe freigibt, erscheint
                  hier ein Reel der Reise.
                </p>
              </div>
            ) : current ? (
              <div className="relative w-full h-full max-w-2xl flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={current.id}
                    src={current.blobUrl}
                    alt={current.caption ?? "Reise-Foto"}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-full max-h-[60vh] rounded-2xl shadow-elevated object-contain"
                  />
                </AnimatePresence>

                {/* Caption + Uploader */}
                <div className="absolute bottom-[-32px] left-0 right-0 text-center text-cream/90 px-4">
                  {current.caption && (
                    <p className="text-sm font-medium italic">
                      „{current.caption}"
                    </p>
                  )}
                  <p className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">
                    von {current.uploaderName}
                    {current.takenAt && (
                      <>
                        {" "}·{" "}
                        {new Date(current.takenAt).toLocaleDateString(
                          "de-DE",
                          { day: "2-digit", month: "short" },
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Progress + Controls */}
          {total > 0 && (
            <div className="relative z-10 px-4 pb-6 pt-12 text-cream">
              {/* Progress-Bar */}
              <div className="h-1 bg-cream/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${((index + 1) / total) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-[10px] font-mono text-center text-cream/70 mt-1.5">
                {index + 1} / {total}
              </p>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={prev}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-sm"
                  aria-label="Zurück"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setPlaying((v) => !v)}
                  className="w-12 h-12 rounded-full bg-gold text-navy hover:scale-105 active:scale-95 transition flex items-center justify-center shadow-elevated"
                  aria-label={playing ? "Pause" : "Wiedergabe"}
                >
                  {playing ? (
                    <Pause size={20} strokeWidth={2.5} />
                  ) : (
                    <Play size={20} strokeWidth={2.5} fill="currentColor" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-sm"
                  aria-label="Weiter"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Footer */}
              <p className="text-[10px] text-center text-cream/60 italic mt-4 leading-relaxed">
                Frohe Heimreise — bis zur nächsten Reise mit Travel Live
                {currentUserName ? `, ${currentUserName}` : ""}!
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
