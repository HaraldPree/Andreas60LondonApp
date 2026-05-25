import type { Coordinates } from "./trip";

export interface PhotoEntry {
  /** crypto.randomUUID() */
  id: string;
  /** Which trip this photo belongs to (e.g. "london-2026") */
  tripSlug: string;
  /** Compressed full-resolution version (~1500px JPEG) */
  fullBlob: Blob;
  /** Small thumbnail (~300px JPEG) for grid rendering */
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
