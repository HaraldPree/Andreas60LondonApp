import type { Metadata } from "next";
import { getTripBySlug } from "@/data/trips";
import { EventResearchClient } from "@/components/research/EventResearchClient";

export const metadata: Metadata = {
  title: "Event-Recherche · RCMK Travel Companion",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: { trip?: string };
}

export default function EventResearchPage({ searchParams }: PageProps) {
  const tripSlug = searchParams.trip;
  const trip = tripSlug ? getTripBySlug(tripSlug) : null;

  const defaults = trip
    ? {
        tripSlug: trip.slug,
        city: trip.weatherLocation.name || trip.destination,
        fromDate: deriveDate(trip, "first") ?? "",
        toDate: deriveDate(trip, "last") ?? "",
        existingEventIds: (trip.events ?? []).map((e) => e.id),
        context: trip.occasionDetails?.title || trip.occasion || trip.group,
      }
    : null;

  return <EventResearchClient defaults={defaults} />;
}

function deriveDate(
  trip: { days: { isoDate?: string }[] },
  which: "first" | "last",
): string | null {
  const dates = trip.days
    .map((d) => d.isoDate)
    .filter((d): d is string => Boolean(d))
    .sort();
  if (dates.length === 0) return null;
  return which === "first" ? dates[0] : dates[dates.length - 1];
}
