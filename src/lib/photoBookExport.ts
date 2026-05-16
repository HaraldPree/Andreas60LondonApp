/**
 * Photo-Book Export
 * -----------------
 * Packages all trip photos into a ZIP with chronologically-sortable
 * filenames + a printable README and a structured metadata index.
 *
 * The ZIP is designed to be drag-dropped into any photo-book service
 * (HappyFoto Designer, CEWE Fotowelt, Pixum, Saal Digital, Pixelnet…).
 * They all read filenames alphabetically when importing a folder, so
 * the `Tag{N}_{YYYY-MM-DD}_{seq}_{slug}.jpg` scheme keeps the album
 * chronological by default.
 */

// JSZip is dynamically imported inside `buildPhotoBookZip` so the ~90kB
// raw / ~30kB gzipped library doesn't ship on initial page load. The
// export feature is rarely used (once after a trip), so the small UX
// delay when first clicking is well worth the smaller bundle.
import type { Day, Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";
import { getFullBlob } from "@/lib/photoStorage";

/** Human-readable trip name combining destination + subtitle. */
function tripDisplayName(trip: Trip): string {
  return trip.subtitle
    ? `${trip.destination} – ${trip.subtitle}`
    : trip.destination;
}

export interface PhotoBookExportProgress {
  current: number;
  total: number;
  step: "collecting" | "compressing" | "done";
}

export interface PhotoBookExportOptions {
  trip: Trip;
  photos: PhotoMeta[];
  onProgress?: (p: PhotoBookExportProgress) => void;
}

/**
 * Strips diacritics + non-filename-safe chars and shortens to ~30 chars.
 * Falls back to "Foto" if input is empty.
 */
function slugifyForFilename(input: string | undefined, fallback = "Foto"): string {
  if (!input || !input.trim()) return fallback;
  const normalised = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/ß/g, "ss");
  return (
    normalised
      .replace(/[^a-zA-Z0-9-_ ]/g, "") // keep only safe chars
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 30) || fallback
  );
}

/**
 * Extracts YYYY-MM-DD from a Day. Prefers isoDate, falls back to
 * parsing takenAt of the first photo, then to a placeholder.
 */
function dayIsoDate(day: Day | undefined, fallback: string): string {
  if (day?.isoDate) return day.isoDate;
  if (day?.date) {
    // try to parse "Mo, 18. Mai" — return fallback if not parseable
    return fallback;
  }
  return fallback;
}

/**
 * Builds the filename inside the ZIP for a single photo.
 * Format: `Tag1_2026-05-18_01_Ankunft-Heathrow.jpg`
 */
function buildPhotoFilename(
  photo: PhotoMeta,
  trip: Trip,
  sequenceWithinDay: number,
): string {
  const dayIdx = photo.assignedDay;
  const isUnsorted = typeof dayIdx !== "number";
  const day = isUnsorted ? undefined : trip.days[dayIdx];

  const dayPrefix = isUnsorted ? "Unsortiert" : `Tag${(dayIdx as number) + 1}`;
  const isoDate = isUnsorted
    ? photo.takenAt.slice(0, 10) // YYYY-MM-DD from takenAt
    : dayIsoDate(day, photo.takenAt.slice(0, 10));
  const seq = String(sequenceWithinDay + 1).padStart(2, "0");
  const captionSlug = slugifyForFilename(
    photo.caption ?? photo.fileName.replace(/\.[^.]+$/, ""),
  );

  return `${dayPrefix}_${isoDate}_${seq}_${captionSlug}.jpg`;
}

/**
 * Groups photos by assignedDay (preserving "unsorted" as a special bucket)
 * and assigns sequential numbers within each group, sorted by takenAt.
 */
function groupAndSequence(
  photos: PhotoMeta[],
): Array<{ photo: PhotoMeta; seq: number }> {
  const buckets = new Map<number | "unsorted", PhotoMeta[]>();
  for (const p of photos) {
    const key = typeof p.assignedDay === "number" ? p.assignedDay : "unsorted";
    const arr = buckets.get(key) ?? [];
    arr.push(p);
    buckets.set(key, arr);
  }

  const result: Array<{ photo: PhotoMeta; seq: number }> = [];
  for (const [, arr] of buckets) {
    arr.sort((a, b) => a.takenAt.localeCompare(b.takenAt));
    arr.forEach((photo, seq) => result.push({ photo, seq }));
  }
  return result;
}

