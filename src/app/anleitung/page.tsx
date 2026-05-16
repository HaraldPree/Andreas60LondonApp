import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  MapPinned,
  Camera,
  Ticket,
  LifeBuoy,
  Info,
  Smartphone,
  Lock,
  UserCircle2,
  Wifi,
} from "lucide-react";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Anleitung",
};

export default function GuidePage() {
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
          <h1 className="font-display text-lg font-semibold">Anleitung</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6 space-y-5">
        {/* Welcome */}
        <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-700 text-cream p-5 text-center shadow-elevated">
          <Sparkles size={24} className="text-gold mx-auto mb-2" />
          <GoldDivider width="sm" className="mx-auto mb-3" />
          <h2 className="font-display text-2xl font-semibold leading-tight">
            Willkommen!
          </h2>
          <p className="text-sm text-cream/85 mt-2 leading-relaxed">
            Dieser Reisebegleiter macht eure London-Reise einfacher. Hier eine
            kurze Einweisung, was die App kann.
          </p>
        </section>

        {/* Quick Start */}
        <Section icon={<Smartphone />} title="In 3 Schritten loslegen">
          <ol className="space-y-3 text-sm text-ink-dark">
            <Step
              num={1}
              title="App auf Home-Screen installieren"
              text="Dann hast du ein eigenes Icon wie bei einer richtigen App. Geht so:"
            >
              <ul className="text-xs text-ink-mid mt-1 space-y-0.5">
                <li>
                  • <strong>iPhone (Safari):</strong> Unten auf Teilen-Icon →
                  „Zum Home-Bildschirm"
                </li>
                <li>
                  • <strong>Android (Chrome/Samsung):</strong> Menü oben rechts
                  → „App zum Startbildschirm hinzufügen"
                </li>
              </ul>
            </Step>
            <Step
              num={2}
              title='Beim ersten Öffnen "Wer bist du?" auswählen'
              text="So weiß die App, wer du bist – AI grüßt dich namentlich, deine Packliste ist privat, deine Gesundheitskarte ist nur für dich sichtbar."
            />
            <Step
              num={3}
              title="Loslegen"
              text="Du springst direkt ins Programm. Unten sind 6 Tabs – schau einfach mal durch."
            />
          </ol>
        </Section>

        {/* Tabs walkthrough */}
        <h2 className="font-display text-lg font-semibold text-navy px-1 pt-2">
          Die 6 Tabs im Überblick
        </h2>

        <TabSection
          icon={<Calendar />}
          color="bg-navy/15 text-navy"
          title="Programm"
        >
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>Tageskarten</strong>: jeder Tag aufklappbar mit Timeline,
              Tipps + Karte-Links
            </Li>
            <Li>
              <strong>Live-Wetter</strong> + 5-Tage-Vorschau für London
            </Li>
            <Li>
              <strong>Plan B bei Regen</strong>: erscheint automatisch wenn
              Regen-Wahrscheinlichkeit hoch
            </Li>
            <Li>
              <strong>Tube-Streik-Pillen</strong>: jeden Tag wird angezeigt
              welche Zeiten der Streik aktiv ist
            </Li>
            <Li>
              <strong>Eure Entdeckungen</strong>: gold-umrahmt, das was ihr
              selbst zur Reise hinzufügt
            </Li>
          </ul>
        </TabSection>

        <TabSection
          icon={<MapPinned />}
          color="bg-info/15 text-info"
          title="Karte"
        >
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              Alle POIs der Reise sortiert nach Kategorie (Sights, Restaurants,
              etc.)
            </Li>
            <Li>
              Filter: Alle / Tag 1-5 / Hidden Places / <strong>In der Nähe</strong>
            </Li>
            <Li>
              <strong>Wo bin ich?</strong> Button → Standort wird gefragt, dann
              siehst du Entfernungen zu jedem Ort
            </Li>
            <Li>
              Jeder Eintrag öffnet Google Maps in eigener App
            </Li>
          </ul>
        </TabSection>

        <TabSection
          icon={<Camera />}
          color="bg-gold/20 text-gold-600"
          title="Fotos"
        >
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>"Wo ist das?"</strong> (oben blau): Foto vom Freund
              hochladen → KI sagt dir, was das ist + wie du hinkommst (mit
              Streik-Hinweis!). <em>Du wirst gefragt bevor das Foto gesendet
              wird.</em>
            </Li>
            <Li>
              <strong>Eigene Fotos</strong>: speichere deine Reise-Fotos lokal
              auf dem Handy. Werden automatisch nach Tag sortiert.
            </Li>
            <Li>
              <strong>"Erzähl mir was"</strong>: KI beschreibt jedes Foto mit
              Kontext zur Reise.
            </Li>
            <Li>
              <strong>"Bearbeiten"</strong> oben rechts: Fotos einzeln löschen
              oder alle auf einmal.
            </Li>
          </ul>
        </TabSection>

        <TabSection
          icon={<Ticket />}
          color="bg-success/15 text-success"
          title="Reservierungen"
        >
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              Status-Toggle pro Reservierung:{" "}
              <span className="text-warning">offen</span> →{" "}
              <span className="text-gold-600">reserviert</span> →{" "}
              <span className="text-success">erledigt</span>
            </Li>
            <Li>
              Cedric Grolet ist <strong>fix für Di 13:00</strong> – mit
              Reservierungs-Nummer + Telefon-Direktwahl
            </Li>
            <Li>Sky Garden, Ronnie Scott's, Blues Kitchen als Vorschläge</Li>
          </ul>
        </TabSection>

        <TabSection
          icon={<LifeBuoy />}
          color="bg-warning/15 text-warning"
          title="SOS"
        >
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>🚨 Großer roter 999-Button</strong> oben – ein Tap ruft
              Notruf an
            </Li>
            <Li>
              Weitere Nummern: 112 (EU), NHS 111, Polizei 101
            </Li>
            <Li>
              Österreichische Botschaft mit Anruf + Karte + Anfahrt
            </Li>
            <Li>
              5 Apotheken/Krankenhäuser inkl. 24h-Notapotheke + UCH-Notaufnahme
            </Li>
            <Li>
              <strong>Persönliche Gesundheitskarte</strong> nur für DICH
              sichtbar – Blutgruppe, Allergien, Dauermedikation, Notfallkontakt.
              <em> Bleibt auf deinem Handy, niemand sonst sieht das.</em>
            </Li>
          </ul>
        </TabSection>

        <TabSection
          icon={<Info />}
          color="bg-ink-light/20 text-ink-mid"
          title="Info & Hilfe"
        >
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>Dein Profil</strong>: zeigt wer du bist + was personalisiert ist
            </Li>
            <Li>
              <strong>Packliste</strong> persönlich, wetter-intelligent (z.B.
              "Regenjacke" weil 60% Regen Mi)
            </Li>
            <Li>
              <strong>Laufrouten</strong> inkl. Lukas-Tipp (Regent's Park +
              Primrose Hill)
            </Li>
            <Li>
              <strong>Standort teilen</strong>: Anleitung für WhatsApp Live
              Location (wir tracken NICHT)
            </Li>
            <Li>
              <strong>Währungsrechner</strong> GBP↔EUR live + Schnellbuttons
            </Li>
            <Li>
              <strong>Ausgaben-Tracker</strong>: wer zahlt was, Auto-Split
              (Andrea ist eingeladen 🎂)
            </Li>
            <Li>
              <strong>15 Restaurants</strong> mit TheFork-Buchungs-Links
            </Li>
            <Li>
              <strong>Unterkunft + Flug</strong> mit Live-Flugstatus (wenn Key
              gesetzt)
            </Li>
            <Li>
              <strong>TfL Live-Status</strong> aller Tube-Linien (auto-refresh)
            </Li>
            <Li>
              <strong>Phrasebook</strong>: 40 Sätze DE→EN mit Aussprache +
              Vorlesen-Button (offline)
            </Li>
            <Li>
              <strong>Hidden Places</strong>: 8 Geheimtipps
            </Li>
            <Li>
              <strong>Privacy & DSGVO</strong>: deine Daten exportieren oder
              löschen
            </Li>
          </ul>
        </TabSection>

        {/* AI Section */}
        <Section
          icon={<Sparkles className="text-gold" />}
          title="Der KI-Reisebegleiter (Sparkles-Button rechts unten)"
          highlight
        >
          <p className="text-sm text-ink-dark leading-relaxed mb-2">
            Der goldene Funken-Button öffnet einen Chat mit Claude. Er kennt:
          </p>
          <ul className="space-y-1 text-xs text-ink-mid">
            <Li>Komplettes Reiseprogramm (alle 5 Tage)</Li>
            <Li>Eure Namen (begrüßt dich persönlich)</Li>
            <Li>Live-Wetter + Tube-Status (fragt selbst nach)</Li>
            <Li>Alle Reservierungen + Hidden Places + Restaurants</Li>
          </ul>
          <p className="text-sm text-ink-dark leading-relaxed mt-3">
            <strong>Beispiel-Fragen:</strong>
          </p>
          <ul className="space-y-0.5 text-xs text-ink-mid italic">
            <Li>„Was machen wir heute am besten?"</Li>
            <Li>„Wie ist das Wetter morgen?"</Li>
            <Li>„Empfehl ein Restaurant in Notting Hill"</Li>
            <Li>„Wie sage ich auf Englisch ‚Die Rechnung bitte'?"</Li>
            <Li>„Andrea hat Bauchweh – wo ist die nächste Apotheke?"</Li>
          </ul>
          <p className="text-[11px] text-ink-mid italic mt-2 leading-relaxed">
            🎤 Du kannst auch über das <strong>Mikrofon-Icon</strong> sprechen,
            und mit dem <strong>Lautsprecher-Icon</strong> die Antworten
            vorlesen lassen.
          </p>
        </Section>

        {/* Privacy */}
        <Section
          icon={<Lock className="text-success" />}
          title="Datenschutz – kurz & einfach"
        >
          <ul className="space-y-2 text-sm text-ink-dark">
            <Li>
              <strong>Deine Inhalte bleiben auf deinem Gerät.</strong> Wir
              haben keinen Server, der etwas speichert.
            </Li>
            <Li>
              <strong>Gesundheitsdaten gehen NIE an Server oder KI.</strong>{" "}
              Andere Reisende können deine Gesundheitskarte nicht sehen.
            </Li>
            <Li>
              <strong>Foto-KI fragt vorher.</strong> Bevor ein Foto an die KI
              geht, wirst du explizit gefragt. Wahl gespeichert.
            </Li>
            <Li>
              <strong>Standort wird nicht getrackt.</strong> Wenn du teilen
              willst → WhatsApp Live Location (du steuerst Dauer + Empfänger).
            </Li>
            <Li>
              <strong>Du kannst alles löschen oder exportieren.</strong> Info-Tab
              → ganz unten „Privacy & DSGVO".
            </Li>
          </ul>
          <Link
            href="/datenschutz"
            className="inline-block text-xs text-navy underline font-semibold mt-3"
          >
            Komplette Datenschutz-Info →
          </Link>
        </Section>

        {/* Identity */}
        <Section icon={<UserCircle2 />} title='Avatar oben rechts: "Wer bin ich?"'>
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>Tap auf das Avatar-Foto im Header → Identität wechseln</Li>
            <Li>
              Wenn du z.B. Haralds Handy ausleihst, kann er dort als Harald
              eingeloggt bleiben
            </Li>
            <Li>
              "Abmelden" löscht <strong>nur deine Identitäts-Wahl</strong>, deine
              Daten bleiben am Handy
            </Li>
          </ul>
        </Section>

        {/* Offline / connectivity */}
        <Section icon={<Wifi />} title="Internet & Offline">
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>Online nötig für:</strong> Live-Wetter, Tube-Status,
              KI-Companion, Foto-Location, Karten-Links, TheFork-Buchung
            </Li>
            <Li>
              <strong>Offline funktioniert:</strong> Programm, Reservierungen,
              Packliste, Phrasebook (vorlesen), Notfallnummern, Gesundheitskarte,
              eigene Fotos
            </Li>
            <Li>
              eSIM oder lokale SIM empfohlen für die Reise – die wichtigsten
              Daten sind aber auch ohne Netz im Cache.
            </Li>
          </ul>
        </Section>

        {/* Help / Contact */}
        <Section icon={<UserCircle2 />} title="Hilfe & Kontakt">
          <p className="text-sm text-ink-dark leading-relaxed">
            Bei Fragen, Bugs oder Feature-Wünschen: <strong>Harald fragen</strong>{" "}
            – er hat die App gebaut und kann sie spontan anpassen. Auch während
            der Reise gibt's „Neue Version verfügbar"-Banner, sobald er was
            ändert.
          </p>
        </Section>

        <div className="rounded-2xl bg-gold/10 border border-gold/30 p-4 text-center">
          <p className="text-sm font-semibold text-navy">Viel Spaß in London! 🎂</p>
          <p className="text-xs text-ink-mid mt-1 italic">
            Happy 60th, Andrea ♥
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
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl shadow-card border overflow-hidden ${
        highlight
          ? "bg-gradient-to-br from-gold/10 to-cream border-gold/40"
          : "bg-white border-cream-200/50"
      }`}
    >
      <div
        className={`px-4 py-2.5 border-b flex items-center gap-2 ${
          highlight
            ? "bg-gold/15 border-gold/30"
            : "bg-navy/5 border-cream-200"
        }`}
      >
        <span className={highlight ? "text-gold-600" : "text-navy"}>
          {icon}
        </span>
        <h2 className="font-display text-base font-semibold text-navy">
          {title}
        </h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function TabSection({
  icon,
  color,
  title,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-cream-200 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
        >
          {icon}
        </div>
        <h3 className="font-display text-lg font-semibold text-navy">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Step({
  num,
  title,
  text,
  children,
}: {
  num: number;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-gold text-navy font-bold flex items-center justify-center flex-shrink-0 text-sm">
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-navy">{title}</p>
        <p className="text-xs text-ink-mid mt-0.5">{text}</p>
        {children}
      </div>
    </li>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gold leading-relaxed">
      {children}
    </li>
  );
}
