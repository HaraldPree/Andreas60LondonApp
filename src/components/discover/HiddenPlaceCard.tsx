import { MapPin } from "lucide-react";
import type { HiddenPlace } from "@/types/trip";
import { mapsUrl } from "@/lib/formatters";

interface HiddenPlaceCardProps {
  place: HiddenPlace;
}

export function HiddenPlaceCard({ place }: HiddenPlaceCardProps) {
  return (
    <a
      href={mapsUrl(place.coordinates.lat, place.coordinates.lng, place.name)}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden transition-all hover:shadow-elevated active:scale-[0.99]"
    >
      <div className="bg-gradient-to-br from-gold/15 to-gold/5 p-4 text-center">
        <span className="text-4xl block">{place.icon}</span>
      </div>
      <div className="p-3">
        {place.category && (
          <p className="text-[9px] uppercase tracking-wider text-gold-600 font-semibold mb-0.5">
            {place.category}
          </p>
        )}
        <h4 className="font-display text-sm font-semibold text-navy leading-tight">
          {place.name}
        </h4>
        <p className="text-[11px] text-ink-mid leading-snug mt-1 line-clamp-3">
          {place.description}
        </p>
        {place.bestTime && (
          <p className="text-[10px] text-ink-light italic mt-1.5">
            🕒 {place.bestTime}
          </p>
        )}
        <p className="text-[11px] text-navy font-medium mt-2 inline-flex items-center gap-1">
          <MapPin size={10} /> Auf Karte
        </p>
      </div>
    </a>
  );
}
