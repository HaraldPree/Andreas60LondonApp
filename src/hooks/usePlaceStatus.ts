"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlaceStatus, PlaceStatusMap } from "@/types/place";

const STORAGE_KEY = (tripSlug: string, userName: string) =>
  `rcmk:placeStatus:${tripSlug}:${userName}`;

const ANON = "_anon";

/**
 * v1.7.0 — Per-Person Place-Status für die Wunschliste.
 *
 * Pro User (oder anonymer Browser) wird gespeichert ob ein Place
 *  - "open" (Default, kein Eintrag)
 *  - "wantToSee" (auf meiner Liste)
 *  - "done" (war ich schon)
 *
 * Persistenz pro Gerät via localStorage — Gruppen-Sync kommt in
 * v1.7.1 mit Blob-Manifest analog Foto-Sharing.
 */
export function usePlaceStatus(tripSlug: string, userName: string | null) {
  const effectiveUser = userName ?? ANON;
  const [statuses, setStatuses] = useState<PlaceStatusMap>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate aus localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(
        STORAGE_KEY(tripSlug, effectiveUser),
      );
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === "object") {
          setStatuses(parsed as PlaceStatusMap);
        }
      } else {
        setStatuses({});
      }
    } catch {
      // ignore — frisch starten
    } finally {
      setHydrated(true);
    }
  }, [tripSlug, effectiveUser]);

  const persist = useCallback(
    (next: PlaceStatusMap) => {
      setStatuses(next);
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(
          STORAGE_KEY(tripSlug, effectiveUser),
          JSON.stringify(next),
        );
      } catch {
        // ignore
      }
    },
    [tripSlug, effectiveUser],
  );

  const statusOf = useCallback(
    (placeId: string): PlaceStatus => {
      return statuses[placeId] ?? "open";
    },
    [statuses],
  );

  const setStatus = useCallback(
    (placeId: string, next: PlaceStatus) => {
      if (next === "open") {
        if (!(placeId in statuses)) return;
        const out = { ...statuses };
        delete out[placeId];
        persist(out);
        return;
      }
      if (statuses[placeId] === next) return;
      persist({ ...statuses, [placeId]: next });
    },
    [statuses, persist],
  );

  const clear = useCallback(
    (placeId: string) => setStatus(placeId, "open"),
    [setStatus],
  );

  const stats = useCallback(() => {
    let wantToSee = 0;
    let done = 0;
    for (const val of Object.values(statuses)) {
      if (val === "wantToSee") wantToSee += 1;
      else if (val === "done") done += 1;
    }
    return { wantToSee, done };
  }, [statuses]);

  return {
    hydrated,
    statusOf,
    setStatus,
    clear,
    stats,
    rawMap: statuses,
  };
}
