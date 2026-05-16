"use client";

import { useCallback, useEffect, useState } from "react";
import type { FlightStatusResponse } from "@/lib/flightStatus";

const REFRESH_INTERVAL = 15 * 60_000; // 15 min

interface UseFlightStatusOptions {
  flightIata?: string;
  /** ISO date YYYY-MM-DD */
  flightDate?: string;
}

export function useFlightStatus({ flightIata, flightDate }: UseFlightStatusOptions) {
  const [data, setData] = useState<FlightStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!flightIata) return;
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/flight-status", window.location.origin);
      url.searchParams.set("flight", flightIata);
      if (flightDate) url.searchParams.set("date", flightDate);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = (await res.json()) as FlightStatusResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannt");
    } finally {
      setLoading(false);
    }
  }, [flightIata, flightDate]);

  useEffect(() => {
    if (!flightIata) return;
    load();
    const t = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(t);
  }, [load, flightIata]);

  return { data, loading, error, refresh: load };
}
