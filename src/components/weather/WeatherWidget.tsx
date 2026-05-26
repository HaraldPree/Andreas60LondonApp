"use client";

import { Wind, Droplets, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { weatherCodeToInfo, formatRelativeAge } from "@/lib/weather";
import { classNames } from "@/lib/formatters";

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  timezone: string;
  locationName: string;
}

/**
 * v1.21.4 — Wetter-Widget mit Cache-Fallback + sichtbarem Status.
 *
 * Drei Zustände:
 *   1. Live-Daten:     normales Widget, kein Status-Hinweis
 *   2. Cache-Daten:    Widget zeigt Daten + dezenten „aus Cache · vor X"-Hinweis
 *   3. Error + kein Cache: kompakte Error-Karte mit konkreter Fehler-Message
 */
export function WeatherWidget({ lat, lng, timezone, locationName }: WeatherWidgetProps) {
  const { data, loading, error, refresh, cachedAt, fromCache } = useWeather(
    lat,
    lng,
    timezone,
  );

  // 1. Skeleton beim ersten Laden, wenn KEIN Cache da ist
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

  // 3. Error + kein Cache → kompakte Fehler-Karte mit konkreter Message
  if (error && !data) {
    return (
      <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4 text-warning text-sm space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[13px]">
              Wetter aktuell nicht erreichbar
            </p>
            <p className="text-[11px] mt-0.5 leading-relaxed opacity-90">
              {error}
            </p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1 text-xs underline flex-shrink-0"
          >
            <RefreshCw size={11} /> Erneut
          </button>
        </div>
        <p className="text-[10px] opacity-70 italic">
          Externer Wetter-Anbieter (Open-Meteo) — wir versuchen automatisch alle 30 Min.
        </p>
      </div>
    );
  }

  // 2. Daten da (live oder cache) → normales Widget + optionale Hinweise
  if (!data) return null;

  const { current } = data;
  const info = weatherCodeToInfo(current.weatherCode);
  const ageMs = cachedAt ? Date.now() - cachedAt : 0;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-700 text-cream p-5 shadow-card relative overflow-hidden">
      {/* Decorative gold accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

      <div className="flex items-center justify-between mb-3 relative">
        <div>
          <span className="text-xs uppercase tracking-wider opacity-70">
            Wetter in {locationName}
          </span>
          <p className="text-[10px] opacity-50 mt-0.5">
            Aktualisiert alle 30 Min
          </p>
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

      {/* v1.21.4 — Status-Footer: zeigt Cache-Hint oder Fehler-Hint */}
      {(error || fromCache) && (
        <div className="mt-4 pt-3 border-t border-cream/15 relative">
          {error ? (
            <p className="text-[11px] inline-flex items-start gap-1.5 leading-relaxed">
              <AlertCircle size={11} className="mt-[1px] flex-shrink-0 text-warning" />
              <span>
                <span className="text-warning">{error}</span>
                <br />
                <span className="opacity-70">
                  Zeige gespeicherten Stand von {formatRelativeAge(ageMs)}.
                </span>
              </span>
            </p>
          ) : (
            <p className="text-[10px] opacity-60 inline-flex items-center gap-1">
              <Clock size={10} />
              Lokal gespeichert · {formatRelativeAge(ageMs)} aktualisiert
            </p>
          )}
        </div>
      )}
    </div>
  );
}
