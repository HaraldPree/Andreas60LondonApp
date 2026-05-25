"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/types/trip";
import { reverseGeocode } from "@/lib/reverseGeocode";

/**
 * v1.14.2 — Lädt das Nominatim-Reverse-Geocoding-Label für eine
 * Koordinate. Cache-first via reverseGeocode(). Wenn `coords`
 * undefined ist (Stop ohne GPS), gibt der Hook sofort `null` zurück.
 *
 * Verwendung im ErlebtView: für Stops ohne Place-Match aber mit GPS
 * wird so „Stopp bei Greenwich" angezeigt statt nur „Stopp ohne
 * Place-Match".
 */
export function useNearbyLabel(
  coords: Coordinates | undefined,
): string | null {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) {
      setLabel(null);
      return;
    }
    let cancelled = false;
    reverseGeocode(coords).then((res) => {
      if (!cancelled) setLabel(res);
    });
    return () => {
      cancelled = true;
    };
    // Cache-Key dependency: nur bei tatsächlicher Coord-Änderung neu
    // anstoßen, nicht bei Re-Renders mit gleicher Coord.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);

  return label;
}
