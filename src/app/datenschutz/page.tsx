import Link from "next/link";
import { ArrowLeft, Lock, Globe, Database, Cookie, Shield, Mail } from "lucide-react";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Datenschutz",
};

export default function PrivacyPage() {
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
          <h1 className="font-display text-lg font-semibold">Datenschutz</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6 space-y-5">
        <section>
          <p className="text-xs text-ink-mid leading-relaxed">
            Stand: Mai 2026 · Privates Test-Produkt · Verantwortlich:
            Harald&nbsp;Pree
          </p>
        </section>

        <Section icon={<Shield />} title="Kurzfassung">
          <ul className="space-y-1.5 text-sm text-ink-dark leading-relaxed">
            <li>
              <strong>Diese App speichert deine persönlichen Inhalte
              ausschließlich lokal auf deinem Gerät</strong> (Browser-Storage).
            </li>
            <li>
              Wir betreiben <strong>keinen eigenen Datenbankserver</strong>.
            </li>
            <li>
              Wenn du KI-Funktionen nutzt (Chat, Foto-Erzählung,
              Foto-Location), wird der jeweilige Inhalt an Anthropic gesendet –
              du musst vorher zustimmen.
            </li>
            <li>
              Gesundheitsdaten gehen <strong>nie</strong> an Server oder KI.
            </li>
          </ul>
        </Section>

        <Section icon={<Database />} title="Was bleibt nur auf deinem Gerät">
          <p className="text-sm text-ink-dark leading-relaxed mb-2">
            In deinem Browser (localStorage / IndexedDB) gespeichert:
          </p>
          <ul className="space-y-1 text-xs text-ink-mid">
            <Li>Deine gewählte Identität (z.B. „Andrea")</Li>
            <Li>Gesundheitskarte (Blutgruppe, Allergien, …)</Li>
            <Li>Packlisten-Häkchen + eigene Items</Li>
            <Li>Reservierungs-Status (offen/reserviert/erledigt)</Li>
            <Li>Ausgaben + Aufteilung</Li>
            <Li>Eigene Entdeckungen (zum Reiseablauf hinzugefügte Orte)</Li>
            <Li>Erkennungs-History der Foto-Location-KI (max 20)</Li>
            <Li>Hochgeladene Fotos + KI-Erzählungen</Li>
            <Li>UI-Präferenzen (Sprachausgabe ein/aus, Hinweise verworfen)</Li>
          </ul>
          <p className="text-[11px] text-ink-mid italic mt-2">
            Browser-Cache leeren = alle deine Daten weg. Es gibt kein Backup.
            Wenn du das Gerät wechselst, beginnst du frisch.
          </p>
        </Section>

        <Section
          icon={<Globe />}
          title="Subprozessoren (Drittanbieter)"
        >
          <p className="text-sm text-ink-dark leading-relaxed mb-3">
            Die App nutzt folgende externe Dienste. Daten gehen nur dorthin,
            wenn du die jeweilige Funktion aktiv nutzt:
          </p>
          <ul className="space-y-2.5">
            <Subprocessor
              name="Vercel"
              region="USA / EU"
              purpose="Hosting der App (statische Seiten + serverlose Funktionen)"
              data="IP-Adresse (zum Ausliefern), keine Inhalte"
              link="https://vercel.com/legal/privacy-policy"
            />
            <Subprocessor
              name="Anthropic (Claude)"
              region="USA"
              purpose="KI-Companion Chat, Foto-Erzählung, Foto-Location-Erkennung"
              data="Deine Chat-Nachrichten + hochgeladene Fotos + Reise-Kontext (KEINE Gesundheitsdaten)"
              link="https://www.anthropic.com/legal/privacy"
              consent
            />
            <Subprocessor
              name="Open-Meteo"
              region="Deutschland / EU"
              purpose="Wetter + 5-Tage-Vorhersage"
              data="Reise-Koordinaten (London), keine personenbezogenen Daten"
              link="https://open-meteo.com/en/terms"
            />
            <Subprocessor
              name="Transport for London (TfL)"
              region="UK"
              purpose="Live-Status der Tube-Linien"
              data="Allgemeine API-Anfrage, keine personenbezogenen Daten"
              link="https://tfl.gov.uk/corporate/privacy-and-cookies/"
            />
            <Subprocessor
              name="AviationStack"
              region="USA"
              purpose="Live-Flugstatus (optional, nur bei konfiguriertem Key)"
              data="Flugnummer (z.B. FR1694)"
              link="https://aviationstack.com/privacy-policy"
            />
            <Subprocessor
              name="Frankfurter (frankfurter.app)"
              region="Deutschland / EU"
              purpose="Tägliche EZB-Wechselkurse (GBP↔EUR)"
              data="Währungspaar, keine personenbezogenen Daten"
              link="https://www.frankfurter.app/legal"
            />
            <Subprocessor
              name="Flightradar24 (Fallback)"
              region="Schweden"
              purpose="Tracker-Link wenn AviationStack nicht konfiguriert"
              data="Flugnummer, nur als externer Link"
              link="https://www.flightradar24.com/privacy-policy"
            />
            <Subprocessor
              name="OpenStreetMap"
              region="UK / weltweit"
              purpose="Karten-Links + POI-Lookups"
              data="Koordinaten, nur als externer Link"
              link="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
            />
            <Subprocessor
              name="Google / Apple Maps (Deep Links)"
              region="USA"
              purpose="Anfahrts-Optionen (öffnet externe Apps)"
              data="Ziel-Koordinaten, nur beim Tap auf den Link"
              link="https://policies.google.com/privacy"
            />
          </ul>
        </Section>

        <Section icon={<Cookie />} title="Cookies & Session">
          <p className="text-sm text-ink-dark leading-relaxed">
            Wir setzen genau <strong>einen</strong> technisch notwendigen Cookie:
          </p>
          <ul className="space-y-1 text-xs text-ink-mid mt-2">
            <Li>
              <code className="font-mono bg-cream-100 px-1 rounded">app_session</code>
              {" — "}speichert deinen erfolgreich eingegebenen PIN-Code (HttpOnly,
              Secure, 30 Tage). Damit du nicht bei jedem Aufruf neu eingeben musst.
            </Li>
          </ul>
          <p className="text-[11px] text-ink-mid italic mt-2">
            Keine Tracking-Cookies, kein Google Analytics, kein Werbenetzwerk.
          </p>
        </Section>

        <Section icon={<Lock />} title="KI &amp; EU AI Act (Art. 50)">
          <p className="text-sm text-ink-dark leading-relaxed">
            Die App nutzt generative KI (Claude Opus 4.7 von Anthropic):
          </p>
          <ul className="space-y-1 text-xs text-ink-mid mt-2">
            <Li>
              Antworten des KI-Companions sind als solche erkennbar
              (Sparkles-Icon, „Powered by Claude").
            </Li>
            <Li>
              Bevor ein Foto an die KI gesendet wird, fragen wir explizit deine
              Einwilligung (einmalig oder dauerhaft).
            </Li>
            <Li>
              KI-Antworten <strong>können Fehler enthalten</strong> – bitte
              kritisch prüfen, vor allem bei Notfall- oder Gesundheits-Themen.
            </Li>
            <Li>
              Gesundheitsdaten (Art.&nbsp;9 DSGVO) werden NIE an die KI gesendet.
            </Li>
          </ul>
        </Section>

        <Section icon={<Shield />} title="Deine Rechte (DSGVO)">
          <p className="text-sm text-ink-dark leading-relaxed mb-2">
            Da wir keinen eigenen Server haben, kannst du deine Rechte direkt
            in der App ausüben:
          </p>
          <ul className="space-y-1 text-xs text-ink-mid">
            <Li>
              <strong>Auskunft &amp; Portabilität (Art. 15, 20):</strong> Im Info-Tab
              unter „Meine Daten" → „Alle als JSON exportieren"
            </Li>
            <Li>
              <strong>Löschung (Art. 17):</strong> Im Info-Tab unter „Meine
              Daten" → „Alle Daten von diesem Gerät löschen". Bei Subprozessoren
              wie Anthropic gilt deren Speicherrichtlinie (siehe Links oben).
            </Li>
            <Li>
              <strong>Widerruf der KI-Einwilligung:</strong> Im Info-Tab unter
              „Meine Daten" → KI-Consent zurücksetzen.
            </Li>
            <Li>
              <strong>Beschwerderecht:</strong> bei der zuständigen
              Datenschutzbehörde (in Österreich: DSB).
            </Li>
          </ul>
        </Section>

        <Section icon={<Mail />} title="Kontakt">
          <p className="text-sm text-ink-dark leading-relaxed">
            Verantwortlich für dieses private Test-Produkt:
          </p>
          <div className="mt-2 rounded-xl bg-cream-50 border border-cream-200 p-3 text-xs">
            <p className="font-semibold text-navy">Harald Pree</p>
            <p className="text-ink-mid mt-1">
              Bei Fragen zur App oder zum Datenschutz bitte direkt an Harald
              wenden (Kontakt über die Reisegruppe).
            </p>
          </div>
        </Section>

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
      <div className="bg-navy/5 px-4 py-2.5 border-b border-cream-200 flex items-center gap-2">
        <span className="text-navy">{icon}</span>
        <h2 className="font-display text-base font-semibold text-navy">
          {title}
        </h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gold leading-relaxed">
      {children}
    </li>
  );
}

function Subprocessor({
  name,
  region,
  purpose,
  data,
  link,
  consent,
}: {
  name: string;
  region: string;
  purpose: string;
  data: string;
  link: string;
  consent?: boolean;
}) {
  return (
    <li className="rounded-xl bg-cream-50 border border-cream-200 p-3 text-xs">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <p className="font-semibold text-navy text-sm">{name}</p>
        <span className="text-[9px] uppercase tracking-wider text-ink-light font-semibold">
          {region}
        </span>
      </div>
      <p className="text-ink-mid mb-1">
        <strong>Zweck:</strong> {purpose}
      </p>
      <p className="text-ink-mid mb-1">
        <strong>Daten:</strong> {data}
      </p>
      {consent && (
        <p className="text-[10px] text-gold-600 font-semibold mb-1">
          ⚠ Nur nach deiner expliziten Zustimmung
        </p>
      )}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-navy underline hover:text-gold"
      >
        Datenschutzerklärung →
      </a>
    </li>
  );
}
