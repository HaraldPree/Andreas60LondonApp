import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Users,
  Camera,
  AlertTriangle,
  Scale,
  XCircle,
  Sparkles,
  Mail,
} from "lucide-react";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "AGB",
};

export default function AGBPage() {
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
          <h1 className="font-display text-lg font-semibold">
            Nutzungsbedingungen (AGB)
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6 space-y-5">
        <section>
          <p className="text-xs text-ink-mid leading-relaxed">
            Stand: Mai 2026 · Version 1.0 · Privates Hobby-Projekt (kein
            gewerblicher Vertrieb)
          </p>
        </section>

        <Section icon={<FileText />} title="1. Geltungsbereich">
          <p className="text-sm text-ink-dark leading-relaxed">
            Diese Nutzungsbedingungen regeln die Nutzung der privaten Reise-
            Begleiter-App (im Folgenden „die App") durch Mitglieder einer
            geschlossenen Reisegruppe. Die App wird Harald Pree als
            Privatperson zur Verfügung gestellt, nicht gewerblich vertrieben
            und nicht für die Öffentlichkeit angeboten.
          </p>
          <p className="text-xs text-ink-mid mt-2 italic leading-relaxed">
            Mit der ersten Verwendung der App (insbesondere PIN-Eingabe und
            Wahl des Profils) akzeptierst du diese Nutzungsbedingungen
            sowie unsere{" "}
            <Link href="/datenschutz" className="underline">
              Datenschutz-Erklärung
            </Link>
            .
          </p>
        </Section>

        <Section icon={<Users />} title="2. Nutzerkreis">
          <p className="text-sm text-ink-dark leading-relaxed">
            Die App ist ausschließlich für die jeweilige Reisegruppe
            bestimmt — typischerweise ein geschlossener Kreis von 2–10
            Personen. Der Zugang ist durch eine PIN geschützt; die
            Weitergabe der PIN an Personen außerhalb der Reisegruppe ist
            untersagt.
          </p>
          <ul className="text-xs text-ink-mid mt-2 space-y-1 leading-relaxed">
            <li>
              • Die Gruppenleitung (Reise-Organisator:in) bestimmt das
              Reiseprogramm und teilt den Zugang.
            </li>
            <li>
              • Mitglieder der Reisegruppe erhalten Zugriff auf alle
              gruppenspezifischen Inhalte (Programm, Treffpunkte,
              Notfallinformationen).
            </li>
            <li>
              • Profil-Fotos / Avatare sind innerhalb der Reisegruppe
              sichtbar — das ist Zweck der Mitgliederliste.
            </li>
          </ul>
        </Section>

        <Section icon={<Camera />} title="3. Foto-Upload und Foto-Sharing">
          <p className="text-sm text-ink-dark leading-relaxed">
            Du kannst Fotos in der App hochladen. Hochgeladene Fotos werden
            in einem von drei Sichtbarkeitsstufen gespeichert, die DU pro
            Foto selbst wählst:
          </p>

          <div className="space-y-2 mt-3">
            <div className="rounded-xl bg-cream-50 border border-cream-200 p-3">
              <p className="text-xs font-semibold text-navy">
                🔒 Privat (Standardeinstellung)
              </p>
              <p className="text-[11px] text-ink-mid mt-0.5 leading-relaxed">
                Foto wird nur auf deinem eigenen Gerät gespeichert
                (Browser-Storage). Niemand sonst hat Zugriff.
              </p>
            </div>
            <div className="rounded-xl bg-gold/10 border border-gold/30 p-3">
              <p className="text-xs font-semibold text-navy">
                🎂 Mit Geburtstagskind teilen (falls vorhanden)
              </p>
              <p className="text-[11px] text-ink-mid mt-0.5 leading-relaxed">
                Foto wird in einem geteilten Speicher abgelegt und ist für
                die Person sichtbar die als „Geburtstagskind / gefeierte
                Person" markiert ist — sonst niemand.
              </p>
            </div>
            <div className="rounded-xl bg-info/10 border border-info/30 p-3">
              <p className="text-xs font-semibold text-navy">
                🌐 Mit ganzer Gruppe teilen
              </p>
              <p className="text-[11px] text-ink-mid mt-0.5 leading-relaxed">
                Foto wird in einem geteilten Speicher abgelegt und ist für
                alle Mitglieder dieser Reisegruppe sichtbar.
              </p>
            </div>
          </div>

          <p className="text-xs text-ink-dark mt-3 leading-relaxed">
            <strong>Deine Pflichten beim Hochladen:</strong>
          </p>
          <ul className="text-xs text-ink-mid mt-1 space-y-1 leading-relaxed">
            <li>
              • Du lädst nur Fotos hoch, an denen du die Rechte hast oder
              für die du die nötige Einwilligung hast.
            </li>
            <li>
              • Wenn andere Personen auf dem Foto erkennbar sind, brauchst
              du deren Einwilligung (sofern sie nicht bereits Teil dieser
              Reisegruppe sind und mit der Verarbeitung gerechnet haben).
            </li>
            <li>
              • Du beachtest die Rechte Dritter (Urheberrecht, Persönlich-
              keitsrecht).
            </li>
            <li>
              • Du lädst keine rechtswidrigen, beleidigenden, gewalt-
              verherrlichenden oder sexuell expliziten Inhalte hoch.
            </li>
          </ul>

          <p className="text-xs text-ink-dark mt-3 leading-relaxed">
            <strong>Widerruf jederzeit möglich:</strong> Du kannst die
            Sichtbarkeitsstufe jedes deiner Fotos jederzeit ändern — auch
            wieder auf „🔒 Privat" zurücksetzen. Mit dem Widerruf wird das
            Foto sofort aus dem geteilten Speicher entfernt und ist für
            andere nicht mehr abrufbar.
          </p>
        </Section>

        <Section
          icon={<Sparkles />}
          title="4. KI-Funktionen (Claude AI)"
        >
          <p className="text-sm text-ink-dark leading-relaxed">
            Die App enthält KI-Funktionen (Chat-Begleiter, Foto-Location-
            Erkennung, Foto-Erzählung). Diese werden über die API von
            Anthropic PBC, USA (Modell „Claude") bereitgestellt.
          </p>
          <ul className="text-xs text-ink-mid mt-2 space-y-1 leading-relaxed">
            <li>
              • Bei aktiver Nutzung dieser Funktionen werden die jeweiligen
              Inhalte (z.B. eine Foto-Datei oder eine Chat-Frage) einmalig
              an Anthropic übermittelt.
            </li>
            <li>
              • Anthropic speichert übermittelte Inhalte standardmäßig
              nicht für Trainingszwecke (laut deren{" "}
              <a
                href="https://www.anthropic.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-navy"
              >
                Privacy Policy
              </a>
              ).
            </li>
            <li>
              • <strong>KI-Antworten können falsch sein</strong> — sie
              dürfen nicht als verbindliche Auskunft (medizinisch,
              rechtlich, finanziell) verstanden werden.
            </li>
            <li>
              • Sende keine besonders sensitiven Daten (Gesundheits-,
              Finanzdaten, Sozialversicherungsnummern) an die KI.
            </li>
          </ul>
        </Section>

        <Section
          icon={<AlertTriangle />}
          title="5. Haftungsausschluss"
        >
          <ul className="text-xs text-ink-dark space-y-1.5 leading-relaxed">
            <li>
              • Die App stellt Reiseinformationen{" "}
              <strong>ohne Gewähr</strong> auf Vollständigkeit oder
              Richtigkeit bereit. Reise-Pläne, Öffnungszeiten,
              Reservierungen, Notfallnummern usw. sind vor Reiseantritt
              zu prüfen.
            </li>
            <li>
              • Externe Links (Google Maps, TheFork, NHS, AviationStack
              etc.) führen zu Drittseiten — deren Inhalte und Funktion
              liegen außerhalb unseres Einflussbereiches.
            </li>
            <li>
              • Die App ersetzt <strong>keine</strong> professionellen
              Reise-Beratung, keine ärztliche Behandlung, keine offizielle
              Notfall-Information, keine Reiserücktrittsversicherung.
            </li>
            <li>
              • Für Schäden durch Nutzung der App (z.B. ein verpasster Zug
              wegen falsch angezeigter Verkehrslage, eine falsche
              KI-Empfehlung) haftet der Betreiber nicht. Bei grober
              Fahrlässigkeit oder Vorsatz gilt selbstverständlich das
              gesetzliche Haftungsrecht.
            </li>
          </ul>
        </Section>

        <Section icon={<XCircle />} title="6. Verstöße & Sperrung">
          <p className="text-sm text-ink-dark leading-relaxed">
            Die Gruppenleitung behält sich vor, bei Verstoß gegen diese
            Nutzungsbedingungen (insbesondere Punkt 3 zu Foto-Inhalten)
            den Zugriff einzelner Mitglieder zu beenden — z.B. durch
            PIN-Änderung oder Ausschluss aus dem Foto-Pool.
          </p>
          <p className="text-xs text-ink-mid mt-2 italic leading-relaxed">
            Bei rechtswidrigen Inhalten oder Verdacht auf Straftaten
            (etwa beleidigende Foto-Captions, Verletzung des Rechts am
            eigenen Bild) sind wir gehalten, Inhalte zu entfernen und
            ggf. an zuständige Stellen zu melden.
          </p>
        </Section>

        <Section icon={<Scale />} title="7. Rechtswahl & Gerichtsstand">
          <p className="text-sm text-ink-dark leading-relaxed">
            Es gilt österreichisches Recht. Gerichtsstand für Streitigkeiten
            ist — soweit gesetzlich zulässig — der Wohnsitz des Betreibers
            (Harald Pree, Österreich).
          </p>
          <p className="text-xs text-ink-mid mt-2 italic leading-relaxed">
            Bei Verbrauchern bleiben zwingende Vorschriften des
            Verbraucherschutzes des jeweiligen Heimatlandes unberührt.
          </p>
        </Section>

        <Section icon={<Mail />} title="8. Kontakt & Änderungen">
          <p className="text-sm text-ink-dark leading-relaxed">
            Kontakt zum Betreiber:{" "}
            <strong>Harald Pree</strong>, erreichbar über die Reise-WhatsApp-
            Gruppe oder direkt via Nachricht. Postanschrift auf Anfrage.
          </p>
          <p className="text-xs text-ink-mid mt-2 leading-relaxed">
            Diese Nutzungsbedingungen können bei wesentlichen
            Funktionsänderungen angepasst werden — du wirst dann beim
            nächsten Öffnen der App auf die Änderung hingewiesen und um
            erneute Zustimmung gebeten.
          </p>
        </Section>

        <div className="rounded-2xl bg-cream-100 border border-cream-200 p-4 text-center">
          <p className="text-xs text-ink-mid leading-relaxed">
            Diese AGB sind in laienverständlicher Sprache verfasst und
            ersetzen keine anwaltliche Beratung. Für eine kommerzielle
            Verkaufsversion wären sie durch fachkundige Rechtsberatung zu
            ergänzen / ersetzen.
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
