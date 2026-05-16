"use client";

import { ExternalLink, Phone, MapPin, Check, Clock, Calendar } from "lucide-react";
import type { Reservation, ReservationStatus } from "@/types/trip";
import { classNames, mapsUrl } from "@/lib/formatters";
import { TransportButtons } from "@/components/ui/TransportButtons";

interface ReservationCardProps {
  reservation: Reservation;
  onToggleStatus: () => void;
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  offen: "Offen – zu reservieren",
  reserviert: "Reserviert",
  erledigt: "Erledigt",
};

const STATUS_CONFIG: Record<
  ReservationStatus,
  { bg: string; text: string; icon: typeof Check }
> = {
  offen: { bg: "bg-warning/10", text: "text-warning", icon: Clock },
  reserviert: { bg: "bg-gold/15", text: "text-gold-600", icon: Calendar },
  erledigt: { bg: "bg-success/10", text: "text-success", icon: Check },
};

export function ReservationCard({ reservation, onToggleStatus }: ReservationCardProps) {
  const statusConfig = STATUS_CONFIG[reservation.status];
  const StatusIcon = statusConfig.icon;
  const isPriority = reservation.priority === "hoch";

  return (
    <div
      className={classNames(
        "rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden",
      )}
      style={isPriority ? { borderLeft: "4px solid #E5A00D" } : undefined}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center text-2xl flex-shrink-0">
            {reservation.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light">
                {reservation.when}
              </span>
              {isPriority && (
                <span className="text-[10px] font-semibold uppercase text-gold-600 tracking-wider">
                  Wichtig
                </span>
              )}
            </div>
            <h3 className="font-display text-base font-semibold text-navy leading-tight">
              {reservation.name}
            </h3>
            {reservation.note && (
              <p className="text-xs text-ink-mid mt-1 leading-relaxed">
                {reservation.note}
              </p>
            )}
            {reservation.address && (
              <p className="text-[11px] text-ink-light mt-1.5">
                {reservation.address}
              </p>
            )}
          </div>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap gap-2 mt-3">
          {reservation.coordinates && (
            <a
              href={mapsUrl(
                reservation.coordinates.lat,
                reservation.coordinates.lng,
                reservation.name,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1.5 rounded-lg bg-navy/5 text-navy font-medium inline-flex items-center gap-1 hover:bg-navy/10 transition"
            >
              <MapPin size={12} /> Karte
            </a>
          )}
          {reservation.phone && (
            <a
              href={`tel:${reservation.phone}`}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-navy/5 text-navy font-medium inline-flex items-center gap-1 hover:bg-navy/10 transition"
            >
              <Phone size={12} /> Anrufen
            </a>
          )}
          {reservation.bookingUrl && (
            <a
              href={reservation.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1.5 rounded-lg bg-navy/5 text-navy font-medium inline-flex items-center gap-1 hover:bg-navy/10 transition"
            >
              <ExternalLink size={12} /> Website
            </a>
          )}
          {reservation.coordinates && (
            <TransportButtons
              coordinates={reservation.coordinates}
              label={reservation.name}
            />
          )}
        </div>
      </div>

      {/* Status toggle bar */}
      <button
        type="button"
        onClick={onToggleStatus}
        className={classNames(
          "w-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors",
          statusConfig.bg,
          statusConfig.text,
        )}
      >
        <StatusIcon size={14} />
        {STATUS_LABELS[reservation.status]}
        <span className="opacity-50 ml-1 normal-case font-normal tracking-normal text-[10px]">
          (tippen zum Ändern)
        </span>
      </button>
    </div>
  );
}
