"use client";

import { useState } from "react";
import {
  Heart,
  Eye,
  Check,
  MapPin,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  CalendarClock,
  MessageCircle,
} from "lucide-react";
import type { Place, PlaceStatus, WeekDay } from "@/types/place";
import { classNames, mapsUrl } from "@/lib/formatters";
import { TrustBadge } from "@/components/ui/TrustBadge";

interface PlaceCardProps {
  place: Place;
  status: PlaceStatus;
  onSetStatus: (next: PlaceStatus) => void;
  /** Optional: aktueller Wochentag der Reise (z.B. "Mi") — wenn der Place
   *  scheduled ist und an dem Tag NICHT offen, wird ein Hinweis gezeigt. */
  currentWeekday?: WeekDay;
  /**
   * v1.7.4 — Wenn gesetzt, erscheint bei 💭-Wünschen ein „💬 Fragen"-Button
   * der einen Single-Place-Poll öffnet. Apple-Way: pro Wunsch eine
   * klare Abstimmung statt Bündel-Poll.
   */
  onAskGroup?: () => void;
}

/**
 * v1.7.0 — Place-Karte im Wunschliste-Tab.
 *
 * Standardmäßig collapsed: Name + Status-Buttons + Quick-Info.
 * Tap auf den Body → Details ausklappen (Beschreibung, Öffnungszeiten, Maps).
 *
 * Drei Status:
 *  - ○ open (Default — nicht markiert)
 *  - 💭 wantToSee (auf meine Liste)
 *  - ✓ done (erledigt)
 *
 * Cycle: open → wantToSee → done → open.
 * Direkte Auswahl via 3-Button-Reihe rechts.
 */
