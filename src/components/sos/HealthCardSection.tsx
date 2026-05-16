"use client";

import { useState } from "react";
import { ChevronDown, Heart, Lock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TripParticipant } from "@/types/trip";
import { useHealthCards, type HealthCardData } from "@/hooks/useHealthCards";
import { classNames } from "@/lib/formatters";

interface HealthCardSectionProps {
  tripSlug: string;
  participants: TripParticipant[];
  defaultOpenName?: string;
}

export function HealthCardSection({
  tripSlug,
  participants,
  defaultOpenName,
}: HealthCardSectionProps) {
  const { get, update, clear, hydrated } = useHealthCards(tripSlug);
  const [openName, setOpenName] = useState<string | null>(defaultOpenName ?? null);

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-br from-success/15 to-cream-50 flex items-center gap-2">
        <Heart size={16} className="text-success" />
        <div className="flex-1">
          <h3 className="font-display text-base font-semibold text-navy">
            Persönliche Gesundheitskarte
          </h3>
          <p className="text-[10px] text-ink-mid inline-flex items-center gap-1">
            <Lock size={9} /> Nur lokal auf deinem Gerät gespeichert
          </p>
        </div>
      </div>

      <ul className="divide-y divide-cream-200">
        {participants.map((p) => {
          const filled = Object.keys(get(p.name)).filter(
            (k) => !!get(p.name)[k as keyof HealthCardData],
          ).length;
          const isOpen = openName === p.name;

          return (
            <li key={p.name}>
              <button
                type="button"
                onClick={() => setOpenName(isOpen ? null : p.name)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-cream-50 transition"
              >
                <div
                  className="w-9 h-9 rounded-full overflow-hidden bg-cover bg-center flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: p.avatarColor ?? "#003366",
                    backgroundImage: p.avatarImage
                      ? `url('${p.avatarImage}')`
                      : undefined,
                  }}
                >
                  {!p.avatarImage && p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-ink-dark">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-ink-light">
                    {hydrated && filled > 0
                      ? `${filled} Felder ausgefüllt`
                      : "Noch leer – tippen zum Ausfüllen"}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={classNames(
                    "text-ink-light transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden bg-cream-50"
                  >
                    <HealthForm
                      data={get(p.name)}
                      onChange={(patch) => update(p.name, patch)}
                      onClear={() => clear(p.name)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
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
          if (confirm("Alle Gesundheitsdaten dieser Person löschen?")) onClear();
        }}
        className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 mt-2 rounded-lg bg-warning/10 text-warning text-xs font-semibold hover:bg-warning/20 transition"
      >
        <Trash2 size={12} /> Alle Daten löschen
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
