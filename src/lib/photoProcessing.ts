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

// ═════════════════════════════════════════════════════════════
// v1.12.0 — Video-Support
// ═════════════════════════════════════════════════════════════

/** Max Video-Größe — IndexedDB-Quota schützen + Mobile-RAM. */
const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100 MB

const SUPPORTED_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime", // .mov
  "video/webm",
  "video/x-m4v",
]);

/**
 * Erkennt ob File ein Video ist (per MIME oder Extension).
 * Mobile-Browser senden manchmal leere `type`-Werte → Extension-Check
 * als Fallback.
 */
export function isVideoFile(file: File): boolean {
  if (file.type && file.type.startsWith("video/")) return true;
  if (/\.(mp4|mov|webm|m4v)$/i.test(file.name)) return true;
  return false;
}

/**
 * Pre-flight für Video-Files.
 * Liefert Fehler-String oder null wenn OK.
 */
export function videoPreflight(file: File): string | null {
  if (file.size === 0) return "Video-Datei ist leer (0 KB)";
  if (file.size > VIDEO_MAX_SIZE) {
    return `Video zu groß (${(file.size / 1024 / 1024).toFixed(0)} MB, max ${VIDEO_MAX_SIZE / 1024 / 1024} MB). Tipp: Video auf dem Handy vorher kürzen oder komprimieren.`;
  }
  if (file.type && !SUPPORTED_VIDEO_MIME_TYPES.has(file.type.toLowerCase())) {
    return `Video-Format ${file.type} wird nicht unterstützt — bitte MP4 oder MOV verwenden`;
  }
  return null;
}

/**
 * Extrahiert ein Cover-Frame aus einem Video.
 * Springt zu ~10 % der Dauer (oder min 1 s) um schwarze Frames zu vermeiden.
 *
 * Returns Blob (JPEG) + Metadaten (Dauer, Original-Dimensionen).
 */
async function extractVideoFrame(file: File): Promise<{
  posterBlob: Blob;
  durationSec: number;
  width: number;
  height: number;
}> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    // Mobile Safari braucht das damit es im DOM erlaubt ist zu dekodieren
    video.style.position = "absolute";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    document.body.appendChild(video);

    try {
      // Metadaten laden (Dimensionen + Dauer)
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(
          () => reject(new Error("Video-Metadaten Timeout (>15 s)")),
          15000,
        );
        video.onloadedmetadata = () => {
          window.clearTimeout(timer);
          resolve();
        };
        video.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error("Video konnte nicht dekodiert werden"));
        };
        video.load();
      });

      const w = video.videoWidth;
      const h = video.videoHeight;
      const duration = video.duration || 0;
      if (!w || !h) throw new Error("Video hat keine Dimensionen");

      // Seek zu sinnvoller Position für Cover (vermeide schwarzen Anfang)
      const targetTime = Math.min(1, duration * 0.1);

      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(
          () => reject(new Error("Video-Seek Timeout")),
          10000,
        );
        video.onseeked = () => {
          window.clearTimeout(timer);
          resolve();
        };
        video.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error("Video-Seek fehlgeschlagen"));
        };
        video.currentTime = targetTime;
      });

      // Frame ins Canvas malen (auf max 1500 px skaliert)
      const { width, height } = scaleToFit(w, h, FULL_MAX_SIZE);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas-Context nicht verfügbar");
      ctx.drawImage(video, 0, 0, width, height);

      const posterBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Poster-Generierung fehlgeschlagen")),
          "image/jpeg",
          FULL_QUALITY,
        );
      });

      return { posterBlob, durationSec: duration, width: w, height: h };
    } finally {
      document.body.removeChild(video);
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * v1.12.0 — Verarbeitung für Video-Upload.
 *
 * Returns:
 *  - full = Original-Video-Blob (NICHT komprimiert — Browser haben keine
 *    sinnvolle Video-Komprimierungs-API)
 *  - thumb = kleines JPEG-Thumbnail vom Cover-Frame (für Galerie-Grid)
 *  - durationSec = Video-Dauer für Display-Pill
 *
 * Anders als Fotos: das "full" bleibt das Original — das wird durch
 * VIDEO_MAX_SIZE-Limit kontrolliert (heute 100 MB pro File).
 */
export async function processVideoForStorage(file: File): Promise<{
  full: Blob;
  thumb: Blob;
  durationSec: number;
}> {
  const { posterBlob, durationSec } = await extractVideoFrame(file);

  // Thumb aus Poster generieren (kleiner für Galerie-Grid)
  const thumb = await thumbnailFromPoster(posterBlob);

  return {
    full: file, // Original-Video bleibt unkomprimiert
    thumb,
    durationSec,
  };
}

/**
 * Skaliert einen Poster-JPEG-Blob auf Thumbnail-Größe.
 */
async function thumbnailFromPoster(posterBlob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(posterBlob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Poster-Decode fehlgeschlagen"));
      i.src = url;
    });
    const { width, height } = scaleToFit(
      img.naturalWidth,
      img.naturalHeight,
      THUMB_MAX_SIZE,
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas-Context nicht verfügbar");
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Thumb-Generierung fehlgeschlagen")),
        "image/jpeg",
        THUMB_QUALITY,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Liest takenAt aus File.lastModified — Videos haben kein EXIF wie Fotos.
 * Gibt fallweise auch undefined zurück.
 */
export function videoTakenAt(file: File): string {
  return new Date(file.lastModified).toISOString();
}
