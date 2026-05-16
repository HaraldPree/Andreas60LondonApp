"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchExchangeRate, type ExchangeRate } from "@/lib/exchangeRate";

const REFRESH_INTERVAL = 60 * 60_000; // 1 hour

export function useExchangeRate(base: string, quote: string) {
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const r = await fetchExchangeRate(base, quote);
      setRate(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }, [base, quote]);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  return { rate, loading, error, refresh: load };
}
