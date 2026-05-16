"use client";

import { AlertTriangle } from "lucide-react";
import type { DayDisruptionWindow } from "@/lib/disruptions";

interface DisruptionPillProps {
  windows: DayDisruptionWindow[];
}

export function DisruptionPill({ windows }: DisruptionPillProps) {
  if (windows.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {windows.map((w, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 bg-warning/15 text-warning border border-warning/30"
          title={w.disruption.description}
        >
          <AlertTriangle size={9} />
          {w.disruption.icon} {w.disruption.shortLabel}: {w.label}
        </span>
      ))}
    </div>
  );
}
