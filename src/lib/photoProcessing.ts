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

/**
 * Drawable image source — either ImageBitmap (preferred, decoded
 * off-main-thread) or HTMLImageElement (legacy fallback).
 */
type DrawableImage =
  | { kind: "bitmap"; image: ImageBitmap; width: number; height: number }
  | { kind: "element"; image: HTMLImageElement; width: number; height: number };

/**
 * Decodes a File into a drawable image, trying the modern
 * createImageBitmap API first. On Android (especially Samsung) modern
 * camera files like 10-bit HDR JPEGs and some HEIF variants are
 * decodable by createImageBitmap but trip up the legacy `new Image()`
 * path with a generic "Bild konnte nicht geladen werden" error.
 */
async function decodeImage(file: File): Promise<DrawableImage> {
  // Try createImageBitmap first — it has wider format support and
  // doesn't depend on the legacy <img> decoder pipeline.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        kind: "bitmap",
        image: bitmap,
        width: bitmap.width,
        height: bitmap.height,
      };
    } catch (e) {
      // Falls through to <img> fallback — log so we can see if this
      // is the path that's failing in production.
      console.warn(
        `[photoProcessing] createImageBitmap failed for ${file.name} (${file.type}, ${file.size}b):`,
        e,
      );
    }
  }

  // Fallback: HTMLImageElement via blob URL.
  return new Promise<DrawableImage>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        kind: "element",
        image: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          `Bild konnte nicht geladen werden (${file.type || "unbekannter Typ"}, ${(file.size / 1024).toFixed(0)} KB). Falls dein Handy HDR/RAW-Fotos macht: in der Galerie als JPG teilen oder Kamera-Einstellungen auf "Standard"-Format umstellen.`,
        ),
      );
    };
    img.src = url;
  });
}

export async function resizeImage(
  file: File,
  maxSize: number,
  quality: number,
): Promise<Blob> {
  const decoded = await decodeImage(file);
  const { width, height } = scaleToFit(decoded.width, decoded.height, maxSize);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    if (decoded.kind === "bitmap") decoded.image.close();
    throw new Error("Canvas-Context nicht verfügbar");
  }
  // drawImage accepts both ImageBitmap and HTMLImageElement
  ctx.drawImage(decoded.image, 0, 0, width, height);
  // Free the underlying bitmap if applicable
  if (decoded.kind === "bitmap") decoded.image.close();

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
  // Decode once, derive both sizes from the same canvas to halve the
  // work versus two independent decodes. Important on mid-tier phones
  // where decoding a 12MP HDR photo can take 2-3 seconds.
  const decoded = await decodeImage(file);
  try {
    const full = await canvasToJpeg(decoded, FULL_MAX_SIZE, FULL_QUALITY);
    const thumb = await canvasToJpeg(decoded, THUMB_MAX_SIZE, THUMB_QUALITY);
    return { full, thumb };
  } finally {
    if (decoded.kind === "bitmap") decoded.image.close();
  }
}

async function canvasToJpeg(
  decoded: DrawableImage,
  maxSize: number,
  quality: number,
): Promise<Blob> {
  const { width, height } = scaleToFit(decoded.width, decoded.height, maxSize);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas-Context nicht verfügbar");
  ctx.drawImage(decoded.image, 0, 0, width, height);
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