export function PlaceCard({
  place,
  status,
  onSetStatus,
  currentWeekday,
  onAskGroup,
}: PlaceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const availability = place.availability;
  const isClosedOnCurrentDay =
    currentWeekday &&
    availability.type === "scheduled" &&
    availability.openDays &&
    !availability.openDays.includes(currentWeekday);

  return (
    <div
      className={classNames(
        "rounded-xl border transition overflow-hidden",
        status === "done"
          ? "bg-success/5 border-success/40"
          : status === "passed"
            ? "bg-info/5 border-info/40"
            : status === "wantToSee"
              ? "bg-gold/8 border-gold/40"
              : "bg-white border-cream-200/70",
      )}
    >
      {/* Header-Zeile */}
      <div className="flex items-start gap-2 p-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-base flex-shrink-0">
              {place.icon ?? "📍"}
            </span>
            <p
              className={classNames(
                "text-sm font-semibold leading-tight",
                status === "done" && "line-through text-ink-mid",
                status === "passed" && "text-ink-dark",
                status === "wantToSee" && "text-ink-dark",
                status === "open" && "text-ink-dark",
              )}
            >
              {place.name}
            </p>
          </div>
          <p className="text-[11px] text-ink-mid mt-1 leading-relaxed line-clamp-2">
            {place.description}
          </p>
          {/* Quick-Info-Pills */}
          <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
            {place.cost && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream-100 text-ink-mid font-mono">
                {place.cost}
              </span>
            )}
            {availability.reservationRequired && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-info/10 text-info font-mono">
                Reservation
              </span>
            )}
            {isClosedOnCurrentDay && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-mono inline-flex items-center gap-0.5">
                <AlertCircle size={9} /> heute zu
              </span>
            )}
            {place.filmContext && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/15 text-gold-600 font-mono">
                🎬 Film
              </span>
            )}
            {/* v1.13.2 — Trust-Badge: zeigt Aktualität + Quelle der Info */}
            <TrustBadge
              lastVerified={availability.lastVerified}
              source={availability.source}
              size="xs"
            />
          </div>
        </button>

        {/* Status-Buttons rechts (v1.7.1 — 3 Stufen horizontal) */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                onSetStatus(status === "wantToSee" ? "open" : "wantToSee")
              }
              aria-label="Auf meine Wunschliste"
              title="Wunsch"
              className={classNames(
                "w-8 h-8 rounded-full flex items-center justify-center transition",
                status === "wantToSee"
                  ? "bg-gold text-white"
                  : "bg-cream-100 text-ink-light hover:bg-cream-200",
              )}
            >
              <Heart
                size={13}
                strokeWidth={status === "wantToSee" ? 0 : 2}
                fill={status === "wantToSee" ? "currentColor" : "none"}
              />
            </button>
            <button
              type="button"
              onClick={() =>
                onSetStatus(status === "passed" ? "open" : "passed")
              }
              aria-label="Vorbei / gesehen"
              title="Vorbei"
              className={classNames(
                "w-8 h-8 rounded-full flex items-center justify-center transition",
                status === "passed"
                  ? "bg-info text-white"
                  : "bg-cream-100 text-ink-light hover:bg-cream-200",
              )}
            >
              <Eye size={13} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => onSetStatus(status === "done" ? "open" : "done")}
              aria-label="Erledigt"
              title="Erledigt"
              className={classNames(
                "w-8 h-8 rounded-full flex items-center justify-center transition",
                status === "done"
                  ? "bg-success text-white"
                  : "bg-cream-100 text-ink-light hover:bg-cream-200",
              )}
            >
              <Check size={13} strokeWidth={3} />
            </button>
          </div>
          {status !== "open" && (
            <button
              type="button"
              onClick={() => onSetStatus("open")}
              aria-label="Markierung entfernen"
              className="text-[9px] font-bold text-ink-light hover:text-warning transition px-2 py-0.5 rounded"
            >
              zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-cream-200 px-3 py-3 space-y-2 bg-cream-50/50">
          {/* Öffnungszeiten */}
          <div className="flex items-start gap-2">
            <CalendarClock
              size={13}
              className="text-ink-light flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0 text-[11px]">
              {availability.type === "always-open" && (
                <p className="text-ink-dark">
                  <strong>Always-open</strong> — jederzeit zugänglich
                </p>
              )}
              {availability.type === "scheduled" && (
                <div className="text-ink-dark">
                  {availability.openHours && (
                    <p>
                      <strong>Öffnungszeiten:</strong> {availability.openHours}
                    </p>
                  )}
                  {availability.openDays && (
                    <p className="text-ink-mid mt-0.5">
                      Tage: {availability.openDays.join(" · ")}
                    </p>
                  )}
                </div>
              )}
              {availability.type === "by-appointment" && (
                <p className="text-ink-dark">
                  <strong>Reservierung pflicht</strong>
                  {availability.openHours && ` (${availability.openHours})`}
                </p>
              )}
              {availability.type === "closed-to-public" && (
                <p className="text-warning">
                  <strong>Aktuell nicht öffentlich zugänglich</strong>
                </p>
              )}
              {availability.note && (
                <p className="text-ink-mid mt-0.5 italic leading-relaxed">
                  {availability.note}
                </p>
              )}
              <p className="text-[10px] text-ink-light mt-1">
                Stand: {availability.lastVerified} · {availability.source}
              </p>
            </div>
          </div>

          {/* Filmkontext bei film-Kategorie */}
          {place.filmContext && (
            <div className="rounded-md bg-gold/10 border border-gold/30 px-2 py-1.5">
              <p className="text-[11px] text-ink-dark leading-relaxed">
                <strong className="text-gold-600">🎬 Filmreferenz:</strong>{" "}
                {place.filmContext}
              </p>
            </div>
          )}

          {/* Adresse */}
          {place.address && (
            <p className="text-[11px] text-ink-mid italic">📍 {place.address}</p>
          )}

          {/* Action-Links */}
          <div className="flex items-center flex-wrap gap-3 pt-1">
            <a
              href={mapsUrl(
                place.coordinates.lat,
                place.coordinates.lng,
                place.name,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-navy hover:text-gold transition inline-flex items-center gap-1 font-medium"
            >
              <MapPin size={11} /> Karte
            </a>
            {place.bookingUrl && (
              <a
                href={place.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-navy hover:text-gold transition inline-flex items-center gap-1 font-medium"
              >
                <ExternalLink size={11} /> Offizielle Website
              </a>
            )}
          </div>
        </div>
      )}

      {/* Footer-Zeile: Single-Place-Frag-Button + Expand */}
      <div className="flex items-center border-t border-cream-100">
        {/* v1.7.5 — Frag-Button sichtbar bei 💭 Wunsch UND 👁 Vorbei
            (Lukas-Case: er war außen, will jetzt innen — kein
            Status-Wechsel nötig). Bei ✓ Erledigt + Offen blendet
            der Button aus weil dort kein Frag-Bedarf typisch ist. */}
        {(status === "wantToSee" || status === "passed") && onAskGroup && (
          <button
            type="button"
            onClick={onAskGroup}
            className="flex-1 px-3 py-2 min-h-[36px] inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-success hover:bg-success/8 transition border-r border-cream-100"
            aria-label="Diese eine Frage an die Gruppe stellen"
          >
            <MessageCircle size={12} />
            Frag die Gruppe
          </button>
        )}

        {/* Expand-Indicator */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Details ausblenden" : "Details anzeigen"}
          className="flex-1 px-3 py-1 min-h-[36px] flex items-center justify-center text-ink-light hover:text-ink-mid"
        >
          <ChevronDown
            size={12}
            className={classNames(
              "transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>
    </div>
  );
}
