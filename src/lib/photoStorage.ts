import { openDB, type IDBPDatabase } from "idb";
import type { PhotoEntry, PhotoMeta } from "@/types/photo";

const DB_NAME = "rcmk-photos";
const DB_VERSION = 1;
const STORE = "photos";

interface PhotoSchema {
  photos: {
    key: string;
    value: PhotoEntry;
    indexes: { tripSlug: string };
  };
}

let dbPromise: Promise<IDBPDatabase<PhotoSchema>> | null = null;

function getDB() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB nicht im Server-Kontext verfügbar"));
  }
  if (!dbPromise) {
    dbPromise = openDB<PhotoSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("tripSlug", "tripSlug");
        }
      },
    });
  }
  return dbPromise;
}

export async function addPhoto(entry: PhotoEntry): Promise<void> {
  const db = await getDB();
  await db.put(STORE, entry);
}

export async function getPhoto(id: string): Promise<PhotoEntry | undefined> {
  const db = await getDB();
  return db.get(STORE, id);
}

/**
 * Duck-typed Blob check. We deliberately don't use `instanceof Blob`
 * because in some browsers (especially Firefox) blobs round-tripped
 * through IndexedDB lose their constructor identity even though they
 * are otherwise fully functional Blob-shaped objects. Falsely flagging
 * a valid blob as broken would auto-delete real user photos.
 */
function isBlobLike(b: unknown): b is Blob {
  return (
    b !== null &&
    b !== undefined &&
    typeof b === "object" &&
    typeof (b as Blob).size === "number" &&
    typeof (b as Blob).type === "string" &&
    typeof (b as Blob).arrayBuffer === "function"
  );
}

export async function listPhotos(tripSlug: string): Promise<PhotoMeta[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE, "tripSlug", tripSlug);

  // We separate the entries into three buckets:
  //   - VALID  : both blobs are blob-shaped with size > 0 → show normally
  //   - BROKEN : at least one blob is blob-shaped but size 0 → still
  //              show (so user can self-delete via the warning card)
  //   - GHOST  : at least one blob is genuinely missing (null/undefined)
  //              → auto-cleanup in background, drop from view
  // Only the GHOST bucket is auto-deleted; the BROKEN bucket stays
  // visible so the user has the choice and the cause stays diagnosable.
  const ghosts: string[] = [];
  const visible = all.filter((entry) => {
    if (entry.fullBlob == null || entry.thumbBlob == null) {
      ghosts.push(entry.id);
      return false;
    }
    return true;
  });

  if (ghosts.length > 0) {
    console.warn(
      `[photoStorage] Cleaning up ${ghosts.length} ghost entr${ghosts.length === 1 ? "y" : "ies"} (null blobs):`,
      ghosts,
    );
    void Promise.all(ghosts.map((id) => db.delete(STORE, id))).catch((e) =>
      console.error("[photoStorage] Ghost cleanup failed", e),
    );
  }

  // Log diagnostic info for visible entries — helps debug rendering issues
  for (const entry of visible) {
    const fullOk = isBlobLike(entry.fullBlob);
    const thumbOk = isBlobLike(entry.thumbBlob);
    const fullSize = (entry.fullBlob as Blob | undefined)?.size ?? 0;
    const thumbSize = (entry.thumbBlob as Blob | undefined)?.size ?? 0;
    if (!fullOk || !thumbOk || thumbSize === 0) {
      console.warn(
        `[photoStorage] Suspicious entry id=${entry.id} fullOk=${fullOk}(${fullSize}b) thumbOk=${thumbOk}(${thumbSize}b)`,
      );
    }
  }

  return visible
    .map(stripBlobs)
    .sort((a, b) => a.takenAt.localeCompare(b.takenAt));
}

export async function getThumbnailBlob(id: string): Promise<Blob | null> {
  const db = await getDB();
  const entry = await db.get(STORE, id);
  return entry?.thumbBlob ?? null;
}

export async function getFullBlob(id: string): Promise<Blob | null> {
  const db = await getDB();
  const entry = await db.get(STORE, id);
  return entry?.fullBlob ?? null;
}

export async function updatePhoto(
  id: string,
  patch: Partial<Pick<PhotoEntry, "caption" | "aiNarrative" | "assignedDay">>,
): Promise<void> {
  const db = await getDB();
  const existing = await db.get(STORE, id);
  if (!existing) return;
  await db.put(STORE, { ...existing, ...patch });
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function clearTripPhotos(tripSlug: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE, "readwrite");
  const idx = tx.store.index("tripSlug");
  let cursor = await idx.openCursor(tripSlug);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

function stripBlobs(entry: PhotoEntry): PhotoMeta {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fullBlob, thumbBlob, ...meta } = entry;
  return meta;
}
