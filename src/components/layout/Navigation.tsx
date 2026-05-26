"use client";

import { Compass, Sparkles, Heart, LifeBuoy, Info } from "lucide-react";
import { classNames } from "@/lib/formatters";

/**
 * v1.17.0 — Drei-Phasen-Navigation (Apple-Way).
 *
 * Statt der bisherigen 7 funktionalen Tabs (Programm, Wünsche, Karte,
 * Fotos, Reservierungen, SOS, Info) jetzt 5 nach mentaler Reise-Phase
 * gruppiert:
 *
 *  Planen   — Wünsche + Karte + Reservierungen (Vorbereitung / Vor Ort)
 *  Erleben  — Tages-Programm (während der Reise wichtigster Tab)
 *  Erinnern — Reel + Feedback + Erlebt-Rückblick + Foto-Galerie
 *  SOS      — Notfall (immer)
 *  Info     — Apartment, Flüge, Phrasebook, Currency, Ausgaben (immer)
 *
 * Alte Tab-Keys werden in TripPageClient migriert (siehe migrateTabKey),
 * damit User mit localStorage-Wert „programm" automatisch auf „erleben"
 * landen.
 */
export type TabKey = "planen" | "erleben" | "erinnern" | "sos" | "info";

interface NavigationProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; Icon: typeof Compass }[] = [
  { key: "planen", label: "Planen", Icon: Compass },
  { key: "erleben", label: "Erleben", Icon: Sparkles },
  { key: "erinnern", label: "Erinnern", Icon: Heart },
  { key: "sos", label: "SOS", Icon: LifeBuoy },
  { key: "info", label: "Info", Icon: Info },
];

export function Navigation({ active, onChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-cream-200 shadow-[0_-2px_12px_rgba(0,51,102,0.06)]">
      <div className="mx-auto max-w-app">
        <ul className="grid grid-cols-5">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = key === active;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onChange(key)}
                  className={classNames(
                    "w-full py-2.5 flex flex-col items-center gap-0.5 transition-colors relative px-1",
                    isActive ? "text-navy" : "text-ink-light hover:text-navy/70",
                    key === "sos" && !isActive && "text-warning/80 hover:text-warning",
                    key === "sos" && isActive && "text-warning",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span
                    className={classNames(
                      "text-[10px] font-semibold tracking-wide uppercase truncate max-w-full",
                      isActive ? "text-navy" : "text-ink-light",
                      key === "sos" && !isActive && "text-warning/80",
                      key === "sos" && isActive && "text-warning",
                    )}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <span
                      className={classNames(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-t-full",
                        key === "sos" ? "bg-warning" : "bg-gold",
                      )}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {/* Safe-area for iPhone home indicator */}
        <div className="h-[env(safe-area-inset-bottom,0px)] bg-white" />
      </div>
    </nav>
  );
}

/**
 * Migriert einen alten persistierten Tab-Key auf das neue Drei-Phasen-
 * Schema. Wird in TripPageClient beim Lesen aus localStorage genutzt.
 */
export function migrateTabKey(stored: string | null): TabKey | null {
  if (!stored) return null;
  switch (stored) {
    case "planen":
    case "wunschliste":
    case "karte":
    case "reservierungen":
      return "planen";
    case "erleben":
    case "programm":
      return "erleben";
    case "erinnern":
    case "fotos":
      return "erinnern";
    case "sos":
      return "sos";
    case "info":
      return "info";
    default:
      return null;
  }
}
