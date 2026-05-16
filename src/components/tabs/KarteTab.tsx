"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Filter, ExternalLink, Navigation, LocateFixed, X } from "lucide-react";
import type { Trip, MapPoint, MapPointCategory } from "@/types/trip";
import { mapsUrl, classNames } from "@/lib/formatters";
import { useGeolocation, distanceMeters, formatDistance } from "@/hooks/useGeolocation";

interface KarteTabProps {
  trip: Trip;
}

const CATEGORY_LABELS: Record<MapPointCategory, string> = {
  sight: "Sehenswürdigkeit",
  food: "Essen & Trinken",
  transport: "Transport",
  accommodation: "Unterkunft",
  hidden: "Hidden Place",
};

const CATEGORY_COLORS: Record<MapPointCategory, string> = {
  sight: "bg-navy/10 text-navy",
  food: "bg-gold/15 text-gold-600",
  transport: "bg-info/10 text-info",
  accommodation: "bg-success/10 text-success",
  hidden: "bg-warning/10 text-warning",
};

type FilterKey = "all" | number | "hidden" | "nearby";

export function KarteTab({ trip }: KarteTabProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const geo = useGeolocation();

  // Collect all points from days + hidden places + accommodation
  const allPoints = useMemo(() => {
    const points: Array<MapPoint & { dayIdx?: number }> = [];

    // Always include accommodation as the canonical "Home" entry
    points.push({
      name: trip.accommodation.name,
      coordinates: trip.accommodation.coordinates,
      category: "accommodation",
      icon: "🏠",
    });

    trip.days.forEach((day, i) => {
      day.mapPoints.forEach((p) => {
        // Defensive: don't re-add accommodation if it accidentally appears
        // in a day's mapPoints (would show as duplicate marker).
        if (p.category === "accommodation") return;
        points.push({ ...p, dayIdx: i });
      });
    });

    trip.hiddenPlaces.forEach((p) =>
      points.push({
        name: p.name,
        coordinates: p.coordinates,
        category: "hidden",
        icon: p.icon,
      }),
    );

    // Final dedup safety net: collapse duplicates by name+coords (keep first occurrence)
    const seen = new Set<string>();
    return points.filter((p) => {
      const key = `${p.name}|${p.coordinates.lat.toFixed(4)},${p.coordinates.lng.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [trip]);

  const filtered = useMemo(() => {
    if (filter === "nearby" && geo.coords) {
      return [...allPoints]
        .map((p) => ({
          ...p,
          _distance: distanceMeters(geo.coords!, p.coordinates),
        }))
        .sort((a, b) => a._distance - b._distance)
        .slice(0, 12);
    }
    if (filter === "all") return allPoints;
    if (filter === "hidden") return allPoints.filter((p) => p.category === "hidden");
    return allPoints.filter(
      (p) => p.dayIdx === filter || p.category === "accommodation",
    );
  }, [allPoints, filter, geo.coords]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<MapPointCategory, typeof filtered>();
    filtered.forEach((p) => {
      const arr = groups.get(p.category) ?? [];
      arr.push(p);
      groups.set(p.category, arr);
    });
    return groups;
  }, [filtered]);

  return (
    <motion.div
      key="karte"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Open big map link */}
      <a
        href={`https://www.openstreetmap.org/?mlat=${trip.mapCenter.lat}&mlon=${trip.mapCenter.lng}&zoom=${trip.mapZoom}#map=${trip.mapZoom}/${trip.mapCenter.lat}/${trip.mapCenter.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl bg-gradient-to-br from-info to-navy text-cream p-5 shadow-card relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="white" fill="none" stroke-width="0.5"/></svg>')`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <MapPin size={36} strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider opacity-75">Karte</p>
            <h3 className="font-display text-xl font-semibold leading-tight">
              {trip.destination} auf OpenStreetMap
            </h3>
            <p className="text-xs opacity-85 mt-1 inline-flex items-center gap-1">
              In großer Karte öffnen <ExternalLink size={11} />
            </p>
          </div>
        </div>
      </a>

      {/* Geolocation */}
      <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-3">
        {!geo.coords && (
          <button
            type="button"
            onClick={() => {
              geo.request();
              setFilter("nearby");
            }}
            disabled={geo.loading || geo.permission === "unsupported"}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 text-gold-600 hover:bg-gold/20 font-semibold text-sm transition disabled:opacity-50"
          >
            <LocateFixed size={16} className={classNames(geo.loading && "animate-pulse")} />
            {geo.loading ? "Suche Standort…" : "Wo bin ich? Zeige nächste POIs"}
          </button>
        )}
        {geo.coords && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center">
                <Navigation size={16} className="text-success" />
              </div>
              <div>
                <p className="text-xs font-semibold text-success">Standort erfasst</p>
                <p className="text-[10px] text-ink-light font-mono">
                  {geo.coords.lat.toFixed(4)}, {geo.coords.lng.toFixed(4)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={geo.clear}
              className="w-8 h-8 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-light"
              aria-label="Standort löschen"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {geo.error && (
          <p className="text-[11px] text-warning mt-2 text-center">{geo.error}</p>
        )}
      </div>

      {/* Filter chips */}
      <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Filter size={12} className="text-ink-light" />
          <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
            Filter
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          <FilterChip
            label="Alle"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {geo.coords && (
            <FilterChip
              label="In der Nähe"
              active={filter === "nearby"}
              onClick={() => setFilter("nearby")}
            />
          )}
          {trip.days.map((day, i) => (
            <FilterChip
              key={i}
              label={`Tag ${i + 1}`}
              active={filter === i}
              onClick={() => setFilter(i)}
            />
          ))}
          <FilterChip
            label="Hidden"
            active={filter === "hidden"}
            onClick={() => setFilter("hidden")}
          />
        </div>
      </div>

      {/* List grouped by category */}
      <div className="space-y-3">
        {Array.from(groupedByCategory.entries()).map(([category, points]) => (
          <div
            key={category}
            className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4"
          >
            <h3 className="font-display text-base font-semibold text-navy mb-2.5">
              {CATEGORY_LABELS[category]}
            </h3>
            <ul className="space-y-1.5">
              {points.map((p, i) => {
                const distance = geo.coords
                  ? distanceMeters(geo.coords, p.coordinates)
                  : null;
                return (
                  <li key={`${p.name}-${i}`}>
                    <a
                      href={mapsUrl(p.coordinates.lat, p.coordinates.lng, p.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-50 transition group"
                    >
                      <span
                        className={classNames(
                          "w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0",
                          CATEGORY_COLORS[category],
                        )}
                      >
                        {p.icon ?? "📍"}
                      </span>
                      <span className="flex-1 text-sm text-ink-dark font-medium leading-tight">
                        {p.name}
                        {distance !== null && (
                          <span className="block text-[10px] text-ink-light font-normal mt-0.5">
                            {formatDistance(distance)} entfernt
                          </span>
                        )}
                      </span>
                      <ExternalLink
                        size={14}
                        className="text-ink-light group-hover:text-navy transition"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-center text-ink-light italic px-4">
        Interaktive Karte (Leaflet/OpenStreetMap) folgt in Phase 2.
      </p>
    </motion.div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition",
        active
          ? "bg-navy text-cream"
          : "bg-cream-200 text-ink-mid hover:bg-cream-300",
      )}
    >
      {label}
    </button>
  );
}
