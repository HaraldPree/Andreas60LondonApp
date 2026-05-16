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
