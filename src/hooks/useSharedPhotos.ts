"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  SharedPhotoView,
  SharedPhotoVisibility,
} from "@/types/sharedPhoto";

interface UseSharedPhotosOptions {
  tripSlug: string;
  viewerName: string | null;
  /** Wenn `false` werden API-Calls übersprungen (z.B. wenn User noch
   *  keine Einwilligung erteilt hat). */
  enabled?: boolean;
}

interface ListResponse {
  ok?: boolean;
  configured?: boolean;
  photos?: SharedPhotoView[];
  viewerIsCelebrant?: boolean;
  error?: string;
}

/** localStorage-Cache-Schema (v1.2.3). Wir cachen den letzten erfolgreichen
 * Manifest-Snapshot pro (tripSlug × viewerName) damit der/die Reisende beim
 * Öffnen der App sofort die letzten geteilten Fotos sieht — auch wenn das
 * Netzwerk gerade hakt. Das `cachedAt`-Feld dient nur Debugging, der Cache
 * wird IMMER angezeigt, parallel läuft die Hintergrund-Aktualisierung
 * (stale-while-revalidate). */
const CACHE_PREFIX = "rcmk:sharedPhotos:cache:";

interface CacheShape {
  photos: SharedPhotoView[];
  viewerIsCelebrant: boolean;
  serviceConfigured: boolean | null;
  cachedAt: number;
}

function cacheKey(tripSlug: string, viewerName: string) {
  return `${CACHE_PREFIX}${tripSlug}:${viewerName}`;
}

function readCache(
  tripSlug: string,
  viewerName: string,
): CacheShape | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(tripSlug, viewerName));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray((parsed as CacheShape).photos)
    ) {
      return null;
    }
    return parsed as CacheShape;
  } catch {
    return null;
  }
}

