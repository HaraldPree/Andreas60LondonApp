"use client";

import { useEffect, useMemo, useState } from "react";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";
import { listPhotos } from "@/lib/photoStorage";
import { useSharedPhotos } from "./useSharedPhotos";
import {
  reconstructDay,
  groupPhotosByDay,
  type ReconstructedStop,
  type PhotoForReconstruction,
} from "@/lib/tripReconstruction";

interface UseReconstructedTripOptions {
  trip: Trip;
  currentUserName: string | null;
  /** Nur aktivieren wenn der Switch tatsächlich auf „erlebt" steht —
   *  spart Listing-Aufruf gegen IndexedDB bei jedem Tab-Render. */
  enabled?: boolean;
}

interface UseReconstructedTripResult {
  /** Pro Tag-Index die rekonstruierten Stops in chronologischer Reihenfolge. */
  stopsByDay: Map<number, ReconstructedStop[]>;
  /** Gesamt-Foto-Anzahl die in die Rekonstruktion eingeflossen ist. */
  totalPhotos: number;
  /** Wieviele davon hatten verwertbares GPS. */
  photosWithGps: number;
  /** Tag-Indizes die mindestens 1 Stop haben (für UI-Anzeige). */
  daysWithStops: number[];
  /** Wieviele Stops haben einen Place-Match gefunden. */
  matchedStops: number;
  /** Wieviele Stops sind „unmatched" (kein GPS oder zu weit weg vom Place). */
  unmatchedStops: number;
  /**
   * Map photo-ID → Thumb-URL für geteilte Fotos (HTTP-Vercel-Blob-URLs).
   * Eigene Fotos sind nicht drin — die werden in der UI per
   * useBlobUrlState(id, getThumbnailBlob) geladen.
   */
  sharedThumbUrls: Record<string, string>;
  loading: boolean;
}

/**
 * v1.14.0 — Sammelt eigene (IndexedDB) und geteilte (Vercel Blob) Fotos
 * eines Trips und rekonstruiert daraus Tag-für-Tag die tatsächlichen
 * Stops via EXIF-GPS + Cluster-Algorithmus.
 *
 * Komplett kostenlos — keine API-Calls, kein AI-Vision. Place-Matching
 * läuft gegen `trip.places` (Wunschliste-Library).
 *
 * `enabled`-Flag verhindert unnötige IndexedDB-Reads wenn der „Erlebt"-
 * Switch nicht aktiv ist.
 */
export function useReconstructedTrip({
  trip,
  currentUserName,
  enabled = true,
}: UseReconstructedTripOptions): UseReconstructedTripResult {
  const [ownPhotos, setOwnPhotos] = useState<PhotoMeta[]>([]);
  const [loadingOwn, setLoadingOwn] = useState(false);

  // Shared photos laden — der Hook hat eigenes Caching + Refresh
  const { photos: sharedPhotos, loading: loadingShared } = useSharedPhotos({
    tripSlug: trip.slug,
    viewerName: currentUserName,
    enabled,
  });

  // Eigene Fotos aus IndexedDB laden (einmalig wenn enabled wird)
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoadingOwn(true);
    listPhotos(trip.slug)
      .then((photos) => {
        if (!cancelled) setOwnPhotos(photos);
      })
      .catch((err) => {
        console.warn("[useReconstructedTrip] IndexedDB read failed:", err);
        if (!cancelled) setOwnPhotos([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOwn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trip.slug, enabled]);

  return useMemo(() => {
    if (!enabled) {
      return {
        stopsByDay: new Map(),
        totalPhotos: 0,
        photosWithGps: 0,
        daysWithStops: [],
        matchedStops: 0,
        unmatchedStops: 0,
        sharedThumbUrls: {},
        loading: false,
      };
    }

    // Auf einheitliches Shape mappen, Videos rausfiltern (kein EXIF-GPS)
    const fromOwn: PhotoForReconstruction[] = ownPhotos
      .filter((p) => p.mediaType !== "video")
      .map((p) => ({
        id: p.id,
        takenAt: p.takenAt,
        coordinates: p.coordinates,
        assignedDay: p.assignedDay,
        source: "own" as const,
      }));

    const fromShared: PhotoForReconstruction[] = sharedPhotos
      .filter((p) => p.takenAt) // ohne takenAt keine Zeitachse
      .map((p) => ({
        id: p.id,
        takenAt: p.takenAt!,
        coordinates: p.coordinates,
        assignedDay: p.assignedDay,
        source: "shared" as const,
      }));

    // Dedupe: shared photos haben oft dieselbe ID wie own (Upload nutzt
    // PhotoEntry.id). Bei Duplikat: own wins (hat zuverlässiger EXIF).
    const seenIds = new Set(fromOwn.map((p) => p.id));
    const merged = [
      ...fromOwn,
      ...fromShared.filter((p) => !seenIds.has(p.id)),
    ];

    const byDay = groupPhotosByDay(merged, trip.days);
    const result = new Map<number, ReconstructedStop[]>();
    let matched = 0;
    let unmatched = 0;
    const days: number[] = [];
    for (const [dayIdx, photos] of byDay.entries()) {
      if (dayIdx < 0) continue; // Foto außerhalb Reisezeit — überspringen
      const stops = reconstructDay(photos, trip.places ?? []);
      if (stops.length > 0) {
        result.set(dayIdx, stops);
        days.push(dayIdx);
        for (const s of stops) {
          if (s.placeId) matched++;
          else unmatched++;
        }
      }
    }
    days.sort((a, b) => a - b);

    // Map shared photo-IDs zu ihren Thumb-URLs damit das UI direkt das
    // <img src=…> setzen kann (keine zusätzliche IndexedDB-Suche nötig).
    const sharedThumbUrls: Record<string, string> = {};
    for (const p of sharedPhotos) {
      sharedThumbUrls[p.id] = p.thumbBlobUrl;
    }

    return {
      stopsByDay: result,
      totalPhotos: merged.length,
      photosWithGps: merged.filter((p) => p.coordinates).length,
      daysWithStops: days,
      matchedStops: matched,
      unmatchedStops: unmatched,
      sharedThumbUrls,
      loading: loadingOwn || loadingShared,
    };
  }, [
    enabled,
    ownPhotos,
    sharedPhotos,
    trip.days,
    trip.places,
    loadingOwn,
    loadingShared,
  ]);
}
