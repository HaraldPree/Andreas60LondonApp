"use client";

import { useMemo } from "react";
import type { Trip } from "@/types/trip";

export type TripPhase = "future" | "current" | "past";

/**
 * v1.17.0 — Welche Phase befindet sich der User in Bezug auf diese
 * Reise: davor (planen), drin (erleben), danach (erinnern).
 *
 * Verwendet wird das für:
 *  - Auto-Default-Tab in TripPageClient (Apple-Way Drei-Phasen-Navigation)
 *  - Conditional-Rendering einzelner Elemente (EventBanner, Reel-Banner,
 *    Feedback-Karte etc.)
 *
 * Wenn keine `isoDate`-Werte gesetzt sind: Fallback `future` (sichere
 * Vermutung, neue Reisen sind in der Regel zukunftsorientiert).
 */
export function useTripPhase(trip: Trip): {
  phase: TripPhase;
  todayIso: string;
  firstDayIso: string | null;
  lastDayIso: string | null;
  isFuture: boolean;
  isCurrent: boolean;
  isPast: boolean;
} {
  return useMemo(() => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const firstDay = trip.days[0]?.isoDate ?? null;
    const lastDay = trip.days[trip.days.length - 1]?.isoDate ?? null;

    let phase: TripPhase = "future";
    if (firstDay && lastDay) {
      if (todayIso > lastDay) phase = "past";
      else if (todayIso >= firstDay) phase = "current";
      else phase = "future";
    }

    return {
      phase,
      todayIso,
      firstDayIso: firstDay,
      lastDayIso: lastDay,
      isFuture: phase === "future",
      isCurrent: phase === "current",
      isPast: phase === "past",
    };
  }, [trip.days]);
}
