"use client";

import { useState } from "react";
import { Sparkles, MapPin, AlertTriangle, Trash2 } from "lucide-react";
import type { PhotoMeta } from "@/types/photo";
import { useBlobUrlState } from "@/hooks/useBlobUrl";
import { getThumbnailBlob } from "@/lib/photoStorage";

interface PhotoCardProps {
  photo: PhotoMeta;
  onClick: () => void;
  /** Optional self-delete handler — shown only when the image fails. */
  onSelfDelete?: (id: string) => void;
}

export function PhotoCard({ photo, onClick, onSelfDelete }: PhotoCardProps) {
  const blobState = useBlobUrlState(photo.id, getThumbnailBlob);
  const [imgFailed, setImgFailed] = useState(false);

  // A photo is "broken" if the blob is missing in storage, fetching it
  // threw, the URL came back empty, or the <img> tag fired an error
  // event (e.g. bytes Firefox can't decode).
  const hasValidUrl =
    blobState.status === "ready" &&
    typeof blobState.url === "string" &&
    blobState.url.length > 0;

  const broken =
    blobState.status === "missing" ||
    blobState.status === "error" ||
    (blobState.status === "ready" && !hasValidUrl) ||
    imgFailed;

  if (broken) {
    const reason =
      blobState.status === "error"
        ? blobState.error.message
        : blobState.status === "missing"
          ? "Thumbnail fehlt in der Datenbank"
          : !hasValidUrl
            ? "Thumbnail-URL ist leer"
            : "Bild konnte nicht dekodiert werden";
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn(
        `[PhotoCard] Broken photo id=${photo.id} (${photo.fileName}): ${reason}`,
      );
    }
    return (
      <div
        className="relative aspect-square rounded-lg overflow-hidden bg-warning/30 border-2 border-warning flex flex-col items-center justify-center p-1.5 text-center"
        title={`${photo.fileName} — ${reason}`}
      >
        <AlertTriangle size={20} className="text-warning mb-1" strokeWidth={2.5} />
        <p className="text-[10px] text-warning font-bold leading-tight uppercase tracking-wide">
          Bild kaputt
        </p>
        {onSelfDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelfDelete(photo.id);
            }}
            className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning text-white text-[9px] font-bold hover:bg-warning/90 transition shadow-sm"
          >
            <Trash2 size={10} />
            ENTFERNEN
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden bg-cream-200 group"
      aria-label={`Foto ${photo.fileName}`}
    >
      {hasValidUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blobState.url}
          alt={photo.caption ?? photo.fileName}
          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={() => {
            if (typeof window !== "undefined") {
              // eslint-disable-next-line no-console
              console.warn(
                `[PhotoCard] <img onError> fired for id=${photo.id} (${photo.fileName})`,
              );
            }
            setImgFailed(true);
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-cream-200">
          <div className="text-[9px] text-ink-light animate-pulse">
            Lade…
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
        {photo.aiNarrative && (
          <span
            className="w-5 h-5 rounded-full bg-gold/90 backdrop-blur-sm flex items-center justify-center text-white shadow"
            title="KI-Erzählung vorhanden"
          >
            <Sparkles size={10} />
          </span>
        )}
        {photo.coordinates && (
          <span
            className="w-5 h-5 rounded-full bg-navy/80 backdrop-blur-sm flex items-center justify-center text-white shadow"
            title="GPS-Koordinaten vorhanden"
          >
            <MapPin size={10} />
          </span>
        )}
      </div>
    </button>
  );
}
