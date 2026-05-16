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

## Wichtige Regeln
1. **Mobile-first** (max-width 480px zentriert)
2. **Keine kostenpflichtigen APIs** (Open-Meteo + OpenStreetMap = gratis)
3. Alle externen Links mit `target="_blank" rel="noopener noreferrer"`
4. Reservierungs-Status in **localStorage** persistieren
5. Wetter-Daten **alle 30 Min** auto-refresh
6. **Tailwind Custom Colors** verwenden (nicht Hex hardcoden)
7. Alle Texte auf **Deutsch**
8. Google Maps Links im Format: `https://maps.google.com/?q=LAT,LNG`
9. **Architektur muss generisch sein** — jede Reise ist eine eigene Datei in `src/data/trips/`, die App ist nicht reise-spezifisch

## Neue Reise hinzufügen
1. Neue Datei `src/data/trips/[slug].ts` erstellen
2. `Trip`-Interface aus `src/types/trip.ts` befüllen
3. Datei in `src/data/trips/index.ts` exportieren
4. Slug wird automatisch unter `/[slug]` verfügbar

## Modelle (Claude API)
- Standard: `claude-opus-4-7` (1M Context, adaptive thinking, kein `budget_tokens` mehr)
- Bei Kostendruck: `claude-sonnet-4-6` (3x billiger, etwas schneller)
- NIE alte Model-IDs mit Datum-Suffix verwenden (`claude-opus-4-7-XXXX` existiert nicht)
