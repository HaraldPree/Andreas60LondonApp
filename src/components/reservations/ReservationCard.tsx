"use client";

import { useState } from "react";
import {
  ExternalLink,
  Phone,
  MapPin,
  Check,
  Clock,
  Calendar,
  Utensils,
  ChevronDown,
  Coffee,
} from "lucide-react";
import type { Reservation, ReservationStatus } from "@/types/trip";
import { classNames, mapsUrl } from "@/lib/formatters";
import { TransportButtons } from "@/components/ui/TransportButtons";

interface ReservationCardProps {
  reservation: Reservation;
  onOpenStatusPicker: () => void;
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

export function ReservationCard({
  reservation,
  onOpenStatusPicker,
}: ReservationCardProps) {
  const statusConfig = STATUS_CONFIG[reservation.status];
  const StatusIcon = statusConfig.icon;
  const isPriority = reservation.priority === "hoch";
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Menu preview — only when reservation.menu is set */}
        {reservation.menu && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="w-full inline-flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-gold-600 text-xs font-semibold hover:bg-gold/15 transition"
            >
              <span className="inline-flex items-center gap-2">
                <Utensils size={12} />
                Menü ansehen
                {reservation.menu.courses && (
                  <span className="font-normal text-ink-mid text-[10px]">
                    ({reservation.menu.courses.length} Gänge)
                  </span>
                )}
              </span>
              <ChevronDown
                size={14}
                className={classNames(
                  "transition-transform",
                  menuOpen && "rotate-180",
                )}
              />
            </button>

            {menuOpen && (
              <div className="mt-2 rounded-xl bg-cream-50 border border-cream-200 p-3 space-y-3">
                <div className="text-center pb-2 border-b border-cream-200">
                  <p className="font-display text-base font-semibold text-navy">
                    {reservation.menu.title}
                  </p>
                  {reservation.menu.subtitle && (
                    <p className="text-[11px] text-ink-mid mt-0.5">
                      {reservation.menu.subtitle}
                    </p>
                  )}
                </div>

                {reservation.menu.courses && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gold-600 font-bold mb-1.5">
                      Gänge
                    </p>
                    <ol className="space-y-1.5">
                      {reservation.menu.courses.map((course, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="font-display font-bold text-gold-600 w-5 flex-shrink-0 text-sm">
                            {i + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy leading-tight">
                              {course.name}
                            </p>
                            {course.description && (
                              <p className="text-[11px] text-ink-mid mt-0.5 leading-relaxed">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {reservation.menu.drinkCategories &&
                  reservation.menu.drinkCategories.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gold-600 font-bold mb-1.5 inline-flex items-center gap-1">
                        <Coffee size={10} />
                        Getränke-Auswahl
                      </p>
                      <div className="space-y-2">
                        {reservation.menu.drinkCategories.map((cat, i) => (
                          <div key={i}>
                            <p className="text-[11px] font-semibold text-ink-dark">
                              {cat.label}
                            </p>
                            <ul className="mt-0.5 space-y-0.5">
                              {cat.items.map((item, j) => (
                                <li
                                  key={j}
                                  className="text-[11px] text-ink-mid leading-relaxed pl-2"
                                >
                                  · {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {reservation.menu.footnote && (
                  <p className="text-[10px] text-ink-light italic leading-relaxed border-t border-cream-200 pt-2">
                    {reservation.menu.footnote}
                  </p>
                )}

                {reservation.menu.sourceUrl && (
                  <a
                    href={reservation.menu.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-navy underline inline-flex items-center gap-1"
                  >
                    <ExternalLink size={10} />
                    Original-Menü beim Restaurant
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar — Apple-Way: Tap öffnet Action-Sheet,
          kein "(tippen zum Ändern)"-Hint mehr nötig */}
      <button
        type="button"
        onClick={onOpenStatusPicker}
        className={classNames(
          "w-full px-4 py-3 min-h-[44px] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:opacity-80",
          statusConfig.bg,
          statusConfig.text,
        )}
        aria-label={`Status ändern (aktuell: ${STATUS_LABELS[reservation.status]})`}
      >
        <StatusIcon size={14} />
        {STATUS_LABELS[reservation.status]}
        <ChevronDown size={12} className="opacity-50 ml-0.5" />
      </button>
    </div>
  );
}
