"use client";

import { useEffect, useState } from "react";

export type TripPhase = "before" | "during" | "after";

export interface CountdownState {
  phase: TripPhase;
  /** Days until trip starts (>= 0 only when phase === "before"). */
  daysUntil: number;
  /** 0-based day index within the trip (only when phase === "during"). */
  currentDayIndex: number;
  /** Human-readable label e.g. "Noch 3 Tage" / "Tag 2 von 5" / "Reise vorbei". */
  label: string;
}

/**
 * @param startIso "YYYY-MM-DD" first day of trip
 * @param endIso   "YYYY-MM-DD" last day of trip (inclusive)
 */
export function useCountdown(startIso?: string, endIso?: string): CountdownState | null {
  // We must hydrate on client to avoid SSR mismatch
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000); // refresh every minute
    return () => clearInterval(t);
  }, []);

  if (!now || !startIso || !endIso) return null;

  const today = startOfDay(now);
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  const totalDays =
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  if (today < start) {
    const daysUntil = Math.round((start.getTime() - today.getTime()) / 86_400_000);
    return {
      phase: "before",
      daysUntil,
      currentDayIndex: -1,
      label:
        daysUntil === 0
          ? "Heute geht's los!"
          : daysUntil === 1
            ? "Morgen geht's los!"
            : `Noch ${daysUntil} Tage`,
    };
  }

  if (today > end) {
    return {
      phase: "after",
      daysUntil: 0,
      currentDayIndex: totalDays - 1,
      label: "Reise vorbei",
    };
  }

  // During: 0-based index from start
  const idx = Math.round((today.getTime() - start.getTime()) / 86_400_000);
  return {
    phase: "during",
    daysUntil: 0,
    currentDayIndex: idx,
    label: `Tag ${idx + 1} von ${totalDays}`,
  };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
