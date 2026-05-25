"use client";

/**
 * v1.13.2 — Trust-Status-Badge für Place + Event.
 *
 * Lastenheft 7.16: "Tipps erhalten Status: Vorgeschlagen, Recherchiert,
 * Aktuell geprüft, Vor Ort bestätigt, Reisegetestet, Native Pick."
 *
 * Aktuelle Implementierung: 4 Stufen abgeleitet aus `lastVerified`-Alter.
 * Spätere Erweiterung (Trust Network in Phase B+): Stufen wie
 * „reisegetestet" / „Native Pick" werden zusätzlich aus User-Status-Logs
 * abgeleitet.
 *
 * Sichtbarkeits-Polish: Anti-Halluzinations-Disziplin wird damit für den
 * User SICHTBAR — er sieht dass jede Info eine Quelle + Aktualität hat.
 * Das ist Polarsteps-Bench-mark-USP (Wettbewerbs-Recherche Mai 2026).
 */

import { CheckCircle2, AlertCircle } from "lucide-react";
import { classNames } from "@/lib/formatters";

export type TrustLevel = "fresh" | "recent" | "verified" | "stale";

export interface TrustInfo {
  level: TrustLevel;
  label: string;
  daysAgo: number;
  source: string;
}

/**
 * Leitet TrustLevel aus `lastVerified` (ISO YYYY-MM-DD) ab.
 * Stufen-Schwellen:
 *  - fresh:     ≤ 14 Tage
 *  - recent:    ≤ 60 Tage
 *  - verified:  ≤ 180 Tage
 *  - stale:     > 180 Tage
 */
export function deriveTrust(
  lastVerified: string | undefined,
  source: string | undefined,
): TrustInfo | null {
  if (!lastVerified) return null;

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(lastVerified);
  if (!m) return null;
  const verifiedDate = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
  );
  const now = new Date();
  const ms = now.getTime() - verifiedDate.getTime();
  const daysAgo = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));

  let level: TrustLevel;
  let label: string;
  if (daysAgo <= 14) {
    level = "fresh";
    label = "Frisch geprüft";
  } else if (daysAgo <= 60) {
    level = "recent";
    label = "Aktuell";
  } else if (daysAgo <= 180) {
    level = "verified";
    label = "Geprüft";
  } else {
    level = "stale";
    label = "Älter — bitte prüfen";
  }
  return { level, label, daysAgo, source: source ?? "" };
}

const LEVEL_STYLES: Record<TrustLevel, string> = {
  fresh: "bg-success/15 text-success border-success/30",
  recent: "bg-info/15 text-info border-info/30",
  verified: "bg-cream-200 text-ink-mid border-cream-300",
  stale: "bg-warning/15 text-warning border-warning/30",
};

interface TrustBadgeProps {
  /** ISO-Datum YYYY-MM-DD. */
  lastVerified: string | undefined;
  /** Source-Hinweis (z.B. „rhs.org.uk", „TripAdvisor"). */
  source: string | undefined;
  /** Kompakte oder verbose Variante. */
  size?: "xs" | "sm";
  /** Wenn true: zeigt zusätzlich „vor N Tagen". */
  showAge?: boolean;
}

/**
 * Kompakte Trust-Badge zum Inline-Anzeigen in Place- / Event-Cards.
 * Klick (über title-Tooltip) zeigt Quelle + Datum.
 */
export function TrustBadge({
  lastVerified,
  source,
  size = "xs",
  showAge = false,
}: TrustBadgeProps) {
  const trust = deriveTrust(lastVerified, source);
  if (!trust) return null;

  const Icon = trust.level === "stale" ? AlertCircle : CheckCircle2;
  const sizeClasses =
    size === "xs"
      ? "text-[10px] px-1.5 py-0.5 gap-1"
      : "text-[11px] px-2 py-0.5 gap-1";
  const iconSize = size === "xs" ? 9 : 11;

  const tooltipText = [
    trust.label,
    `Geprüft vor ${trust.daysAgo} ${trust.daysAgo === 1 ? "Tag" : "Tagen"}`,
    source ? `Quelle: ${source}` : null,
    `Stand: ${lastVerified}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border font-semibold",
        sizeClasses,
        LEVEL_STYLES[trust.level],
      )}
      title={tooltipText}
    >
      <Icon size={iconSize} strokeWidth={2.5} />
      <span>
        {trust.label}
        {showAge && (
          <span className="opacity-75 font-normal ml-1">
            · vor {trust.daysAgo}d
          </span>
        )}
      </span>
    </span>
  );
}
