"use client";

import { useCallback, useEffect, useState } from "react";
import type { PhotoEntry, PhotoMeta } from "@/types/photo";
import {
  addPhoto,
  deletePhoto,
  getFullBlob,
  getThumbnailBlob,
  listPhotos,
  updatePhoto,
} from "@/lib/photoStorage";
import {
  assignToDay,
  compressForStorage,
  extractExif,
} from "@/lib/photoProcessing";

interface UsePhotosOptions {
  tripSlug: string;
  days: Array<{ isoDate?: string }>;
}

export interface UploadError {
  fileName: string;
  reason: string;
}

/** Image MIME types the browser can reliably decode into a canvas.
 *  HEIC/HEIF (iPhone) and RAW formats can't be decoded by canvas APIs
 *  so we reject them up-front rather than silently failing later. */
const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
]);

/** Friendly file-format check. Returns a human-readable reason if the
 *  file is unlikely to work, or null if it should be fine. */
function preflightCheck(file: File): string | null {
  // Empty file
  if (file.size === 0) {
    return "Datei ist leer (0 KB)";
  }
  // Too big — refuse 50MB+ before they choke the canvas
  if (file.size > 50 * 1024 * 1024) {
    return `Datei zu gross (${(file.size / 1024 / 1024).toFixed(1)} MB, max 50 MB)`;
  }
  // HEIC/HEIF — common on iPhone, can't be decoded by browser canvas
  if (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)
  ) {
    return "HEIC/HEIF wird vom Browser nicht unterstützt — am iPhone unter Einstellungen → Kamera → Formate → 'Maximale Kompatibilität' umstellen, dann werden Fotos als JPG gespeichert";
  }
  // Some browsers send empty MIME type for camera-roll picks. Accept those
  // and let the canvas decoder be the final judge.
  if (file.type && !SUPPORTED_MIME_TYPES.has(file.type.toLowerCase())) {
    return `Format ${file.type} wird nicht unterstützt — bitte JPG oder PNG verwenden`;
  }
  return null;
}

export function usePhotos({ tripSlug, days }: UsePhotosOptions) {
  const [photos, setPhotos] = useState<PhotoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);

  const refresh = useCallback(async () => {
    try {
      const meta = await listPhotos(tripSlug);
      setPhotos(meta);
    } catch (e) {
      console.error("listPhotos failed", e);
    } finally {
      setLoading(false);
    }
  }, [tripSlug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      if (arr.length === 0) return;
      setUploadProgress({ current: 0, total: arr.length });
      const errors: UploadError[] = [];

      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        try {
          const preflight = preflightCheck(file);
          if (preflight) {
            throw new Error(preflight);
          }
          const exif = await extractExif(file);
          const { full, thumb } = await compressForStorage(file);
          // Defensive check: don't insert ghosts if compression
          // returned undefined/empty blobs.
          if (!(full instanceof Blob) || full.size === 0) {
            throw new Error("Komprimiertes Bild ist leer");
          }
          if (!(thumb instanceof Blob) || thumb.size === 0) {
            throw new Error("Thumbnail ist leer");
          }
          const id =
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `p_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          const entry: PhotoEntry = {
            id,
            tripSlug,
            fullBlob: full,
            thumbBlob: thumb,
            fileName: file.name,
            takenAt: exif.takenAt,
            coordinates: exif.coordinates,
            assignedDay: assignToDay(exif.takenAt, days),
            addedAt: new Date().toISOString(),
          };
          await addPhoto(entry);
        } catch (e) {
          const reason = e instanceof Error ? e.message : String(e);
          console.error(`upload failed for ${file.name}: ${reason}`, e);
          errors.push({ fileName: file.name, reason });
        }
        setUploadProgress({ current: i + 1, total: arr.length });
      }

      setUploadProgress(null);
      setUploadErrors(errors);
      await refresh();
    },
    [tripSlug, days, refresh],
  );

  const dismissUploadErrors = useCallback(() => {
    setUploadErrors([]);
  }, []);

  const remove = useCallback(
    async (id: string) => {
      await deletePhoto(id);
      await refresh();
    },
    [refresh],
  );

  /**
   * Deletes many photos in a single batch (single refresh at the end)
   * — safer than `photos.forEach(remove)` which fires N parallel
   * refreshes and can leave the UI in an inconsistent state if any
   * delete is still in-flight when the next refresh reads the DB.
   */
  const removeMany = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => deletePhoto(id)));
      await refresh();
    },
    [refresh],
  );

  const setCaption = useCallback(
    async (id: string, caption: string) => {
      await updatePhoto(id, { caption });
      await refresh();
    },
    [refresh],
  );

  const setNarrative = useCallback(
    async (id: string, aiNarrative: string) => {
      await updatePhoto(id, { aiNarrative });
      await refresh();
    },
    [refresh],
  );

  /**
   * v1.7.8 — Manueller Tag-Wechsel für Fotos.
   * Wird genutzt wenn EXIF-Auto-Sort nicht gegriffen hat (Foto in
   * "Unsortiert") oder User die Auto-Zuordnung korrigieren will.
   * `null` setzt zurück auf "Unsortiert".
   */
  const setAssignedDay = useCallback(
    async (id: string, dayIndex: number | null) => {
      await updatePhoto(id, { assignedDay: dayIndex ?? undefined });
      await refresh();
    },
    [refresh],
  );

  return {
    photos,
    loading,
    uploadProgress,
    uploadErrors,
    dismissUploadErrors,
    upload,
    remove,
    removeMany,
    setCaption,
    setNarrative,
    setAssignedDay,
    refresh,
    getThumbnailBlob,
    getFullBlob,
  };
}
