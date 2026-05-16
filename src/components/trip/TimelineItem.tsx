"use client";

import { ExternalLink } from "lucide-react";
import type { ProgramItem } from "@/types/trip";
import { classNames, mapsUrl } from "@/lib/formatters";
import { TransportButtons } from "@/components/ui/TransportButtons";

interface TimelineItemProps {
  item: ProgramItem;
  isLast?: boolean;
}

const TYPE_COLORS: Record<ProgramItem["type"], string> = {
  flight: "bg-info/15 text-info",
  activity: "bg-navy/10 text-navy",
  food: "bg-gold/15 text-gold-600",
  accom: "bg-success/10 text-success",
  alternative: "bg-ink-light/15 text-ink-mid",
  transport: "bg-info/10 text-info",
  free: "bg-cream-200 text-ink-mid",
};

export function TimelineItem({ item, isLast = false }: TimelineItemProps) {
  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div
        className={classNames(
          "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-sm",
          TYPE_COLORS[item.type],
          item.highlight && "ring-2 ring-gold ring-offset-2 ring-offset-white",
        )}
      >
        {item.icon}
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-3 top-7 bottom-[-12px] w-px bg-cream-300" />
      )}

      <div className="pb-4">
        <p className="text-[11px] font-mono uppercase tracking-wider text-ink-light">
          {item.time}
        </p>
        <p
          className={classNames(
            "text-sm leading-snug mt-0.5",
            item.highlight ? "font-semibold text-navy" : "text-ink-dark",
          )}
        >
          {item.label}
        </p>
        {item.note && (
          <p className="text-xs text-ink-mid mt-1 leading-relaxed">{item.note}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {item.coordinates && (
            <>
              <a
                href={mapsUrl(item.coordinates.lat, item.coordinates.lng, item.label)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-navy hover:text-gold transition-colors font-medium inline-flex items-center gap-1"
              >
                📍 Karte
              </a>
              <TransportButtons coordinates={item.coordinates} label={item.label} compact />
            </>
          )}
          {item.bookingUrl && (
            <a
              href={item.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-navy hover:text-gold transition-colors font-medium inline-flex items-center gap-1"
            >
              <ExternalLink size={11} /> Buchen
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
