import exifr from "exifr";
import type { Coordinates } from "@/types/trip";

const FULL_MAX_SIZE = 1500;
const THUMB_MAX_SIZE = 320;
const FULL_QUALITY = 0.85;
const THUMB_QUALITY = 0.72;

export interface ExtractedExif {
  takenAt: string;
  coordinates?: Coordinates;
}

export async function extractExif(file: File): Promise<ExtractedExif> {
  try {
    const data = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      pick: ["DateTimeOriginal", "CreateDate", "latitude", "longitude"],
    });
    const takenAt = (
      data?.DateTimeOriginal ??
      data?.CreateDate ??
      new Date(file.lastModified)
    ).toISOString();
    const coordinates =
      typeof data?.latitude === "number" && typeof data?.longitude === "number"
        ? { lat: data.latitude as number, lng: data.longitude as number }
        : undefined;
    return { takenAt, coordinates };
  } catch {
    return { takenAt: new Date(file.lastModified).toISOString() };
  }
}

export async function resizeImage(
  file: File,
  maxSize: number,
  quality: number,
): Promise<Blob> {
  const img = await fileToImage(file);
  const { width, height } = scaleToFit(img.width, img.height, maxSize);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context nicht verfügbar");
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Kompression fehlgeschlagen"));
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

export async function compressForStorage(file: File): Promise<{
  full: Blob;
  thumb: Blob;
}> {
  // Generate both in parallel
  const [full, thumb] = await Promise.all([
    resizeImage(file, FULL_MAX_SIZE, FULL_QUALITY),
    resizeImage(file, THUMB_MAX_SIZE, THUMB_QUALITY),
  ]);
  return { full, thumb };
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bild konnte nicht geladen werden"));
    };
    img.src = url;
  });
}

function scaleToFit(
  w: number,
  h: number,
  max: number,
): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = Math.min(max / w, max / h);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Pick the day index whose isoDate matches photo's takenAt date.
 * Returns undefined if no match.
 */
export function assignToDay(
  takenAt: string,
  days: Array<{ isoDate?: string }>,
): number | undefined {
  const dateOnly = takenAt.slice(0, 10); // "YYYY-MM-DD"
  const idx = days.findIndex((d) => d.isoDate === dateOnly);
  return idx >= 0 ? idx : undefined;
}
