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
import { useWeather } from "@/hooks/useWeather";
import type { TripVariant } from "@/hooks/useTripVariant";
import { getDisruptionsForDay } from "@/lib/disruptions";
import { useUserPlaces } from "@/hooks/useUserPlaces";

interface ProgrammTabProps {
  trip: Trip;
  variant?: TripVariant;
  onVariantChange?: (next: TripVariant) => void;
}

export function ProgrammTab({
  trip,
  variant = "original",
  onVariantChange,
}: ProgrammTabProps) {
  const { data: weather } = useWeather(
    trip.weatherLocation.lat,
    trip.weatherLocation.lng,
    trip.weatherLocation.timezone,
  );
  const { listForDay, remove: removeUserPlace } = useUserPlaces(trip.slug);

  const precipByDate = useMemo(() => {
    const map = new Map<string, number>();
    weather?.daily.forEach((d) => {
      map.set(d.date, d.precipitationProbability);
    });
    return map;
  }, [weather]);

  return (
    <motion.div
      key="programm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <TripHero trip={trip} />

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
              defaultOpen={i === 0}
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
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
