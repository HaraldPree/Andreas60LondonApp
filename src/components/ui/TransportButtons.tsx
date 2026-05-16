"use client";

import { useState } from "react";
import {
  Navigation,
  Car,
  ChevronDown,
  Footprints,
  Bus,
  ExternalLink,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Coordinates } from "@/types/trip";
import {
  googleDirectionsTransit,
  googleDirectionsWalking,
  uberDeepLink,
  appleMapsDirections,
} from "@/lib/transportLinks";
import { classNames } from "@/lib/formatters";

interface TransportButtonsProps {
  coordinates: Coordinates;
  label?: string;
  compact?: boolean;
}

export function TransportButtons({
  coordinates,
  label,
  compact = false,
}: TransportButtonsProps) {
  const [open, setOpen] = useState(false);

  const ButtonClass = compact
    ? "text-[11px] px-2 py-1 rounded-md"
    : "text-xs px-2.5 py-1.5 rounded-lg";

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={classNames(
          ButtonClass,
          "bg-navy/5 text-navy font-medium inline-flex items-center gap-1 hover:bg-navy/10 transition",
        )}
        aria-label="Anfahrt-Optionen"
      >
        <Navigation size={compact ? 11 : 12} />
        Anfahrt
        <ChevronDown
          size={10}
          className={classNames(
            "transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden mt-1"
          >
            <div className="grid grid-cols-2 gap-1.5 p-2 bg-white rounded-lg border border-cream-200 shadow-card max-w-[260px]">
              <ActionLink
                href={googleDirectionsTransit(coordinates, label)}
                icon={<Bus size={12} />}
                label="ÖPNV"
                hint="Google Maps"
              />
              <ActionLink
                href={googleDirectionsWalking(coordinates, label)}
                icon={<Footprints size={12} />}
                label="Zu Fuß"
                hint="Google Maps"
              />
              <ActionLink
                href={uberDeepLink(coordinates, label)}
                icon={<Car size={12} />}
                label="Uber"
                hint="App / Web"
              />
              <ActionLink
                href={appleMapsDirections(coordinates, label)}
                icon={<Navigation size={12} />}
                label="Apple Maps"
                hint="ÖPNV"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionLink({
  href,
  icon,
  label,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-cream-50 transition text-left"
    >
      <span className="text-navy">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-ink-dark leading-tight">
          {label}
        </p>
        <p className="text-[9px] text-ink-light leading-tight">{hint}</p>
      </div>
      <ExternalLink size={9} className="text-ink-light flex-shrink-0" />
    </a>
  );
}
