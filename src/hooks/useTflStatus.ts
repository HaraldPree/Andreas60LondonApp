"use client";

import { useCallback, useEffect, useState } from "react";

export interface TflLineStatus {
  name: string;
  status: string;
  severity: number;
  reason?: string;
  color: string;
}

const REFRESH_MS = 5 * 60 * 1000; // 5 min

// Tube line colors (TfL official)
const LINE_COLORS: Record<string, string> = {
  Bakerloo: "#B36305",
  Central: "#E32017",
  Circle: "#FFD300",
  District: "#00782A",
  "Hammersmith & City": "#F3A9BB",
  Jubilee: "#A0A5A9",
  Metropolitan: "#9B0056",
  Northern: "#000000",
  Piccadilly: "#003688",
  Victoria: "#0098D4",
  "Waterloo & City": "#95CDBA",
  Elizabeth: "#6950A1",
  DLR: "#00A4A7",
  Overground: "#EE7C0E",
};

interface TflApiLine {
  name: string;
  lineStatuses?: Array<{
    statusSeverity: number;
    statusSeverityDescription: string;
    reason?: string;
  }>;
}

export function useTflStatus() {
  const [data, setData] = useState<TflLineStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("https://api.tfl.gov.uk/Line/Mode/tube/Status");
      if (!res.ok) throw new Error(`TfL API ${res.status}`);
      const lines = (await res.json()) as TflApiLine[];

      const mapped: TflLineStatus[] = lines.map((line) => {
        const status = line.lineStatuses?.[0];
        return {
          name: line.name,
          status: status?.statusSeverityDescription ?? "Unbekannt",
          severity: status?.statusSeverity ?? 10,
          reason: status?.reason,
          color: LINE_COLORS[line.name] ?? "#666666",
        };
      });

      mapped.sort((a, b) => a.severity - b.severity);
      setData(mapped);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  return { data, loading, error, lastUpdated, refresh: load };
}
