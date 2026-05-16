"use client";

import { CheckCircle2, Sparkles, UserCircle2, Lock } from "lucide-react";
import type { TripParticipant } from "@/types/trip";

interface ProfileCardProps {
  currentUser: TripParticipant | null;
  onRequestIdentity?: () => void;
}

export function ProfileCard({ currentUser, onRequestIdentity }: ProfileCardProps) {
  if (!currentUser) {
    return (
      <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4 text-center">
        <UserCircle2 size={28} className="mx-auto text-ink-light mb-2" />
        <p className="text-sm font-semibold text-navy">Wer bist du?</p>
        <p className="text-xs text-ink-mid mt-1 leading-relaxed">
          Wähle deine Identität, um die App persönlich zu machen.
        </p>
        {onRequestIdentity && (
          <button
            type="button"
            onClick={onRequestIdentity}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-navy text-cream text-xs font-semibold hover:bg-navy-600 transition"
          >
            <UserCircle2 size={13} /> Identität wählen
          </button>
        )}
      </div>
    );
  }

  const isCelebrant = currentUser.role === "celebrant";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-600 text-cream shadow-card overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full overflow-hidden bg-cover bg-center flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 ring-2 ring-gold/60"
          style={{
            backgroundColor: currentUser.avatarColor ?? "#003366",
            backgroundImage: currentUser.avatarImage
              ? `url('${currentUser.avatarImage}')`
              : undefined,
          }}
        >
          {!currentUser.avatarImage && currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gold font-semibold">
            Dein Profil
          </p>
          <p className="font-display text-lg font-semibold leading-tight">
            {currentUser.name}
          </p>
          {isCelebrant && (
            <p className="text-[10px] text-gold font-semibold uppercase tracking-wider mt-0.5">
              🎂 Geburtstagskind
            </p>
          )}
        </div>
      </div>

      <div className="bg-white/10 px-4 py-3 space-y-1.5 backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-wider text-cream/70 font-semibold mb-1">
          Personalisiert für dich:
        </p>
        <Feature
          icon={<Sparkles size={11} />}
          label={`AI-Companion grüßt dich namentlich ("Hallo ${currentUser.name}!")`}
        />
        <Feature
          icon={<CheckCircle2 size={11} />}
          label="Deine Packliste ist privat für dich"
        />
        <Feature
          icon={<Lock size={11} />}
          label="Deine Gesundheitsdaten bleiben nur auf diesem Gerät"
        />
        <Feature
          icon={<UserCircle2 size={11} />}
          label="Identität wechseln: Avatar oben rechts im Header"
        />
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-2 text-cream/90 text-[11px] leading-relaxed">
      <span className="text-gold mt-0.5">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
