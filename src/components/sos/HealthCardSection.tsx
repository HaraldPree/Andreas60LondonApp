"use client";

import { useState } from "react";
import { ChevronDown, Heart, Lock, ShieldCheck, Trash2, UserCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TripParticipant } from "@/types/trip";
import { useHealthCards, type HealthCardData } from "@/hooks/useHealthCards";
import { classNames } from "@/lib/formatters";

interface HealthCardSectionProps {
  tripSlug: string;
  participants: TripParticipant[];
  /** Name of the currently identified user. If absent, no card is shown. */
  currentUserName?: string | null;
  /** Called when user clicks "Wer bin ich?" CTA */
  onRequestIdentity?: () => void;
}

export function HealthCardSection({
  tripSlug,
  participants,
  currentUserName,
  onRequestIdentity,
}: HealthCardSectionProps) {
  const { get, update, clear, hydrated } = useHealthCards(tripSlug);
  const [open, setOpen] = useState(true);

  // Only the current user can see their own card. Others' data stays hidden.
  const me = participants.find((p) => p.name === currentUserName) ?? null;

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-br from-success/15 to-cream-50 flex items-center gap-2">
        <Heart size={16} className="text-success" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-semibold text-navy">
            Persönliche Gesundheitskarte
          </h3>
          <p className="text-[10px] text-ink-mid inline-flex items-center gap-1">
            <Lock size={9} /> Nur lokal auf deinem Gerät
          </p>
        </div>
      </div>

      {/* Privacy banner – always visible */}
      <div className="px-4 py-2.5 bg-success/5 border-b border-success/15">
        <div className="flex items-start gap-2">
          <ShieldCheck size={14} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-ink-dark leading-relaxed">
            <span className="font-semibold">Deine Gesundheitsdaten bleiben auf diesem Gerät.</span>{" "}
            Sie werden <strong>nicht</strong> mit den anderen Reiseteilnehmer:innen geteilt,{" "}
            <strong>nicht</strong> an einen Server gesendet, <strong>nicht</strong> von KI verarbeitet
            (EU AI Act / Art.&nbsp;9 DSGVO).
          </p>
        </div>
      </div>

      {/* Content */}
      {!me ? (
        <NoIdentityCta onRequestIdentity={onRequestIdentity} />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-cream-50 transition"
          >
            <div
              className="w-10 h-10 rounded-full overflow-hidden bg-cover bg-center flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{
                backgroundColor: me.avatarColor ?? "#003366",
                backgroundImage: me.avatarImage
                  ? `url('${me.avatarImage}')`
                  : undefined,
              }}
            >
              {!me.avatarImage && me.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-ink-dark">
                Deine Karte ({me.name})
              </p>
              <p className="text-[10px] text-ink-light">
                {hydrated
                  ? filledCount(get(me.name)) > 0
                    ? `${filledCount(get(me.name))} Felder ausgefüllt`
                    : "Noch leer – tippen zum Ausfüllen"
                  : "Lade…"}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={classNames(
                "text-ink-light transition-transform",
                open && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden bg-cream-50"
              >
                <HealthForm
                  data={get(me.name)}
                  onChange={(patch) => update(me.name, patch)}
                  onClear={() => clear(me.name)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function NoIdentityCta({
  onRequestIdentity,
}: {
  onRequestIdentity?: () => void;
}) {
  return (
    <div className="p-5 text-center">
      <div className="w-12 h-12 rounded-full bg-cream-100 mx-auto mb-2 flex items-center justify-center">
        <UserCircle2 size={22} className="text-ink-light" />
      </div>
      <p className="text-sm text-ink-dark leading-relaxed">
        Damit deine Gesundheitsdaten privat bleiben, brauchst du erst eine Identität.
      </p>
      <p className="text-xs text-ink-mid mt-2 leading-relaxed">
        Wähle oben rechts im Header dein Profil (Avatar-Button) – dann erscheint hier
        ausschließlich deine eigene Karte.
      </p>
      {onRequestIdentity && (
        <button
          type="button"
          onClick={onRequestIdentity}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-navy text-cream text-xs font-semibold hover:bg-navy-600 transition"
        >
          <UserCircle2 size={13} /> Wer bin ich?
        </button>
      )}
    </div>
  );
}

function filledCount(data: HealthCardData): number {
  return (Object.keys(data) as Array<keyof HealthCardData>).filter(
    (k) => !!data[k],
  ).length;
}

function HealthForm({
  data,
  onChange,
  onClear,
}: {
  data: HealthCardData;
  onChange: (patch: Partial<HealthCardData>) => void;
  onClear: () => void;
}) {
  return (
    <div className="px-4 py-3 space-y-2.5">
      <Row
        label="Blutgruppe"
        value={data.bloodGroup ?? ""}
        placeholder="z.B. A+, 0-, AB+"
        onChange={(v) => onChange({ bloodGroup: v })}
      />
      <Row
        label="Allergien"
        value={data.allergies ?? ""}
        placeholder="z.B. Penicillin, Erdnüsse, keine"
        onChange={(v) => onChange({ allergies: v })}
      />
      <Row
        label="Dauermedikation"
        value={data.medications ?? ""}
        placeholder="z.B. Thyrex 100, Pantoprazol"
        onChange={(v) => onChange({ medications: v })}
        multiline
      />
      <Row
        label="Versicherungsnummer"
        value={data.insuranceNumber ?? ""}
        placeholder="z.B. AT 1234 010180"
        onChange={(v) => onChange({ insuranceNumber: v })}
      />

      <div className="pt-2 border-t border-cream-200 space-y-2.5">
        <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
          Notfallkontakt zuhause
        </p>
        <Row
          label="Name"
          value={data.emergencyContactName ?? ""}
          placeholder="z.B. Maria Muster"
          onChange={(v) => onChange({ emergencyContactName: v })}
        />
        <Row
          label="Telefon"
          value={data.emergencyContactPhone ?? ""}
          placeholder="z.B. +43 664 1234567"
          onChange={(v) => onChange({ emergencyContactPhone: v })}
          type="tel"
        />
        <Row
          label="Beziehung"
          value={data.emergencyContactRelation ?? ""}
          placeholder="z.B. Partnerin, Sohn"
          onChange={(v) => onChange({ emergencyContactRelation: v })}
        />
      </div>

      <Row
        label="Notizen"
        value={data.notes ?? ""}
        placeholder="z.B. Herzschrittmacher, Diabetes"
        onChange={(v) => onChange({ notes: v })}
        multiline
      />

      <button
        type="button"
        onClick={() => {
          if (confirm("Alle deine Gesundheitsdaten löschen?")) onClear();
        }}
        className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 mt-2 rounded-lg bg-warning/10 text-warning text-xs font-semibold hover:bg-warning/20 transition"
      >
        <Trash2 size={12} /> Alle meine Daten löschen
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
}) {
  const baseClass =
    "w-full px-2.5 py-1.5 text-sm rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none";
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={baseClass + " resize-none"}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      )}
    </label>
  );
}
