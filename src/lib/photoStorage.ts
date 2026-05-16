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

export async function listPhotos(tripSlug: string): Promise<PhotoMeta[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE, "tripSlug", tripSlug);
  return all
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
