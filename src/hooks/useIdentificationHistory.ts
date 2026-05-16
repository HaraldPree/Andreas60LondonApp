"use client";

import { useCallback, useEffect, useState } from "react";
import type { LocationResult } from "@/app/api/identify-location/route";
import type { IdentifiedLocation } from "@/types/identifiedLocation";

const MAX_HISTORY = 20;

function key(tripSlug: string) {
  return `rcmk:identifications:${tripSlug}`;
}

function load(tripSlug: string): IdentifiedLocation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(tripSlug));
    return raw ? (JSON.parse(raw) as IdentifiedLocation[]) : [];
  } catch {
    return [];
  }
}

function save(tripSlug: string, items: IdentifiedLocation[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(tripSlug), JSON.stringify(items));
  } catch {
    // localStorage full – drop oldest and retry
    try {
      window.localStorage.setItem(
        key(tripSlug),
        JSON.stringify(items.slice(0, Math.floor(items.length / 2))),
      );
    } catch {
      // give up
    }
  }
}

export function useIdentificationHistory(tripSlug: string) {
  const [history, setHistory] = useState<IdentifiedLocation[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHistory(load(tripSlug));
    setHydrated(true);
  }, [tripSlug]);

  const add = useCallback(
    (result: LocationResult, thumbnailDataUrl?: string) => {
      // Only save successful identifications (with at least a name or description)
      if (!result.name && !result.description) return;

      setHistory((prev) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `il_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const entry: IdentifiedLocation = {
          id,
          tripSlug,
          result,
          thumbnailDataUrl,
          identifiedAt: new Date().toISOString(),
        };
        const next = [entry, ...prev].slice(0, MAX_HISTORY);
        save(tripSlug, next);
        return next;
      });
    },
    [tripSlug],
  );

  const remove = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const next = prev.filter((h) => h.id !== id);
        save(tripSlug, next);
        return next;
      });
    },
    [tripSlug],
  );

  const clear = useCallback(() => {
    setHistory([]);
    save(tripSlug, []);
  }, [tripSlug]);

  return { history, hydrated, add, remove, clear };
}
