/**
 * Server-side helpers für Shared Photos.
 *
 * Persistenz:
 *   - Vercel Blob Storage     → die eigentlichen Foto-Bytes (Voll + Thumb)
 *   - Vercel KV (Upstash)     → Metadaten + Indizes pro Reisegruppe
 *
 * Schlüssel-Schema im KV:
 *   photo:{id}                 → Hash mit SharedPhoto JSON
 *   photos:{tripSlug}          → Set aller IDs in dieser Reise
 *
 * Wenn die ENV-Vars für Vercel KV / Blob fehlen, geben die Funktionen
 * `null` / leere Listen zurück — Frontend zeigt dann eine "Coming soon"
 * UI statt einem 500-Crash. Aktivierung via Vercel-Dashboard:
 *   - Settings → Storage → Vercel Blob enable
 *   - Settings → Storage → Vercel KV enable (oder via Marketplace
 *     Upstash for Redis)
 *   - Env Vars werden dann automatisch in das Projekt geschoben
 */

import { kv } from "@vercel/kv";
import { put, del } from "@vercel/blob";
import type {
  SharedPhoto,
  SharedPhotoVisibility,
} from "@/types/sharedPhoto";

/**
 * Prüft ob die Storage-Services konfiguriert sind.
 * Aufrufer können bei `false` eine "Service nicht eingerichtet"-Message
 * an den Client zurückgeben.
 */
export function isStorageConfigured(): boolean {
  return (
    !!process.env.BLOB_READ_WRITE_TOKEN &&
    !!process.env.KV_REST_API_URL &&
    !!process.env.KV_REST_API_TOKEN
  );
}

const KEY_PHOTO = (id: string) => `photo:${id}`;
const KEY_TRIP_INDEX = (tripSlug: string) => `photos:${tripSlug}`;

/**
 * Lädt ein Foto-Blob-Paar (Voll + Thumb) auf Vercel Blob hoch und
 * schreibt die Metadaten in KV.
 *
 * Wirft, wenn Storage nicht konfiguriert ist — Caller muss vorher
 * `isStorageConfigured()` prüfen.
 */
export async function uploadSharedPhoto(args: {
  tripSlug: string;
  photoId: string;
  uploaderName: string;
  visibility: SharedPhotoVisibility;
  fullBlob: Blob;
  thumbBlob: Blob;
  fileName: string;
  takenAt?: string;
  caption?: string;
  aiNarrative?: string;
  assignedDay?: number;
  coordinates?: { lat: number; lng: number };
}): Promise<SharedPhoto> {
  if (!isStorageConfigured()) {
    throw new Error("Storage-Service nicht konfiguriert");
  }

  // Lade beide Varianten parallel hoch. Vercel Blob fügt einen
  // zufälligen Suffix an den Pfad an damit die URLs nicht-erratbar
  // sind — bietet eine zusätzliche Schicht "security through
  // obscurity" für Photos im "celebrant" Modus.
  const [fullResult, thumbResult] = await Promise.all([
    put(
      `trips/${args.tripSlug}/${args.photoId}-full.jpg`,
      args.fullBlob,
      {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: true,
      },
    ),
    put(
      `trips/${args.tripSlug}/${args.photoId}-thumb.jpg`,
      args.thumbBlob,
      {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: true,
      },
    ),
  ]);

  const record: SharedPhoto = {
    id: args.photoId,
    tripSlug: args.tripSlug,
    uploaderName: args.uploaderName,
    visibility: args.visibility,
    blobUrl: fullResult.url,
    thumbBlobUrl: thumbResult.url,
    fileName: args.fileName,
    takenAt: args.takenAt,
    coordinates: args.coordinates,
    caption: args.caption,
    aiNarrative: args.aiNarrative,
    assignedDay: args.assignedDay,
    uploadedAt: new Date().toISOString(),
  };

  // Atomisch beides schreiben — Hash + Set-Index
  await Promise.all([
    kv.set(KEY_PHOTO(args.photoId), record),
    kv.sadd(KEY_TRIP_INDEX(args.tripSlug), args.photoId),
  ]);

  return record;
}

/**
 * Listet alle (nicht-zurückgezogenen) Fotos einer Reise.
 * Aufrufer filtert nach `canViewSharedPhoto()` für die jeweilige
 * Viewer-Identität.
 */
export async function listSharedPhotos(
  tripSlug: string,
): Promise<SharedPhoto[]> {
  if (!isStorageConfigured()) return [];

  const ids = await kv.smembers(KEY_TRIP_INDEX(tripSlug));
  if (!ids || ids.length === 0) return [];

  // Batch-Get aller Metadaten
  const records = await Promise.all(
    ids.map((id) => kv.get<SharedPhoto>(KEY_PHOTO(String(id)))),
  );

  return records
    .filter((r): r is SharedPhoto => r !== null && !r.withdrawnAt)
    .sort((a, b) => (a.takenAt ?? a.uploadedAt).localeCompare(b.takenAt ?? b.uploadedAt));
}

/**
 * Lädt ein einzelnes Foto-Metadatum.
 */
export async function getSharedPhoto(
  photoId: string,
): Promise<SharedPhoto | null> {
  if (!isStorageConfigured()) return null;
  return (await kv.get<SharedPhoto>(KEY_PHOTO(photoId))) ?? null;
}

/**
 * Ändert die Sichtbarkeitsstufe eines geteilten Fotos.
 * NUR der ursprüngliche Uploader darf das (Auth-Check beim Caller).
 *
 * Bei Stufe `"private"`: das Foto wird zurückgezogen (siehe withdraw).
 */
export async function updateSharedPhotoVisibility(
  photoId: string,
  newVisibility: SharedPhotoVisibility,
): Promise<SharedPhoto | null> {
  if (!isStorageConfigured()) return null;
  const current = await getSharedPhoto(photoId);
  if (!current) return null;

  // Down-grade auf "private" = withdraw
  if (newVisibility === "private") {
    return await withdrawSharedPhoto(photoId);
  }

  const updated: SharedPhoto = {
    ...current,
    visibility: newVisibility,
    visibilityChangedAt: new Date().toISOString(),
  };
  await kv.set(KEY_PHOTO(photoId), updated);
  return updated;
}

/**
 * Zieht ein geteiltes Foto zurück — löscht sowohl die Blobs als auch
 * den KV-Eintrag. DSGVO-konform: sofortige Löschung ohne Soft-Delete-
 * Verzögerung.
 *
 * Returns das (jetzt nicht mehr abrufbare) gelöschte Foto-Objekt zur
 * Bestätigung.
 */
export async function withdrawSharedPhoto(
  photoId: string,
): Promise<SharedPhoto | null> {
  if (!isStorageConfigured()) return null;
  const record = await getSharedPhoto(photoId);
  if (!record) return null;

  // Beide Blobs + KV-Hash + Index-Eintrag parallel löschen
  await Promise.all([
    del(record.blobUrl).catch(() => {
      // Blob ist evtl. schon weg — kein hard fail
    }),
    del(record.thumbBlobUrl).catch(() => {
      // ditto
    }),
    kv.del(KEY_PHOTO(photoId)),
    kv.srem(KEY_TRIP_INDEX(record.tripSlug), photoId),
  ]);

  return { ...record, withdrawnAt: new Date().toISOString() };
}
