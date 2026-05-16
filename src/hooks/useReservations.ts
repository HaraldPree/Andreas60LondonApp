"use client";

import { useCallback, useEffect, useState } from "react";
import type { Reservation, ReservationStatus } from "@/types/trip";

type StatusMap = Record<string, ReservationStatus>;

const STATUS_FLOW: ReservationStatus[] = ["offen", "reserviert", "erledigt"];

function storageKey(tripSlug: string): string {
  return `rcmk:reservations:${tripSlug}`;
}

function loadFromStorage(tripSlug: string): StatusMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(tripSlug));
    return raw ? (JSON.parse(raw) as StatusMap) : {};
  } catch {
    return {};
  }
}

function saveToStorage(tripSlug: string, map: StatusMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(tripSlug), JSON.stringify(map));
  } catch {
    // localStorage full / disabled – fail silently
  }
}

export function useReservations(tripSlug: string, defaults: Reservation[]) {
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStatusMap(loadFromStorage(tripSlug));
    setHydrated(true);
  }, [tripSlug]);

  const cycleStatus = useCallback(
    (id: string, defaultStatus: ReservationStatus) => {
      setStatusMap((prev) => {
        const current = prev[id] ?? defaultStatus;
        const currentIdx = STATUS_FLOW.indexOf(current);
        const next = STATUS_FLOW[(currentIdx + 1) % STATUS_FLOW.length];
        const updated = { ...prev, [id]: next };
        saveToStorage(tripSlug, updated);
        return updated;
      });
    },
    [tripSlug],
  );

  const getStatus = useCallback(
    (reservation: Reservation): ReservationStatus => {
      if (!hydrated) return reservation.status;
      return statusMap[reservation.id] ?? reservation.status;
    },
    [statusMap, hydrated],
  );

  const reservations = defaults.map((r) => ({
    ...r,
    status: getStatus(r),
  }));

  return { reservations, cycleStatus, hydrated };
}
