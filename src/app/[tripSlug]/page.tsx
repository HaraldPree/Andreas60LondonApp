import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTripBySlug, getAllTripSlugs } from "@/data/trips";
import { TripPageClient } from "@/components/TripPageClient";

interface PageProps {
  params: { tripSlug: string };
}

export function generateStaticParams() {
  return getAllTripSlugs().map((tripSlug) => ({ tripSlug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const trip = getTripBySlug(params.tripSlug);
  if (!trip) return { title: "Reise nicht gefunden" };

  return {
    title: `${trip.destination} ${trip.subtitle}`,
    description: `Deine persönliche Reise nach ${trip.destination}, ${trip.subtitle} – ${trip.group}.`,
    openGraph: {
      title: `${trip.destination} – ${trip.subtitle}`,
      description: `${trip.group}${trip.occasion ? ` · ${trip.occasion}` : ""}`,
      type: "website",
      locale: "de_AT",
    },
  };
}

export default function TripPage({ params }: PageProps) {
  const trip = getTripBySlug(params.tripSlug);
  if (!trip) notFound();

  return <TripPageClient trip={trip} />;
}
