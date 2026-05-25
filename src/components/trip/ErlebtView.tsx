"use client";

import { Compass, MapPin } from "lucide-react";
import type { Trip, Day } from "@/types/trip";
import {
  formatStopTimeRange,
  type ReconstructedStop,
} from "@/lib/tripReconstruction";
import { classNames } from "@/lib/formatters";
import { useBlobUrlState } from "@/hooks/useBlobUrl";
import { getThumbnailBlob } from "@/lib/photoStorage";

interface Props {
  trip: Trip;
  stopsByDay: Map<number, ReconstructedStop[]>;
  daysWithStops: number[];
  /** Map photo-ID → HTTP-Thumb-URL (für geteilte Fotos). */
  sharedThumbUrls: Record<string, string>;
  /** Heutiges Datum (ISO) — Tag wird visuell hervorgehoben. */
  todayIso: string;
}

/**
 * v1.14.0 — Rückblick-Ansicht des Programm-Tabs.
 *
 * Zeigt pro Tag (sofern Fotos vorhanden) eine Liste der tatsächlichen
 * Stops, rekonstruiert aus den Foto-EXIF-Daten (siehe
 * lib/tripReconstruction.ts). Komplett kostenlos — alle Auswertung läuft
 * client-side.
 *
 * Tage ohne Fotos werden übersprungen (kein leerer Platzhalter — der
 * User soll erkennen welche Tage er fotografisch dokumentiert hat).
 */
export function ErlebtView({
  trip,
  stopsByDay,
  daysWithStops,
  sharedThumbUrls,
  todayIso,
}: Props) {
  if (daysWithStops.length === 0) {
    return (
      <div className="rounded-2xl bg-cream-100 border border-cream-300 p-6 text-center">
        <Compass size={28} className="mx-auto text-ink-light mb-3" />
        <p className="font-display text-sm font-semibold text-ink-dark">
          Noch kein Rückblick möglich
        </p>
        <p className="text-xs text-ink-mid mt-2 leading-relaxed">
          Sobald Fotos mit Aufnahmezeit + GPS in der App sind (eigene
          oder geteilte), baut der Rückblick chronologisch zusammen, was
          an jedem Tag tatsächlich besucht wurde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trip.days.map((day, i) => {
        const stops = stopsByDay.get(i) ?? [];
        if (stops.length === 0) return null;
        return (
          <ErlebtDayCard
            key={day.date}
            day={day}
            dayNumber={i}
            stops={stops}
            sharedThumbUrls={sharedThumbUrls}
            highlight={day.isoDate === todayIso}
          />
        );
      })}

      <p className="text-[10px] text-center text-ink-light italic px-4 pt-1">
        Rekonstruiert aus Foto-EXIF (GPS + Zeitstempel). Stops mit
        bekanntem Ort sind benannt, Cluster ohne Match heißen
        „Stopp ohne…". Keine Daten verlassen euer Gerät.
      </p>
    </div>
  );
}

function ErlebtDayCard({
  day,
  dayNumber,
  stops,
  sharedThumbUrls,
  highlight,
}: {
  day: Day;
  dayNumber: number;
  stops: ReconstructedStop[];
  sharedThumbUrls: Record<string, string>;
  highlight: boolean;
}) {
  const matchedCount = stops.filter((s) => s.placeId).length;
  return (
    <div
      className={classNames(
        "rounded-2xl bg-white border overflow-hidden shadow-card",
        highlight
          ? "border-success/40 ring-1 ring-success/30"
          : "border-cream-200",
      )}
    >
      <div className="p-3 border-b border-cream-200 bg-cream-50/60 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
            Tag {dayNumber + 1} — Erlebt
          </p>
          <p className="font-display text-base font-semibold text-navy leading-tight">
            {day.date}
          </p>
          <p className="text-[11px] text-ink-mid mt-0.5 truncate">
            geplant: {day.title}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-ink-mid">
            {stops.length} {stops.length === 1 ? "Stop" : "Stops"}
          </p>
          <p className="text-[10px] text-success font-semibold">
            {matchedCount} erkannt
          </p>
        </div>
      </div>
      <ul className="divide-y divide-cream-100">
        {stops.map((stop) => (
          <ErlebtStopRow
            key={stop.id}
            stop={stop}
            sharedThumbUrls={sharedThumbUrls}
          />
        ))}
      </ul>
    </div>
  );
}

