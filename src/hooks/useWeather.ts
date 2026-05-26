"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchWeather,
  loadCachedWeather,
  saveCachedWeather,
  type WeatherData,
} from "@/lib/weather";

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

interface UseWeatherResult {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  /** Zeitstempel der aktuellen Daten — entweder Cache- oder Live-Fetch-Zeitpunkt. */
  cachedAt: number | null;
  /** True wenn die aktuellen Daten aus dem localStorage-Cache stammen (z.B. weil
   *  API down ist). False sobald ein erfolgreicher Live-Fetch durch ist. */
  fromCache: boolean;
  refresh: () => Promise<void>;
}

/**
 * v1.21.4 — Wetter-Hook mit localStorage-Cache + Fallback bei API-Ausfall.
 *
 * Verhalten:
 *  - Beim Mount: Cache synchron lesen (falls vorhanden + jünger als 24h)
 *    → User sieht sofort etwas, kein leeres Skeleton wenn API langsam.
 *  - Im Hintergrund: Live-Fetch.
 *    - Erfolg → Live-Daten ersetzen Cache-Daten, fromCache=false.
 *    - Fehler → Cache-Daten bleiben, error wird gesetzt, fromCache=true.
 *
 * So bleibt die App auch bei längeren API-Ausfällen nutzbar (Open-Meteo
 * war am 26.05.2026 stundenlang mit 502 down — Lesson Learned).
 */
export function useWeather(
  lat: number,
  lng: number,
  timezone: string,
): UseWeatherResult {
  // Lazy Init: einmaliger Cache-Read beim ersten Mount
  const [initial] = useState(() => {
    if (typeof window === "undefined") return null;
    return loadCachedWeather(lat, lng);
  });

  const [data, setData] = useState<WeatherData | null>(initial?.data ?? null);
  const [cachedAt, setCachedAt] = useState<number | null>(
    initial?.cachedAt ?? null,
  );
  const [fromCache, setFromCache] = useState<boolean>(!!initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const weather = await fetchWeather(lat, lng, timezone);
      setData(weather);
      const now = Date.now();
      setCachedAt(now);
      setFromCache(false);
      saveCachedWeather(lat, lng, weather);
    } catch (e) {
      // Bei Fehler: gecachten Stand reaktivieren falls vorhanden
      const cached = loadCachedWeather(lat, lng);
      if (cached) {
        setData(cached.data);
        setCachedAt(cached.cachedAt);
        setFromCache(true);
      }
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }, [lat, lng, timezone]);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  return { data, loading, error, cachedAt, fromCache, refresh: load };
}
