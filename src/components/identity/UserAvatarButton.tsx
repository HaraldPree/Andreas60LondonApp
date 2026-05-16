"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, UserCircle2, User } from "lucide-react";
import type { TripParticipant } from "@/types/trip";

interface UserAvatarButtonProps {
  currentUser: TripParticipant | null;
  hydrated: boolean;
  onChangeIdentity: () => void;
  onClearIdentity: () => void;
}

export function UserAvatarButton({
  currentUser,
  hydrated,
  onChangeIdentity,
  onClearIdentity,
}: UserAvatarButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!hydrated) {
    // Avoid hydration flash
    return <div className="w-8 h-8" />;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full overflow-hidden bg-cover bg-center ring-1 ring-gold/40 hover:ring-gold transition flex items-center justify-center text-xs font-semibold text-cream"
        style={{
          backgroundColor: currentUser?.avatarColor ?? "transparent",
          backgroundImage: currentUser?.avatarImage
            ? `url('${currentUser.avatarImage}')`
            : undefined,
        }}
        aria-label={currentUser ? `Identität: ${currentUser.name}` : "Identität wählen"}
      >
        {!currentUser?.avatarImage &&
          (currentUser ? currentUser.name.charAt(0).toUpperCase() : <User size={14} />)}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[180px] bg-white rounded-xl shadow-elevated border border-cream-200 overflow-hidden z-50">
          {currentUser ? (
            <>
              <div className="px-3 py-2.5 bg-cream-50 border-b border-cream-200">
                <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                  Du bist
                </p>
                <p className="font-display text-base font-semibold text-navy leading-tight">
                  {currentUser.name}
                </p>
                {currentUser.role === "celebrant" && (
                  <p className="text-[10px] text-gold-600 font-semibold uppercase tracking-wider mt-0.5">
                    🎂 Geburtstagskind
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onChangeIdentity();
                }}
                className="w-full px-3 py-2 text-left text-xs text-ink-dark hover:bg-cream-50 inline-flex items-center gap-2 transition"
              >
                <UserCircle2 size={13} /> Identität wechseln
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onClearIdentity();
                }}
                className="w-full px-3 py-2 text-left text-xs text-warning hover:bg-warning/5 inline-flex items-center gap-2 transition"
              >
                <LogOut size={13} /> Abmelden
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onChangeIdentity();
              }}
              className="w-full px-3 py-2.5 text-left text-xs text-ink-dark hover:bg-cream-50 inline-flex items-center gap-2 transition"
            >
              <UserCircle2 size={13} /> Wer bist du?
            </button>
          )}
        </div>
      )}
    </div>
  );
}
