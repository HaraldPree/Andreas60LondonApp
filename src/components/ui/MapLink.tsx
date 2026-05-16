"use client";

import { MapPin } from "lucide-react";
import { mapsUrl } from "@/lib/formatters";
import type { Coordinates } from "@/types/trip";

interface MapLinkProps {
  coordinates: Coordinates;
  label?: string;
  text?: string;
  className?: string;
  compact?: boolean;
}

export function MapLink({
  coordinates,
  label,
  text = "Auf Karte öffnen",
  className,
  compact = false,
}: MapLinkProps) {
  return (
    <a
      href={mapsUrl(coordinates.lat, coordinates.lng, label)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        `inline-flex items-center gap-1.5 ${
          compact ? "text-xs" : "text-sm"
        } font-medium text-navy hover:text-gold transition-colors`
      }
    >
      <MapPin size={compact ? 12 : 14} />
      {text}
    </a>
  );
}
