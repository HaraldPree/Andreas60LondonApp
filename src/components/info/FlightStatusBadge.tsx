"use client";

import { ExternalLink, RefreshCw, AlertTriangle, CheckCircle2, Clock, Plane } from "lucide-react";
import type { FlightStatusResponse, FlightStatusValue } from "@/lib/flightStatus";
import { useFlightStatus } from "@/hooks/useFlightStatus";
import { classNames } from "@/lib/formatters";

interface FlightStatusBadgeProps {
  flightIata?: string;
  flightDate?: string;
}

const STATUS_LABEL: Record<FlightStatusValue, string> = {
  scheduled: "Geplant",
  active: "In der Luft",
  landed: "Gelandet",
  cancelled: "Annulliert",
  incident: "Zwischenfall",
  diverted: "Umgeleitet",
  unknown: "Unbekannt",
};

export function FlightStatusBadge({ flightIata, flightDate }: FlightStatusBadgeProps) {
  const { data, loading, refresh } = useFlightStatus({ flightIata, flightDate });

  if (!flightIata) {
    return (
      <div className="text-[10px] text-ink-light italic px-1">
        💡 Trag Flugnummer in <code className="font-mono">london-2026.ts</code> ein
        (Feld <code className="font-mono">flightNumber</code>) für Live-Status.
      </div>
    );
  }

  if (!data && loading) {
    return (
      <div className="text-[10px] text-ink-light inline-flex items-center gap-1">
        <RefreshCw size={9} className="animate-spin" /> Lade Status…
      </div>
    );
  }

  if (!data) return null;

  // No API key configured → graceful fallback
  if (data.state === "no_key") {
    return (
      <FallbackLink
        message="Live-Status nicht konfiguriert"
        trackerUrl={data.trackerUrl}
      />
    );
  }

  if (data.state === "too_early") {
    return (
      <div className="text-[10px] text-ink-light bg-cream-100 rounded-md px-2 py-1 inline-flex items-center gap-1">
        <Clock size={10} /> Live-Status erst ~48h vor Abflug
        {data.trackerUrl && (
          <>
            {" · "}
            <a
              href={data.trackerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy underline"
            >
              Tracker
            </a>
          </>
        )}
      </div>
    );
  }

  if (data.error) {
    return (
      <FallbackLink message={data.error} trackerUrl={data.trackerUrl} />
    );
  }

  if (data.empty || !data.data) {
    return (
      <FallbackLink
        message="Keine Flugdaten gefunden"
        trackerUrl={data.trackerUrl}
      />
    );
  }

  const status = data.data.status;
  const delay = Math.max(
    data.data.departure?.delayMinutes ?? 0,
    data.data.arrival?.delayMinutes ?? 0,
  );

  const isProblem = status === "cancelled" || status === "diverted" || status === "incident";
  const isDelay = delay >= 15;

  const config = isProblem
    ? { bg: "bg-warning text-white", Icon: AlertTriangle }
    : isDelay
      ? { bg: "bg-gold/15 text-gold-600 border border-gold/30", Icon: Clock }
      : status === "landed"
        ? { bg: "bg-success/10 text-success border border-success/30", Icon: CheckCircle2 }
        : status === "active"
          ? { bg: "bg-info/10 text-info border border-info/30", Icon: Plane }
          : { bg: "bg-cream-100 text-ink-mid border border-cream-300", Icon: Clock };

  const Icon = config.Icon;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={classNames(
            "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-full px-2.5 py-1",
            config.bg,
          )}
        >
          <Icon size={11} />
          {STATUS_LABEL[status]}
          {isDelay && ` · +${delay} Min`}
        </span>
        <button
          type="button"
          onClick={refresh}
          className="text-ink-light hover:text-navy"
          aria-label="Aktualisieren"
        >
          <RefreshCw size={11} className={classNames(loading && "animate-spin")} />
        </button>
      </div>

      {(data.data.departure?.gate || data.data.departure?.terminal) && (
        <div className="text-[11px] text-ink-mid">
          <span className="font-semibold text-ink-dark">Abflug:</span>{" "}
          {data.data.departure.terminal && `Terminal ${data.data.departure.terminal}`}
          {data.data.departure.gate &&
            ` · Gate ${data.data.departure.gate}`}
        </div>
      )}

      {data.fetchedAt && (
        <div className="text-[10px] text-ink-light italic">
          Aktualisiert:{" "}
          {new Date(data.fetchedAt).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" · "}
          {data.trackerUrl && (
            <a
              href={data.trackerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy underline inline-flex items-center gap-1"
            >
              Flightradar <ExternalLink size={8} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function FallbackLink({
  message,
  trackerUrl,
}: {
  message: string;
  trackerUrl?: string;
}) {
  return (
    <div className="text-[10px] text-ink-light bg-cream-100 rounded-md px-2 py-1 inline-flex items-center gap-1.5">
      <span>{message}</span>
      {trackerUrl && (
        <a
          href={trackerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-navy underline inline-flex items-center gap-0.5"
        >
          Tracker <ExternalLink size={9} />
        </a>
      )}
    </div>
  );
}
