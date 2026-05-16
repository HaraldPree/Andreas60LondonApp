"use client";

import { Wind, Droplets, RefreshCw } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { weatherCodeToInfo } from "@/lib/weather";
import { classNames } from "@/lib/formatters";

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  timezone: string;
  locationName: string;
}

export function WeatherWidget({ lat, lng, timezone, locationName }: WeatherWidgetProps) {
  const { data, loading, error, refresh } = useWeather(lat, lng, timezone);

  if (loading && !data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-600 text-cream p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider opacity-70">
            Wetter {locationName}
          </span>
          <RefreshCw size={14} className="animate-spin opacity-60" />
        </div>
        <div className="h-16 animate-pulse bg-cream/10 rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-warning/10 border border-warning/20 p-4 text-warning text-sm">
        <div className="flex items-center justify-between">
          <span>Wetter konnte nicht geladen werden.</span>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1 text-xs underline"
          >
            <RefreshCw size={12} /> Erneut
          </button>
        </div>
      </div>
    );
  }

  const { current } = data;
  const info = weatherCodeToInfo(current.weatherCode);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-700 text-cream p-5 shadow-card relative overflow-hidden">
      {/* Decorative gold accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

      <div className="flex items-center justify-between mb-3 relative">
        <div>
          <span className="text-xs uppercase tracking-wider opacity-70">
            Wetter in {locationName}
          </span>
          <p className="text-[10px] opacity-50 mt-0.5">Aktualisiert alle 30 Min</p>
        </div>
        <button
          onClick={refresh}
          className="opacity-70 hover:opacity-100 transition"
          aria-label="Wetter aktualisieren"
        >
          <RefreshCw size={14} className={classNames(loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex items-end gap-4 relative">
        <span className="text-5xl">{info.icon}</span>
        <div className="flex-1">
          <p className="font-display text-4xl font-semibold leading-none">
            {current.temperature}°C
          </p>
          <p className="text-sm opacity-85 mt-1">{info.label}</p>
        </div>
      </div>

      <div className="flex gap-4 mt-4 text-xs opacity-80">
        <span className="inline-flex items-center gap-1.5">
          <Wind size={12} /> {current.windSpeed} km/h
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Droplets size={12} /> {current.humidity}%
        </span>
      </div>
    </div>
  );
}
