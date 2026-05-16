"use client";

import { motion } from "framer-motion";
import type { Trip } from "@/types/trip";
import { ReservationTracker } from "@/components/reservations/ReservationTracker";

interface ReservierungenTabProps {
  trip: Trip;
}

export function ReservierungenTab({ trip }: ReservierungenTabProps) {
  return (
    <motion.div
      key="reservierungen"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="px-1">
        <h2 className="font-display text-xl font-semibold text-navy">
          Reservierungen
        </h2>
        <p className="text-xs text-ink-mid mt-0.5">
          Tippe auf den Status-Balken um den Stand zu ändern.
        </p>
      </div>
      <ReservationTracker
        tripSlug={trip.slug}
        reservations={trip.reservations}
      />
    </motion.div>
  );
}
