"use client";

import { useCallback, useEffect, useState } from "react";

export interface HealthCardData {
  bloodGroup?: string;
  allergies?: string;
  medications?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  notes?: string;
}

type HealthMap = Record<string, HealthCardData>;

function storageKey(tripSlug: string) {
  return `rcmk:health:${tripSlug}`;
}

function load(tripSlug: string): HealthMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(tripSlug));
    return raw ? (JSON.parse(raw) as HealthMap) : {};
  } catch {
    return {};
  }
}

function save(tripSlug: string, map: HealthMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(tripSlug), JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function useHealthCards(tripSlug: string) {
  const [data, setData] = useState<HealthMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(load(tripSlug));
    setHydrated(true);
  }, [tripSlug]);

  const update = useCallback(
    (participantName: string, patch: Partial<HealthCardData>) => {
      setData((prev) => {
        const next = { ...prev, [participantName]: { ...prev[participantName], ...patch } };
        save(tripSlug, next);
        return next;
      });
    },
    [tripSlug],
  );

  const clear = useCallback(
    (participantName: string) => {
      setData((prev) => {
        const next = { ...prev };
        delete next[participantName];
        save(tripSlug, next);
        return next;
      });
    },
    [tripSlug],
  );

  const get = useCallback(
    (participantName: string): HealthCardData => data[participantName] ?? {},
    [data],
  );

  return { data, hydrated, get, update, clear };
}
