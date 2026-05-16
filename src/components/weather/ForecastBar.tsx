"use client";

import { useWeather } from "@/hooks/useWeather";
import { weatherCodeToInfo, formatForecastDay, formatForecastDate } from "@/lib/weather";

interface ForecastBarProps {
  lat: number;
  lng: number;
  timezone: string;
}

export function ForecastBar({ lat, lng, timezone }: ForecastBarProps) {
  const { data, loading } = useWeather(lat, lng, timezone);

  if (loading && !data) {
    return (
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[72px] h-24 rounded-xl bg-cream-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
      {data.daily.map((day, i) => {
        const info = weatherCodeToInfo(day.weatherCode);
        return (
          <div
            key={day.date}
            className="min-w-[72px] flex-shrink-0 rounded-xl bg-white shadow-card border border-cream-200/50 p-2.5 text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
              {i === 0 ? "Heute" : formatForecastDay(day.date)}
            </p>
            <p className="text-[10px] text-ink-light mb-1">
              {formatForecastDate(day.date)}
            </p>
            <p className="text-2xl my-1">{info.icon}</p>
            <p className="text-xs font-semibold text-navy">
              {day.tempMax}°
              <span className="text-ink-light font-normal"> / {day.tempMin}°</span>
            </p>
            {day.precipitationProbability >= 30 && (
              <p className="text-[10px] text-info mt-0.5">
                💧 {day.precipitationProbability}%
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
