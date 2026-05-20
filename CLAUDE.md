# RCMK Travel Companion

## Was ist das?
Interaktive Reise-Companion-Webapp für Kunden des ReiseCenter Mader-Kuoni. Mobile-first App, die ein Reiseprogramm lebendig macht: Live-Wetter, Karte, Reservierungstracker, Tagesplaner, Hidden Places.

## Tech-Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion (Animationen)
- @anthropic-ai/sdk (AI Companion mit Claude Opus 4.7, Streaming + Tool Use)
- Leaflet (Karten, Phase 2)
- Open-Meteo (Wetter, kein API-Key)
- TfL API (Londoner U-Bahn, kein API-Key)
- Web Speech API (Voice Input + TTS, Browser-nativ)
- Lucide React (Icons)
- Vercel (Hosting)

## Befehle
- `npm run dev` – Entwicklungsserver auf localhost:3000
- `npm run build` – Production Build
- `npm run lint` – Linting

## Environment Variables (.env.local)
- `RCMK_ANTHROPIC_KEY` – Pflicht für AI-Companion (Format `sk-ant-api03-...`)
  - Erstellen unter https://console.anthropic.com/settings/keys
  - Wenn nicht gesetzt: AI-Chat liefert 500, App funktioniert sonst normal
  - **Warum nicht `ANTHROPIC_API_KEY`?** Auf manchen Dev-Maschinen (z.B. mit Claude Code CLI) ist
    `ANTHROPIC_API_KEY` global leer gesetzt – das würde `.env.local` überschreiben. Daher app-eigener Var-Name.
  - Fallback: Falls `RCMK_ANTHROPIC_KEY` nicht gesetzt aber `ANTHROPIC_API_KEY` einen Wert hat, wird der genutzt.
- `AVIATIONSTACK_API_KEY` – Optional für Live-Flugstatus
  - Free Tier 100 Calls/Monat: https://aviationstack.com/signup/free
  - Server-seitig 5 Min gecached, daher reichen wenige Calls
  - Ohne Key: Flightradar24-Tracker-Link als Fallback

## Corporate Identity
- Dunkelblau: #003366 (Primär) → Tailwind: `navy`
- Gold: #E5A00D (Akzent) → Tailwind: `gold`
- Warmweiß: #F8F6F1 (Hintergrund) → Tailwind: `cream`
- Font Display: Playfair Display
- Font Body: DM Sans
- Footer immer: "ReiseCenter Mader-Kuoni | www.meinreisecenter.at"

## Ordnerstruktur
- `src/app/` – Next.js Routen (App Router)
- `src/app/[tripSlug]/page.tsx` – Dynamische Reise-Seite
- `src/app/api/chat/route.ts` – Streaming Chat API mit Tool Use
- `src/components/` – React-Komponenten (layout, trip, weather, map, reservations, info, companion, ui)
- `src/components/companion/` – AI-Chat-Widget + Voice
- `src/data/trips/` – Reisedaten als TypeScript-Objekte (eine Datei pro Reise)
- `src/types/trip.ts` – TypeScript Interfaces
- `src/lib/` – Helper-Funktionen (weather, formatters, transportLinks, companionPrompt, companionTools)
- `src/hooks/` – Custom Hooks (useWeather, useReservations, useCompanion, useSpeech, useTflStatus, useGeolocation)

## AI Companion (Claude Opus 4.7)
- API Route `/api/chat` mit Streaming (Server-Sent Events)
- System Prompt enthält komplettes Trip-Objekt – Prompt Caching aktiviert (`cache_control: ephemeral`)
- Tool Use: `get_live_weather` (Open-Meteo), `get_tfl_status` (TfL)
- Max 5 Tool-Iterationen pro Antwort
- Voice Input: Web Speech API (de-DE)
- Voice Output: Browser SpeechSynthesis (toggle in UI, persistiert in localStorage)
- Wenn du die Trip-Daten erweiterst: System Prompt in `src/lib/companionPrompt.ts` updaten falls neue Felder relevant sind

## Release-Workflow (ab v1.0.0)

**Jede Code-Änderung bekommt eine Versions-Nummer + Release-Doc.**

