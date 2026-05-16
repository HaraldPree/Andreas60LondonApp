"use client";

import { useState } from "react";
import { Sparkles, MapPin, AlertCircle, Trash2 } from "lucide-react";
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
  // threw, or the <img> tag itself fired an error event (e.g. corrupt
  // bytes that Firefox can't decode).
  const broken =
    blobState.status === "missing" ||
    blobState.status === "error" ||
    imgFailed;

  if (broken) {
    return (
      <div
        className="relative aspect-square rounded-lg overflow-hidden bg-warning/10 border border-warning/30 flex flex-col items-center justify-center p-1 text-center"
        title={
          blobState.status === "error"
            ? blobState.error.message
            : "Thumbnail nicht ladbar"
        }
      >
        <AlertCircle size={16} className="text-warning mb-1" />
        <p className="text-[8px] text-warning font-semibold leading-tight">
          Bild kaputt
        </p>
        <p
          className="text-[8px] text-ink-mid leading-tight truncate w-full px-0.5 mt-0.5"
          title={photo.fileName}
        >
          {photo.fileName}
        </p>
        {onSelfDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelfDelete(photo.id);
            }}
            className="mt-1 inline-flex items-center gap-0.5 text-[9px] text-warning font-semibold underline hover:text-warning/80"
          >
            <Trash2 size={9} />
            entfernen
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
      {blobState.status === "ready" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blobState.url}
          alt={photo.caption ?? photo.fileName}
          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-cream-300" />
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
