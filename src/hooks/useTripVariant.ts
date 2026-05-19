"use client";

import { useCallback, useEffect, useState } from "react";

export type TripVariant = "original" | "alternative";

const KEY = (tripSlug: string) => `rcmk:trip-variant:${tripSlug}`;

/**
 * Verwalten der aktiven Programm-Variante (Original vs. Alternative,
 * z.B. Wetter-Anpassung) pro Reise im localStorage.
 *
 * Default-Verhalten: wenn lokal nichts gespeichert, verwende den
 * Trip-eigenen `defaultVariant` (falls gesetzt) oder "original".
 *
 * Hinweis: aktuell pro Gerät getrennt. Wenn später ein Backend für
 * geteilten State kommt, könnte die Wahl gruppenweit sein — aber das
 * würde den "Lukas-Konsens" (alle sehen dasselbe) erfüllen, eine
 * Diskussion die noch offen ist.
 */
export function useTripVariant(
  tripSlug: string,
  defaultFromTrip: TripVariant = "original",
) {
  const [variant, setVariantState] = useState<TripVariant>(defaultFromTrip);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate aus localStorage beim Mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(KEY(tripSlug));
      if (stored === "original" || stored === "alternative") {
        setVariantState(stored);
      } else {
        setVariantState(defaultFromTrip);
      }
    } catch {
      setVariantState(defaultFromTrip);
    } finally {
      setHydrated(true);
    }
  }, [tripSlug, defaultFromTrip]);

  const setVariant = useCallback(
    (next: TripVariant) => {
      setVariantState(next);
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(KEY(tripSlug), next);
      } catch {
        // ignore
      }
    },
    [tripSlug],
  );

  return { variant, setVariant, hydrated };
}
