"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Trip } from "@/types/trip";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { ForecastBar } from "@/components/weather/ForecastBar";
import { AlertBanner } from "@/components/trip/AlertBanner";
import { DayCard } from "@/components/trip/DayCard";
import { TripHero } from "@/components/trip/TripHero";
import { TripVariantSwitcher } from "@/components/trip/TripVariantSwitcher";
import { EventBanner } from "@/components/trip/EventBanner";
import { useWeather } from "@/hooks/useWeather";
import { useTripPhase } from "@/hooks/useTripPhase";
import type { TripVariant } from "@/hooks/useTripVariant";
import { getDisruptionsForDay } from "@/lib/disruptions";
import { useUserPlaces } from "@/hooks/useUserPlaces";
import { usePlaceStatus } from "@/hooks/usePlaceStatus";

interface ErlebenTabProps {
  trip: Trip;
  variant?: TripVariant;
  onVariantChange?: (next: TripVariant) => void;
  currentUserName?: string | null;
}

/**
 * v1.17.0 — „Erleben"-Tab der Drei-Phasen-Navigation.
 *
 * Zeigt was während der Reise wichtig ist:
 *  - Hero
 *  - Event-Banner (nur wenn Reise nicht vorbei)
 *  - Wetter + 5-Tage-Forecast
 *  - Alert-Banner (Disruptions, Hinweise)
 *  - Tages-Programm
 *
 * Was NICHT mehr hier ist (wandert nach „Erinnern"):
 *  - Goodbye-Reel-Banner
 *  - Feedback-Karte
 *  - „Geplant ↔ Erlebt"-Switcher (überflüssig geworden durch
 *    Tab-Trennung: Erleben = Geplant, Erinnern = Erlebt-Rückblick)
 *
 * Vorgängerkomponente: `ProgrammTab.tsx` (v1.0.0 – v1.16.1). Wird in
 * v1.17.0 abgelöst und kann später entfernt werden sobald keine
 * Referenz mehr existiert.
 */
export function ErlebenTab({
  trip,
  variant = "original",
  onVariantChange,
  currentUserName,
}: ErlebenTabProps) {
  const { data: weather } = useWeather(
    trip.weatherLocation.lat,
    trip.weatherLocation.lng,
    trip.weatherLocation.timezone,
  );
  const { listForDay, remove: removeUserPlace } = useUserPlaces(trip.slug);
  const { statusOf: placeStatusOf, setStatus: setPlaceStatus } = usePlaceStatus(
    trip.slug,
    currentUserName ?? null,
  );

  const { isPast, todayIso } = useTripPhase(trip);

  const precipByDate = useMemo(() => {
    const map = new Map<string, number>();
    weather?.daily.forEach((d) => {
      map.set(d.date, d.precipitationProbability);
    });
    return map;
  }, [weather]);

  return (
    <motion.div
      key="erleben"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <TripHero trip={trip} />

      {/* EventBanner: nur während/vor der Reise. Nach Reise-Ende
          irrelevant (Chelsea Flower Show ist gelaufen). */}
      {!isPast && <EventBanner trip={trip} />}

      {/* TripVariantSwitcher: nur wenn der Trip wirklich alternativeDays
          definiert (z.B. künftig „Plan B bei Regen"). London-Trip hat
          das seit v1.14.0 nicht mehr — Switcher rendert dann nichts. */}
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
              placeStatusOf={placeStatusOf}
              onSetPlaceStatus={setPlaceStatus}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
