"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserPlace } from "@/types/userPlace";

function key(tripSlug: string) {
  return `rcmk:userplaces:${tripSlug}`;
}

function load(tripSlug: string): UserPlace[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(tripSlug));
    return raw ? (JSON.parse(raw) as UserPlace[]) : [];
  } catch {
    return [];
  }
}

function save(tripSlug: string, items: UserPlace[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(tripSlug), JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function useUserPlaces(tripSlug: string) {
  const [places, setPlaces] = useState<UserPlace[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPlaces(load(tripSlug));
    setHydrated(true);
  }, [tripSlug]);

  const add = useCallback(
    (place: Omit<UserPlace, "id" | "addedAt" | "tripSlug">) => {
      setPlaces((prev) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `up_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const next: UserPlace[] = [
          ...prev,
          {
            ...place,
            id,
            tripSlug,
            addedAt: new Date().toISOString(),
          },
        ];
        save(tripSlug, next);
        return next;
      });
    },
    [tripSlug],
  );

  const remove = useCallback(
    (id: string) => {
      setPlaces((prev) => {
        const next = prev.filter((p) => p.id !== id);
        save(tripSlug, next);
        return next;
      });
    },
    [tripSlug],
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<UserPlace, "id" | "tripSlug">>) => {
      setPlaces((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
        save(tripSlug, next);
        return next;
      });
    },
    [tripSlug],
  );

  const byDay = useMemo(() => {
    const map = new Map<number | "unassigned", UserPlace[]>();
    for (const p of places) {
      const k = typeof p.dayIndex === "number" ? p.dayIndex : "unassigned";
      const arr = map.get(k) ?? [];
      arr.push(p);
      map.set(k, arr);
    }
    return map;
  }, [places]);

  const listForDay = useCallback(
    (dayIndex: number): UserPlace[] => byDay.get(dayIndex) ?? [],
    [byDay],
  );

  return { places, hydrated, add, remove, update, byDay, listForDay };
}
