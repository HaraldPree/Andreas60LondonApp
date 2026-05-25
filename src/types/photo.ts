import type { Coordinates } from "./trip";

/**
 * v1.12.0 — Medientyp pro Eintrag.
 * "photo" (default, backwards-kompatibel) oder "video".
 * Bei Video: fullBlob ist Video-File (mp4/mov/webm), thumbBlob ist
 * extrahiertes Cover-Frame als JPEG.
 */
export type MediaType = "photo" | "video";

export interface PhotoEntry {
  /** crypto.randomUUID() */
  id: string;
  /** Which trip this photo belongs to (e.g. "london-2026") */
  tripSlug: string;
  /** Compressed full-resolution version (~1500px JPEG) — bei video: original-File */
  fullBlob: Blob;
  /** Small thumbnail (~300px JPEG) — bei video: skalierter Poster-Frame */
  thumbBlob: Blob;
  /** Original file name (for download/display reference) */
  fileName: string;
  /** ISO timestamp when photo was taken (from EXIF or file.lastModified) */
  takenAt: string;
  /** GPS coordinates from EXIF if present */
  coordinates?: Coordinates;
  /** Day index (0-based) in the trip's day array, or undefined if unmatched */
  assignedDay?: number;
  /** User-editable caption */
  caption?: string;
  /** AI-generated narrative from Claude Vision */
  aiNarrative?: string;
  /** When this entry was added to the gallery */
  addedAt: string;
  /** v1.12.0 — "photo" (default) oder "video" */
  mediaType?: MediaType;
  /** v1.12.0 — bei Videos: Dauer in Sekunden für Display-Pill */
  videoDurationSec?: number;
}

/** Lightweight view used in grids – avoids loading full blobs */
export interface PhotoMeta {
  id: string;
  tripSlug: string;
  fileName: string;
  takenAt: string;
  coordinates?: Coordinates;
  assignedDay?: number;
  caption?: string;
  aiNarrative?: string;
  addedAt: string;
  mediaType?: MediaType;
  videoDurationSec?: number;
}

/**
 * v1.11.0 — Export-fähiges Foto, kann aus mehreren Quellen kommen:
 *  - Eigene Fotos (IndexedDB): remoteUrl ist undefined, getFullBlob(id) liefert blob
 *  - Geteilte Fotos (Vercel Blob): remoteUrl gesetzt → fetch zur Konvertierung
 *
 * Wird in PDF- + ZIP-Generator verwendet damit beide Quellen
 * gleichberechtigt verarbeitet werden können.
 */
export interface ExportPhoto extends PhotoMeta {
  /** Wenn gesetzt: Foto ist über HTTP zu fetchen (geteiltes Foto aus Blob). */
  remoteUrl?: string;
  /**
   * v1.11.2 — Thumbnail-URL für Selection-Sheet-Grid.
   * Bei geteilten Fotos: aus SharedPhotoView.thumbBlobUrl.
   * Bei eigenen Fotos: undefined → Selection-Sheet nutzt getThumbnailBlob().
   */
  remoteThumbUrl?: string;
  /** Wer hat's geteilt (für Display in Captions, "Foto von Andrea") */
  uploaderName?: string;
}