function buildReadme(trip: Trip, totalPhotos: number): string {
  const lines: string[] = [];
  lines.push(`# Foto-Buch: ${tripDisplayName(trip)}`);
  lines.push("");
  lines.push(`Exportiert am: ${new Date().toLocaleString("de-AT")}`);
  lines.push(`Anzahl Fotos: ${totalPhotos}`);
  lines.push("");
  lines.push("## So bekommst du daraus ein gedrucktes Foto-Buch");
  lines.push("");
  lines.push("1. Entpacke diese ZIP-Datei in einen Ordner.");
  lines.push("2. Lade dir den HappyFoto Designer (gratis) herunter:");
  lines.push("   https://www.happyfoto.at/designer");
  lines.push("   (oder CEWE Fotowelt, Pixum, Saal Digital, Pixelnet etc.)");
  lines.push("3. Im Designer: Neues Foto-Buch starten und 'Bilder hinzufügen'");
  lines.push("   → den entpackten Ordner auswählen.");
  lines.push("4. Die Fotos sind nach Filename sortiert chronologisch:");
  lines.push("   Tag1_2026-05-18_01_xxx.jpg → Tag1_2026-05-18_02_xxx.jpg → …");
  lines.push("   → Du kannst sie 'Auto-Befüllen' lassen, dann sind sie");
  lines.push("   gleich in der richtigen Reihenfolge auf den Seiten.");
  lines.push("");
  lines.push("## Filename-Schema");
  lines.push("");
  lines.push("Tag{N}_{YYYY-MM-DD}_{SequenzNr}_{Bildtitel}.jpg");
  lines.push("");
  lines.push("Beispiel:");
  lines.push("  Tag2_2026-05-19_03_Cedric-Grolet-Mittagessen.jpg");
  lines.push("  = 2. Reisetag, 19.05.2026, 3. Foto, Cedric-Grolet-Mittagessen");
  lines.push("");
  lines.push("## Reise-Tage");
  lines.push("");
  for (let i = 0; i < trip.days.length; i++) {
    const d = trip.days[i];
    lines.push(`  Tag ${i + 1} (${d.date}) – ${d.title}`);
  }
  lines.push("");
  lines.push("## Bonus");
  lines.push("");
  lines.push("In metadata.json findest du Bildbeschreibungen, Captions");
  lines.push("und KI-generierte Beschreibungen pro Foto — praktisch wenn");
  lines.push("du Bildunterschriften ins Buch übernehmen möchtest.");
  lines.push("");
  return lines.join("\n");
}

interface MetadataEntry {
  filename: string;
  originalFilename: string;
  day: string;
  takenAt: string;
  caption?: string;
  aiNarrative?: string;
  coordinates?: { lat: number; lng: number };
}

function buildMetadata(
  trip: Trip,
  ordered: Array<{ photo: PhotoMeta; seq: number; filename: string }>,
): string {
  const entries: MetadataEntry[] = ordered.map(({ photo, filename }) => {
    const dayIdx = photo.assignedDay;
    const day =
      typeof dayIdx === "number"
        ? `Tag ${dayIdx + 1} · ${trip.days[dayIdx]?.title ?? ""}`
        : "Unsortiert";
    return {
      filename,
      originalFilename: photo.fileName,
      day,
      takenAt: photo.takenAt,
      caption: photo.caption,
      aiNarrative: photo.aiNarrative,
      coordinates: photo.coordinates,
    };
  });

  return JSON.stringify(
    {
      trip: {
        slug: trip.slug,
        destination: trip.destination,
        subtitle: trip.subtitle,
      },
      exportedAt: new Date().toISOString(),
      totalPhotos: entries.length,
      photos: entries,
    },
    null,
    2,
  );
}

/**
 * Main entry point. Builds a ZIP Blob containing:
 *   - All photos renamed to chronologically-sortable filenames
 *   - README.txt with import instructions
 *   - metadata.json with structured info per photo
 *
 * The returned blob can be passed to `triggerDownload` or saved via FSAccess API.
 */
export async function buildPhotoBookZip({
  trip,
  photos,
  onProgress,
}: PhotoBookExportOptions): Promise<Blob> {
  if (photos.length === 0) {
    throw new Error("Keine Fotos zum Exportieren vorhanden");
  }

  // Dynamic import: keeps jszip out of the main bundle until the user
  // actually triggers an export.
  const { default: JSZip } = await import("jszip");

  const zip = new JSZip();
  const sequenced = groupAndSequence(photos);
  const total = sequenced.length;
  const namedEntries: Array<{
    photo: PhotoMeta;
    seq: number;
    filename: string;
  }> = [];

  // Step 1: fetch each blob from IndexedDB, add to zip with stable name
  for (let i = 0; i < sequenced.length; i++) {
    const { photo, seq } = sequenced[i];
    onProgress?.({ current: i, total, step: "collecting" });

    const blob = await getFullBlob(photo.id);
    if (!blob) {
      // Skip photos whose blob disappeared (shouldn't happen but be safe)
      continue;
    }
    const filename = buildPhotoFilename(photo, trip, seq);
    zip.file(filename, blob);
    namedEntries.push({ photo, seq, filename });
  }

  // Step 2: add helper files
  zip.file("README.txt", buildReadme(trip, namedEntries.length));
  zip.file("metadata.json", buildMetadata(trip, namedEntries));

  // Step 3: generate ZIP. STORE (no compression) – JPGs are already
  // compressed, recompressing would burn CPU for ~0 size savings.
  onProgress?.({ current: total, total, step: "compressing" });
  const result = await zip.generateAsync({
    type: "blob",
    compression: "STORE",
  });
  onProgress?.({ current: total, total, step: "done" });
  return result;
}

// triggerDownload re-exported from shared downloadBlob helper. On
// phones it uses Web Share API (native share sheet → Files / WhatsApp
// / Drive), on desktop it falls back to anchor-download. The previous
// inline implementation revoked the blob URL after 1s, which on Firefox
// Android caused the new tab opened by the browser to show about:blank
// before the download could start.
export { downloadOrShareBlob as triggerDownload } from "./downloadBlob";

/**
 * Convenience filename for the download: "Foto-Buch_London-2026_2026-05-21.zip"
 */
export function defaultZipFilename(trip: Trip): string {
  const today = new Date().toISOString().slice(0, 10);
  const slug = trip.slug.replace(/[^a-zA-Z0-9-_]/g, "-");
  return `Foto-Buch_${slug}_${today}.zip`;
}
