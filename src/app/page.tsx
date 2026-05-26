import Link from "next/link";
import { ArrowRight, Calendar, Users, Sparkles, Search } from "lucide-react";
import { trips } from "@/data/trips";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Footer } from "@/components/layout/Footer";
import { ParticipantsRow } from "@/components/trip/ParticipantsRow";
import { TripCountdownChip } from "@/components/trip/TripCountdownChip";
import { InstallHint } from "@/components/pwa/InstallHint";
import { UpdateBanner } from "@/components/pwa/UpdateBanner";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <UpdateBanner />
      {/* Hero / Brand bar */}
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-app px-4 pt-6 pb-8 text-center">
          <p className="font-display text-[11px] tracking-[0.22em] text-gold font-semibold uppercase">
            Travel Concierge
          </p>
          <GoldDivider width="sm" className="mx-auto my-3" />
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Dein persönlicher Reisebegleiter
          </h1>
          <p className="text-sm text-cream/80 mt-2">
            Deine Reise – elegant in der Tasche
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        <InstallHint />

        <div className="mb-4">
          <h2 className="font-display text-lg font-semibold text-navy">
            Verfügbare Reisen
          </h2>
          <p className="text-xs text-ink-mid mt-0.5">
            Wählen Sie Ihre Reise um die Companion-App zu öffnen.
          </p>
        </div>

        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.slug}>
              <Link
                href={`/${trip.slug}`}
                className="block rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden transition-all hover:shadow-elevated active:scale-[0.99]"
              >
                {/* Hero image / gradient banner */}
                <div
                  className="relative h-32 w-full bg-cover bg-center"
                  style={{
                    backgroundImage: trip.heroImage
                      ? `url('${trip.heroImage}'), ${trip.heroGradient ?? "linear-gradient(135deg, #003366 0%, #2980B9 70%, #E5A00D 100%)"}`
                      : trip.heroGradient ??
                        "linear-gradient(135deg, #003366 0%, #2980B9 70%, #E5A00D 100%)",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,20,41,0.75) 0%, rgba(0,20,41,0.15) 70%)",
                    }}
                  />
                  {/* Countdown chip top-right */}
                  <div className="absolute top-2 right-2">
                    <TripCountdownChip
                      startIso={trip.days[0]?.isoDate}
                      endIso={trip.days[trip.days.length - 1]?.isoDate}
                    />
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between text-cream">
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold leading-tight">
                        {trip.destination}
                      </h3>
                      <p className="text-[11px] opacity-90 inline-flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> {trip.subtitle}
                      </p>
                    </div>
                    <ArrowRight size={18} className="text-gold flex-shrink-0 mb-0.5" />
                  </div>
                </div>

                {/* Body */}
                <div className="p-3 space-y-2">
                  {trip.occasionDetails?.title && (
                    <div className="flex items-start gap-2">
                      <span className="text-base flex-shrink-0">
                        {trip.occasionDetails.icon ?? "🎉"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-navy leading-tight">
                          {trip.occasionDetails.title}
                        </p>
                        {trip.occasionDetails.highlightLabel && (
                          <p className="text-[10px] text-gold-600 inline-flex items-center gap-1 mt-0.5">
                            <Sparkles size={9} /> {trip.occasionDetails.highlightLabel}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {trip.participants && trip.participants.length > 0 ? (
                    <div className="flex items-center justify-between pt-1">
                      <ParticipantsRow
                        participants={trip.participants}
                        variant="light"
                        size="sm"
                      />
                      <span className="text-[10px] text-ink-light">
                        {trip.participants.length} Reisende
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-ink-mid inline-flex items-center gap-1">
                      <Users size={10} /> {trip.group}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* v1.10.0 / v1.11.1 — KI-Event-Recherche pro Trip.
            Bewusst dezent — nicht für End-Reisende, sondern für den
            Reise-Vorbereiter. v1.11.1 umbenannt auf User-Wunsch:
            "Veranstalter-Tools" war zweideutig (Event-Veranstalter vs.
            Reise-Veranstalter) → klare Bezeichnung was es tut. */}
        {trips.length > 0 && (
          <details className="mt-6 rounded-2xl bg-white/60 border border-cream-200 px-4 py-3">
            <summary className="text-xs text-ink-mid font-semibold cursor-pointer inline-flex items-center gap-1">
              <Sparkles size={11} className="text-gold-600" /> KI Event-Recherche
            </summary>
            <ul className="mt-2 space-y-1.5">
              {trips.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/research/events?trip=${t.slug}`}
                    className="text-[11px] text-navy hover:text-gold transition inline-flex items-center gap-1"
                  >
                    <Search size={11} /> Events für {t.destination} suchen
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-6 rounded-2xl bg-white/60 border border-cream-200 p-4 text-center">
          <p className="text-xs text-ink-mid leading-relaxed">
            Privates Test-Produkt für die Reisegruppe.
          </p>
        </div>

        <Footer />
      </main>
    </div>
  );
}
