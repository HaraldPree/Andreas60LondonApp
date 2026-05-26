import type { InspirationCategory } from "@/data/inspirations";
import { Sparkles } from "lucide-react";
// v1.19.0 — Inspirations-Quelle aus Tenant (heute Default-Set, später
// per Tenant überschreibbar).
import {
  getCurrentTenant,
  getInspirationsForTenant,
} from "@/lib/tenant/current";

/**
 * v1.18.0 — Inspirations-Sektion der Landing-Page.
 *
 * Zeigt Reise-Konzept-Karten als Anker fürs Beratungsgespräch.
 * Heute statisch (siehe `src/data/inspirations.ts`) — später per
 * Tenant überschreibbar (Reisebüro hinterlegt eigene Vorschläge).
 *
 * Anti-Halluzinations-Disziplin: KEINE konkreten Preise/Termine/
 * Hotelnamen. Nur Konzept + was Travel Concierge dabei leistet.
 */
export function InspirationsSection() {
  const inspirations = getInspirationsForTenant(getCurrentTenant());
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-display text-lg font-semibold text-navy inline-flex items-center gap-2">
          <Sparkles size={16} className="text-gold-600" />
          Inspirationen
        </h2>
        <p className="text-xs text-ink-mid mt-0.5 leading-relaxed">
          Reise-Konzepte die wir mit Travel Concierge schon abgebildet
          haben oder gerne kuratieren würden. Klick auf eine Karte
          öffnet die Beratungs-Anfrage.
        </p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {inspirations.map((entry) => (
          <li
            key={entry.id}
            className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4 hover:shadow-elevated transition"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{entry.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-sm font-semibold text-navy leading-tight">
                    {entry.title}
                  </h3>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${badgeColor(entry.category)}`}
                  >
                    {categoryLabel(entry.category)}
                  </span>
                </div>
                <p className="text-[10px] text-ink-light font-mono mt-0.5">
                  {entry.durationLabel}
                </p>
                <p className="text-[11px] text-ink-mid mt-1.5 leading-relaxed">
                  {entry.description}
                </p>
                {entry.highlights.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {entry.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-[10px] text-ink-dark leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gold"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                {entry.source && (
                  <p className="text-[9px] text-ink-light italic mt-2">
                    {entry.source}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function categoryLabel(c: InspirationCategory): string {
  const m: Record<InspirationCategory, string> = {
    "city-break": "Stadt",
    nature: "Natur",
    culture: "Kultur",
    premium: "Premium",
    family: "Familie",
    adventure: "Abenteuer",
  };
  return m[c];
}

function badgeColor(c: InspirationCategory): string {
  const m: Record<InspirationCategory, string> = {
    "city-break": "bg-navy/10 text-navy",
    nature: "bg-success/10 text-success",
    culture: "bg-gold/15 text-gold-600",
    premium: "bg-info/10 text-info",
    family: "bg-warning/10 text-warning",
    adventure: "bg-warning/15 text-warning",
  };
  return m[c];
}
