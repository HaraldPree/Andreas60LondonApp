"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  DayStats,
  ItemMark,
  ItemState,
  ItemStateMap,
} from "@/types/itemState";
import { itemIdFor } from "@/types/itemState";
import type { TripVariant } from "@/hooks/useTripVariant";

const STORAGE_KEY = (tripSlug: string) => `rcmk:items:${tripSlug}`;

/**
 * v1.3.0 — In-App-Editor (Phase 1).
 *
 * Persistiert pro Reise (alle Varianten zusammen) den User-Zustand
 * jedes Items: erledigt, ausgelassen, freie Notiz. Pro Gerät, kein
 * Backend-Sync.
 *
 * Variant-aware: Items in der „Wetter-Variante" haben separate IDs
 * von den Items im Original. So bleibt die Markierung beim Wechsel
 * der Variante korrekt zugeordnet.
 *
 * Erwartete Größe: < 100 Items pro Reise × ~50 bytes pro State ≈ 5KB
 * gut innerhalb localStorage-Limits.
 */
export function useItemState(tripSlug: string, variant: TripVariant) {
  const [states, setStates] = useState<ItemStateMap>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate aus localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY(tripSlug));
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === "object") {
          setStates(parsed as ItemStateMap);
        }
      }
    } catch {
      // Korrupter Eintrag → ignorieren, frisch starten
    } finally {
      setHydrated(true);
    }
  }, [tripSlug]);

  // Persistenz-Helper
  const persist = useCallback(
    (next: ItemStateMap) => {
      setStates(next);
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(
          STORAGE_KEY(tripSlug),
          JSON.stringify(next),
        );
      } catch {
        // Quota voll oder localStorage gesperrt — kein Crash
      }
    },
    [tripSlug],
  );

  /** State eines Items lesen (undefined wenn unmarkiert). */
  const get = useCallback(
    (dayIndex: number, itemIndex: number): ItemState | undefined => {
      const id = itemIdFor(variant, dayIndex, itemIndex);
      return states[id];
    },
    [states, variant],
  );

  /**
   * Markierung setzen (done / skipped) oder entfernen (null).
   * Behält bestehende Notiz bei. Wenn weder mark noch note übrig
   * bleiben, wird der Eintrag komplett gelöscht (sauber).
   */
  const setMark = useCallback(
    (dayIndex: number, itemIndex: number, mark: ItemMark | null) => {
      const id = itemIdFor(variant, dayIndex, itemIndex);
      const existing = states[id];
      const note = existing?.note;

      if (mark === null && !note) {
        // Komplett entfernen
        if (!(id in states)) return;
        const next = { ...states };
        delete next[id];
        persist(next);
        return;
      }

      const nextState: ItemState = {
        ...(note ? { note } : {}),
        ...(mark ? { mark } : {}),
        updatedAt: Date.now(),
      };
      persist({ ...states, [id]: nextState });
    },
    [states, variant, persist],
  );

  /**
   * Notiz setzen (leerer String = entfernen). Behält Markierung bei.
   * Wenn weder mark noch note übrig bleiben → kompletter Eintrag weg.
   */
  const setNote = useCallback(
    (dayIndex: number, itemIndex: number, note: string) => {
      const id = itemIdFor(variant, dayIndex, itemIndex);
      const trimmed = note.trim();
      const existing = states[id];
      const mark = existing?.mark;

      if (!trimmed && !mark) {
        if (!(id in states)) return;
        const next = { ...states };
        delete next[id];
        persist(next);
        return;
      }

      const nextState: ItemState = {
        ...(mark ? { mark } : {}),
        ...(trimmed ? { note: trimmed } : {}),
        updatedAt: Date.now(),
      };
      persist({ ...states, [id]: nextState });
    },
    [states, variant, persist],
  );

  /**
   * v1.4.0 — Bulk-Operation: Range von Items in einem Tag markieren.
   *
   * Verwendet von „Ab hier Rest des Tages offen lassen" — markiert
   * alle Items von `fromItemIndex` bis `toItemIndex` (inklusive) mit
   * derselben Markierung. Atomares persist am Ende statt N einzelner
   * localStorage-Writes.
   */
  const setRangeMark = useCallback(
    (
      dayIndex: number,
      fromItemIndex: number,
      toItemIndex: number,
      mark: ItemMark | null,
    ) => {
      const next: ItemStateMap = { ...states };
      let changed = false;
      const ts = Date.now();
      for (let i = fromItemIndex; i <= toItemIndex; i += 1) {
        const id = itemIdFor(variant, dayIndex, i);
        const existing = next[id];
        const note = existing?.note;

        if (mark === null && !note) {
          if (id in next) {
            delete next[id];
            changed = true;
          }
          continue;
        }

        const newState: ItemState = {
          ...(note ? { note } : {}),
          ...(mark ? { mark } : {}),
          updatedAt: ts,
        };
        // Nur als geändert zählen wenn tatsächlich anders
        if (
          !existing ||
          existing.mark !== newState.mark ||
          existing.note !== newState.note
        ) {
          next[id] = newState;
          changed = true;
        }
      }
      if (changed) persist(next);
    },
    [states, variant, persist],
  );

  /** Alles für ein Item entfernen (Markierung + Notiz). */
  const clearItem = useCallback(
    (dayIndex: number, itemIndex: number) => {
      const id = itemIdFor(variant, dayIndex, itemIndex);
      if (!(id in states)) return;
      const next = { ...states };
      delete next[id];
      persist(next);
    },
    [states, variant, persist],
  );

  /** Alle Markierungen + Notizen eines Tages entfernen. */
  const clearDay = useCallback(
    (dayIndex: number) => {
      const prefix = `v=${variant}:d=${dayIndex}:`;
      const next: ItemStateMap = {};
      let changed = false;
      for (const [key, val] of Object.entries(states)) {
        if (key.startsWith(prefix)) {
          changed = true;
        } else {
          next[key] = val;
        }
      }
      if (changed) persist(next);
    },
    [states, variant, persist],
  );

  /** Aggregierte Statistik pro Tag — für DayCard-Header-Badge. */
  const dayStats = useCallback(
    (dayIndex: number, totalItems: number): DayStats => {
      const prefix = `v=${variant}:d=${dayIndex}:`;
      let done = 0;
      let skipped = 0;
      let withNote = 0;
      let touched = 0;
      for (const [key, val] of Object.entries(states)) {
        if (!key.startsWith(prefix)) continue;
        touched += 1;
        if (val.mark === "done") done += 1;
        else if (val.mark === "skipped") skipped += 1;
        if (val.note) withNote += 1;
      }
      return { done, skipped, withNote, total: totalItems, touched };
    },
    [states, variant],
  );

  return {
    hydrated,
    get,
    setMark,
    setNote,
    setRangeMark,
    clearItem,
    clearDay,
    dayStats,
  };
}
