"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PACKING,
  WEATHER_PACKING,
  type PackingCategory,
  type PackingItem,
} from "@/lib/packingDefaults";
import type { DailyForecast } from "@/lib/weather";

interface UsePackingListOptions {
  tripSlug: string;
  userName?: string | null;
  forecast?: DailyForecast[];
}

function checkedKey(tripSlug: string, userName: string) {
  return `rcmk:packing-checked:${tripSlug}:${userName}`;
}

function customKey(tripSlug: string, userName: string) {
  return `rcmk:packing-custom:${tripSlug}:${userName}`;
}

const SUNNY_CODES = new Set([0, 1, 2]); // open-meteo: Klar / Überwiegend klar / Teilweise bewölkt

export function usePackingList({
  tripSlug,
  userName,
  forecast,
}: UsePackingListOptions) {
  const scope = userName || "anon";
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<PackingItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = window.localStorage.getItem(checkedKey(tripSlug, scope));
      setChecked(c ? new Set(JSON.parse(c)) : new Set());
      const u = window.localStorage.getItem(customKey(tripSlug, scope));
      setCustom(u ? (JSON.parse(u) as PackingItem[]) : []);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [tripSlug, scope]);

  const weatherItems = useMemo(() => {
    if (!forecast || forecast.length === 0) return [];
    return WEATHER_PACKING.filter((item) => {
      if (!item.weatherRule) return false;
      const r = item.weatherRule;
      if (r.type === "rain_above") {
        return forecast.some((d) => d.precipitationProbability >= r.threshold);
      }
      if (r.type === "max_temp_above") {
        return forecast.some((d) => d.tempMax >= r.threshold);
      }
      if (r.type === "min_temp_below") {
        return forecast.some((d) => d.tempMin <= r.threshold);
      }
      if (r.type === "sunny_days_at_least") {
        const sunnyDays = forecast.filter((d) => SUNNY_CODES.has(d.weatherCode)).length;
        return sunnyDays >= r.threshold;
      }
      return false;
    }).map((item) => {
      // Add a hint about WHY this is recommended
      let hint: string | undefined;
      const r = item.weatherRule!;
      if (r.type === "rain_above") {
        const peakDay = forecast.reduce(
          (a, b) => (a.precipitationProbability > b.precipitationProbability ? a : b),
        );
        hint = `Wegen Regen (${peakDay.precipitationProbability}% am ${formatDay(peakDay.date)})`;
      } else if (r.type === "min_temp_below") {
        const coldest = forecast.reduce((a, b) => (a.tempMin < b.tempMin ? a : b));
        hint = `Kälteste Nacht: ${coldest.tempMin}°C (${formatDay(coldest.date)})`;
      } else if (r.type === "max_temp_above") {
        const warmest = forecast.reduce((a, b) => (a.tempMax > b.tempMax ? a : b));
        hint = `Wärmster Tag: ${warmest.tempMax}°C (${formatDay(warmest.date)})`;
      } else if (r.type === "sunny_days_at_least") {
        hint = "Mehrere sonnige Tage erwartet";
      }
      return { ...item, hint };
    });
  }, [forecast]);

  const allItems = useMemo(() => {
    const merged = [...DEFAULT_PACKING, ...weatherItems, ...custom];
    return merged;
  }, [weatherItems, custom]);

  const byCategory = useMemo(() => {
    const map = new Map<PackingCategory, PackingItem[]>();
    for (const item of allItems) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return map;
  }, [allItems]);

  const stats = useMemo(() => {
    const total = allItems.length;
    const done = allItems.filter((i) => checked.has(i.id)).length;
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [allItems, checked]);

  const persistChecked = useCallback(
    (next: Set<string>) => {
      try {
        window.localStorage.setItem(
          checkedKey(tripSlug, scope),
          JSON.stringify(Array.from(next)),
        );
      } catch {
        // ignore
      }
    },
    [tripSlug, scope],
  );

  const persistCustom = useCallback(
    (next: PackingItem[]) => {
      try {
        window.localStorage.setItem(
          customKey(tripSlug, scope),
          JSON.stringify(next),
        );
      } catch {
        // ignore
      }
    },
    [tripSlug, scope],
  );

  const toggle = useCallback(
    (id: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        persistChecked(next);
        return next;
      });
    },
    [persistChecked],
  );

  const addItem = useCallback(
    (label: string, category: PackingCategory) => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: PackingItem = { id, label, category, custom: true };
      setCustom((prev) => {
        const next = [...prev, item];
        persistCustom(next);
        return next;
      });
    },
    [persistCustom],
  );

  const removeItem = useCallback(
    (id: string) => {
      setCustom((prev) => {
        const next = prev.filter((i) => i.id !== id);
        persistCustom(next);
        return next;
      });
      // Also clear checked state
      setChecked((prev) => {
        const next = new Set(prev);
        next.delete(id);
        persistChecked(next);
        return next;
      });
    },
    [persistCustom, persistChecked],
  );

  const resetAll = useCallback(() => {
    setChecked(new Set());
    persistChecked(new Set());
  }, [persistChecked]);

  return {
    allItems,
    byCategory,
    weatherItems,
    custom,
    checked,
    stats,
    hydrated,
    toggle,
    addItem,
    removeItem,
    resetAll,
  };
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return `${days[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
}
