/**
 * Server-side helpers für Shared Photos — Blob-only Implementierung.
 *
 * Architektur (v1.1.3+):
 *   - Vercel Blob speichert sowohl die Foto-Dateien als auch die
 *     Metadaten (als JSON-Manifest pro Reise).
 *   - KEINE separate KV/Redis-Datenbank nötig.
 *
 * Pfad-Schema im Blob:
 *   trips/{tripSlug}/{photoId}-full.{ext}      → Voll-Auflösung (~1500px)
 *   trips/{tripSlug}/{photoId}-thumb.{ext}     → Thumbnail (~320px)
 *   trips/{tripSlug}/manifest-*.json           → Metadaten-Index (1 pro Reise)
 *                                                 (`-*` = Vercel-Random-Suffix
 *                                                 da Vercel Blob bei jedem
 *                                                 PUT neue URL generiert)
 *
 * Manifest-Schema:
 *   {
 *     "tripSlug": "london-2026",
 *     "updatedAt": "2026-05-21T...",
 *     "photos": SharedPhoto[]
 *   }
 *
 * Trade-off ggü. KV-Variante: kleine Race-Condition bei gleichzeitigem
 * Upload (2 Personen zur gleichen Millisekunde) — der zuletzt schreibende
 * gewinnt. Für 5-Personen-Reise mit max ~100 Fotos akzeptabel.
 */

import { put, del, list } from "@vercel/blob";
import type {
  SharedPhoto,
  SharedPhotoVisibility,
} from "@/types/sharedPhoto";

const MANIFEST_PREFIX = (tripSlug: string) =>
  `trips/${tripSlug}/manifest-`;

/**
 * Prüft ob Vercel Blob verfügbar ist (Env-Var gesetzt).
 * Keine KV-Prüfung mehr — Blob-only Architektur.
 */
export function isStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

interface Manifest {
  tripSlug: string;
  updatedAt: string;
  photos: SharedPhoto[];
}

/**
 * Liest das aktuelle Manifest einer Reise.
 * Findet die jüngste manifest-*.json Datei und lädt ihren Inhalt.
 *
 * Gibt leeres Manifest zurück wenn noch keines existiert.
 */
async function readManifest(tripSlug: string): Promise<Manifest> {
  const empty: Manifest = {
    tripSlug,
    updatedAt: new Date().toISOString(),
    photos: [],
  };

  try {
    const { blobs } = await list({
      prefix: MANIFEST_PREFIX(tripSlug),
    });

    if (blobs.length === 0) return empty;

    // Wenn mehrere existieren (z.B. nach unaufgeräumtem Race): die jüngste nehmen
    const latest = blobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    )[0];

    const res = await fetch(latest.url, { cache: "no-store" });
    if (!res.ok) return empty;
    const data = (await res.json()) as Manifest;

    // Sanity-Check
    if (!Array.isArray(data.photos)) return empty;
    return data;
  } catch (e) {
    console.error("[sharedPhotoStore] readManifest failed:", e);
    return empty;
  }
}

/**
 * Schreibt das Manifest atomar (so atomar wie Blob hergibt) und räumt
 * vorherige Manifest-Versionen auf.
 *
 * Hinweis zur Race: Bei gleichzeitigem Aufruf von 2 Clients gewinnt
 * der letzte — der erste Eintrag könnte verloren gehen. Für 5-User-
 * Trip akzeptiert.
 */
async function writeManifest(
  tripSlug: string,
  photos: SharedPhoto[],
): Promise<void> {
  // 1. Aufräumen alte Manifest-Files (nur die jüngste behalten)
  try {
    const { blobs } = await list({
      prefix: MANIFEST_PREFIX(tripSlug),
    });
    // Lösche alle existierenden Manifests — wir schreiben gleich neu
    await Promise.all(
      blobs.map((b) => del(b.url).catch(() => {})),
    );
  } catch (e) {
    // Cleanup-Fehler ist nicht fatal — neue Version wird trotzdem geschrieben
    console.warn("[sharedPhotoStore] manifest cleanup failed:", e);
  }

  // 2. Neues Manifest schreiben
  const manifest: Manifest = {
    tripSlug,
    updatedAt: new Date().toISOString(),
    photos,
  };
  await put(
    `${MANIFEST_PREFIX(tripSlug)}${Date.now()}.json`,
    JSON.stringify(manifest),
    {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true, // Vercel macht das URLs nicht-erratbar
    },
  );
}

