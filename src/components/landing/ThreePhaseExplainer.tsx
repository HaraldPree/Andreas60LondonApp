import { Compass, Sparkles, Heart } from "lucide-react";

/**
 * v1.18.0 — Drei-Phasen-Erklärung auf der Landing-Page.
 *
 * Bildet das Apple-Way-Navigation-Konzept (v1.17.0) auch außen ab —
 * Interessenten verstehen sofort wie Travel Concierge eine Reise
 * begleitet: Vorbereitung, Erlebnis, Erinnerung.
 *
 * Pragmatisch ohne Marketing-Übertreibungen: was leistet die App in
 * welcher Phase, nicht „revolutioniert" / „verändert dein Leben"-
 * Floskeln.
 */
export function ThreePhaseExplainer() {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-display text-lg font-semibold text-navy">
          So funktioniert Travel Concierge
        </h2>
        <p className="text-xs text-ink-mid mt-0.5 leading-relaxed">
          Drei Phasen einer Reise, eine App.
        </p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PhaseCard
          Icon={Compass}
          phase="Planen"
          tint="navy"
          accent="bg-navy/10 text-navy"
          when="Vor + während Reise"
          description="Wünsche sammeln, Karte erkunden, Reservierungen koordinieren. WhatsApp-Polls für Gruppen-Entscheidungen."
          features={[
            "Place-Library mit Trust-Badges",
            "Interaktive Leaflet-Karte",
            "Reservierungs-Tracker",
          ]}
        />
        <PhaseCard
          Icon={Sparkles}
          phase="Erleben"
          tint="gold"
          accent="bg-gold/15 text-gold-600"
          when="Während Reise"
          description="Tages-Programm, Live-Wetter, AI-Concierge als persönlicher Begleiter. Spontane Fragen, Tube-Status, Plan-B-Vorschläge."
          features={[
            "Tagesprogramm mit Disruptions-Hinweisen",
            "Live-Wetter + 5-Tage-Forecast",
            "AI-Companion (Claude Opus 4.7)",
          ]}
        />
        <PhaseCard
          Icon={Heart}
          phase="Erinnern"
          tint="success"
          accent="bg-success/10 text-success"
          when="Nach Reise"
          description="Foto-Galerie, Reise-Rückblick aus Foto-EXIF, Abschieds-Reel, Foto-Buch-Export. Plus Feedback-Karte."
          features={[
            "Erlebt-Rückblick aus Foto-GPS",
            "Goodbye-Reel mit Konfetti",
            "Foto-Buch-Export (ZIP für HappyFoto/CEWE)",
          ]}
        />
      </ul>
    </section>
  );
}

function PhaseCard({
  Icon,
  phase,
  when,
  description,
  features,
  accent,
}: {
  Icon: typeof Compass;
  phase: string;
  tint: "navy" | "gold" | "success";
  when: string;
  description: string;
  features: string[];
  accent: string;
}) {
  return (
    <li className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4">
      <div
        className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center mb-3`}
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
        {when}
      </p>
      <h3 className="font-display text-base font-semibold text-navy leading-tight mt-0.5">
        {phase}
      </h3>
      <p className="text-[11px] text-ink-mid mt-2 leading-relaxed">
        {description}
      </p>
      <ul className="mt-3 space-y-1">
        {features.map((f, i) => (
          <li
            key={i}
            className="text-[10px] text-ink-dark leading-snug pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gold"
          >
            {f}
          </li>
        ))}
      </ul>
    </li>
  );
}
