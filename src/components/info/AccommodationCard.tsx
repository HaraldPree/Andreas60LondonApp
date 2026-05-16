import { MapPin, LogIn, LogOut } from "lucide-react";
import type { Accommodation } from "@/types/trip";
import { mapsUrl } from "@/lib/formatters";
import { TransportButtons } from "@/components/ui/TransportButtons";

interface AccommodationCardProps {
  accommodation: Accommodation;
}

export function AccommodationCard({ accommodation }: AccommodationCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="bg-gradient-to-br from-navy to-navy-600 text-cream p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gold/20 flex items-center justify-center text-2xl flex-shrink-0">
          🏠
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-cream/70 font-semibold">
            Unterkunft
          </p>
          <h3 className="font-display text-base font-semibold leading-tight">
            {accommodation.name}
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-ink-dark leading-relaxed">
          {accommodation.address}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-success/5 border border-success/15 p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <LogIn size={12} className="text-success" />
              <span className="text-[10px] uppercase tracking-wider text-success font-semibold">
                Check-In
              </span>
            </div>
            <p className="text-xs text-ink-dark leading-tight">
              {accommodation.checkIn}
            </p>
          </div>
          <div className="rounded-xl bg-warning/5 border border-warning/15 p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <LogOut size={12} className="text-warning" />
              <span className="text-[10px] uppercase tracking-wider text-warning font-semibold">
                Check-Out
              </span>
            </div>
            <p className="text-xs text-ink-dark leading-tight">
              {accommodation.checkOut}
            </p>
          </div>
        </div>

        {accommodation.notes && (
          <p className="text-xs text-ink-mid italic leading-relaxed">
            {accommodation.notes}
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          <a
            href={mapsUrl(
              accommodation.coordinates.lat,
              accommodation.coordinates.lng,
              accommodation.name,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs px-3 py-2 rounded-lg bg-navy text-cream font-medium inline-flex items-center justify-center gap-1.5 hover:bg-navy-600 transition min-w-[120px]"
          >
            <MapPin size={12} /> Auf Karte
          </a>
          {accommodation.phone && (
            <a
              href={`tel:${accommodation.phone}`}
              className="flex-1 text-center text-xs px-3 py-2 rounded-lg bg-navy/10 text-navy font-medium hover:bg-navy/20 transition min-w-[100px]"
            >
              Anrufen
            </a>
          )}
        </div>
        <TransportButtons
          coordinates={accommodation.coordinates}
          label={accommodation.name}
        />
      </div>
    </div>
  );
}
