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
  Key,
  BookOpen,
  Wallet,
  Cloud,
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
            Diese kleine App begleitet euch durch Andreas 60. in London. Hier
            ist alles drin, was ihr unterwegs braucht.
          </p>
        </section>

        {/* Quick Start */}
        <Section icon={<Smartphone />} title="In 4 Minuten startklar">
          <ol className="space-y-3 text-sm text-ink-dark">
            <Step
              num={1}
              title="PIN von Harald eingeben"
              text="Die App ist privat — du brauchst den 4-stelligen Code, den du per WhatsApp bekommen hast."
            >
              <p className="text-[11px] text-ink-mid italic mt-1">
                Vergessen? Frag bei Harald nach.
              </p>
            </Step>
            <Step
              num={2}
              title='"Wer bist du?" auswählen'
              text="Tipp auf deinen Avatar oben rechts. Die App grüßt dich dann namentlich, deine Packliste & Notfallkarte sind nur für dich sichtbar."
            />
            <Step
              num={3}
              title="App als Icon auf den Home-Bildschirm"
              text="Damit du sie immer mit einem Tipp öffnest:"
            >
              <ul className="text-xs text-ink-mid mt-1 space-y-0.5">
                <li>
                  • <strong>iPhone (Safari):</strong> Teilen-Icon unten → „Zum
                  Home-Bildschirm"
                </li>
                <li>
                  • <strong>Android (Chrome / Samsung Internet):</strong> Menü
                  oben rechts → „App installieren" / „Zum Startbildschirm
                  hinzufügen"
                </li>
                <li>
                  • <strong>Firefox:</strong> ☰ → „Seite speichern unter" → „Zum
                  Startbildschirm"
                </li>
              </ul>
              <p className="text-[11px] text-ink-mid italic mt-1">
                Andrea ist dann das App-Icon 🎂
              </p>
            </Step>
            <Step
              num={4}
              title="Fertig — losschmökern"
              text="Unten sind 6 Tabs. Tipp mal überall rein, du kannst nichts kaputtmachen."
            />
          </ol>
        </Section>

        {/* Top features highlight */}
        <Section
          icon={<Sparkles className="text-gold" />}
          title="Was die App alles kann"
          highlight
        >
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>5-Tages-Programm</strong> mit Live-Wetter, Tipps und
              Plan&nbsp;B bei Regen
            </Li>
            <Li>
              <strong>Karte aller POIs</strong> + „In der Nähe"-Filter
            </Li>
            <Li>
              <strong>Foto-Tagebuch</strong> direkt am Handy, auto-sortiert nach
              Reisetag
            </Li>
            <Li>
              <strong>KI-Reisebegleiter</strong> — fragt alles auf Deutsch, mit
              Sprach-Eingabe und Vorlesen
            </Li>
            <Li>
              <strong>Foto-Location-Erkennung</strong>: „Wo ist das?" mit jedem
              Bild
            </Li>
            <Li>
              <strong>Live-Tube-Status</strong> + Streik-Hinweise pro Tag
            </Li>
            <Li>
              <strong>Reservierungen</strong> tracken (Cedric Grolet Di 13:00
              fix!)
            </Li>
            <Li>
              <strong>Ausgaben-Tracker</strong> mit Auto-Split unter den 4
              (Andrea ist eingeladen 🎂)
            </Li>
            <Li>
              <strong>Währungsrechner</strong> GBP↔EUR live
            </Li>
            <Li>
              <strong>SOS-Notfallnummern</strong> + Botschaft + Apotheken
            </Li>
            <Li>
              <strong>Phrasebook</strong>: 40 deutsch→englische Sätze mit
              Aussprache, vorlesbar
            </Li>
            <Li>
              <strong>Foto-Buch-Export</strong>: alle Reise-Fotos als ZIP für
              HappyFoto Designer & Co.
            </Li>
          </ul>
        </Section>

        {/* Tabs walkthrough */}
        <h2 className="font-display text-lg font-semibold text-navy px-1 pt-2">
          Die 6 Tabs unten
        </h2>

        <TabSection
          icon={<Calendar />}
          color="bg-navy/15 text-navy"
          title="Programm"
        >
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>Tageskarten</strong> mit Timeline, Tipps + Map-Links
            </Li>
            <Li>
              <strong>Live-Wetter</strong> + 5-Tage-Vorschau für London
            </Li>
            <Li>
              <strong>Plan B bei Regen</strong> erscheint automatisch wenn die
              Regen-Wahrscheinlichkeit hoch ist
            </Li>
            <Li>
              <strong>Tube-Streik-Pills</strong> zeigen pro Tag genau wann
              gestreikt wird
            </Li>
            <Li>
              <strong>Eure Entdeckungen</strong> (gold umrahmt): was ihr selbst
              aus Foto-Erkennung ins Programm aufnehmt
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
              Alle Orte der Reise sortiert nach Kategorie (Sights, Essen,
              Hidden Places…)
            </Li>
            <Li>
              Filter: Alle / Tag 1–5 / Hidden Places /{" "}
              <strong>In der Nähe</strong>
            </Li>
            <Li>
              <strong>„Wo bin ich?"</strong> → App fragt nach Standort, dann
              siehst du Entfernungen zu jedem Punkt
            </Li>
            <Li>Jeder Eintrag öffnet Google Maps in der Maps-App</Li>
          </ul>
        </TabSection>

        <TabSection
          icon={<Camera />}
          color="bg-gold/20 text-gold-600"
          title="Fotos"
        >
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>„Wo ist das?"</strong> (blauer Block oben): Foto vom
              Freund hochladen → KI sagt dir was das ist + wie du hinkommst.
              Mit Streik-Hinweis falls grad Tube-Streik!
            </Li>
            <Li>
              <strong>Eigene Fotos</strong>: speichere deine Reise-Fotos lokal.
              Auto-sortiert nach Aufnahmetag.
            </Li>
            <Li>
              <strong>„Erzähl mir was"</strong> bei jedem Foto: KI beschreibt
              das Bild mit Reise-Kontext.
            </Li>
            <Li>
              <strong>„Foto-Buch exportieren"</strong> (unten): alle Fotos als
              ZIP mit chronologischen Dateinamen — direkt importierbar in
              HappyFoto Designer, CEWE, Pixum etc.
            </Li>
            <Li>
              <strong>„Bearbeiten"</strong> oben rechts: Fotos einzeln oder
              alle löschen.
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
              Status-Toggle:{" "}
              <span className="text-warning font-semibold">offen</span> →{" "}
              <span className="text-gold-600 font-semibold">reserviert</span> →{" "}
              <span className="text-success font-semibold">erledigt</span>
            </Li>
            <Li>
              Cedric Grolet ist <strong>fix für Di 13:00</strong> — mit
              Buchungsnummer + Direktwahl-Telefon
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
              <strong>🚨 Großer roter 999-Button</strong> ganz oben — ein Tap
              ruft sofort den UK-Notruf an
            </Li>
            <Li>Weitere Nummern: 112 (EU), NHS 111, Polizei 101</Li>
            <Li>
              Österreichische Botschaft mit Anruf + Karte + Anfahrt-Buttons
            </Li>
            <Li>
              5 Apotheken / Krankenhäuser inkl. 24h-Notapotheke +
              UCH-Notaufnahme
            </Li>
            <Li>
              <strong>Persönliche Gesundheitskarte</strong> — Blutgruppe,
              Allergien, Medikation, Notfallkontakt.{" "}
              <em>
                Nur DU siehst sie. Andere Reisende oder die KI können nicht
                draufschauen.
              </em>
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
              <strong>Dein Profil</strong> + Avatar-Wechsel
            </Li>
            <Li>
              <strong>Packliste</strong> persönlich + wetter-intelligent (z.B.
              „Regenjacke" wenn 60% Regenrisiko)
            </Li>
            <Li>
              <strong>Laufrouten</strong> inkl. Lukas-Tipp (Regent's Park +
              Primrose Hill)
            </Li>
            <Li>
              <strong>Standort teilen</strong>: Anleitung für WhatsApp Live
              Location — wir tracken NICHTS selbst
            </Li>
            <Li>
              <strong>Währungsrechner</strong> GBP↔EUR mit Live-Kurs +
              Schnellbuttons. Fällt auf Fallback-Kurs zurück wenn keine Online-Quelle erreichbar.
            </Li>
            <Li>
              <strong>Ausgaben-Tracker</strong>: wer zahlt was, auto-aufgeteilt
              unter den 4 (Andrea ist als Geburtstagskind eingeladen 🥂)
            </Li>
            <Li>
              <strong>15 Restaurants</strong> mit TheFork-Buchungs-Links und
              Filter (Cuisine / Preis)
            </Li>
            <Li>
              <strong>Unterkunft + Flug</strong> mit Buchungs-Details und
              Live-Status (wenn verfügbar)
            </Li>
            <Li>
              <strong>TfL Live-Status</strong> aller Tube-Linien
              (auto-refresh)
            </Li>
            <Li>
              <strong>Phrasebook</strong>: 40 Sätze DE→EN mit Aussprache +
              Vorlesen-Button (komplett offline)
            </Li>
            <Li>
              <strong>Hidden Places</strong>: 8 kuratierte Geheimtipps
            </Li>
            <Li>
              <strong>Privacy & DSGVO</strong>: deine Daten exportieren oder
              komplett löschen
            </Li>
          </ul>
        </TabSection>

        {/* AI Section */}
        <Section
          icon={<Sparkles className="text-gold" />}
          title="KI-Reisebegleiter (Sparkles-Button rechts unten)"
          highlight
        >
          <p className="text-sm text-ink-dark leading-relaxed mb-2">
            Der goldene Funken-Button öffnet einen Chat mit Claude. Er kennt:
          </p>
          <ul className="space-y-1 text-xs text-ink-mid">
            <Li>Das komplette Reiseprogramm aller 5 Tage</Li>
            <Li>Eure Namen — begrüßt dich persönlich</Li>
            <Li>Live-Wetter + Tube-Status (fragt selbst nach wenn nötig)</Li>
            <Li>Alle Reservierungen, Hidden Places, Restaurants, Phrasen</Li>
          </ul>
          <p className="text-sm text-ink-dark leading-relaxed mt-3">
            <strong>Probier z.B.:</strong>
          </p>
          <ul className="space-y-0.5 text-xs text-ink-mid italic">
            <Li>„Was machen wir heute am besten?"</Li>
            <Li>„Wie wird's morgen wettertechnisch?"</Li>
            <Li>„Empfehl ein Restaurant in Notting Hill"</Li>
            <Li>„Wie sage ich auf Englisch ‚Die Rechnung bitte'?"</Li>
            <Li>„Andrea hat Bauchweh – wo ist die nächste Apotheke?"</Li>
          </ul>
          <p className="text-[11px] text-ink-mid italic mt-2 leading-relaxed">
            🎤 <strong>Mikrofon-Icon</strong>: sprechen statt tippen.{" "}
            🔊 <strong>Lautsprecher</strong>: Antworten vorlesen lassen.
          </p>
        </Section>

        {/* Photo Book Export */}
        <Section icon={<BookOpen />} title="Nach der Reise: Foto-Buch erstellen">
          <p className="text-sm text-ink-dark leading-relaxed">
            Auf dem Fotos-Tab ganz unten findest du <strong>„Foto-Buch
            exportieren"</strong>. Erzeugt eine ZIP-Datei mit allen Fotos —
            sinnvoll benannt nach Reisetag + Aufnahmezeit:
          </p>
          <pre className="text-[10px] bg-cream-100 rounded p-2 mt-2 overflow-x-auto leading-relaxed">
{`Tag1_2026-05-18_01_Ankunft.jpg
Tag2_2026-05-19_03_Cedric-Grolet.jpg
…`}
          </pre>
          <p className="text-xs text-ink-mid mt-2 leading-relaxed">
            ZIP entpacken → in HappyFoto Designer (gratis), CEWE, Pixum oder
            Saal Digital importieren → „Auto-Befüllen" → Fotos landen
            chronologisch auf den Seiten. Im ZIP ist auch eine{" "}
            <code className="bg-cream-100 px-1 rounded">metadata.json</code>{" "}
            mit Bildunterschriften zum Übernehmen.
          </p>
        </Section>

        {/* Currency / Expenses */}
        <Section icon={<Wallet />} title="Geld & Ausgaben">
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>Währungsrechner</strong>: tippt Beträge ein, Umrechnung
              automatisch in beide Richtungen
            </Li>
            <Li>
              <strong>Ausgaben-Tracker</strong>: jeder kann eine Ausgabe
              eintragen (wer hat bezahlt, was, wieviel, Kategorie)
            </Li>
            <Li>
              <strong>Auto-Split</strong> teilt durch 4 — Andrea ist als
              Geburtstagskind eingeladen 🥂
            </Li>
            <Li>
              <strong>„Wer schuldet wem"</strong>: am Ende der Reise sagt die
              App, wer wem was zahlen muss (minimale Anzahl Transaktionen)
            </Li>
            <Li>
              <strong>WhatsApp-Export</strong>: alle Ausgaben + Settlement als
              Text in die Zwischenablage → in die Gruppe einfügen
            </Li>
          </ul>
        </Section>

        {/* Privacy */}
        <Section
          icon={<Lock className="text-success" />}
          title="Datenschutz — kurz & einfach"
        >
          <ul className="space-y-2 text-sm text-ink-dark">
            <Li>
              <strong>Deine Inhalte bleiben auf deinem Gerät.</strong> Wir
              haben keine eigene Datenbank, keinen User-Account, keinen
              Tracker.
            </Li>
            <Li>
              <strong>Gesundheitsdaten</strong> gehen NIE an Server oder KI.
              Auch andere Reisende sehen deine Karte nicht.
            </Li>
            <Li>
              <strong>KI-Features</strong> (Foto-Location, „Erzähl mir was",
              Chat) senden das jeweilige Foto / die Frage einmalig an
              Anthropic / Claude in den USA. Anthropic speichert Inhalte
              standardmäßig <em>nicht</em> für Training.
            </Li>
            <Li>
              <strong>Standort wird nicht getrackt.</strong> Wenn ihr eure
              Standorte teilen wollt → WhatsApp Live Location (du steuerst
              Dauer + Empfänger selbst).
            </Li>
            <Li>
              <strong>Alles löschbar:</strong> Info-Tab → ganz unten „Privacy &
              DSGVO" → Daten exportieren oder komplett löschen.
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
        <Section icon={<UserCircle2 />} title="Avatar oben rechts">
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              Tap auf das Avatar-Foto im Header → Identität wechseln
            </Li>
            <Li>
              Wenn du z.B. Haralds Handy ausleihst, kann er dort als Harald
              eingeloggt bleiben — er sieht trotzdem die ganze App, nur seine
              persönlichen Sachen (Packliste, Gesundheitskarte) sind „seine"
            </Li>
            <Li>
              „Abmelden" löscht <strong>nur deine Identitäts-Wahl</strong>,
              deine eigentlichen Daten bleiben am Handy
            </Li>
          </ul>
        </Section>

        {/* Offline / connectivity */}
        <Section icon={<Wifi />} title="Internet & Offline">
          <ul className="space-y-1.5 text-sm text-ink-dark">
            <Li>
              <strong>Online nötig für:</strong> Live-Wetter, Tube-Status,
              KI-Chat, Foto-Location-Erkennung, Karten-Links,
              TheFork-Buchungen, Währungs-Live-Kurs
            </Li>
            <Li>
              <strong>Offline funktioniert:</strong> Programm-Texte,
              Reservierungen, Packliste, Phrasebook (auch Vorlesen),
              Notfallnummern, Gesundheitskarte, deine eigenen Fotos
            </Li>
            <Li>
              <strong>eSIM oder lokale SIM</strong> empfohlen — die wichtigsten
              Daten sind aber auch ohne Netz im Cache
            </Li>
          </ul>
        </Section>

        {/* Updates / new version */}
        <Section icon={<Cloud />} title="Updates kommen automatisch">
          <p className="text-sm text-ink-dark leading-relaxed">
            Falls Harald während der Reise was anpasst: ein dezenter Banner
            „Neue Version verfügbar" erscheint oben auf der Seite. Antippen,
            App lädt frisch — fertig. Du musst nichts manuell installieren.
          </p>
        </Section>

        {/* Help / Contact */}
        <Section icon={<Key />} title="Hilfe & Kontakt">
          <p className="text-sm text-ink-dark leading-relaxed">
            Bei Fragen, Bugs oder Wünschen: <strong>einfach Harald fragen</strong>
            . Er hat die App gebaut und kann sie spontan anpassen — auch
            während der Reise. Klein-Updates sind oft binnen Minuten live.
          </p>
        </Section>

        <div className="rounded-2xl bg-gold/10 border border-gold/30 p-4 text-center">
          <p className="text-sm font-semibold text-navy">
            Viel Spaß in London! 🎂
          </p>
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
