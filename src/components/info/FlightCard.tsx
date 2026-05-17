"use client";

import { useState } from "react";
import {
  Plane,
  Ticket,
  Copy,
  ExternalLink,
  Smartphone,
  Globe,
  CheckCircle2,
  Luggage,
  ChevronDown,
} from "lucide-react";
import type { Flight } from "@/types/trip";
import { FlightStatusBadge } from "./FlightStatusBadge";
import { classNames } from "@/lib/formatters";

interface FlightCardProps {
  outbound: Flight;
  inbound: Flight;
  /** Optional: current user's chosen name — highlights their seat. */
  currentUserName?: string | null;
}

/**
 * Parse trip-specific date format ("Mo 18.5.2026") to ISO YYYY-MM-DD.
 */
function parseFlightDate(s?: string): string | undefined {
  if (!s) return undefined;
  const m = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!m) return undefined;
  const day = m[1].padStart(2, "0");
  const month = m[2].padStart(2, "0");
  return `${m[3]}-${month}-${day}`;
}

function CopyChip({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // ignore
        }
      }}
      className={classNames(
        "inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition",
        copied
          ? "bg-success text-white"
          : "bg-cream-200 text-ink-mid hover:bg-cream-300 hover:text-navy",
      )}
      aria-label={`${label ?? value} kopieren`}
    >
      <Copy size={10} />
      {copied ? "kopiert" : "kopieren"}
    </button>
  );
}

