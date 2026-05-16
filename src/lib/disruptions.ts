import type { TransportDisruption } from "@/types/trip";

export interface DayDisruptionWindow {
  disruption: TransportDisruption;
  /** "00:00" or "12:00" */
  startTime: string;
  /** "23:59" or "11:59" */
  endTime: string;
  /** True if the disruption covers the entire day */
  fullDay: boolean;
  /** Human-readable: "12:00 – 23:59" or "ganztägig" */
  label: string;
}

/**
 * For a given day (YYYY-MM-DD), returns all active disruption windows.
 * Times are formatted in 24h based on the disruption's local timezone offset.
 */
export function getDisruptionsForDay(
  dayIso: string,
  disruptions: TransportDisruption[] | undefined,
): DayDisruptionWindow[] {
  if (!disruptions || disruptions.length === 0) return [];

  const dayStart = new Date(`${dayIso}T00:00:00`);
  const dayEnd = new Date(`${dayIso}T23:59:59`);
  const result: DayDisruptionWindow[] = [];

  for (const d of disruptions) {
    const start = new Date(d.startIso);
    const end = new Date(d.endIso);
    if (end <= dayStart) continue; // disruption already over before today
    if (start > dayEnd) continue; // disruption hasn't started yet

    const startsBeforeDay = start <= dayStart;
    const endsAfterDay = end > dayEnd;
    const startTime = startsBeforeDay ? "00:00" : formatHHMM(start);
    const endTime = endsAfterDay ? "23:59" : formatHHMM(end);
    const fullDay = startsBeforeDay && endsAfterDay;

    result.push({
      disruption: d,
      startTime,
      endTime,
      fullDay,
      label: fullDay ? "ganztägig" : `${startTime} – ${endTime} Uhr`,
    });
  }

  return result;
}

/**
 * Format Date to HH:MM in local time (no seconds).
 */
function formatHHMM(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Format an ISO timestamp into "Di 19.5. 12:00 Uhr"
 */
export function formatDisruptionTime(iso: string): string {
  const d = new Date(iso);
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const day = days[d.getDay()];
  const date = `${d.getDate()}.${d.getMonth() + 1}.`;
  const time = formatHHMM(d);
  return `${day} ${date} ${time} Uhr`;
}

/**
 * Check if a disruption is active right now (at the given moment).
 */
export function isDisruptionActiveAt(
  disruption: TransportDisruption,
  at: Date = new Date(),
): boolean {
  const start = new Date(disruption.startIso);
  const end = new Date(disruption.endIso);
  return at >= start && at < end;
}
