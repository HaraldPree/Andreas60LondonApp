"use client";

import { Calendar, Plane, MapPin, CheckCircle2 } from "lucide-react";
import type { CountdownState } from "@/hooks/useCountdown";
import { classNames } from "@/lib/formatters";

interface CountdownBadgeProps {
  state: CountdownState | null;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export function CountdownBadge({
  state,
  variant = "dark",
  size = "md",
}: CountdownBadgeProps) {
  if (!state) return null;

  const Icon =
    state.phase === "before"
      ? Plane
      : state.phase === "during"
        ? MapPin
        : CheckCircle2;

  const isLastChance =
    state.phase === "before" && state.daysUntil <= 1;

  const baseCls =
    variant === "dark"
      ? "bg-white/15 text-cream border-white/25"
      : "bg-navy/10 text-navy border-navy/20";

  const accent =
    state.phase === "during"
      ? "bg-success/20 text-success border-success/40"
      : isLastChance
        ? "bg-gold/20 text-gold border-gold/40"
        : baseCls;

  const sizeCls =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1"
      : size === "lg"
        ? "text-sm px-3.5 py-1.5 gap-2"
        : "text-[11px] px-2.5 py-1 gap-1.5";

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border font-semibold uppercase tracking-wider",
        accent,
        sizeCls,
      )}
    >
      <Icon size={size === "lg" ? 13 : 11} />
      {state.label}
    </span>
  );
}

/** Compact "X days" pill used as overlay on cards */
export function CountdownChip({ state }: { state: CountdownState | null }) {
  if (!state) return null;
  const isLastChance =
    state.phase === "before" && state.daysUntil <= 1;
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm",
        state.phase === "during"
          ? "bg-success text-white"
          : isLastChance
            ? "bg-gold text-navy"
            : state.phase === "after"
              ? "bg-ink-light/80 text-white"
              : "bg-white/90 text-navy",
      )}
    >
      <Calendar size={9} />
      {state.label}
    </span>
  );
}