function FlightRow({
  flight,
  direction,
  currentUserName,
}: {
  flight: Flight;
  direction: "out" | "in";
  currentUserName?: string | null;
}) {
  const isOut = direction === "out";
  const isoDate = parseFlightDate(flight.date);
  const [bookingOpen, setBookingOpen] = useState(false);

  const hasBookingDetails =
    !!flight.bookingReference ||
    (!!flight.seats && Object.keys(flight.seats).length > 0) ||
    !!flight.manageUrl ||
    !!flight.airlineAppUrl;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isOut ? "bg-info/10 text-info" : "bg-gold/15 text-gold-600"
            }`}
          >
            <Plane
              size={16}
              className={isOut ? "" : "rotate-180"}
              strokeWidth={2}
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
              {isOut ? "Hinflug" : "Rückflug"}
            </p>
            <p className="text-xs text-ink-mid">{flight.date}</p>
          </div>
        </div>
        {flight.checkedIn && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-semibold">
            <CheckCircle2 size={10} />
            eingecheckt
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="font-mono text-lg font-semibold text-navy leading-none">
            {flight.departure}
          </p>
          <p className="text-[10px] text-ink-light mt-1 uppercase font-semibold tracking-wider">
            {flight.from}
          </p>
        </div>
        <div className="flex-1 relative">
          <div className="h-px bg-cream-300 border-t border-dashed border-cream-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white px-2 text-[10px] text-ink-light">
              {flight.duration ?? "—"}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-semibold text-navy leading-none">
            {flight.arrival}
          </p>
          <p className="text-[10px] text-ink-light mt-1 uppercase font-semibold tracking-wider">
            {flight.to}
          </p>
        </div>
      </div>

      {(flight.airline || flight.flightNumber) && (
        <p className="text-[11px] text-ink-light mt-2 text-center">
          {flight.airline}
          {flight.flightNumber ? ` · ${flight.flightNumber}` : ""}
        </p>
      )}

      {/* Booking + Seats */}
      {hasBookingDetails && (
        <div className="mt-3 pt-3 border-t border-cream-200">
          <button
            type="button"
            onClick={() => setBookingOpen((v) => !v)}
            className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold-600 text-xs font-semibold hover:bg-gold/15 transition"
          >
            <span className="inline-flex items-center gap-2">
              <Ticket size={12} />
              Buchung &amp; Bordkarte
              {flight.bookingReference && (
                <span className="font-mono text-navy bg-white px-1.5 py-0.5 rounded text-[10px]">
                  {flight.bookingReference}
                </span>
              )}
            </span>
            <ChevronDown
              size={14}
              className={classNames(
                "transition-transform",
                bookingOpen && "rotate-180",
              )}
            />
          </button>

          {bookingOpen && (
            <div className="mt-2 space-y-2">
              {flight.bookingReference && (
                <div className="rounded-lg bg-cream-50 border border-cream-200 p-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                      Buchungs-Code (PNR)
                    </p>
                    <p className="font-mono text-base font-bold text-navy tracking-widest">
                      {flight.bookingReference}
                    </p>
                  </div>
                  <CopyChip value={flight.bookingReference} label="PNR" />
                </div>
              )}

              {flight.seats && Object.keys(flight.seats).length > 0 && (
                <div className="rounded-lg bg-cream-50 border border-cream-200 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-1.5">
                    Sitzplätze
                  </p>
                  <ul className="space-y-1">
                    {Object.entries(flight.seats).map(([name, seat]) => {
                      const isMe = currentUserName === name;
                      return (
                        <li
                          key={name}
                          className={classNames(
                            "flex items-center justify-between text-xs py-1 px-2 rounded",
                            isMe && "bg-gold/15 ring-1 ring-gold/40",
                          )}
                        >
                          <span
                            className={classNames(
                              "text-ink-dark",
                              isMe && "font-bold text-navy",
                            )}
                          >
                            {isMe ? "★ " : ""}
                            {name}
                          </span>
                          <span className="font-mono font-bold text-navy">
                            {seat}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                {flight.airlineAppUrl && (
                  <a
                    href={flight.airlineAppUrl}
                    className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-navy text-cream text-[11px] font-semibold hover:bg-navy-600 transition"
                  >
                    <Smartphone size={11} />
                    Airline-App
                  </a>
                )}
                {flight.manageUrl && (
                  <a
                    href={flight.manageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-cream-200 text-navy text-[11px] font-semibold hover:bg-cream-300 transition"
                  >
                    <Globe size={11} />
                    Im Browser
                    <ExternalLink size={9} className="opacity-60" />
                  </a>
                )}
              </div>

              {flight.airlineAppStoreUrl && flight.airlineAppUrl && (
                <p className="text-[10px] text-ink-light italic text-center leading-relaxed">
                  Airline-App nicht installiert?{" "}
                  <a
                    href={flight.airlineAppStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-navy"
                  >
                    im Store öffnen
                  </a>
                </p>
              )}

              {flight.baggageNote && (
                <div className="rounded-lg bg-info/5 border border-info/20 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Luggage size={11} className="text-info" />
                    <p className="text-[10px] uppercase tracking-wider text-info font-semibold">
                      Gepäck
                    </p>
                  </div>
                  <p className="text-[11px] text-ink-dark leading-relaxed">
                    {flight.baggageNote}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-ink-light italic text-center leading-relaxed">
                💡 Tipp: Bordkarte vorab als Screenshot speichern (Galerie)
                — funktioniert dann auch ohne Internet am Gate.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Live status */}
      <div className="mt-3 pt-3 border-t border-cream-200">
        <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-1.5">
          Live-Status
        </p>
        <FlightStatusBadge
          flightIata={flight.flightNumber}
          flightDate={isoDate}
        />
      </div>
    </div>
  );
}

export function FlightCard({
  outbound,
  inbound,
  currentUserName,
}: FlightCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="px-4 pt-3 pb-2 bg-cream-50 border-b border-cream-200">
        <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
          ✈️ Flüge
        </p>
      </div>
      <FlightRow
        flight={outbound}
        direction="out"
        currentUserName={currentUserName}
      />
      <div className="h-px bg-cream-200 mx-4" />
      <FlightRow
        flight={inbound}
        direction="in"
        currentUserName={currentUserName}
      />
    </div>
  );
}
