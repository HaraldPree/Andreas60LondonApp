"use client";

import { motion } from "framer-motion";
import { ListChecks, MapPinned, Ticket } from "lucide-react";
import type { Trip } from "@/types/trip";
import { TripHero } from "@/components/trip/TripHero";
import { WunschlisteTab } from "@/components/tabs/WunschlisteTab";
import { KarteTab } from "@/components/tabs/KarteTab";
import { ReservierungenTab } from "@/components/tabs/ReservierungenTab";

interface PlanenTabProps {
  trip: Trip;
  currentUserName?: string | null;
}

/**
 * v1.17.0 — „Planen"-Tab der Drei-Phasen-Navigation.
 *
 * Bündelt alles was zur Vorbereitung und während der Reise zum
 * Organisieren wichtig ist:
 *
 *  - Wünsche (Place-Library + WhatsApp-Polls)
 *  - Karte (Leaflet interaktiv)
 *  - Reservierungen (mit Status-Tracking)
 *
 * Vor v1.17.0 waren das drei separate Bottom-Nav-Tabs. Apple-Way:
 * Drei-Phasen-Gruppierung (Planen / Erleben / Erinnern) ist
 * mentale Reise-Phase, nicht Funktional-Topf. User scrollt durch
 * die drei Sections statt zwischen Tabs zu wechseln.
 *
 * Falls die Page-Länge mal stört: Sub-Navigation oben als Pills
 * (Apple Watch Stocks-Pattern) ist trivial nachrüstbar.
 */
export function PlanenTab({ trip, currentUserName }: PlanenTabProps) {
  return (
    <motion.div
      key="planen"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <TripHero trip={trip} />

      {/* Sektion: Wünsche */}
      <section>
        <SectionHeader Icon={ListChecks} label="Wünsche" />
        <WunschlisteTab trip={trip} currentUserName={currentUserName ?? null} />
      </section>

      {/* Sektion: Karte */}
      <section>
        <SectionHeader Icon={MapPinned} label="Karte" />
        <KarteTab trip={trip} />
      </section>

      {/* Sektion: Reservierungen */}
      <section>
        <SectionHeader Icon={Ticket} label="Reservierungen" />
        <ReservierungenTab trip={trip} />
      </section>
    </motion.div>
  );
}

function SectionHeader({
  Icon,
  label,
}: {
  Icon: typeof ListChecks;
  label: string;
}) {
  return (
    <h3 className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-2 px-1 inline-flex items-center gap-1.5">
      <Icon size={11} />
      {label}
    </h3>
  );
}
