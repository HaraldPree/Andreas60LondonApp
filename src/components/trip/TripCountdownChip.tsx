"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { CountdownChip } from "./CountdownBadge";

/**
 * Client-side wrapper that computes the countdown and renders a chip.
 * Use in server components (Landing) where we can't call hooks directly.
 */
export function TripCountdownChip({
  startIso,
  endIso,
}: {
  startIso?: string;
  endIso?: string;
}) {
  const state = useCountdown(startIso, endIso);
  return <CountdownChip state={state} />;
}
