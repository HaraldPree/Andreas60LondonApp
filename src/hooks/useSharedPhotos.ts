"use client";

import { useCallback, useEffect, useState } from "react";
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

/**
 * Client-Hook für die Gemeinsame Galerie.
 *
 * Lädt geteilte Fotos vom Backend für die aktuelle Viewer-Identität,
 * stellt Action-Helpers für Upload / Visibility-Update / Withdraw
 * bereit und re-fetcht automatisch nach jedem Schreibvorgang.
 *
 * Failure-Modus: wenn Vercel Blob/KV nicht konfiguriert ist, geben
 * die Server-Endpoints 503 oder configured:false zurück. Der Hook
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

  const refresh = useCallback(async () => {
    if (!enabled || !tripSlug || !viewerName) {
      setPhotos([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ viewerName });
      const res = await fetch(
        `/api/photos/list/${encodeURIComponent(tripSlug)}?${params.toString()}`,
        { credentials: "include" },
      );
      if (res.status === 503) {
        setServiceConfigured(false);
        setPhotos([]);
        return;
      }
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API ${res.status}: ${body || res.statusText}`);
      }
      const data = (await res.json()) as ListResponse;
      setServiceConfigured(data.configured !== false);
      setPhotos(data.photos ?? []);
      setViewerIsCelebrant(!!data.viewerIsCelebrant);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
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
      const res = await fetch(
        `/api/photos/share?id=${encodeURIComponent(photoId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            visibility: next,
            requesterName: viewerName,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error ?? `Sichtbarkeits-Update fehlgeschlagen (${res.status})`,
        );
      }
      await refresh();
    },
    [viewerName, refresh],
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
    [viewerName, refresh],
  );

  return {
    photos,
    loading,
    error,
    serviceConfigured,
    viewerIsCelebrant,
    refresh,
    share,
    changeVisibility,
    withdraw,
  };
}
