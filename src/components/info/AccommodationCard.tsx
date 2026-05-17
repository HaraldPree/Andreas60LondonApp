"use client";

import { useState } from "react";
import {
  MapPin,
  LogIn,
  LogOut,
  Key,
  Wifi,
  Thermometer,
  Phone,
  Users,
  ChevronDown,
  Copy,
  AlertTriangle,
  DoorOpen,
  Building,
} from "lucide-react";
import type { Accommodation } from "@/types/trip";
import { mapsUrl, classNames } from "@/lib/formatters";
import { TransportButtons } from "@/components/ui/TransportButtons";

interface AccommodationCardProps {
  accommodation: Accommodation;
}

export function AccommodationCard({ accommodation }: AccommodationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasCheckInDetails =
    !!accommodation.keyAccess ||
    !!accommodation.doorInstructions?.length ||
    !!accommodation.wifi ||
    !!accommodation.climate ||
    !!accommodation.houseRules?.length ||
    !!accommodation.emergencyContact ||
    !!accommodation.hosts ||
    !!accommodation.floorInfo ||
    !!accommodation.entranceHint;

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="bg-gradient-to-br from-navy to-navy-600 text-cream p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gold/20 flex items-center justify-center text-2xl flex-shrink-0">
          🏠
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-cream/70 font-semibold">
            Unterkunft
          </p>
          <h3 className="font-display text-base font-semibold leading-tight">
            {accommodation.name}
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-ink-dark leading-relaxed">
          {accommodation.address}
        </p>

        {accommodation.floorInfo && (
          <p className="text-xs text-warning font-semibold inline-flex items-center gap-1.5">
            <Building size={12} />
            {accommodation.floorInfo}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-success/5 border border-success/15 p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <LogIn size={12} className="text-success" />
              <span className="text-[10px] uppercase tracking-wider text-success font-semibold">
                Check-In
              </span>
            </div>
            <p className="text-xs text-ink-dark leading-tight">
              {accommodation.checkIn}
            </p>
          </div>
          <div className="rounded-xl bg-warning/5 border border-warning/15 p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <LogOut size={12} className="text-warning" />
              <span className="text-[10px] uppercase tracking-wider text-warning font-semibold">
                Check-Out
              </span>
            </div>
            <p className="text-xs text-ink-dark leading-tight">
              {accommodation.checkOut}
            </p>
          </div>
        </div>

        {accommodation.notes && (
          <p className="text-xs text-ink-mid italic leading-relaxed">
            {accommodation.notes}
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          <a
            href={mapsUrl(
              accommodation.coordinates.lat,
              accommodation.coordinates.lng,
              accommodation.name,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs px-3 py-2 rounded-lg bg-navy text-cream font-medium inline-flex items-center justify-center gap-1.5 hover:bg-navy-600 transition min-w-[120px]"
          >
            <MapPin size={12} /> Auf Karte
          </a>
          {accommodation.phone && (
            <a
              href={`tel:${accommodation.phone}`}
              className="flex-1 text-center text-xs px-3 py-2 rounded-lg bg-navy/10 text-navy font-medium hover:bg-navy/20 transition min-w-[100px]"
            >
              Anrufen
            </a>
          )}
        </div>
        <TransportButtons
          coordinates={accommodation.coordinates}
          label={accommodation.name}
        />

        {/* Expandable check-in details */}
        {hasCheckInDetails && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="w-full inline-flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-gold-600 text-sm font-semibold hover:bg-gold/15 transition"
            >
              <span className="inline-flex items-center gap-2">
                <Key size={14} />
                Check-in &amp; Zugangs-Details
              </span>
              <ChevronDown
                size={16}
                className={classNames(
                  "transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>

            {expanded && (
              <div className="space-y-3 pt-1">
                {accommodation.entranceHint && (
                  <DetailRow
                    icon={<DoorOpen size={14} />}
                    label="Eingang finden"
                  >
                    <p className="text-xs text-ink-dark leading-relaxed">
                      {accommodation.entranceHint}
                    </p>
                  </DetailRow>
                )}

                {accommodation.keyAccess && (
                  <DetailRow
                    icon={<Key size={14} className="text-success" />}
                    label="Schlüssel-Box"
                    accent="success"
                  >
                    <p className="text-xs text-ink-dark leading-relaxed">
                      {accommodation.keyAccess.location}
                    </p>
                    <div className="flex items-center justify-between mt-2 p-2 bg-white rounded-lg border border-cream-300">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                          Code
                        </p>
                        <p className="font-mono text-2xl font-bold text-navy tracking-widest">
                          {accommodation.keyAccess.code}
                        </p>
                      </div>
                      <CopyButton value={accommodation.keyAccess.code} />
                    </div>
                    {accommodation.keyAccess.scrambleReminder && (
                      <p className="text-[11px] text-ink-mid italic mt-2 leading-relaxed">
                        💡 {accommodation.keyAccess.scrambleReminder}
                      </p>
                    )}
                  </DetailRow>
                )}

                {accommodation.doorInstructions?.length && (
                  <DetailRow
                    icon={<DoorOpen size={14} />}
                    label="Türen-Trick"
                    accent="warning"
                  >
                    <ol className="text-xs text-ink-dark space-y-1 leading-relaxed">
                      {accommodation.doorInstructions.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-bold text-navy w-4 flex-shrink-0">
                            {i + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </DetailRow>
                )}

                {accommodation.wifi && (
                  <DetailRow icon={<Wifi size={14} />} label="WLAN" accent="info">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-cream-300">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                            Netzwerk
                          </p>
                          <p className="font-mono text-sm text-navy truncate">
                            {accommodation.wifi.network}
                          </p>
                        </div>
                        <CopyButton value={accommodation.wifi.network} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-cream-300">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                            Passwort
                          </p>
                          <p className="font-mono text-sm text-navy break-all">
                            {accommodation.wifi.password}
                          </p>
                        </div>
                        <CopyButton value={accommodation.wifi.password} />
                      </div>
                      {accommodation.wifi.note && (
                        <p className="text-[11px] text-ink-mid italic leading-relaxed">
                          ⚠️ {accommodation.wifi.note}
                        </p>
                      )}
                    </div>
                  </DetailRow>
                )}

                {accommodation.climate && (
                  <DetailRow icon={<Thermometer size={14} />} label="Heizung & Klima">
                    <div className="space-y-1.5 text-xs text-ink-dark leading-relaxed">
                      {accommodation.climate.heating && (
                        <p>
                          <strong>Heizung:</strong>{" "}
                          {accommodation.climate.heating}
                        </p>
                      )}
                      {accommodation.climate.cooling && (
                        <p>
                          <strong>Klima:</strong>{" "}
                          {accommodation.climate.cooling}
                        </p>
                      )}
                      {accommodation.climate.warning && (
                        <p className="text-[11px] text-warning italic">
                          ⚠️ {accommodation.climate.warning}
                        </p>
                      )}
                    </div>
                  </DetailRow>
                )}

                {accommodation.houseRules?.length && (
                  <DetailRow
                    icon={<AlertTriangle size={14} />}
                    label="Hausregeln"
                  >
                    <ul className="text-xs text-ink-dark space-y-1 leading-relaxed">
                      {accommodation.houseRules.map((rule, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="text-gold flex-shrink-0">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </DetailRow>
                )}

                {accommodation.emergencyContact && (
                  <DetailRow
                    icon={<Phone size={14} className="text-warning" />}
                    label="Notfall-Kontakt vor Ort"
                    accent="warning"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-ink-dark font-semibold">
                        {accommodation.emergencyContact.name}
                      </p>
                      <a
                        href={`tel:${accommodation.emergencyContact.phone}`}
                        className="inline-flex items-center gap-1.5 text-sm font-mono text-navy underline"
                      >
                        <Phone size={11} />
                        {accommodation.emergencyContact.phone}
                      </a>
                      {accommodation.emergencyContact.note && (
                        <p className="text-[11px] text-ink-mid italic leading-relaxed mt-1">
                          {accommodation.emergencyContact.note}
                        </p>
                      )}
                    </div>
                  </DetailRow>
                )}

                {accommodation.hosts && (
                  <DetailRow icon={<Users size={14} />} label="Gastgeber">
                    <p className="text-xs text-ink-dark">
                      <strong>{accommodation.hosts.names}</strong>
                      {accommodation.hosts.company && (
                        <span className="text-ink-mid">
                          {" "}
                          · {accommodation.hosts.company}
                        </span>
                      )}
                    </p>
                    {accommodation.hosts.contactNote && (
                      <p className="text-[11px] text-ink-mid italic leading-relaxed mt-0.5">
                        {accommodation.hosts.contactNote}
                      </p>
                    )}
                  </DetailRow>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  accent?: "success" | "warning" | "info";
}) {
  const accentClasses =
    accent === "success"
      ? "bg-success/5 border-success/20"
      : accent === "warning"
        ? "bg-warning/5 border-warning/20"
        : accent === "info"
          ? "bg-info/5 border-info/20"
          : "bg-cream-50 border-cream-200";
  return (
    <div className={classNames("rounded-xl border p-3", accentClasses)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-ink-dark">{icon}</span>
        <p className="text-[10px] uppercase tracking-wider text-ink-mid font-semibold">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={classNames(
        "ml-2 flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition",
        copied
          ? "bg-success text-white"
          : "bg-cream-200 text-ink-mid hover:bg-cream-300 hover:text-navy",
      )}
      aria-label={copied ? "Kopiert" : "In Zwischenablage kopieren"}
    >
      <Copy size={10} />
      {copied ? "kopiert" : "kopieren"}
    </button>
  );
}
