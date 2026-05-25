/**
 * v1.11.0 — Adapter um eigene Fotos (IndexedDB) + geteilte (Vercel Blob)
 * für den Export zu kombinieren.
 *
 * Beide Generator-Funktionen (PDF + ZIP) erwarten jetzt ExportPhoto[]
 * statt PhotoMeta[]. Eigene Fotos sind kompatibel (PhotoMeta ⊂ ExportPhoto),
 * geteilte müssen mit `fromShared` konvertiert werden.
 *
 * Dedupliziert via `id` — wenn jemand ein eigenes Foto geteilt hat,
 * erscheint es nur EINMAL im Export (lokale Variante hat Vorrang weil
 * sie die volle Auflösung im IndexedDB-Blob hat).
 */

import type { ExportPhoto, PhotoMeta } from "@/types/photo";
import type { SharedPhotoView } from "@/types/sharedPhoto";

/**
 * Konvertiert einen SharedPhotoView in ein ExportPhoto.
 * takenAt-Fallback: `uploadedAt` wenn EXIF fehlt (Foto wird dann in
 * "Unsortiert"-Bucket landen sofern assignedDay nicht gesetzt ist).
 */
export function fromShared(s: SharedPhotoView, tripSlug: string): ExportPhoto {
  return {
    id: s.id,
    tripSlug,
    fileName: s.fileName,
    takenAt: s.takenAt ?? s.uploadedAt,
    assignedDay: s.assignedDay,
    caption: s.caption,
    addedAt: s.uploadedAt,
    remoteUrl: s.blobUrl,
    remoteThumbUrl: s.thumbBlobUrl, // v1.11.2 — für Selection-Sheet Grid
    uploaderName: s.uploaderName,
  };
}

/**
 * Vereinigt eigene + geteilte Fotos in einer Liste, dedupliziert nach `id`.
 * Eigene haben Vorrang (volle Auflösung aus IndexedDB).
 *
 * Wenn `includeShared` = false: gibt nur eigene zurück (Default-Verhalten
 * wie vor v1.11.0).
 */
export function combineForExport(
  own: PhotoMeta[],
  shared: SharedPhotoView[],
  tripSlug: string,
  includeShared: boolean,
): ExportPhoto[] {
  // v1.12.0 — Videos werden NICHT in PDF/ZIP-Export aufgenommen (kommt
  // erst in v1.12.2 — PDF kann nur Cover-Frame zeigen, ZIP könnte
  // Video direkt enthalten). Heute filtern wir Videos raus, damit der
  // Generator nicht versucht ein Video als JPEG zu rendern.
  const ownPhotosOnly: ExportPhoto[] = own
    .filter((p) => p.mediaType !== "video")
    .map((p) => ({ ...p }));
  if (!includeShared) return ownPhotosOnly;

  const ownIds = new Set(ownPhotosOnly.map((p) => p.id));
  const sharedFiltered = shared
    .filter((s) => !ownIds.has(s.id))
    .map((s) => fromShared(s, tripSlug));

  return [...ownPhotosOnly, ...sharedFiltered];
}
