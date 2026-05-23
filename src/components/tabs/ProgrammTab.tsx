"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import type { Trip } from "@/types/trip";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { ForecastBar } from "@/components/weather/ForecastBar";
import { AlertBanner } from "@/components/trip/AlertBanner";
import { DayCard } from "@/components/trip/DayCard";
import { TripHero } from "@/components/trip/TripHero";
import { TripVariantSwitcher } from "@/components/trip/TripVariantSwitcher";
import { EventBanner } from "@/components/trip/EventBanner";
import { GoodbyeReel } from "@/components/reel/GoodbyeReel";
import { useWeather } from "@/hooks/useWeather";
import type { TripVariant } from "@/hooks/useTripVariant";
import { getDisruptionsForDay } from "@/lib/disruptions";
import { useUserPlaces } from "@/hooks/useUserPlaces";
import { usePlaceStatus } from "@/hooks/usePlaceStatus";
import { useSharedPhotos } from "@/hooks/useSharedPhotos";

interface ProgrammTabProps {
  trip: Trip;
  variant?: TripVariant;
  onVariantChange?: (next: TripVariant) => void;
  /** v1.7.1 — für Place-Status-Sync zwischen Programm + Wunschliste. */
  currentUserName?: string | null;
}

export function ProgrammTab({
  trip,
  variant = "original",
  onVariantChange,
  currentUserName,
}: ProgrammTabProps) {
  const { data: weather } = useWeather(
    trip.weatherLocation.lat,
    trip.weatherLocation.lng,
    trip.weatherLocation.timezone,
  );
  const { listForDay, remove: removeUserPlace } = useUserPlaces(trip.slug);

  // v1.7.1 — Place-Status synchron mit Wunschliste-Tab
  const { statusOf: placeStatusOf, setStatus: setPlaceStatus } = usePlaceStatus(
    trip.slug,
    currentUserName ?? null,
  );

  // v1.8.0 — Goodbye-Reel (Banner am Abreise-Tag)
  const [reelOpen, setReelOpen] = useState(false);
  const { photos: sharedPhotos } = useSharedPhotos({
    tripSlug: trip.slug,
    viewerName: currentUserName ?? null,
  });

  // v1.8.0 — Auto-Open beim ersten Besuch am Abreise-Tag (mit
  // localStorage-Flag, damit es nicht jedes Mal aufpoppt).
  // Banner bleibt sichtbar fürs erneute Ansehen.
  const reelSeenKey = `rcmk:reelSeen:${trip.slug}`;

  // v1.6.0 — In-App-Editor (Phase 1+2) deaktiviert auf User-Wunsch:
  // "Phase 1 und 2 kannst du momentan deaktivieren — das werden wir in
  // der Neufassung anders machen". Hook + Komponenten bleiben im Code,
  // werden nur nicht mehr verdrahtet. Reaktivierung später (vermutlich
  // mit Gruppen-Sync = Phase 3) durch erneutes Einhängen der Callbacks
  // an DayCard.

  const precipByDate = useMemo(() => {
    const map = new Map<string, number>();
    weather?.daily.forEach((d) => {
      map.set(d.date, d.precipitationProbability);
    });
    return map;
  }, [weather]);

  // v1.7.8 — heutiger Tag als Default offen (statt immer Tag 1).
  // Fallback wenn kein Tag matched: keiner offen — User klickt selbst.
  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // v1.8.0 — Auto-Open am echten letzten Tag (nur 1x via localStorage-Flag).
  const isActualLastDay = useMemo(() => {
    const last = trip.days[trip.days.length - 1];
    return last?.isoDate === todayIso;
  }, [trip.days, todayIso]);

  // v1.10.1 — Banner auch NACH Reise-Ende sichtbar zum nostalgischen
  // Wiederansehen. Bug-Fix: Off-by-one-day — vorher war Banner nur am
  // exakten letzten Tag sichtbar und verschwand am Tag danach komplett.
  // Harald-Feedback: "ich sehe auch nirgends das reel zum nochmals ansehen"
  const showReelBanner = useMemo(() => {
    const last = trip.days[trip.days.length - 1];
    if (!last?.isoDate) return false;
    return last.isoDate <= todayIso; // letzter Tag ODER danach
  }, [trip.days, todayIso]);

  // v1.8.0 — Auto-Open des Reels beim ersten Besuch am letzten Tag.
  // localStorage-Flag verhindert dass es bei jedem Tab-Wechsel aufpoppt.
  // Banner bleibt sichtbar zum erneuten Ansehen (siehe showReelBanner).
  useEffect(() => {
    if (!isActualLastDay) return;
    if (sharedPhotos.length === 0) return;
    if (typeof window === "undefined") return;
    try {
      const seen = window.localStorage.getItem(reelSeenKey);
      if (!seen) {
        // Erstes Mal heute → Reel öffnet sich automatisch nach kurzem Delay
        // (damit der User nicht überrascht wird beim App-Open)
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
      key="programm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <TripHero trip={trip} />

      {/* v1.9.0 — Event-Banner: zeigt nur Events die mit dem Reisezeitraum
          überlappen (Chelsea Flower Show, Wimbledon etc.). Null-fallback
          wenn nichts passt — komplett unsichtbar. */}
      <EventBanner trip={trip} />

      {/* v1.8.0 + v1.10.1 — Goodbye-Reel-Banner ab Abreise-Tag und danach.
          Bleibt dauerhaft sichtbar zum nostalgischen Wieder-Ansehen. */}
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
              {isActualLastDay ? "Letzter Tag — Abschieds-Reel" : "Abschieds-Reel · Wiederansehen"}
            </p>
            <p className="font-display text-base font-semibold leading-tight mt-0.5">
              🎂 Andrea-Reel + Reise-Highlights
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {sharedPhotos.length} geteilte Fotos · Slideshow + Konfetti
            </p>
          </div>
          <span className="text-2xl flex-shrink-0">🎬</span>
        </button>
      )}

      {trip.alternativeDays && onVariantChange && (
        <TripVariantSwitcher
          trip={trip}
          variant={variant}
          onChange={onVariantChange}
        />
      )}

      <WeatherWidget
        lat={trip.weatherLocation.lat}
        lng={trip.weatherLocation.lng}
        timezone={trip.weatherLocation.timezone}
        locationName={trip.weatherLocation.name}
      />

      <div>
        <h3 className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-2 px-1">
          5-Tage-Vorschau
        </h3>
        <ForecastBar
          lat={trip.weatherLocation.lat}
          lng={trip.weatherLocation.lng}
          timezone={trip.weatherLocation.timezone}
        />
      </div>

      <AlertBanner alerts={trip.alerts} />

      <div>
        <h3 className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-2 px-1">
          Euer Tagesprogramm
        </h3>
        <div className="space-y-3">
          {trip.days.map((day, i) => (
            <DayCard
              key={day.date}
              day={day}
              dayNumber={i}
              defaultOpen={day.isoDate === todayIso}
              rainProbability={
                day.isoDate ? precipByDate.get(day.isoDate) : undefined
              }
              disruptions={
                day.isoDate
                  ? getDisruptionsForDay(day.isoDate, trip.disruptions)
                  : []
              }
              userPlaces={listForDay(i)}
              onRemoveUserPlace={removeUserPlace}
              // v1.6.0: In-App-Editor (Phase 1+2) deaktiviert — keine
              // itemStateFor/onToggleItemDone/onCommitItemState/etc.
              // Props mehr durchgereicht. DayCard rendert ohne Circle-
              // Button, ohne Action-Menu und ohne Stats-Badge.

              // v1.7.1 — Place-Status-Sync mit Wunschliste-Tab
              placeStatusOf={placeStatusOf}
              onSetPlaceStatus={setPlaceStatus}
            />
          ))}
        </div>
      </div>

      {/* v1.8.0 — Goodbye-Reel-Modal */}
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
