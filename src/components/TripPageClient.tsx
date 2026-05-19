"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useTripVariant } from "@/hooks/useTripVariant";
import { UpdateBanner } from "@/components/pwa/UpdateBanner";

interface TripPageClientProps {
  trip: Trip;
}

export function TripPageClient({ trip }: TripPageClientProps) {
  const [tab, setTab] = useState<TabKey>("programm");
  const { currentUserName, hydrated, skipped, setUser, skip, clear } = useCurrentUser(
    trip.slug,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  // Variante (Original vs. Alternative) — pro Gerät in localStorage.
  // useTripVariant fällt auf trip.defaultVariant zurück wenn nichts
  // gespeichert ist.
  const { variant, setVariant } = useTripVariant(
    trip.slug,
    trip.defaultVariant ?? "original",
  );

  // effectiveTrip: bei aktiver Alternative die alternativen Tage
  // einblenden, an null-Stellen das Original beibehalten. Alle Tabs
  // (Programm, Karte, Companion-Kontext, KI-Prompt) sehen ab hier
  // dieselbe Wahrheit.
  const effectiveTrip: Trip = useMemo(() => {
    if (
      variant !== "alternative" ||
      !trip.alternativeDays ||
      trip.alternativeDays.length === 0
    ) {
      return trip;
    }
    return {
      ...trip,
      days: trip.days.map(
        (originalDay, i) => trip.alternativeDays?.[i] ?? originalDay,
      ),
    };
  }, [trip, variant]);

  // Auto-open picker on first visit (once hydrated)
  useEffect(() => {
    if (
      hydrated &&
      !currentUserName &&
      !skipped &&
      (trip.participants?.length ?? 0) > 0
    ) {
      const t = setTimeout(() => setPickerOpen(true), 600);
      return () => clearTimeout(t);
    }
    // participants kommen aus dem rohen trip (Variante ändert sie nicht)
  }, [hydrated, currentUserName, skipped, trip.participants]);

  const currentUser =
    effectiveTrip.participants?.find((p) => p.name === currentUserName) ?? null;

  return (
    <div className="min-h-screen bg-cream pb-20">
      <UpdateBanner />
      <Header
        destination={effectiveTrip.destination}
        subtitle={effectiveTrip.subtitle}
        occasion={effectiveTrip.occasion}
        backHref="/"
        backLabel="Reisen"
        rightSlot={
          (effectiveTrip.participants?.length ?? 0) > 0 ? (
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
          {tab === "programm" && (
            <ProgrammTab
              key="programm"
              trip={effectiveTrip}
              variant={variant}
              onVariantChange={setVariant}
            />
          )}
          {tab === "karte" && <KarteTab key="karte" trip={effectiveTrip} />}
          {tab === "fotos" && (
            <FotosTab
              key="fotos"
              trip={effectiveTrip}
              currentUserName={currentUserName}
            />
          )}
          {tab === "reservierungen" && (
            <ReservierungenTab key="reservierungen" trip={effectiveTrip} />
          )}
          {tab === "sos" && (
            <SOSTab
              key="sos"
              trip={effectiveTrip}
              currentUserName={currentUserName}
              onRequestIdentity={() => setPickerOpen(true)}
            />
          )}
          {tab === "info" && (
            <InfoTab
              key="info"
              trip={effectiveTrip}
              currentUserName={currentUserName}
              onRequestIdentity={() => setPickerOpen(true)}
            />
          )}
        </AnimatePresence>

        <Footer />
      </main>

      <ScrollToTop />
      <CompanionWidget
        tripSlug={effectiveTrip.slug}
        destination={effectiveTrip.destination}
        currentUserName={currentUserName}
      />
      <Navigation active={tab} onChange={setTab} />

      <PersonPicker
        open={pickerOpen}
        destination={effectiveTrip.destination}
        participants={effectiveTrip.participants ?? []}
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
