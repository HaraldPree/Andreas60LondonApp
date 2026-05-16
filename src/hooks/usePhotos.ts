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

export function usePhotos({ tripSlug, days }: UsePhotosOptions) {
  const [photos, setPhotos] = useState<PhotoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

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

      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        try {
          const exif = await extractExif(file);
          const { full, thumb } = await compressForStorage(file);
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
          console.error(`upload failed for ${file.name}`, e);
        }
        setUploadProgress({ current: i + 1, total: arr.length });
      }

      setUploadProgress(null);
      await refresh();
    },
    [tripSlug, days, refresh],
  );

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

  return {
    photos,
    loading,
    uploadProgress,
    upload,
    remove,
    removeMany,
    setCaption,
    setNarrative,
    refresh,
    getThumbnailBlob,
    getFullBlob,
  };
}
