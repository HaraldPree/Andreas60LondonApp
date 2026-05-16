import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { GoldDivider } from "@/components/ui/GoldDivider";

interface HeaderProps {
  destination: string;
  subtitle?: string;
  occasion?: string;
  /** Slot for an identity widget on the right of the trip-title row */
  rightSlot?: ReactNode;
  /**
   * If set, the top-left of the brand bar becomes a clickable back link
   * to this URL (typically "/" to return to the trip list). Replaces the
   * static destination label that was there before — the destination is
   * already shown as the H1 below, so it was redundant.
   */
  backHref?: string;
  /** Label next to the back chevron. Defaults to "Reisen". */
  backLabel?: string;
}

export function Header({
  destination,
  subtitle,
  occasion,
  rightSlot,
  backHref,
  backLabel = "Reisen",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-navy text-cream shadow-lg">
      <div className="mx-auto max-w-app">
        {/* Brand bar – back link (or destination label) on left, app name on right */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-0.5 -ml-1 px-2 py-1 rounded-md text-cream/80 hover:text-cream hover:bg-white/10 active:bg-white/15 transition"
              aria-label={`Zurück zu ${backLabel}`}
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
              <span className="font-display text-[11px] tracking-[0.2em] text-gold font-semibold uppercase">
                {backLabel}
              </span>
            </Link>
          ) : (
            <span className="font-display text-[11px] tracking-[0.22em] text-gold font-semibold uppercase">
              {destination}
            </span>
          )}
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
