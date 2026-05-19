/**
 * v1.3.0 — In-App-Editor für Tagesprogramm (Phase 1).
 *
 * Reisende können während der Reise pro Programm-Item drei Aktionen
 * pflegen:
 *  - „erledigt" (Tap auf den Circle-Button)
 *  - „ausgelassen" (Action-Sheet)
 *  - eigene Notiz (Action-Sheet)
 *
 * Speicherung erfolgt clientseitig in localStorage — pro Gerät, kein
 * Sync zwischen Reisenden (analog `useTripVariant`, `useUserPlaces`).
 */

import type { TripVariant } from "@/hooks/useTripVariant";

export type ItemMark = "done" | "skipped";

export interface ItemState {
  /** Markierung des Items. Wenn `undefined`, ist nur eine Notiz da. */
  mark?: ItemMark;
  /** Freie Notiz der User:in zu diesem Item. */
  note?: string;
  /** Letzte Aktualisierung (epoch ms) — für künftiges Sync / Debug. */
  updatedAt: number;
}

/**
 * Zustand aller Items einer Reise, gekeyed via stabiler Item-ID.
 *
 * Items haben aktuell keine intrinsischen IDs in den Trip-Daten, daher
 * konstruieren wir IDs aus (variant, dayIndex, itemIndex). Wenn Items
 * in den Daten umsortiert werden, kann der State verschoben sein —
 * akzeptable Schwäche für v1.3.0 (Live-Editor erwartet selten
 * Daten-Reorganisation während Nutzung).
 */
export type ItemStateMap = Record<string, ItemState>;

/**
 * Stabile ID pro Item. Variant-Prefix verhindert Kollisionen zwischen
 * unterschiedlichen Programm-Versionen (z.B. Donnerstag Original vs.
 * Donnerstag Sonnentag-Bündelung — sind unterschiedliche Items am
 * selben Tag).
 */
export function itemIdFor(
  variant: TripVariant,
  dayIndex: number,
  itemIndex: number,
): string {
  return `v=${variant}:d=${dayIndex}:i=${itemIndex}`;
}

/**
 * Berechnet ob für eine Day-Index-Position überhaupt State existiert.
 * Genutzt für „Reset Tag"-Button und Stats-Badge im DayCard-Header.
 */
export interface DayStats {
  done: number;
  skipped: number;
  withNote: number;
  total: number;
  /** Anzahl der Items mit irgendeiner Markierung ODER Notiz. */
  touched: number;
}
