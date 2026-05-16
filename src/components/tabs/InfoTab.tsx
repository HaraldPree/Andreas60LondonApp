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

interface InfoTabProps {
  trip: Trip;
  currentUserName?: string | null;
  onRequestIdentity?: () => void;
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
          Unterkunft, Flüge, Notfallnummern und Geheimtipps.
        </p>
      </div>

      {trip.participants && trip.participants.length > 0 && (
        <ProfileCard
          currentUser={currentUser}
          onRequestIdentity={onRequestIdentity}
        />
      )}
      <PackingList trip={trip} currentUserName={currentUserName} />
      <AccommodationCard accommodation={trip.accommodation} />
      <FlightCard outbound={trip.flights.outbound} inbound={trip.flights.inbound} />
      <TfLLiveWidget />
      {trip.runningRoutes && trip.runningRoutes.length > 0 && (
        <RunningRoutes routes={trip.runningRoutes} />
      )}
      <LocationSharingCard />
      <QuickActions actions={trip.quickActions} />
      <TransportTips />
      <HiddenPlacesGrid places={trip.hiddenPlaces} />
    </motion.div>
  );
}
