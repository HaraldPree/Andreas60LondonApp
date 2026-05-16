"use client";

import { useState } from "react";
import type { TripParticipant } from "@/types/trip";
import { classNames } from "@/lib/formatters";

interface ParticipantsRowProps {
  participants: TripParticipant[];
  /** "light" for navy backgrounds, "dark" for cream backgrounds. */
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-11 h-11 text-sm",
};

const OVERLAP_MAP = {
  sm: "-ml-2",
  md: "-ml-2.5",
  lg: "-ml-3",
};

export function ParticipantsRow({
  participants,
  variant = "dark",
  size = "md",
}: ParticipantsRowProps) {
  const [activeName, setActiveName] = useState<string | null>(null);

  if (participants.length === 0) return null;

  const ringClass =
    variant === "light"
      ? "ring-2 ring-navy"
      : "ring-2 ring-white";

  return (
    <div className="relative">
      <ul className="flex">
        {participants.map((p, i) => {
          const initial = p.name.charAt(0).toUpperCase();
          const isCelebrant = p.role === "celebrant";
          return (
            <li
              key={p.name}
              className={classNames(
                "relative",
                i > 0 && OVERLAP_MAP[size],
              )}
              style={{ zIndex: participants.length - i }}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveName(activeName === p.name ? null : p.name)
                }
                className={classNames(
                  SIZE_MAP[size],
                  ringClass,
                  "rounded-full font-semibold flex items-center justify-center text-white transition-transform hover:scale-110 overflow-hidden bg-cover bg-center",
                  isCelebrant && "ring-gold",
                )}
                style={{
                  backgroundColor: p.avatarColor ?? "#003366",
                  backgroundImage: p.avatarImage
                    ? `url('${p.avatarImage}')`
                    : undefined,
                }}
                aria-label={`${p.name} (${p.role})`}
              >
                {!p.avatarImage && (p.emoji ?? initial)}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Tap-info popover */}
      {activeName && (
        <div
          onClick={() => setActiveName(null)}
          className="absolute top-full left-0 mt-2 z-20 bg-white shadow-elevated rounded-xl px-3 py-2 min-w-[180px] border border-cream-200"
        >
          {(() => {
            const p = participants.find((x) => x.name === activeName)!;
            return (
              <>
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center text-white overflow-hidden bg-cover bg-center"
                    style={{
                      backgroundColor: p.avatarColor ?? "#003366",
                      backgroundImage: p.avatarImage
                        ? `url('${p.avatarImage}')`
                        : undefined,
                    }}
                  >
                    {!p.avatarImage && (p.emoji ?? p.name.charAt(0).toUpperCase())}
                  </div>
                  <p className="font-display text-sm font-semibold text-navy">
                    {p.name}
                    {p.role === "celebrant" && (
                      <span className="ml-1.5 text-[10px] text-gold-600 uppercase tracking-wider font-bold">
                        Hauptperson
                      </span>
                    )}
                  </p>
                </div>
                {p.bio && (
                  <p className="text-[11px] text-ink-mid mt-1.5 leading-relaxed">
                    {p.bio}
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
