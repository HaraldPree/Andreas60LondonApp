"use client";

import { Sparkles } from "lucide-react";
import type { Trip } from "@/types/trip";
import { ParticipantsRow } from "./ParticipantsRow";

interface TripHeroProps {
  trip: Trip;
}

export function TripHero({ trip }: TripHeroProps) {
  const fallbackGradient =
    trip.heroGradient ??
    "linear-gradient(135deg, #003366 0%, #2980B9 70%, #E5A00D 100%)";

  // When the hero image has the title baked in, we skip the overlay text
  // so we don't compete with the image's own typography.
  const imageHasTitle = trip.heroImageContainsTitle ?? !!trip.heroImage;

  // Aspect ratio: wider for narrative images, taller for plain photos.
  const aspectClass = imageHasTitle ? "aspect-[2/1]" : "aspect-[16/10]";

  return (
    <section className="rounded-2xl overflow-hidden shadow-card bg-white">
      {/* Image / gradient banner with consistent aspect ratio */}
      <div
        className={`relative w-full ${aspectClass} bg-cover bg-center`}
        style={{
          backgroundImage: trip.heroImage
            ? `url('${trip.heroImage}'), ${fallbackGradient}`
            : fallbackGradient,
        }}
      >
        {/* Overlay text only when image doesn't carry the title */}
        {!imageHasTitle && (
          <>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,20,41,0.85) 0%, rgba(0,20,41,0.35) 55%, rgba(0,20,41,0.1) 100%)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-cream">
              {trip.occasionDetails?.icon && (
                <span className="text-3xl block mb-1">
                  {trip.occasionDetails.icon}
                </span>
              )}
              <h2 className="font-display text-2xl font-semibold leading-tight">
                {trip.occasionDetails?.title ??
                  trip.occasion ??
                  trip.destination}
              </h2>
              {trip.occasionDetails?.reason && (
                <p className="text-sm text-cream/90 mt-2 leading-relaxed">
                  {trip.occasionDetails.reason}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Detail strip below image */}
      <div className="p-4 space-y-3">
        {imageHasTitle && trip.occasionDetails?.reason && (
          <p className="text-sm text-ink-dark leading-relaxed">
            {trip.occasionDetails.reason}
          </p>
        )}

        {trip.occasionDetails?.highlightLabel && (
          <div className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/30 rounded-full px-3 py-1">
            <Sparkles size={11} className="text-gold-600" />
            <span className="text-[11px] uppercase tracking-wider text-gold-600 font-semibold">
              Highlight: {trip.occasionDetails.highlightLabel}
            </span>
          </div>
        )}

        {trip.participants && trip.participants.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <ParticipantsRow
              participants={trip.participants}
              variant="light"
              size="md"
            />
            <p className="text-[11px] text-ink-light">
              {trip.participants.length} Reisende
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
