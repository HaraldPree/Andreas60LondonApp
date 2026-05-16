import type { HiddenPlace } from "@/types/trip";
import { HiddenPlaceCard } from "./HiddenPlaceCard";

interface HiddenPlacesGridProps {
  places: HiddenPlace[];
}

export function HiddenPlacesGrid({ places }: HiddenPlacesGridProps) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-base font-semibold text-navy">
          Hidden Places
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-gold-600 font-semibold">
          Geheimtipps
        </span>
      </div>
      <p className="text-xs text-ink-mid mb-3 leading-relaxed">
        Abseits der typischen Touristenpfade – diese Orte erzählen ihre eigene Geschichte.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {places.map((place, i) => (
          <HiddenPlaceCard key={i} place={place} />
        ))}
      </div>
    </div>
  );
}
