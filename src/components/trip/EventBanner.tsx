"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { Trip } from "@/types/trip";
import type { Event } from "@/types/event";
import {
  eventOverlapsTrip,
  EVENT_CATEGORY_META,
} from "@/types/event";
import { classNames, mapsUrl } from "@/lib/formatters";
import { TrustBadge } from "@/components/ui/TrustBadge";

interface Props {
  trip: Trip;
}

/**
 * v1.9.0 — Event-Banner für Programm-Tab.
 *
 * Zeigt nur Events die mit dem Reisezeitraum überlappen
 * (eventOverlapsTrip). Klappt aus mit Details + Booking-Links +
 * Visitor-Tips.
 *
 * Anlass: Lukas / Harald-Feedback nach London-Reise — Chelsea Flower
 * Show 19.–23. Mai 2026 wäre direkt während der Reise gewesen, aber
 * die App hat's nicht gezeigt.
 */
export function EventBanner({ trip }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Trip-Zeitraum aus erstem/letztem Tag mit isoDate ableiten
  const { tripStart, tripEnd } = useMemo(() => {
    const dates = trip.days
      .map((d) => d.isoDate)
      .filter((d): d is string => Boolean(d))
      .sort();
    return {
      tripStart: dates[0] ?? "",
      tripEnd: dates[dates.length - 1] ?? "",
    };
  }, [trip.days]);

  // Events filtern + sortieren (nach Start-Datum)
  const matchingEvents = useMemo(() => {
    if (!trip.events || !tripStart || !tripEnd) return [];
    return trip.events
      .filter((e) => eventOverlapsTrip(e, tripStart, tripEnd))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [trip.events, tripStart, tripEnd]);

  if (matchingEvents.length === 0) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gold/15 via-cream-50 to-gold/8 border-2 border-gold/30 overflow-hidden">
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-gold-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gold-600 font-bold">
            Während eurer Reise
          </p>
          <p className="font-display text-sm font-semibold text-navy leading-tight mt-0.5">
            {matchingEvents.length === 1
              ? "1 Event passt zu eurem Reisezeitraum"
              : `${matchingEvents.length} Events passen zu eurem Reisezeitraum`}
          </p>
          <p className="text-[11px] text-ink-mid mt-0.5">
            Kuratierte lokale Highlights — Tap aufs Event für Details
          </p>
        </div>
      </div>

      <div className="divide-y divide-gold/15 border-t border-gold/20">
        {matchingEvents.map((event) => {
          const isOpen = expanded === event.id;
          return (
            <EventRow
              key={event.id}
              event={event}
              tripStart={tripStart}
              tripEnd={tripEnd}
              isOpen={isOpen}
              onToggle={() => setExpanded(isOpen ? null : event.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function EventRow({
  event,
  tripStart,
  tripEnd,
  isOpen,
  onToggle,
}: {
  event: Event;
  tripStart: string;
  tripEnd: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const dateRange = formatDateRange(event.startDate, event.endDate);
  // Wie viele Tage der Reise sind durch Event abgedeckt?
  const overlapDays = countOverlapDays(
    event.startDate,
    event.endDate,
    tripStart,
    tripEnd,
  );

  const catMeta = EVENT_CATEGORY_META[event.category];

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-start gap-3 text-left hover:bg-gold/5 transition"
      >
        <span className="text-xl flex-shrink-0 mt-0.5">
          {event.icon ?? catMeta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-dark leading-tight">
            {event.name}
          </p>
          <p className="text-[11px] text-ink-mid mt-0.5">
            {dateRange}
            {overlapDays > 0 && (
              <span className="text-success font-semibold ml-1">
                · {overlapDays} {overlapDays === 1 ? "Tag" : "Tage"} eurer Reise
              </span>
            )}
          </p>
          <div className="flex items-center flex-wrap gap-1.5 mt-1">
            {event.cost && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream-100 text-ink-mid font-mono">
                {event.cost}
              </span>
            )}
            {/* v1.13.2 — Trust-Badge: Aktualität + Quelle */}
            <TrustBadge
              lastVerified={event.lastVerified}
              source={event.source}
              size="xs"
            />
          </div>
        </div>
        <ChevronDown
          size={14}
          className={classNames(
            "text-ink-light transition-transform flex-shrink-0 mt-1.5",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-2 bg-gold/5">
          <p className="text-xs text-ink-dark leading-relaxed">
            {event.description}
          </p>

          {event.location && (
            <p className="text-[11px] text-ink-mid italic inline-flex items-center gap-1">
              <MapPin size={11} /> {event.location}
            </p>
          )}

          {event.visitorTips && event.visitorTips.length > 0 && (
            <div className="rounded-md bg-white/60 border border-gold/20 p-2">
              <p className="text-[10px] uppercase tracking-wider text-gold-600 font-bold mb-1">
                Tipps
              </p>
              <ul className="space-y-1">
                {event.visitorTips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-ink-dark leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gold"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center flex-wrap gap-3 pt-1">
            {event.coordinates && (
              <a
                href={mapsUrl(
                  event.coordinates.lat,
                  event.coordinates.lng,
                  event.location,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-navy hover:text-gold transition inline-flex items-center gap-1 font-medium"
              >
                <MapPin size={11} /> Karte
              </a>
            )}
            {event.bookingUrl && (
              <a
                href={event.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-navy hover:text-gold transition inline-flex items-center gap-1 font-medium"
              >
                <ExternalLink size={11} />
                {event.bookingRequired ? "Tickets" : "Mehr Infos"}
              </a>
            )}
          </div>

          <p className="text-[10px] text-ink-light italic pt-1">
            <Calendar size={9} className="inline mr-1" />
            Stand: {event.lastVerified} · {event.source}
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════

function formatDateRange(start: string, end: string): string {
  const s = parseIsoDate(start);
  const e = parseIsoDate(end);
  if (!s || !e) return start;
  if (start === end) {
    return s.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return `${s.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  })} – ${e.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function countOverlapDays(
  eventStart: string,
  eventEnd: string,
  tripStart: string,
  tripEnd: string,
): number {
  const a = parseIsoDate(eventStart < tripStart ? tripStart : eventStart);
  const b = parseIsoDate(eventEnd > tripEnd ? tripEnd : eventEnd);
  if (!a || !b || a > b) return 0;
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return diff + 1; // inclusive
}
