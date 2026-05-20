"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Heart,
  Eye,
  Check,
  ListChecks,
  Filter,
  MessageCircle,
} from "lucide-react";
import { WunschPollShare } from "@/components/places/WunschPollShare";
import type { Trip } from "@/types/trip";
import type { Place, PlaceCategory, WeekDay } from "@/types/place";
import { CATEGORY_META } from "@/types/place";
import { PlaceCard } from "@/components/places/PlaceCard";
import { usePlaceStatus } from "@/hooks/usePlaceStatus";
import { classNames } from "@/lib/formatters";

interface WunschlisteTabProps {
  trip: Trip;
  currentUserName?: string | null;
}

type FilterMode = "all" | "wantToSee" | "passed" | "done";

const WEEKDAY_MAP: Record<number, WeekDay> = {
  0: "So",
  1: "Mo",
  2: "Di",
  3: "Mi",
  4: "Do",
  5: "Fr",
  6: "Sa",
};

function todayAsWeekday(): WeekDay {
  return WEEKDAY_MAP[new Date().getDay()];
}

/**
 * v1.7.0 — Wunschliste-Tab.
 *
 * Zeigt alle Places einer Reise in ausklappbaren Kategorien.
 * Pro Place 3 Status-Optionen (open / wantToSee / done).
 * Filter oben: alle / meine Liste / erledigt.
 * Stats-Header zeigt eigene Counter.
 *
 * Per-Gerät via localStorage. Gruppen-Sync kommt in v1.7.1.
 */
