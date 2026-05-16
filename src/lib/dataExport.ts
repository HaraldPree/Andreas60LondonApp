/**
 * GDPR Art. 15/17/20 helpers: export everything stored locally for a trip,
 * and wipe everything stored locally for a trip.
 *
 * Storage spans:
 * - localStorage keys with various prefixes (see KEY_PATTERNS)
 * - IndexedDB photos (via clearTripPhotos)
 */

import { clearTripPhotos, listPhotos, getFullBlob } from "@/lib/photoStorage";

// All localStorage key patterns owned by this app
const TRIP_SCOPED_PATTERNS = [
  (slug: string) => `rcmk:current-user:${slug}`,
  (slug: string) => `rcmk:health:${slug}`,
  (slug: string) => `rcmk:reservations:${slug}`,
  (slug: string) => `rcmk:expenses:${slug}`,
  (slug: string) => `rcmk:userplaces:${slug}`,
  (slug: string) => `rcmk:identifications:${slug}`,
];

// Patterns that also include a user scope (more permissive collection)
const TRIP_USER_PREFIXES = [
  (slug: string) => `rcmk:packing-checked:${slug}:`,
  (slug: string) => `rcmk:packing-custom:${slug}:`,
];

// Cross-trip / global app keys
const GLOBAL_KEYS = [
  "rcmk:tts-enabled",
  "rcmk:install-hint-dismissed",
  "rcmk:ai-consent:photo-vision",
  "rcmk:ai-consent:photo-narration",
];

export interface ExportedData {
  app: string;
  exportedAt: string;
  tripSlug: string;
  localStorage: Record<string, unknown>;
  photos: Array<{
    id: string;
    fileName: string;
    takenAt: string;
    coordinates?: { lat: number; lng: number };
    assignedDay?: number;
    caption?: string;
    aiNarrative?: string;
    /** Base64 data URL of the full photo */
    dataUrl?: string;
  }>;
  notes: string;
}

function safeParse(raw: string | null): unknown {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw; // fall back to string
  }
}

export async function exportAllDataForTrip(
  tripSlug: string,
): Promise<ExportedData> {
  if (typeof window === "undefined") {
    throw new Error("exportAllDataForTrip muss im Browser laufen");
  }

  const data: Record<string, unknown> = {};

  // Trip-scoped exact keys
  for (const fn of TRIP_SCOPED_PATTERNS) {
    const k = fn(tripSlug);
    const v = window.localStorage.getItem(k);
    if (v !== null) data[k] = safeParse(v);
  }

  // Trip+user-scoped prefixes (need to scan all keys)
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    for (const prefixFn of TRIP_USER_PREFIXES) {
      if (k.startsWith(prefixFn(tripSlug))) {
        data[k] = safeParse(window.localStorage.getItem(k));
      }
    }
  }

  // Global keys
  for (const k of GLOBAL_KEYS) {
    const v = window.localStorage.getItem(k);
    if (v !== null) data[k] = safeParse(v);
  }

  // Photos from IndexedDB
  const photoMetas = await listPhotos(tripSlug);
  const photos: ExportedData["photos"] = [];
  for (const meta of photoMetas) {
    const blob = await getFullBlob(meta.id);
    let dataUrl: string | undefined;
    if (blob) {
      dataUrl = await blobToDataUrl(blob);
    }
    photos.push({
      id: meta.id,
      fileName: meta.fileName,
      takenAt: meta.takenAt,
      coordinates: meta.coordinates,
      assignedDay: meta.assignedDay,
      caption: meta.caption,
      aiNarrative: meta.aiNarrative,
      dataUrl,
    });
  }

  return {
    app: "Andrea London Travel Companion",
    exportedAt: new Date().toISOString(),
    tripSlug,
    localStorage: data,
    photos,
    notes:
      "DSGVO Art. 15/20 Export. Daten lagen ausschließlich auf deinem Gerät – ein Server-Backup existiert nicht. Bei Subprozessoren (siehe /datenschutz) gilt deren jeweilige Aufbewahrungs-Policy.",
  };
}

export async function deleteAllDataForTrip(tripSlug: string): Promise<void> {
  if (typeof window === "undefined") return;

  // Trip-scoped exact keys
  for (const fn of TRIP_SCOPED_PATTERNS) {
    window.localStorage.removeItem(fn(tripSlug));
  }

  // Trip+user prefixes – scan and remove
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    for (const prefixFn of TRIP_USER_PREFIXES) {
      if (k.startsWith(prefixFn(tripSlug))) {
        keysToRemove.push(k);
      }
    }
  }
  for (const k of keysToRemove) window.localStorage.removeItem(k);

  // Photos (IndexedDB)
  await clearTripPhotos(tripSlug);
}

export function deleteAllGlobalSettings(): void {
  if (typeof window === "undefined") return;
  for (const k of GLOBAL_KEYS) window.localStorage.removeItem(k);
}

export function downloadAsJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
