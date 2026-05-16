"use client";

import { Sparkles, MapPin } from "lucide-react";
import type { PhotoMeta } from "@/types/photo";
import { useBlobUrl } from "@/hooks/useBlobUrl";
import { getThumbnailBlob } from "@/lib/photoStorage";

interface PhotoCardProps {
  photo: PhotoMeta;
  onClick: () => void;
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const url = useBlobUrl(photo.id, getThumbnailBlob);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden bg-cream-200 group"
      aria-label={`Foto ${photo.fileName}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={photo.caption ?? photo.fileName}
          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
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