function writeCache(
  tripSlug: string,
  viewerName: string,
  data: Omit<CacheShape, "cachedAt">,
) {
  if (typeof window === "undefined") return;
  try {
    const payload: CacheShape = { ...data, cachedAt: Date.now() };
    window.localStorage.setItem(
      cacheKey(tripSlug, viewerName),
      JSON.stringify(payload),
    );
  } catch {
    // Quota voll oder localStorage gesperrt — ignorieren, ist nur Cache.
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Client-Hook für die Gemeinsame Galerie.
 *
 * v1.2.3 Updates:
 *  - localStorage-Cache als instant-display (stale-while-revalidate)
 *  - Retry mit Backoff (3 Versuche: 0ms / 1500ms / 4000ms) bei
 *    Netzwerk- / Server-Fehlern
 *  - Sichtbarer Fehler-State wenn alle 3 Versuche fehlschlagen, ABER
 *    Cache wird weiterhin angezeigt (damit der User nicht plötzlich
 *    eine leere Galerie sieht)
 *
 * Failure-Modus: wenn Vercel Blob nicht konfiguriert ist, geben die
 * Server-Endpoints 503 oder `configured:false` zurück. Der Hook
 * exposed das als `serviceConfigured: false` damit die UI eine
 * passende "Service noch nicht aktiv"-Meldung zeigen kann.
 */
export function useSharedPhotos({
  tripSlug,
  viewerName,
  enabled = true,
}: UseSharedPhotosOptions) {
  const [photos, setPhotos] = useState<SharedPhotoView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceConfigured, setServiceConfigured] = useState<boolean | null>(
    null,
  );
  const [viewerIsCelebrant, setViewerIsCelebrant] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  // Cache hydration läuft synchron beim ersten Effect-Run damit der User
  // sofort sieht was er beim letzten Mal hatte. Ohne diesen Schritt
  // sieht er auf langsamen Verbindungen erst nichts → Skeleton →
  // möglicherweise Fehler → leer.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (!enabled || !tripSlug || !viewerName) return;
    const cached = readCache(tripSlug, viewerName);
    if (cached) {
      setPhotos(cached.photos);
      setViewerIsCelebrant(cached.viewerIsCelebrant);
      setServiceConfigured(cached.serviceConfigured);
      setLastUpdatedAt(cached.cachedAt);
    }
    hydratedRef.current = true;
  }, [enabled, tripSlug, viewerName]);

  const refresh = useCallback(async () => {
    if (!enabled || !tripSlug || !viewerName) {
      setPhotos([]);
      return;
    }

    setLoading(true);
    // Wichtig: wir resetten den Fehler NICHT sofort — wenn der vorherige
    // Refresh ein Fehler hatte, soll der User nicht für eine Sekunde
    // "ok" sehen bevor wieder fehlerhaft wird. Setzen unten je nach
    // Ergebnis.
    const backoffs = [0, 1500, 4000]; // 3 Versuche, total ca. 5.5 Sek
    let lastError: unknown = null;

    for (let attempt = 0; attempt < backoffs.length; attempt += 1) {
      if (backoffs[attempt] > 0) await sleep(backoffs[attempt]);
      try {
        const params = new URLSearchParams({ viewerName });
        const res = await fetch(
          `/api/photos/list/${encodeURIComponent(tripSlug)}?${params.toString()}`,
          { credentials: "include" },
        );

        if (res.status === 503) {
          setServiceConfigured(false);
          setPhotos([]);
          setError(null);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(
            `API ${res.status}: ${res.statusText || "request failed"}`,
          );
        }

        const data = (await res.json()) as ListResponse;
        const nextPhotos = data.photos ?? [];
        const nextCelebrant = !!data.viewerIsCelebrant;
        const nextConfigured = data.configured !== false;

        setServiceConfigured(nextConfigured);
        setPhotos(nextPhotos);
        setViewerIsCelebrant(nextCelebrant);
        setError(null);
        setLoading(false);
        setLastUpdatedAt(Date.now());

        writeCache(tripSlug, viewerName, {
          photos: nextPhotos,
          viewerIsCelebrant: nextCelebrant,
          serviceConfigured: nextConfigured,
        });
        return;
      } catch (e) {
        lastError = e;
        // Weiter zur nächsten Iteration
      }
    }

    // Alle 3 Versuche fehlgeschlagen — Cache bleibt sichtbar, aber wir
    // signalisieren den Fehler.
    setError(
      lastError instanceof Error
        ? lastError.message
        : "Verbindungsproblem — letzter Stand wird angezeigt.",
    );
    setLoading(false);
  }, [enabled, tripSlug, viewerName]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * Lädt ein Foto in der gewünschten Sichtbarkeit auf den Server hoch.
   * Erwartet die bereits-komprimierten Blobs (gleicher Format wie für
   * IndexedDB) — der Hook macht keine Bildverarbeitung.
   */
  const share = useCallback(
    async (args: {
      photoId: string;
      visibility: Exclude<SharedPhotoVisibility, "private">;
      fullBlob: Blob;
      thumbBlob: Blob;
      fileName: string;
      caption?: string;
      takenAt?: string;
      assignedDay?: number;
    }) => {
      if (!viewerName) throw new Error("Keine Viewer-Identität");
      const form = new FormData();
      form.append("file", args.fullBlob, args.fileName);
      form.append("thumb", args.thumbBlob, `${args.fileName}-thumb.jpg`);
      form.append("tripSlug", tripSlug);
      form.append("photoId", args.photoId);
      form.append("uploaderName", viewerName);
      form.append("visibility", args.visibility);
      form.append("fileName", args.fileName);
      if (args.caption) form.append("caption", args.caption);
      if (args.takenAt) form.append("takenAt", args.takenAt);
      if (typeof args.assignedDay === "number") {
        form.append("assignedDay", String(args.assignedDay));
      }

      const res = await fetch("/api/photos/share", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (res.status === 503) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.hint ?? "Foto-Sharing-Service noch nicht aktiviert",
        );
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Upload fehlgeschlagen (${res.status})`);
      }
      await refresh();
    },
    [tripSlug, viewerName, refresh],
  );

  /**
   * Sichtbarkeit eines bereits geteilten Fotos ändern.
   * "private" = effektiv withdraw.
   */
  const changeVisibility = useCallback(
    async (photoId: string, next: SharedPhotoVisibility) => {
      if (!viewerName) throw new Error("Keine Viewer-Identität");
      const params = new URLSearchParams({
        id: photoId,
        tripSlug,
      });
      const res = await fetch(`/api/photos/share?${params.toString()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          visibility: next,
          requesterName: viewerName,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error ?? `Sichtbarkeits-Update fehlgeschlagen (${res.status})`,
        );
      }
      await refresh();
    },
    [tripSlug, viewerName, refresh],
  );

  /**
   * Foto vollständig vom Server entfernen (DSGVO-konform sofortige
   * Löschung sowohl Blobs als auch Metadaten).
   */
  const withdraw = useCallback(
    async (photoId: string) => {
      if (!viewerName) throw new Error("Keine Viewer-Identität");
      const params = new URLSearchParams({
        id: photoId,
        tripSlug,
        requesterName: viewerName,
      });
      const res = await fetch(`/api/photos/share?${params.toString()}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error ?? `Widerruf fehlgeschlagen (${res.status})`,
        );
      }
      await refresh();
    },
    [tripSlug, viewerName, refresh],
  );

  return {
    photos,
    loading,
    error,
    serviceConfigured,
    viewerIsCelebrant,
    lastUpdatedAt,
    refresh,
    share,
    changeVisibility,
    withdraw,
  };
}
