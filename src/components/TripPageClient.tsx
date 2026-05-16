"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Trip } from "@/types/trip";
import { Header } from "@/components/layout/Header";
import { Navigation, type TabKey } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ProgrammTab } from "@/components/tabs/ProgrammTab";
import { KarteTab } from "@/components/tabs/KarteTab";
import { FotosTab } from "@/components/tabs/FotosTab";
import { ReservierungenTab } from "@/components/tabs/ReservierungenTab";
import { SOSTab } from "@/components/tabs/SOSTab";
import { InfoTab } from "@/components/tabs/InfoTab";
import { CompanionWidget } from "@/components/companion/CompanionWidget";

interface TripPageClientProps {
  trip: Trip;
}

export function TripPageClient({ trip }: TripPageClientProps) {
  const [tab, setTab] = useState<TabKey>("programm");

  return (
    <div className="min-h-screen bg-cream pb-20">
      <Header
        destination={trip.destination}
        subtitle={trip.subtitle}
        occasion={trip.occasion}
      />

      <main className="mx-auto max-w-app px-4 py-4">
        <AnimatePresence mode="wait">
          {tab === "programm" && <ProgrammTab key="programm" trip={trip} />}
          {tab === "karte" && <KarteTab key="karte" trip={trip} />}
          {tab === "fotos" && <FotosTab key="fotos" trip={trip} />}
          {tab === "reservierungen" && (
            <ReservierungenTab key="reservierungen" trip={trip} />
          )}
          {tab === "sos" && <SOSTab key="sos" trip={trip} />}
          {tab === "info" && <InfoTab key="info" trip={trip} />}
        </AnimatePresence>

        <Footer />
      </main>

      <ScrollToTop />
      <CompanionWidget tripSlug={trip.slug} destination={trip.destination} />
      <Navigation active={tab} onChange={setTab} />
    </div>
  );
}
