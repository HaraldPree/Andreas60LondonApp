"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Building2,
  AlertTriangle,
  Cross,
  Pill,
  Stethoscope,
  Hospital,
  Filter,
  ExternalLink,
} from "lucide-react";
import type {
  EmergencyContact,
  Embassy,
  MedicalLocation,
  MedicalType,
  Trip,
} from "@/types/trip";
import { classNames, mapsUrl } from "@/lib/formatters";
import { HealthCardSection } from "@/components/sos/HealthCardSection";
import { TransportButtons } from "@/components/ui/TransportButtons";

interface SOSTabProps {
  trip: Trip;
  currentUserName?: string | null;
  onRequestIdentity?: () => void;
}

const MEDICAL_LABEL: Record<MedicalType, string> = {
  pharmacy: "Apotheke",
  hospital: "Krankenhaus",
  doctor: "Arzt",
  dentist: "Zahnarzt",
};

const MEDICAL_ICON: Record<MedicalType, typeof Pill> = {
  pharmacy: Pill,
  hospital: Hospital,
  doctor: Stethoscope,
  dentist: Cross,
};

export function SOSTab({ trip, currentUserName, onRequestIdentity }: SOSTabProps) {
  const [medFilter, setMedFilter] = useState<MedicalType | "all">("all");
  const ei = trip.emergencyInfo;

  return (
    <motion.div
      key="sos"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="px-1">
        <h2 className="font-display text-xl font-semibold text-navy">
          🆘 Notfall & Gesundheit
        </h2>
        <p className="text-xs text-ink-mid mt-0.5">
          Im Ernstfall: ruhig bleiben, tief atmen, hier sind alle Nummern.
        </p>
      </div>

      {!ei ? (
        <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4 text-warning text-sm">
          Notfall-Daten für diese Reise sind noch nicht hinterlegt.
        </div>
      ) : (
        <>
          {/* BIG emergency button */}
          {ei.contacts.filter((c) => c.urgent).map((c) => (
            <a
              key={c.phone}
              href={`tel:${c.phone}`}
              className="block rounded-2xl bg-gradient-to-br from-warning to-warning/80 text-white p-5 shadow-elevated relative overflow-hidden hover:scale-[1.01] transition active:scale-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Phone size={26} strokeWidth={2.2} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-widest opacity-90">
                    Sofort anrufen
                  </p>
                  <p className="font-display text-3xl font-bold leading-none mt-0.5">
                    {c.label} {c.phone}
                  </p>
                  {c.description && (
                    <p className="text-[11px] opacity-90 mt-1.5 leading-snug">
                      {c.description}
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))}

          {/* Other contacts grid */}
          <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-2.5">
              Weitere wichtige Nummern
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ei.contacts
                .filter((c) => !c.urgent)
                .map((c) => (
                  <ContactItem key={c.phone} contact={c} />
                ))}
            </ul>
          </div>

          {/* Embassy */}
          {ei.embassy && <EmbassyCard embassy={ei.embassy} />}

          {/* Medical */}
          {ei.medical.length > 0 && (
            <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-base font-semibold text-navy">
                  Apotheken & Spitäler
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                  {ei.medical.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar">
                <Filter size={11} className="text-ink-light flex-shrink-0" />
                <FilterChip
                  label="Alle"
                  active={medFilter === "all"}
                  onClick={() => setMedFilter("all")}
                />
                {(Object.keys(MEDICAL_LABEL) as MedicalType[]).map((t) => {
                  if (!ei.medical.some((m) => m.type === t)) return null;
                  return (
                    <FilterChip
                      key={t}
                      label={MEDICAL_LABEL[t]}
                      active={medFilter === t}
                      onClick={() => setMedFilter(t)}
                    />
                  );
                })}
              </div>
              <ul className="space-y-2">
                {ei.medical
                  .filter((m) => medFilter === "all" || m.type === medFilter)
                  .map((m, i) => (
                    <MedicalCard key={`${m.name}-${i}`} location={m} />
                  ))}
              </ul>
            </div>
          )}

          {/* Insurance tips */}
          {ei.insuranceTips && ei.insuranceTips.length > 0 && (
            <div className="rounded-2xl bg-info/5 border border-info/20 p-4">
              <h3 className="font-display text-sm font-semibold text-info inline-flex items-center gap-1.5">
                <AlertTriangle size={14} /> Wichtig bei Krankenhausbesuch
              </h3>
              <ul className="space-y-1.5 mt-2">
                {ei.insuranceTips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-xs text-ink-dark leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-info"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Health card – private, current user only */}
      {trip.participants && trip.participants.length > 0 && (
        <HealthCardSection
          tripSlug={trip.slug}
          participants={trip.participants}
          currentUserName={currentUserName}
          onRequestIdentity={onRequestIdentity}
        />
      )}

      <p className="text-[11px] text-center text-ink-light italic px-4 pt-2">
        💡 Frag den KI-Companion z.B. &quot;Wie sage ich Schmerzen auf Englisch?&quot;
      </p>
    </motion.div>
  );
}

function ContactItem({ contact }: { contact: EmergencyContact }) {
  return (
    <li>
      <a
        href={`tel:${contact.phone}`}
        className="block rounded-xl bg-cream-50 border border-cream-200 p-3 hover:border-navy/30 hover:bg-cream-100 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-navy/10 text-navy flex items-center justify-center flex-shrink-0">
            <Phone size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink-dark">
              {contact.label} <span className="text-navy">{contact.phone}</span>
            </p>
            {contact.description && (
              <p className="text-[10px] text-ink-mid leading-tight mt-0.5">
                {contact.description}
              </p>
            )}
          </div>
        </div>
      </a>
    </li>
  );
}

function EmbassyCard({ embassy }: { embassy: Embassy }) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="bg-navy text-cream px-4 py-3 flex items-center gap-2.5">
        <Building2 size={18} />
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wider opacity-75">
            Konsularische Hilfe
          </p>
          <h3 className="font-display text-sm font-semibold leading-tight">
            {embassy.name}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-ink-dark leading-relaxed">{embassy.address}</p>
        {embassy.openingHours && (
          <p className="text-xs text-ink-mid italic">{embassy.openingHours}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${embassy.phone}`}
            className="text-xs px-3 py-1.5 rounded-lg bg-navy text-cream font-medium inline-flex items-center gap-1.5 hover:bg-navy-600 transition"
          >
            <Phone size={11} /> Anrufen
          </a>
          {embassy.coordinates && (
            <>
              <a
                href={mapsUrl(
                  embassy.coordinates.lat,
                  embassy.coordinates.lng,
                  embassy.name,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-navy/10 text-navy font-medium inline-flex items-center gap-1.5"
              >
                Auf Karte
              </a>
              <TransportButtons
                coordinates={embassy.coordinates}
                label={embassy.name}
              />
            </>
          )}
          {embassy.website && (
            <a
              href={embassy.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-navy/10 text-navy font-medium inline-flex items-center gap-1"
            >
              <ExternalLink size={11} /> Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function MedicalCard({ location }: { location: MedicalLocation }) {
  const Icon = MEDICAL_ICON[location.type];
  return (
    <li className="rounded-xl bg-cream-50 border border-cream-200 p-3">
      <div className="flex items-start gap-3">
        <div
          className={classNames(
            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
            location.type === "hospital"
              ? "bg-warning/15 text-warning"
              : location.type === "pharmacy"
                ? "bg-success/15 text-success"
                : "bg-info/15 text-info",
          )}
        >
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-ink-dark leading-tight">
              {location.name}
            </p>
            {location.open24h && (
              <span className="text-[9px] uppercase tracking-wider bg-success/15 text-success font-bold px-1.5 py-0.5 rounded">
                24/7
              </span>
            )}
          </div>
          <p className="text-[11px] text-ink-mid mt-0.5">{location.address}</p>
          {location.note && (
            <p className="text-[11px] text-ink-mid italic mt-1 leading-snug">
              {location.note}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {location.phone && (
              <a
                href={`tel:${location.phone}`}
                className="text-[11px] px-2 py-1 rounded-md bg-navy/10 text-navy font-medium inline-flex items-center gap-1"
              >
                <Phone size={10} /> Anrufen
              </a>
            )}
            <TransportButtons
              coordinates={location.coordinates}
              label={location.name}
              compact
            />
          </div>
        </div>
      </div>
    </li>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition",
        active
          ? "bg-navy text-cream"
          : "bg-cream-200 text-ink-mid hover:bg-cream-300",
      )}
    >
      {label}
    </button>
  );
}
