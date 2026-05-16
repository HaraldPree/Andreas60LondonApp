/**
 * PDF photo-book generator — wraps the React-PDF document with the
 * blob-loading + base64-conversion plumbing.
 *
 * Why base64?
 *   @react-pdf/renderer's <Image src=...> needs either a remote URL
 *   it can fetch, or a data URL. Our blobs live in IndexedDB so we
 *   resolve them once up front, base64-encode them, then build the
 *   document with those data URLs inline.
 *
 * Memory note:
 *   Base64-encoding inflates byte size ~33%. A 200KB JPEG becomes a
 *   ~270KB string in memory. With 50 photos that's ~13MB held in JS
 *   memory just for the data URLs, plus react-pdf's internal layout
 *   buffers. Acceptable on most modern phones but not unlimited.
 */

import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";
import { getFullBlob } from "@/lib/photoStorage";
import type { PdfPhotoEntry } from "./photoBookPdf";

export interface PdfBookProgress {
  step: "loading-photos" | "compressing-hero" | "rendering-pdf" | "done";
  current: number;
  total: number;
}

export interface PdfBookOptions {
  trip: Trip;
  photos: PhotoMeta[];
  onProgress?: (p: PdfBookProgress) => void;
  /** Override the trip's heroImage URL with a different one for the cover. */
  customHeroUrl?: string;
}

/**
 * Reads a Blob and returns a data URL (data:image/jpeg;base64,...).
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Re-encodes an image as a smaller JPEG to keep the PDF byte size
 * reasonable. PDFs embed every byte of the source image, so we cap
 * dimensions at 1400px and use quality 0.82 → ~150KB per photo.
 *
 * If anything fails, returns the original blob unchanged so the PDF
 * still works (just a bit fatter).
 */
async function compressForPdf(blob: Blob, maxDim = 1400): Promise<Blob> {
  try {
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("decode failed"));
        i.src = url;
      });
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      if (scale >= 1) {
        // Image is already small enough — keep original
        return blob;
      }
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return blob;
      ctx.drawImage(img, 0, 0, w, h);
      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (out) => (out ? resolve(out) : reject(new Error("toBlob null"))),
          "image/jpeg",
          0.82,
        );
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    console.warn("[photoBookPdf] compressForPdf failed, using original:", e);
    return blob;
  }
}

/**
 * Fetches an external image URL and returns a base64 data URL.
 * Used for the cover hero image which is typically served from
 * /public (Next.js static asset).
 */
async function urlToDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return blobToDataUrl(blob);
  } catch (e) {
    console.warn("[photoBookPdf] hero fetch failed:", e);
    return undefined;
  }
}

/**
 * Main entry: builds the PDF Blob.
 *
 * Steps:
 *   1. Compress + base64-encode every photo (most expensive part)
 *   2. Fetch + encode the hero image for the cover
 *   3. Render the React-PDF document to a Blob
 *
 * `@react-pdf/renderer` is dynamically imported so the ~600KB
 * library only loads when a user actually generates a PDF.
 */
export async function buildPhotoBookPdf({
  trip,
  photos,
  onProgress,
  customHeroUrl,
}: PdfBookOptions): Promise<Blob> {
  if (photos.length === 0) {
    throw new Error("Keine Fotos zum Exportieren vorhanden");
  }

  const total = photos.length;
  onProgress?.({ step: "loading-photos", current: 0, total });

  // Step 1: load + compress + encode every photo
  const entries: PdfPhotoEntry[] = [];
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    const blob = await getFullBlob(p.id);
    if (!blob) {
      console.warn(`[photoBookPdf] skipping ${p.id} — blob missing`);
      onProgress?.({ step: "loading-photos", current: i + 1, total });
      continue;
    }
    const compressed = await compressForPdf(blob);
    const dataUrl = await blobToDataUrl(compressed);
    entries.push({
      id: p.id,
      fileName: p.fileName,
      takenAt: p.takenAt,
      caption: p.caption,
      aiNarrative: p.aiNarrative,
      dataUrl,
      dayIndex: typeof p.assignedDay === "number" ? p.assignedDay : null,
    });
    onProgress?.({ step: "loading-photos", current: i + 1, total });
  }

  if (entries.length === 0) {
    throw new Error("Keine Fotos konnten geladen werden — alle Blobs fehlen");
  }

  // Group by day
  const photosByDay = new Map<number | "unsorted", PdfPhotoEntry[]>();
  for (const e of entries) {
    const key = e.dayIndex ?? "unsorted";
    const arr = photosByDay.get(key) ?? [];
    arr.push(e);
    photosByDay.set(key, arr);
  }
  // Sort each bucket by takenAt
  for (const arr of photosByDay.values()) {
    arr.sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  }

  // Step 2: hero image
  onProgress?.({ step: "compressing-hero", current: 0, total: 1 });
  const heroSourceUrl = customHeroUrl ?? trip.heroImage;
  const heroDataUrl = heroSourceUrl ? await urlToDataUrl(heroSourceUrl) : undefined;
  onProgress?.({ step: "compressing-hero", current: 1, total: 1 });

  // Step 3: render. Dynamic import keeps the ~600KB library out of
  // the initial bundle for users who never export a PDF.
  onProgress?.({ step: "rendering-pdf", current: 0, total: 1 });
  const [{ pdf }, { PhotoBookDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./photoBookPdf"),
  ]);

  const doc = (
    <PhotoBookDocument
      trip={trip}
      photosByDay={photosByDay}
      heroDataUrl={heroDataUrl}
    />
  );

  const blob = await pdf(doc).toBlob();
  onProgress?.({ step: "done", current: 1, total: 1 });
  return blob;
}

/**
 * Convenience filename: "Foto-Buch_london-2026_2026-05-21.pdf"
 */
export function defaultPdfFilename(trip: Trip): string {
  const today = new Date().toISOString().slice(0, 10);
  const slug = trip.slug.replace(/[^a-zA-Z0-9-_]/g, "-");
  return `Foto-Buch_${slug}_${today}.pdf`;
}

/**
 * Triggers a browser download of a Blob.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