/**
 * Lädt ein Foto-Blob-Paar hoch und ergänzt das Manifest.
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

  // Foto-Blobs parallel hochladen
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

  // Manifest lesen + ergänzen + schreiben
  const manifest = await readManifest(args.tripSlug);
  // Falls dieselbe photoId schon drin: replace (z.B. erneuter Upload)
  const filtered = manifest.photos.filter((p) => p.id !== record.id);
  await writeManifest(args.tripSlug, [...filtered, record]);

  return record;
}

/**
 * Listet alle (nicht-zurückgezogenen) Fotos einer Reise.
 * Filterung nach Viewer-Identität passiert beim Caller (canViewSharedPhoto).
 */
export async function listSharedPhotos(
  tripSlug: string,
): Promise<SharedPhoto[]> {
  if (!isStorageConfigured()) return [];
  const manifest = await readManifest(tripSlug);
  return manifest.photos
    .filter((p) => !p.withdrawnAt)
    .sort((a, b) =>
      (a.takenAt ?? a.uploadedAt).localeCompare(
        b.takenAt ?? b.uploadedAt,
      ),
    );
}

/**
 * Einzelnes Foto-Metadatum aus dem Manifest holen.
 */
export async function getSharedPhoto(
  photoId: string,
  tripSlug?: string,
): Promise<SharedPhoto | null> {
  if (!isStorageConfigured()) return null;
  if (!tripSlug) {
    // Ohne tripSlug-Hint können wir den Eintrag nicht effizient finden.
    // (Im Blob-only-Modell ist das Manifest pro Trip — wir bräuchten
    // den Trip-Slug um das richtige zu lesen.) Caller muss tripSlug
    // mitgeben — siehe API-Routes wo der Slug aus dem Request kommt.
    console.warn(
      "[sharedPhotoStore] getSharedPhoto ohne tripSlug — Photo kann nicht lokalisiert werden",
    );
    return null;
  }
  const manifest = await readManifest(tripSlug);
  return manifest.photos.find((p) => p.id === photoId) ?? null;
}

/**
 * Sichtbarkeit eines bereits geteilten Fotos ändern.
 * "private" = withdraw.
 */
export async function updateSharedPhotoVisibility(
  photoId: string,
  newVisibility: SharedPhotoVisibility,
  tripSlug: string,
): Promise<SharedPhoto | null> {
  if (!isStorageConfigured()) return null;

  if (newVisibility === "private") {
    return await withdrawSharedPhoto(photoId, tripSlug);
  }

  const manifest = await readManifest(tripSlug);
  const photo = manifest.photos.find((p) => p.id === photoId);
  if (!photo) return null;

  const updated: SharedPhoto = {
    ...photo,
    visibility: newVisibility,
    visibilityChangedAt: new Date().toISOString(),
  };

  const newPhotos = manifest.photos.map((p) =>
    p.id === photoId ? updated : p,
  );
  await writeManifest(tripSlug, newPhotos);
  return updated;
}

/**
 * Zieht ein geteiltes Foto zurück — entfernt Manifest-Eintrag UND
 * löscht die zugehörigen Foto-Blobs. DSGVO-konform sofortige Löschung.
 */
export async function withdrawSharedPhoto(
  photoId: string,
  tripSlug: string,
): Promise<SharedPhoto | null> {
  if (!isStorageConfigured()) return null;
  const manifest = await readManifest(tripSlug);
  const photo = manifest.photos.find((p) => p.id === photoId);
  if (!photo) return null;

  // Foto-Blobs parallel löschen
  await Promise.all([
    del(photo.blobUrl).catch(() => {}),
    del(photo.thumbBlobUrl).catch(() => {}),
  ]);

  // Aus Manifest entfernen
  const newPhotos = manifest.photos.filter((p) => p.id !== photoId);
  await writeManifest(tripSlug, newPhotos);

  return { ...photo, withdrawnAt: new Date().toISOString() };
}