export function WunschlisteTab({
  trip,
  currentUserName,
}: WunschlisteTabProps) {
  const { statusOf, setStatus, stats } = usePlaceStatus(
    trip.slug,
    currentUserName ?? null,
  );

  const [filter, setFilter] = useState<FilterMode>("all");

  // Welche Kategorien standardmäßig offen sind: alle (kann pro User später
  // persistiert werden, für jetzt einfach immer offen beim ersten Render).
  const [collapsed, setCollapsed] = useState<Set<PlaceCategory>>(new Set());

  // v1.7.2 — WhatsApp-Poll-Share
  const [pollOpen, setPollOpen] = useState(false);

  const today = todayAsWeekday();

  const places = trip.places ?? [];

  // Filter anwenden
  const filteredPlaces = useMemo(() => {
    if (filter === "all") return places;
    return places.filter((p) => statusOf(p.id) === filter);
  }, [places, filter, statusOf]);

  // Nach Kategorie gruppieren — in Reihenfolge von CATEGORY_META
  const grouped = useMemo(() => {
    const map = new Map<PlaceCategory, Place[]>();
    for (const p of filteredPlaces) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return map;
  }, [filteredPlaces]);

  const totalCount = places.length;
  const myStats = stats();

  const toggleCollapse = (key: PlaceCategory) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <motion.div
      key="wunschliste"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="px-1">
        <h2 className="font-display text-xl font-semibold text-navy inline-flex items-center gap-2">
          <ListChecks size={20} className="text-gold-600" />
          Wunschliste
        </h2>
        <p className="text-xs text-ink-mid mt-0.5">
          {totalCount} kuratierte Sehenswürdigkeiten, Geheimtipps & Foodie-Spots
          in {trip.destination}.
        </p>
      </div>

      {/* Personal Stats */}
      {currentUserName ? (
        <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                Dein Stand · {currentUserName}
              </p>
              <div className="mt-1.5 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5 text-gold-600 font-semibold">
                  <Heart size={13} fill="currentColor" strokeWidth={0} />
                  {myStats.wantToSee}{" "}
                  <span className="text-ink-mid font-normal text-xs">
                    Wunsch
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-info font-semibold">
                  <Eye size={13} strokeWidth={2} />
                  {myStats.passed}{" "}
                  <span className="text-ink-mid font-normal text-xs">
                    vorbei
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-success font-semibold">
                  <Check size={13} strokeWidth={3} />
                  {myStats.done}{" "}
                  <span className="text-ink-mid font-normal text-xs">
                    erledigt
                  </span>
                </span>
              </div>
            </div>
            {/* v1.7.3 — Gruppen-Poll-Button (immer sichtbar, mit Hint
                wenn 0 Wünsche → klar wo das Feature ist) */}
            <button
              type="button"
              onClick={() => setPollOpen(true)}
              className={classNames(
                "flex-shrink-0 inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg text-[11px] font-semibold transition",
                myStats.wantToSee > 0
                  ? "bg-success/15 text-success hover:bg-success/25"
                  : "bg-cream-100 text-ink-light hover:bg-cream-200",
              )}
              aria-label="Gruppen-Poll teilen"
            >
              <MessageCircle size={12} />
              Poll teilen
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-info/5 border border-info/30 px-4 py-3">
          <p className="text-xs text-info font-semibold">
            Wähle oben rechts deinen Avatar
          </p>
          <p className="text-[11px] text-ink-mid mt-1 leading-relaxed">
            Markierungen werden pro Person gespeichert — wähle aus, wer du
            bist, damit dein Status erhalten bleibt.
          </p>
        </div>
      )}

      {/* Filter-Pills */}
      <div className="flex flex-wrap gap-1.5 px-1">
        {(
          [
            { key: "all", label: "Alle", count: totalCount },
            { key: "wantToSee", label: "💭 Wunsch", count: myStats.wantToSee },
            { key: "passed", label: "👁 Vorbei", count: myStats.passed },
            { key: "done", label: "✓ Erledigt", count: myStats.done },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setFilter(opt.key)}
            className={classNames(
              "flex-1 min-w-[72px] inline-flex items-center justify-center gap-1 px-2 py-2 min-h-[40px] rounded-lg text-[11px] font-semibold transition",
              filter === opt.key
                ? "bg-navy text-cream shadow-sm"
                : "bg-cream-100 text-ink-mid hover:bg-cream-200",
            )}
          >
            {opt.label}
            <span
              className={classNames(
                "ml-0.5 px-1.5 rounded-full text-[10px] font-mono",
                filter === opt.key
                  ? "bg-cream/20 text-cream"
                  : "bg-cream-200 text-ink-light",
              )}
            >
              {opt.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty-State falls Filter nichts liefert */}
      {filteredPlaces.length === 0 && (
        <div className="rounded-2xl bg-white border border-cream-200 p-6 text-center">
          <p className="text-sm font-semibold text-ink-dark">
            {filter === "wantToSee"
              ? "Noch kein Place auf deiner Wunschliste"
              : filter === "passed"
                ? "Noch nichts als 'vorbei' markiert"
                : filter === "done"
                  ? "Noch nichts als erledigt markiert"
                  : "Keine Places vorhanden"}
          </p>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-2 text-xs text-navy hover:text-gold transition font-medium"
            >
              Alle Places anzeigen
            </button>
          )}
        </div>
      )}

      {/* Kategorien — in Reihenfolge von CATEGORY_META, leere überspringen */}
      <div className="space-y-3">
        {CATEGORY_META.map((cat) => {
          const items = grouped.get(cat.key);
          if (!items || items.length === 0) return null;
          const isCollapsed = collapsed.has(cat.key);

          // Pro-Kategorie Counter (basierend auf dem ungefilterten Set,
          // um auch im Filter-Modus die Gesamtzahl zu zeigen)
          const categoryAllItems = places.filter((p) => p.category === cat.key);
          const categoryDone = categoryAllItems.filter(
            (p) => statusOf(p.id) === "done",
          ).length;
          const categoryPassed = categoryAllItems.filter(
            (p) => statusOf(p.id) === "passed",
          ).length;
          const categoryWant = categoryAllItems.filter(
            (p) => statusOf(p.id) === "wantToSee",
          ).length;

          return (
            <div
              key={cat.key}
              className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleCollapse(cat.key)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-cream-50 transition"
              >
                <span className="text-xl flex-shrink-0">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-semibold text-navy">
                    {cat.label}
                  </p>
                  <p className="text-[11px] text-ink-mid mt-0.5">
                    {cat.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono text-ink-light">
                    {filter === "all"
                      ? `${items.length}`
                      : `${items.length}/${categoryAllItems.length}`}
                  </span>
                  {categoryWant > 0 && (
                    <span className="text-[10px] text-gold-600 inline-flex items-center gap-0.5 font-mono">
                      <Heart size={9} fill="currentColor" strokeWidth={0} />
                      {categoryWant}
                    </span>
                  )}
                  {categoryPassed > 0 && (
                    <span className="text-[10px] text-info inline-flex items-center gap-0.5 font-mono">
                      <Eye size={9} strokeWidth={2} />
                      {categoryPassed}
                    </span>
                  )}
                  {categoryDone > 0 && (
                    <span className="text-[10px] text-success inline-flex items-center gap-0.5 font-mono">
                      <Check size={9} strokeWidth={3} />
                      {categoryDone}
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={classNames(
                      "text-ink-light transition-transform",
                      isCollapsed && "rotate-[-90deg]",
                    )}
                  />
                </div>
              </button>

              {!isCollapsed && (
                <div className="px-3 pb-3 pt-1 space-y-2 border-t border-cream-100">
                  {items.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      status={statusOf(place.id)}
                      onSetStatus={(next) => setStatus(place.id, next)}
                      currentWeekday={today}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer-Hinweis */}
      <p className="text-[10px] text-center text-ink-light italic px-4 pt-2 leading-relaxed">
        Diese Markierungen werden auf diesem Gerät gespeichert. Echter
        Gruppen-Sync kommt in v1.7.x — bis dahin Poll-Button oben nutzen
        um deine Wünsche per WhatsApp abzustimmen.
      </p>

      {/* v1.7.2 — Gruppen-Poll-Share-Sheet */}
      {currentUserName && (
        <WunschPollShare
          open={pollOpen}
          places={places}
          statusOf={statusOf}
          authorName={currentUserName}
          destination={trip.destination}
          onClose={() => setPollOpen(false)}
        />
      )}
    </motion.div>
  );
}