function ErlebtStopRow({
  stop,
  sharedThumbUrls,
}: {
  stop: ReconstructedStop;
  sharedThumbUrls: Record<string, string>;
}) {
  const isUnmatched = !stop.placeId;
  return (
    <li className="p-3 flex items-start gap-3">
      <span
        className={classNames(
          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg",
          isUnmatched ? "bg-cream-100 text-ink-light" : "bg-success/10",
        )}
      >
        {stop.placeIcon ?? (isUnmatched ? "📷" : "📍")}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={classNames(
            "text-sm font-semibold leading-tight",
            isUnmatched ? "text-ink-mid italic" : "text-ink-dark",
          )}
        >
          {stop.placeName}
        </p>
        <p className="text-[11px] text-ink-mid mt-0.5">
          {formatStopTimeRange(stop.startAt, stop.endAt)}
          {stop.matchDistanceM !== undefined && stop.placeId && (
            <span className="text-ink-light ml-1.5 inline-flex items-center gap-0.5">
              · <MapPin size={9} /> {Math.round(stop.matchDistanceM)} m
            </span>
          )}
          <span className="text-success ml-1.5">
            · {stop.photoIds.length}{" "}
            {stop.photoIds.length === 1 ? "Foto" : "Fotos"}
          </span>
        </p>

        {/* Thumbnail-Reihe — max 4 sichtbar, „+N" Hinweis bei mehr */}
        <StopThumbRow
          photoIds={stop.photoIds}
          sources={stop.photoSources}
          sharedThumbUrls={sharedThumbUrls}
        />
      </div>
    </li>
  );
}

function StopThumbRow({
  photoIds,
  sources,
  sharedThumbUrls,
}: {
  photoIds: string[];
  sources: Array<"own" | "shared">;
  sharedThumbUrls: Record<string, string>;
}) {
  const MAX = 4;
  const visible = photoIds.slice(0, MAX);
  const extra = photoIds.length - MAX;

  if (visible.length === 0) return null;

  return (
    <div className="mt-2 flex items-center gap-1">
      {visible.map((id, i) => (
        <StopThumb
          key={id}
          photoId={id}
          source={sources[i]}
          sharedUrl={sharedThumbUrls[id]}
        />
      ))}
      {extra > 0 && (
        <div className="w-12 h-12 rounded-md bg-cream-100 flex items-center justify-center text-[10px] font-bold text-ink-mid">
          +{extra}
        </div>
      )}
    </div>
  );
}

function StopThumb({
  photoId,
  source,
  sharedUrl,
}: {
  photoId: string;
  source: "own" | "shared";
  sharedUrl?: string;
}) {
  // Für eigene Fotos: IndexedDB-Blob via Hook laden + automatisch revoken.
  // Für shared: HTTP-URL direkt nutzen, Hook gibt sofort "missing" zurück
  //   (übergebene null), aber das ist ok weil wir die URL anders rendern.
  const ownBlobState = useBlobUrlState(
    source === "own" ? photoId : null,
    getThumbnailBlob,
  );

  const url =
    source === "shared"
      ? sharedUrl
      : ownBlobState.status === "ready"
        ? ownBlobState.url
        : undefined;

  if (!url) {
    return (
      <div className="w-12 h-12 rounded-md bg-cream-200 animate-pulse" />
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="w-12 h-12 rounded-md object-cover bg-cream-100"
      loading="lazy"
    />
  );
}
