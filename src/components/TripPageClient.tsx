"use client";

import { useEffect, useState } from "react";
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
import { PersonPicker } from "@/components/identity/PersonPicker";
import { UserAvatarButton } from "@/components/identity/UserAvatarButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface TripPageClientProps {
  trip: Trip;
}

export function TripPageClient({ trip }: TripPageClientProps) {
  const [tab, setTab] = useState<TabKey>("programm");
  const { currentUserName, hydrated, skipped, setUser, skip, clear } = useCurrentUser(
    trip.slug,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  // Auto-open picker on first visit (once hydrated)
  useEffect(() => {
    if (
      hydrated &&
      !currentUserName &&
      !skipped &&
      (trip.participants?.length ?? 0) > 0
    ) {
      // Slight delay to let the page render first
      const t = setTimeout(() => setPickerOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [hydrated, currentUserName, skipped, trip.participants]);

  const currentUser =
    trip.participants?.find((p) => p.name === currentUserName) ?? null;

  return (
    <div className="min-h-screen bg-cream pb-20">
      <Header
        destination={trip.destination}
        subtitle={trip.subtitle}
        occasion={trip.occasion}
        rightSlot={
          (trip.participants?.length ?? 0) > 0 ? (
            <UserAvatarButton
              currentUser={currentUser}
              hydrated={hydrated}
              onChangeIdentity={() => setPickerOpen(true)}
              onClearIdentity={clear}
            />
          ) : null
        }
      />

      <main className="mx-auto max-w-app px-4 py-4">
        <AnimatePresence mode="wait">
          {tab === "programm" && <ProgrammTab key="programm" trip={trip} />}
          {tab === "karte" && <KarteTab key="karte" trip={trip} />}
          {tab === "fotos" && <FotosTab key="fotos" trip={trip} />}
          {tab === "reservierungen" && (
            <ReservierungenTab key="reservierungen" trip={trip} />
          )}
          {tab === "sos" && (
            <SOSTab
              key="sos"
              trip={trip}
              currentUserName={currentUserName}
              onRequestIdentity={() => setPickerOpen(true)}
            />
          )}
          {tab === "info" && (
            <InfoTab
              key="info"
              trip={trip}
              currentUserName={currentUserName}
              onRequestIdentity={() => setPickerOpen(true)}
            />
          )}
        </AnimatePresence>

        <Footer />
      </main>

      <ScrollToTop />
      <CompanionWidget
        tripSlug={trip.slug}
        destination={trip.destination}
        currentUserName={currentUserName}
      />
      <Navigation active={tab} onChange={setTab} />

      <PersonPicker
        open={pickerOpen}
        destination={trip.destination}
        participants={trip.participants ?? []}
        onPick={(name) => {
          setUser(name);
          setPickerOpen(false);
        }}
        onSkip={() => {
          skip();
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
