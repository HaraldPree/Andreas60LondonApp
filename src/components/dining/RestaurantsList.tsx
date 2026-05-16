"use client";

import { useMemo, useState } from "react";
import {
  Utensils,
  ChevronDown,
  Phone,
  ExternalLink,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Restaurant } from "@/types/restaurant";
import type { Trip } from "@/types/trip";
import { mapsUrl, classNames } from "@/lib/formatters";
import { TransportButtons } from "@/components/ui/TransportButtons";

interface RestaurantsListProps {
  trip: Trip;
}

const PRICE_LABEL: Record<number, string> = {
  1: "£",
  2: "££",
  3: "£££",
  4: "££££",
};

export function RestaurantsList({ trip }: RestaurantsListProps) {
  const restaurants = trip.restaurants ?? [];
  const [expanded, setExpanded] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState<string | "all">("all");
  const [priceFilter, setPriceFilter] = useState<number | "all">("all");

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => set.add(r.cuisine));
    return Array.from(set).sort();
  }, [restaurants]);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (cuisineFilter !== "all" && r.cuisine !== cuisineFilter) return false;
      if (priceFilter !== "all" && r.priceLevel !== priceFilter) return false;
      return true;
    });
  }, [restaurants, cuisineFilter, priceFilter]);

  const byArea = useMemo(() => {
    const map = new Map<string, Restaurant[]>();
    for (const r of filtered) {
      const arr = map.get(r.area) ?? [];
      arr.push(r);
      map.set(r.area, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (restaurants.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
          <Utensils size={18} className="text-gold-600" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-display text-base font-semibold text-navy">
            Restaurant-Empfehlungen
          </h3>
          <p className="text-[11px] text-ink-mid">
            {restaurants.length} kuratierte Spots · Booking via TheFork wenn
            möglich
          </p>
        </div>
        <ChevronDown
          size={18}
          className={classNames(
            "text-ink-light transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-cream-200 p-4 space-y-3">
              {/* Filters */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Filter size={11} className="text-ink-light" />
                  <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                    Cuisine
                  </span>
                </div>
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                  <FilterChip
                    label="Alle"
                    active={cuisineFilter === "all"}
                    onClick={() => setCuisineFilter("all")}
                  />
                  {cuisines.map((c) => (
                    <FilterChip
                      key={c}
                      label={c}
                      active={cuisineFilter === c}
                      onClick={() => setCuisineFilter(c)}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                    Preis
                  </span>
                </div>
                <div className="flex gap-1">
                  <FilterChip
                    label="Alle"
                    active={priceFilter === "all"}
                    onClick={() => setPriceFilter("all")}
                  />
                  {[1, 2, 3, 4].map((p) => (
                    <FilterChip
                      key={p}
                      label={PRICE_LABEL[p]}
                      active={priceFilter === p}
                      onClick={() => setPriceFilter(p)}
                    />
                  ))}
                </div>
              </div>

              {filtered.length === 0 && (
                <p className="text-xs text-ink-mid italic text-center py-3">
                  Keine Restaurants matchen den Filter.
                </p>
              )}

              {byArea.map(([area, items]) => (
                <div key={area}>
                  <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-1.5 px-1">
                    {area}
                  </p>
                  <ul className="space-y-2">
                    {items.map((r) => (
                      <RestaurantCard key={r.id} restaurant={r} />
                    ))}
                  </ul>
                </div>
              ))}

              <p className="text-[10px] text-ink-light italic text-center pt-2">
                💡 Frag den KI-Companion: &quot;Wo essen wir heute?&quot; – er
                kennt diese Liste.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <li className="rounded-xl bg-cream-50 border border-cream-200 overflow-hidden">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-semibold text-navy leading-tight">
              {r.name}
            </p>
            <p className="text-[11px] text-ink-mid">{r.cuisine}</p>
          </div>
          <span className="text-[10px] font-mono font-semibold text-gold-600 bg-gold/10 px-1.5 py-0.5 rounded">
            {PRICE_LABEL[r.priceLevel]}
          </span>
        </div>

        {r.description && (
          <p className="text-xs text-ink-dark leading-relaxed mb-1">
            {r.description}
          </p>
        )}

        {r.note && (
          <p className="text-[11px] text-ink-mid italic mb-2">💡 {r.note}</p>
        )}

        <p className="text-[10px] text-ink-light">{r.address}</p>

        {/* Actions */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {r.bookingUrl && (
            <a
              href={r.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] px-2 py-1 rounded-md bg-gold/15 text-gold-600 font-semibold inline-flex items-center gap-1 hover:bg-gold/25 transition"
            >
              <ExternalLink size={10} />
              {r.bookingPlatform === "thefork"
                ? "TheFork"
                : r.bookingPlatform === "opentable"
                  ? "OpenTable"
                  : r.bookingPlatform === "walkin"
                    ? "Website"
                    : "Buchen"}
            </a>
          )}
          {r.phone && (
            <a
              href={`tel:${r.phone}`}
              className="text-[11px] px-2 py-1 rounded-md bg-navy/10 text-navy font-medium inline-flex items-center gap-1 hover:bg-navy/15 transition"
            >
              <Phone size={10} /> Anrufen
            </a>
          )}
          <a
            href={mapsUrl(r.coordinates.lat, r.coordinates.lng, r.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] px-2 py-1 rounded-md bg-navy/10 text-navy font-medium inline-flex items-center gap-1 hover:bg-navy/15 transition"
          >
            📍 Karte
          </a>
          <TransportButtons coordinates={r.coordinates} label={r.name} compact />
        </div>
      </div>
    </li>
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
        "flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition",
        active
          ? "bg-navy text-cream"
          : "bg-cream-200 text-ink-mid hover:bg-cream-300",
      )}
    >
      {label}
    </button>
  );
}
