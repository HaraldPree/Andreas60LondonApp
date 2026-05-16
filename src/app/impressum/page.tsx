import Link from "next/link";
import { ArrowLeft, User, Server, Brain, AlertTriangle, Mail } from "lucide-react";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy text-cream sticky top-0 z-30">
        <div className="mx-auto max-w-app px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
            aria-label="Zurück"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="font-display text-lg font-semibold">Impressum</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6 space-y-5">
        <section>
          <p className="text-xs text-ink-mid leading-relaxed">
            Stand: Mai 2026 · Privates, nicht-gewerbliches Hobbyprojekt für
            eine 5-köpfige Reisegruppe
          </p>
        </section>

        <Section icon={<User />} title="Verantwortlich für den Inhalt">
          <div className="space-y-1 text-sm text-ink-dark leading-relaxed">
            <p>
              <strong>Harald Pree</strong>
            </p>
            <p className="text-xs text-ink-mid italic">
              Privatperson, kein Unternehmen
            </p>
          </div>
          <p className="text-xs text-ink-mid mt-3 leading-relaxed">
            Diese App ist ein <strong>privates Hobbyprojekt</strong>, das
            ausschließlich einer geschlossenen Gruppe von 5 Reisenden für die
            Dauer einer einzelnen Reise zur Verfügung gestellt wird. Es findet
            kein gewerblicher Vertrieb statt, keine Vermarktung, keine
            Monetarisierung. Eine Impressumspflicht nach §&nbsp;5 ECG / §&nbsp;25
            MedienG besteht für rein private Webauftritte nicht — dieses
            Impressum wird auf freiwilliger Basis aus Transparenzgründen
            bereitgestellt.
          </p>
        </Section>

        <Section icon={<Mail />} title="Kontakt">
          <p className="text-sm text-ink-dark leading-relaxed">
            Die App-Nutzer kennen Harald persönlich und erreichen ihn am besten
            über die <strong>Reise-WhatsApp-Gruppe</strong> oder direkt per
            Nachricht.
          </p>
          <p className="text-xs text-ink-mid italic mt-2">
            Für Bugs, Feature-Wünsche oder Datenschutzanfragen einfach Harald
            ansprechen — Patches sind oft binnen Minuten live.
          </p>
        </Section>

        <Section icon={<Server />} title="Technischer Betrieb">
          <ul className="space-y-1.5 text-sm text-ink-dark leading-relaxed">
            <li>
              <strong>Hosting:</strong> Vercel Inc. (USA) — Edge-Network mit
              EU-Regionen
            </li>
            <li>
              <strong>Source-Repository:</strong> GitHub Inc. (USA)
            </li>
            <li>
              <strong>Code-Sprache:</strong> Next.js 14 / TypeScript / React
            </li>
            <li>
              <strong>Datenhaltung:</strong> ausschließlich im Browser des
              Nutzers (localStorage / IndexedDB) — keine eigene Datenbank,
              kein User-Account-System
            </li>
          </ul>
        </Section>

        <Section icon={<Brain />} title="KI-Komponente">
          <p className="text-sm text-ink-dark leading-relaxed">
            Bei aktiver Nutzung der KI-Funktionen (Chat-Begleiter,
            Foto-Location-Erkennung, Foto-Erzählung) werden Inhalte an{" "}
            <strong>Anthropic PBC</strong> (USA) gesendet und dort von Claude
            verarbeitet. Anthropic speichert übermittelte Inhalte
            standardmäßig nicht für Trainingszwecke
            (siehe{" "}
            <a
              href="https://www.anthropic.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-navy"
            >
              Anthropic Privacy Policy
            </a>
            ).
          </p>
          <p className="text-xs text-ink-mid italic mt-2 leading-relaxed">
            Details zur Datenverarbeitung und zur Übermittlung in die USA
            stehen auf der{" "}
            <Link href="/datenschutz" className="underline text-navy">
              Datenschutz-Seite
            </Link>
            .
          </p>
        </Section>

        <Section icon={<AlertTriangle />} title="Haftungsausschluss">
          <ul className="space-y-1.5 text-sm text-ink-dark leading-relaxed">
            <li>
              Sämtliche Informationen werden{" "}
              <strong>ohne Gewähr auf Richtigkeit oder Aktualität</strong>{" "}
              bereitgestellt. Reise-Programmpunkte, Öffnungszeiten,
              Verkehrshinweise, Notfallnummern und KI-Antworten können fehlerhaft
              sein — bitte kritische Informationen (Reservierungen, Notfall,
              Medizin) immer aus offiziellen Quellen verifizieren.
            </li>
            <li>
              <strong>KI-generierte Inhalte</strong> (Foto-Beschreibungen,
              Chat-Antworten, Ortsbestimmungen) können{" "}
              <strong>halluzinieren</strong> — Anthropic / Claude erfindet
              gelegentlich Fakten. Nicht für medizinische, rechtliche oder
              finanzielle Entscheidungen verwenden.
            </li>
            <li>
              Externe Links (Google Maps, TheFork, NHS, Botschaft etc.) führen
              zu Drittseiten, deren Inhalte und Datenschutz wir nicht
              beeinflussen.
            </li>
            <li>
              Diese App ersetzt keinen{" "}
              <strong>professionellen Reiseführer</strong>, keine
              Reiserücktritts­versicherung, keine ärztliche Beratung und keine
              offizielle Notfall-Information.
            </li>
          </ul>
        </Section>

        <Section icon={<User />} title="Urheberrecht">
          <p className="text-sm text-ink-dark leading-relaxed">
            Foto-Material (Hero, Avatare) und Reisedaten wurden mit
            Einverständnis der dargestellten Personen erfasst. Hosting-Logos,
            Markennamen und Symbole (TheFork, TfL, Lucide, Vercel etc.) sind
            Eigentum der jeweiligen Inhaber und werden nur referenzierend
            verwendet.
          </p>
          <p className="text-xs text-ink-mid italic mt-2">
            Eigener Quellcode steht in einem privaten GitHub-Repository, keine
            Lizenzfreigabe für Dritte.
          </p>
        </Section>

        <div className="rounded-2xl bg-gold/10 border border-gold/30 p-4 text-center">
          <p className="text-sm font-semibold text-navy">
            Fragen oder Korrekturwünsche?
          </p>
          <p className="text-xs text-ink-mid mt-1">
            Einfach Harald ansprechen — alle App-Nutzer kennen ihn persönlich.
          </p>
        </div>

        <GoldDivider width="sm" className="mx-auto my-4" />
        <Footer />
      </main>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="bg-navy/5 border-b border-cream-200 px-4 py-2.5 flex items-center gap-2">
        <span className="text-navy">{icon}</span>
        <h2 className="font-display text-base font-semibold text-navy">
          {title}
        </h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