1. **Vor dem Push**: Versions-Bump in `package.json` nach Semver-light:
   - PATCH (1.0.0 → 1.0.1) für Bug-Fix / kleine UX
   - MINOR (1.0.x → 1.1.0) für neue Features
   - MAJOR (1.x → 2.0) für architektonische Brüche
2. **Vor dem Push**: neue Datei `releases/vX.Y.Z.md` anlegen mit Standard-Format
   (siehe `releases/README.md`)
3. **Index aktualisieren**: neuen Eintrag in `releases/README.md` ganz oben einfügen
4. **Commit-Message**: erste Zeile referenziert Version, z.B. `v1.0.1: fix iOS safe-area`
5. Nicht für Releases erforderlich: Git-Tag pushen (kann später nachgezogen werden)

**Interne Doku** (Workshop-Notizen, Produkt-Architektur-Analysen, Kompatibilitäts-
Matrizen) gehört in `releases/workshop/` oder `releases/internal/` — beide sind
in `.gitignore`. Diese Dokumente NIE auf GitHub oder Vercel deployen.

**Verbesserungsvorschläge / Audits / "Soll ich später machen"-Ideen** gehören in
den `todo/` Ordner — eine MD-Datei pro Vorschlag mit Template aus
`todo/README.md`. Diese sind git-tracked (nicht intern) damit der Plan für alle
sichtbar bleibt. Wenn Vorschlag umgesetzt wird: Status auf `done` setzen +
Verweis auf die Release-Version eintragen.

Beziehung der drei Ordner:
- `releases/`        → was tatsächlich deployed wurde (versioniert)
- `todo/`            → was wir machen könnten (mit Priorität + Aufwand)
- `releases/internal/` + `releases/workshop/` → interne Strategiepapiere (gitignored)

## Wichtige Regeln
1. **Mobile-first** (max-width 480px zentriert)
2. **Keine kostenpflichtigen APIs** (Open-Meteo + OpenStreetMap = gratis)
3. Alle externen Links mit `target="_blank" rel="noopener noreferrer"`
4. Reservierungs-Status in **localStorage** persistieren
5. Wetter-Daten **alle 30 Min** auto-refresh
6. **Tailwind Custom Colors** verwenden (nicht Hex hardcoden)
7. Alle Texte auf **Deutsch**
8. Google Maps Links: bevorzugt Adress-String (`?q=126+Great+Portland+Street...`) statt rohe Koordinaten, damit Geocoding nicht driftet
9. **Architektur muss generisch sein** — jede Reise ist eine eigene Datei in `src/data/trips/`, die App ist nicht reise-spezifisch
10. **KEINE ERFUNDENEN INFOS** ⚠️ (Anti-Halluzinations-Regel — siehe unten)
11. **User-Kommunikation für Updates: Short+Lang-Format** (siehe unten)

## User-Kommunikation für Updates (PFLICHT-FORMAT)

**Jeder Update-Text für die Reisegruppe folgt dem Short+Lang-Schema.**

Vorgegeben von Harald, 20.05.2026 — gilt für alle künftigen Updates
die per WhatsApp / Mail an die Reisegruppe gehen:

> Erst Short für den Überblick, wer mehr wissen will kann das Detail
> weiterlesen.

### Pflicht-Struktur

```
Update in der Travel-Companion-App 🎉
Neu seit [Datum] | Short:
• [Bullet 1 — wichtigstes Feature]
• [Bullet 2]
• [Bullet 3]
• [Bullet 4 — max ~5 Bullets]
App neu laden, dann ist alles da.


DetailInfo | Lang-Variante (mit allen Details, falls du mehr wissen willst)
🎉 Update Travel-Companion-App

[Emoji] [Feature-Titel]
   [1-3 Zeilen Beschreibung]

[Emoji] [Feature-Titel]
   [Erklärung]

... weitere Features ...

📥 App-Reload nötig: einfach Seite neu laden, dann sind alle
Updates da. Bei Fragen oder Bugs: kurz schreiben.

(Optional: Hinweis auf nächste geplante Erweiterung in vX.Y.Z.)
```

### Regeln

