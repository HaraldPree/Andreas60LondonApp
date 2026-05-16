"use client";

import { CalendarDays, MapPinned, Camera, Ticket, Info } from "lucide-react";
import { classNames } from "@/lib/formatters";

export type TabKey = "programm" | "karte" | "fotos" | "reservierungen" | "info";

interface NavigationProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; Icon: typeof CalendarDays }[] = [
  { key: "programm", label: "Programm", Icon: CalendarDays },
  { key: "karte", label: "Karte", Icon: MapPinned },
  { key: "fotos", label: "Fotos", Icon: Camera },
  { key: "reservierungen", label: "Reserv.", Icon: Ticket },
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
                    "w-full py-2.5 flex flex-col items-center gap-0.5 transition-colors relative",
                    isActive ? "text-navy" : "text-ink-light hover:text-navy/70",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span
                    className={classNames(
                      "text-[10px] font-semibold tracking-wide uppercase",
                      isActive ? "text-navy" : "text-ink-light",
                    )}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-8 bg-gold rounded-t-full" />
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
