/**
 * Shared-Photo types.
 *
 * Bewusst getrennt von `PhotoEntry` (siehe types/photo.ts) — dort
 * sind die LOKALEN Fotos pro Gerät (IndexedDB). Hier geht's um die
 * Untermenge die ein:e Reisende:r AKTIV mit anderen geteilt hat.
 * Geteilte Fotos liegen auf Vercel Blob, Metadaten in Vercel KV.
 */

import type { Coordinates } from "./trip";

/**
 * Sichtbarkeitsstufen pro geteiltem Foto.
 *
 * Reihenfolge entspricht der "Privatsphäre-Strenge":
 *   private < celebrant < group
 *
 * Default beim Upload-Dialog ist immer `"private"` — bewusster Akt
 * nötig um hochzustufen (Privacy by Default, Art. 25 Abs. 2 DSGVO).
 */
export type SharedPhotoVisibility = "private" | "celebrant" | "group";

/**
 * Stored in Vercel KV (Redis-kompatibel) als Hash `photo:{id}`.
 * Plus Index in Set `photos:{tripSlug}` mit allen Photo-IDs.
 */
export interface SharedPhoto {
  /** UUID, identisch mit lokaler PhotoEntry.id wenn beides existiert */
  id: string;
  /** Welche Reisegruppe (= welche app-Reise / PIN-Kreis) */
  tripSlug: string;
  /** Wer hat hochgeladen — Mitgliedername aus trip.participants */
  uploaderName: string;
  /** Aktuelle Sichtbarkeitsstufe (kann später vom Uploader geändert werden) */
  visibility: SharedPhotoVisibility;
  /** Vercel Blob URL der Voll-Auflösung */
  blobUrl: string;
  /** Vercel Blob URL des Thumbnails (kleiner für Galerie-Grid) */
  thumbBlobUrl: string;
  /** Original-Dateiname zum Anzeigen */
  fileName: string;
  /** EXIF-Aufnahmezeit (ISO) — falls vorhanden */
  takenAt?: string;
  /** GPS-Koordinaten aus EXIF — falls vorhanden */
  coordinates?: Coordinates;
  /** User-eigene Bildunterschrift */
  caption?: string;
  /** KI-generierte Beschreibung (übernommen aus lokalem PhotoEntry) */
  aiNarrative?: string;
  /** Tagesindex der Reise (0-based) — falls zugeordnet */
  assignedDay?: number;
  /** Wann hochgeladen */
  uploadedAt: string;
  /** Wann zuletzt Sichtbarkeit geändert (Audit-Trail) */
  visibilityChangedAt?: string;
  /** Soft-Delete-Marker (für DSGVO-Audit) — wenn gesetzt, kein API-Listing */
  withdrawnAt?: string;
}

/**
 * View-Type — was die Galerie braucht (ohne sensitive Felder).
 */
export interface SharedPhotoView {
  id: string;
  uploaderName: string;
  visibility: SharedPhotoVisibility;
  blobUrl: string;
  thumbBlobUrl: string;
  fileName: string;
  takenAt?: string;
  caption?: string;
  assignedDay?: number;
  uploadedAt: string;
  /** Gibt's an wenn der aktuelle User das Foto wieder zurückziehen darf */
  canWithdraw: boolean;
}

/**
 * Wer darf welche Sichtbarkeitsstufe sehen?
 *
 * Logik:
 *   - Eigene Fotos: immer alle (auch withdrawn, falls noch im Cache)
 *   - Andere Fotos auf "group": sichtbar wenn ich Mitglied der Gruppe bin
 *   - Andere Fotos auf "celebrant": sichtbar NUR wenn ich das
 *     Geburtstagskind bin (role === "celebrant")
 *   - Andere Fotos auf "private": niemals sichtbar (sollten ohnehin
 *     nicht im KV liegen wenn private)
 */
export function canViewSharedPhoto(
  photo: SharedPhoto,
  viewerName: string | null,
  viewerIsCelebrant: boolean,
): boolean {
  if (photo.withdrawnAt) return false;
  if (photo.uploaderName === viewerName) return true;
  if (photo.visibility === "group") return true;
  if (photo.visibility === "celebrant" && viewerIsCelebrant) return true;
  return false;
}
