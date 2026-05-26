"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Trip } from "@/types/trip";
import { Header } from "@/components/layout/Header";
import {
  Navigation,
  migrateTabKey,
  type TabKey,
} from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PlanenTab } from "@/components/tabs/PlanenTab";
import { ErlebenTab } from "@/components/tabs/ErlebenTab";
import { ErinnernTab } from "@/components/tabs/ErinnernTab";
import { SOSTab } from "@/components/tabs/SOSTab";
import { InfoTab } from "@/components/tabs/InfoTab";
import { CompanionWidget } from "@/components/companion/CompanionWidget";
import { PersonPicker } from "@/components/identity/PersonPicker";
import { UserAvatarButton } from "@/components/identity/UserAvatarButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTripVariant } from "@/hooks/useTripVariant";
import { useTripPhase } from "@/hooks/useTripPhase";
import { useTripPageBackToHome } from "@/hooks/useTripPageBackToHome";
import { UpdateBanner } from "@/components/pwa/UpdateBanner";

interface TripPageClientProps {
  trip: Trip;
}

export function TripPageClient({ trip }: TripPageClientProps) {
  const { currentUserName, hydrated, skipped, setUser, skip, clear } =
    useCurrentUser(trip.slug);
  const [pickerOpen, setPickerOpen] = useState(false);

  // v1.17.0 — Variant-System bleibt fürs Trip-Datenmodell (alternativeDays
  // können künftige Reisen weiter nutzen), wird aber für London nicht mehr
  // aktiv geschaltet.
  const { variant, setVariant } = useTripVariant(
    trip.slug,
    trip.defaultVariant ?? "original",
  );

  useTripPageBackToHome();

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

  // v1.17.0 — Default-Tab abhängig von Reise-Phase:
  //   future  → Planen (was muss noch organisiert werden)
  //   current → Erleben (Tages-Programm aktiv)
  //   past    → Erinnern (Reel, Feedback, Rückblick)
  // Wenn der User aber bereits aktiv einen Tab gewählt hat,
  // gewinnt die User-Wahl (localStorage).
  const { phase } = useTripPhase(effectiveTrip);
  const phaseDefaultTab: TabKey = useMemo(() => {
    if (phase === "future") return "planen";
    if (phase === "current") return "erleben";
    return "erinnern";
  }, [phase]);

  const tabStorageKey = `rcmk:tab:${trip.slug}`;
  const [tab, setTabState] = useState<TabKey>(phaseDefaultTab);
  const [tabHydrated, setTabHydrated] = useState(false);

  // Beim Mount: gespeicherten Tab lesen + migrieren wenn alte Key
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(tabStorageKey);
      const migrated = migrateTabKey(stored);
      if (migrated) {
        setTabState(migrated);
      } else {
        setTabState(phaseDefaultTab);
      }
    } catch {
      setTabState(phaseDefaultTab);
    } finally {
      setTabHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabStorageKey]);

  const setTab = useCallback(
    (next: TabKey) => {
      setTabState(next);
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(tabStorageKey, next);
      } catch {
        // ignore quota / storage disabled
      }
    },
    [tabStorageKey],
  );

  // Person-Picker auto-open
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
          {tab === "planen" && (
            <PlanenTab
              key="planen"
              trip={effectiveTrip}
              currentUserName={currentUserName}
            />
          )}
          {tab === "erleben" && (
            <ErlebenTab
              key="erleben"
              trip={effectiveTrip}
              variant={variant}
              onVariantChange={setVariant}
              currentUserName={currentUserName}
            />
          )}
          {tab === "erinnern" && (
            <ErinnernTab
              key="erinnern"
              trip={effectiveTrip}
              currentUserName={currentUserName}
            />
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