- **Short** zuerst, mit Bullets — Überblick in 30 Sekunden lesbar
- **Lang** danach im selben Text-Block — keine zwei separaten
  Nachrichten, sonst geht's verloren
- **Emoji pro Feature** in der Lang-Variante (📋 🔄 🗳️ 🎬 ✅ etc.) —
  visuelle Auffälligkeit ohne Markdown
- **„App-Reload"-Hinweis** in beiden Varianten — die meisten Bugs sind
  Cache-Probleme
- **Kein Markdown-Bold** mit `**…**` — WhatsApp rendert es nicht
  zuverlässig. Stattdessen Emoji + Zeilenumbrüche
- **Footer mit Next-Release-Hint** wenn passend (z.B. „Echter Sync
  kommt in v1.8.0")

### Wann verwenden

- **Jeder neue Release** der user-facing Features bringt → diese
  Vorlage anwenden
- **Patches ohne User-Wirkung** (z.B. nur Code-Refactoring) brauchen
  KEIN WhatsApp-Update — User-Update nur wenn was sichtbar wird

### Wo dokumentiert

Der konkrete WhatsApp-Text wird im jeweiligen Release-Doc unter dem
Abschnitt **„User-Kommunikation"** abgelegt — copy-paste-bereit für
Harald.

## Anti-Halluzinations-Regel (KRITISCH)

**Niemals Restaurant-/Hotel-Policies, Dresscodes, Preise, Öffnungszeiten,
Hausregeln oder andere User-bindende Informationen erfinden — auch nicht
als "sichere" Schätzung.**

❌ FALSCH (real passiert in Mai 2026):
- Reservation-Note erfunden: "Smart casual, keine Sneakers"
  → Echter Mitreisender verunsichert, hat Outfit gewechselt obwohl nicht nötig
- Bestätigungsmail vom Restaurant erwähnt keinen Dresscode → also DARF
  die App auch keinen behaupten

✅ RICHTIG:
- Nur Infos aufnehmen die aus **kuratierten Quellen** kommen:
  - Bestätigungsmails von Hotel/Restaurant
  - Offizielle Website
  - Vom User explizit übergebene Daten
  - Im Code mit Quelle markieren wenn nicht offensichtlich
- Bei Unsicherheit: **weglassen** oder explizit "nicht publiziert" /
  "laut [Quelle XYZ]" markieren
- "Vorbeugende" oder "sichere" Tipps wie 'smart casual zur Sicherheit'
  sind genauso schlimm wie freie Halluzination — beides verursacht
  User-Verhalten ohne reale Grundlage

### Betroffene Felder in Trip-Daten
- `Reservation.note` — keine Dresscodes / Vorschriften / Preise erfinden
- `ProgramItem.note` — keine Restriktionen / Hausregeln erfinden
- `Accommodation.notes` — nur was vom Host bestätigt ist
- `Day.tips` — kuratiert, nicht halluziniert

### KI-Companion (System-Prompt)
Hat eine eigene `# Verbote`-Sektion in `src/lib/companionPrompt.ts`.
Diese Sektion **immer aktuell halten** wenn neue Halluzinations-Klassen
beobachtet werden.

### Wenn ich (Claude) eine Information NICHT habe
1. Weglassen — "Information nicht verfügbar"
2. ODER: User fragen statt raten ("Bitte vom Host die Info nachreichen")
3. NIEMALS eine "sichere Annahme" treffen die User-Verhalten beeinflusst

## Neue Reise hinzufügen
1. Neue Datei `src/data/trips/[slug].ts` erstellen
2. `Trip`-Interface aus `src/types/trip.ts` befüllen
3. Datei in `src/data/trips/index.ts` exportieren
4. Slug wird automatisch unter `/[slug]` verfügbar

## Modelle (Claude API)
- Standard: `claude-opus-4-7` (1M Context, adaptive thinking, kein `budget_tokens` mehr)
- Bei Kostendruck: `claude-sonnet-4-6` (3x billiger, etwas schneller)
- NIE alte Model-IDs mit Datum-Suffix verwenden (`claude-opus-4-7-XXXX` existiert nicht)
