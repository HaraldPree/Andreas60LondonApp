"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Film, Camera, Sparkles } from "lucide-react";
import type { Trip } from "@/types/trip";
import { TripHero } from "@/components/trip/TripHero";
import { ErlebtView } from "@/components/trip/ErlebtView";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { GoodbyeReel } from "@/components/reel/GoodbyeReel";
import { FotosTab } from "@/components/tabs/FotosTab";
import { useTripPhase } from "@/hooks/useTripPhase";
import { useSharedPhotos } from "@/hooks/useSharedPhotos";
import { useReconstructedTrip } from "@/hooks/useReconstructedTrip";

interface ErinnernTabProps {
  trip: Trip;
  currentUserName?: string | null;
}

/**
 * v1.17.0 — „Erinnern"-Tab der Drei-Phasen-Navigation.
 *
 * Alles was nach der Reise zurückbleibt — und schon währenddessen
 * gesammelt wird:
 *
 *  Vor Reise:    nur Hint „Hier sammeln wir später die Erinnerungen"
 *  Während:      Foto-Upload + Galerie (so weit schon vorhanden)
 *  Nach Reise:   Reel-Banner + Feedback-Karte + Erlebt-Rückblick +
 *                Volle Galerie
 *
 * Der bisherige „Geplant ↔ Erlebt"-Switcher (v1.14.0) ist überflüssig
 * geworden: Geplant = Tab „Erleben", Erlebt = dieser Tab. Eine
 * Trennung statt einer Toggle-Logik.
 */
export function ErinnernTab({ trip, currentUserName }: ErinnernTabProps) {
  const { isPast, todayIso, isFuture } = useTripPhase(trip);

  // Geteilte Fotos laden (für Reel + Rückblick)
  const { photos: sharedPhotos } = useSharedPhotos({
    tripSlug: trip.slug,
    viewerName: currentUserName ?? null,
  });

  // Reise-Rückblick aus Foto-EXIF rekonstruieren — nur post-trip aktiv
  const reconstructed = useReconstructedTrip({
    trip,
    currentUserName: currentUserName ?? null,
    enabled: isPast,
  });

  // Reel-Modal-State
  const [reelOpen, setReelOpen] = useState(false);
  const reelSeenKey = `rcmk:reelSeen:${trip.slug}`;
  const isActualLastDay = useMemo(() => {
    const last = trip.days[trip.days.length - 1];
    return last?.isoDate === todayIso;
  }, [trip.days, todayIso]);
  const showReelBanner = isPast || isActualLastDay;

  // Auto-Open am letzten Reise-Tag (gleiche Logik wie vorher in ProgrammTab)
  useEffect(() => {
    if (!isActualLastDay) return;
    if (sharedPhotos.length === 0) return;
    if (typeof window === "undefined") return;
    try {
      const seen = window.localStorage.getItem(reelSeenKey);
      if (!seen) {
        const t = setTimeout(() => setReelOpen(true), 1500);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, [isActualLastDay, sharedPhotos.length, reelSeenKey]);

  const handleReelClose = () => {
    setReelOpen(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(reelSeenKey, new Date().toISOString());
      } catch {
        // ignore
      }
    }
  };

  return (
    <motion.div
      key="erinnern"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <TripHero trip={trip} />

      {/* Future-Trip Hint: noch nicht viel zum Erinnern, aber wir laden
          schon mal Vor-Reise-Fotos hoch falls jemand mag. */}
      {isFuture && (
        <div className="rounded-2xl bg-gold/5 border border-gold/30 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-gold-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-gold-600 font-semibold">
              Reise steht noch bevor
            </p>
            <p className="font-display text-sm font-semibold text-navy leading-tight mt-0.5">
              Hier sammeln wir nach der Reise die Erinnerungen
            </p>
            <p className="text-[11px] text-ink-mid mt-1 leading-relaxed">
              Fotos + Videos können später hochgeladen werden, der
              automatische Rückblick aus den Bildern erscheint nach
              Reise-Ende. Vorab kannst du schon Vorfreude-Fotos posten.
            </p>
          </div>
        </div>
      )}

      {/* Reel-Banner — sichtbar ab dem letzten Reise-Tag und danach.
          Banner bleibt zum nostalgischen Wiederansehen sichtbar. */}
      {showReelBanner && sharedPhotos.length > 0 && (
        <button
          type="button"
          onClick={() => setReelOpen(true)}
          className="w-full rounded-2xl bg-gradient-to-br from-gold via-gold-400 to-gold-600 text-navy p-4 flex items-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition shadow-elevated"
        >
          <div className="w-12 h-12 rounded-xl bg-navy/15 flex items-center justify-center flex-shrink-0">
            <Film size={22} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">
              {isActualLastDay
                ? "Letzter Tag — Abschieds-Reel"
                : "Abschieds-Reel · Wiederansehen"}
            </p>
            <p className="font-display text-base font-semibold leading-tight mt-0.5">
              {trip.occasionDetails?.icon ?? "🎬"}{" "}
              {trip.occasionDetails?.title ?? "Reise-Highlights"}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {sharedPhotos.length} geteilte Fotos · Slideshow + Konfetti
            </p>
          </div>
          <span className="text-2xl flex-shrink-0">🎬</span>
        </button>
      )}

      {/* Feedback-Karte — nur post-trip + identifizierter User. */}
      {isPast && currentUserName && (
        <FeedbackCard trip={trip} userName={currentUserName} />
      )}

      {/* Erlebt-Rückblick: tagweise rekonstruierte Stops aus Foto-EXIF.
          Nur post-trip + mindestens 1 Foto vorhanden. */}
      {isPast && reconstructed.totalPhotos > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-2 px-1 inline-flex items-center gap-1.5">
            <Camera size={11} />
            Was wir erlebt haben — rekonstruiert aus euren Fotos
          </h3>
          <ErlebtView
            trip={trip}
            stopsByDay={reconstructed.stopsByDay}
            daysWithStops={reconstructed.daysWithStops}
            sharedThumbUrls={reconstructed.sharedThumbUrls}
            todayIso={todayIso}
          />
        </div>
      )}

      {/* Foto-Galerie (= bisheriger FotosTab). Funktioniert in allen
          Reise-Phasen — vor/während Upload, nach Reise als Galerie. */}
      <div>
        <h3 className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-2 px-1">
          Fotos + Videos
        </h3>
        <FotosTab trip={trip} currentUserName={currentUserName} />
      </div>

      <GoodbyeReel
        open={reelOpen}
        trip={trip}
        sharedPhotos={sharedPhotos}
        currentUserName={currentUserName}
        onClose={handleReelClose}
      />
    </motion.div>
  );
}
