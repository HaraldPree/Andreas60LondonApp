import type { ReactNode } from "react";
import { GoldDivider } from "@/components/ui/GoldDivider";

interface HeaderProps {
  destination: string;
  subtitle?: string;
  occasion?: string;
  /** Slot for an identity widget on the right of the trip-title row */
  rightSlot?: ReactNode;
}

export function Header({ destination, subtitle, occasion, rightSlot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-navy text-cream shadow-lg">
      <div className="mx-auto max-w-app">
        {/* Brand bar – destination is the headline */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <span className="font-display text-[11px] tracking-[0.22em] text-gold font-semibold uppercase">
            {destination}
          </span>
          <span className="text-[10px] text-cream/70 tracking-wider uppercase">
            Travel Companion
          </span>
        </div>
        <GoldDivider width="full" className="opacity-90 h-[1px]" />
        {/* Trip title with optional right-slot */}
        <div className="px-4 pt-3 pb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl leading-tight">
              {destination}
              {occasion && (
                <span className="ml-2 text-base align-middle">{occasion}</span>
              )}
            </h1>
            {subtitle && (
              <p className="text-sm text-cream/85 mt-0.5">{subtitle}</p>
            )}
          </div>
          {rightSlot && <div className="flex-shrink-0 mt-1">{rightSlot}</div>}
        </div>
      </div>
    </header>
  );
}
