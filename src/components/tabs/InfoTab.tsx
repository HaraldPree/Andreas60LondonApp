"use client";

import { motion } from "framer-motion";
import type { Trip } from "@/types/trip";
import { AccommodationCard } from "@/components/info/AccommodationCard";
import { FlightCard } from "@/components/info/FlightCard";
import { QuickActions } from "@/components/info/QuickActions";
import { TransportTips } from "@/components/info/TransportTips";
import { TfLLiveWidget } from "@/components/info/TfLLiveWidget";
import { HiddenPlacesGrid } from "@/components/discover/HiddenPlacesGrid";
import { PackingList } from "@/components/organize/PackingList";
import { ProfileCard } from "@/components/identity/ProfileCard";
import { RunningRoutes } from "@/components/activities/RunningRoutes";
import { LocationSharingCard } from "@/components/activities/LocationSharingCard";
import { CurrencyConverter } from "@/components/info/CurrencyConverter";
import { ExpenseTracker } from "@/components/expenses/ExpenseTracker";
import { MyDataSection } from "@/components/privacy/MyDataSection";
import { RestaurantsList } from "@/components/dining/RestaurantsList";
import { Phrasebook } from "@/components/info/Phrasebook";
import { ReportIssueCard } from "@/components/support/ReportIssueCard";

interface InfoTabProps {
  trip: Trip;
  currentUserName?: string | null;
  onRequestIdentity?: () => void;
}

function SectionHeading({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="px-1 pt-1">
      <p className="font-display text-[11px] uppercase tracking-[0.2em] text-gold-600 font-bold">
        {title}
      </p>
      {hint && <p className="text-[11px] text-ink-mid mt-0.5">{hint}</p>}
    </div>
  );
}

export function InfoTab({ trip, currentUserName, onRequestIdentity }: InfoTabProps) {
  const currentUser =
    trip.participants?.find((p) => p.name === currentUserName) ?? null;
  return (
    <motion.div
      key="info"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="px-1">
        <h2 className="font-display text-xl font-semibold text-navy">
          Info & Hilfe
        </h2>
        <p className="text-xs text-ink-mid mt-0.5">
          Alles für vor & während der Reise.
        </p>
      </div>

      {/* — DEIN PROFIL — */}
      {trip.participants && trip.participants.length > 0 && (
        <>
          <SectionHeading title="Dein Profil" />
          <ProfileCard
            currentUser={currentUser}
            onRequestIdentity={onRequestIdentity}
          />
        </>
      )}

      {/* — VORBEREITUNG — */}
      <SectionHeading title="Vor & während der Reise" />
      <PackingList trip={trip} currentUserName={currentUserName} />

      {/* — AKTIV UNTERWEGS — (Laufen, Standort teilen) */}
      <SectionHeading
        title="Aktiv unterwegs"
        hint="Laufrouten + Standort sicher mit der Gruppe teilen"
      />
      {trip.runningRoutes && trip.runningRoutes.length > 0 && (
        <RunningRoutes routes={trip.runningRoutes} />
      )}
      <LocationSharingCard />

      {/* — BUDGET & GELD — */}
      <SectionHeading
        title="Budget & Geld"
        hint={`Live-Kurs ${trip.currency ?? "GBP"} ↔ ${trip.homeCurrency ?? "EUR"} + wer hat was bezahlt`}
      />
      <CurrencyConverter
        tripCurrency={trip.currency ?? "GBP"}
        homeCurrency={trip.homeCurrency ?? "EUR"}
      />
      {trip.participants && trip.participants.length > 0 && (
        <ExpenseTracker
          trip={trip}
          currentUserName={currentUserName}
          tripCurrency={trip.currency ?? "GBP"}
          homeCurrency={trip.homeCurrency ?? "EUR"}
        />
      )}

      {/* — ESSEN & TRINKEN — */}
      {trip.restaurants && trip.restaurants.length > 0 && (
        <>
          <SectionHeading
            title="Essen & Trinken"
            hint="Kuratierte Restaurants mit Buchungs-Links (TheFork)"
          />
          <RestaurantsList trip={trip} />
        </>
      )}

      {/* — LOGISTIK — */}
      <SectionHeading title="Logistik" />
      <AccommodationCard accommodation={trip.accommodation} />
      <FlightCard outbound={trip.flights.outbound} inbound={trip.flights.inbound} />
      <TfLLiveWidget />

      {/* — SCHNELLZUGRIFF — */}
      <SectionHeading title="Schnellzugriff & Tipps" />
      <QuickActions actions={trip.quickActions} />
      <Phrasebook />
      <TransportTips />

      {/* — ENTDECKEN — */}
      <SectionHeading title="Entdecken" />
      <HiddenPlacesGrid places={trip.hiddenPlaces} />

      {/* — HILFE / BUG REPORT — */}
      <SectionHeading
        title="Hilfe & Support"
        hint="Etwas funktioniert nicht? Direkt-Kanal an Harald"
      />
      <ReportIssueCard currentUserName={currentUserName} />

      {/* — PRIVACY / DSGVO — */}
      <SectionHeading
        title="Privacy & DSGVO"
        hint="Deine Daten exportieren oder löschen"
      />
      <MyDataSection tripSlug={trip.slug} />
    </motion.div>
  );
}
