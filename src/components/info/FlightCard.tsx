import { Plane } from "lucide-react";
import type { Flight } from "@/types/trip";

interface FlightCardProps {
  outbound: Flight;
  inbound: Flight;
}

function FlightRow({ flight, direction }: { flight: Flight; direction: "out" | "in" }) {
  const isOut = direction === "out";
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isOut ? "bg-info/10 text-info" : "bg-gold/15 text-gold-600"
          }`}
        >
          <Plane
            size={16}
            className={isOut ? "" : "rotate-180"}
            strokeWidth={2}
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
            {isOut ? "Hinflug" : "Rückflug"}
          </p>
          <p className="text-xs text-ink-mid">{flight.date}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="font-mono text-lg font-semibold text-navy leading-none">
            {flight.departure}
          </p>
          <p className="text-[10px] text-ink-light mt-1 uppercase font-semibold tracking-wider">
            {flight.from}
          </p>
        </div>
        <div className="flex-1 relative">
          <div className="h-px bg-cream-300 border-t border-dashed border-cream-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white px-2 text-[10px] text-ink-light">
              {flight.duration ?? "—"}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-semibold text-navy leading-none">
            {flight.arrival}
          </p>
          <p className="text-[10px] text-ink-light mt-1 uppercase font-semibold tracking-wider">
            {flight.to}
          </p>
        </div>
      </div>

      {(flight.airline || flight.flightNumber) && (
        <p className="text-[11px] text-ink-light mt-2 text-center">
          {flight.airline}
          {flight.flightNumber ? ` · ${flight.flightNumber}` : ""}
        </p>
      )}
    </div>
  );
}

export function FlightCard({ outbound, inbound }: FlightCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="px-4 pt-3 pb-2 bg-cream-50 border-b border-cream-200">
        <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
          ✈️ Flüge
        </p>
      </div>
      <FlightRow flight={outbound} direction="out" />
      <div className="h-px bg-cream-200 mx-4" />
      <FlightRow flight={inbound} direction="in" />
    </div>
  );
}
