"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchWeather, type WeatherData } from "@/lib/weather";

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useWeather(lat: number, lng: number, timezone: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const weather = await fetchWeather(lat, lng, timezone);
      setData(weather);
    } catch (e) {
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

  return { data, loading, error, refresh: load };
}
