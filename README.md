# Travel-Companion-Plattform (hp+ consulting)

> **Eigentümer**: hp+ consulting & marketing gmbh, Leonding (AT)
> **Erster Pilot-Kunde**: ReiseCenter Mader-Kuoni (RCMK) — namensgebender
> Trip „60. Geburtstag Andrea, London Mai 2026"
>
> Mobile-first PWA für die Zeit **während** und **nach** einer Reise:
> Live-Wetter, interaktive Karte, Reservierungstracker, AI-Companion (Claude
> Opus 4.7 mit Tool-Use), Wunschliste, gemeinsame Foto-Galerie, PDF/ZIP-Export,
> KI Event-Recherche, Video-Support.

**Aktuelle Version**: siehe `package.json` → `version`
**Hosting**: Vercel (Auto-Deploy via GitHub-Main)
**Live unter** (RCMK-Pilot): https://birthdaytravelguidelondon.vercel.app
**Marken-Name** (final): noch offen — siehe Recherche in `Recherchen/`

---

## Quick-Start für Entwickler

```bash
# 1. Dependencies
npm install

# 2. Env-Vars (siehe Abschnitt „Environment Variables" unten)
cp .env.local.example .env.local      # falls noch nicht da: selbst anlegen
# Mindestens APP_ANTHROPIC_KEY setzen für AI-Companion

# 3. Dev-Server
npm run dev                            # → http://localhost:3000

# 4. Build + Lint vor jedem Push
npm run lint
npm run build
```

**Standard-Slug zum Testen**: `http://localhost:3000/london-2026`

Ohne `APP_PIN` ist die App offen — das ist der Dev-Modus.
Mit `APP_PIN` setzt sich ein PIN-Gate (Edge-Middleware) vor alle Seiten.

---

## Tech-Stack auf einen Blick

| Schicht | Wahl | Begründung |
|---|---|---|
| Framework | Next.js 14 App Router | SSG für Speed, Edge-Middleware für Auth |
| Sprache | TypeScript (strict) | Typsichere Trip-Datenstrukturen |
| Styling | Tailwind CSS + Custom Theme | `navy`, `gold`, `cream` Brand-Colors |
| Animationen | Framer Motion | Tab-Übergänge, Sheets |
| AI | `@anthropic-ai/sdk` v0.96, Claude Opus 4.7 | Streaming + Tool Use |
| Storage (Photo) | Vercel Blob + Manifest-JSON | KV-frei seit v1.1.3 |
| Storage (lokal) | localStorage + IndexedDB | Eigene Fotos, Wunschstatus, User-Wahl |
| Wetter | Open-Meteo | gratis, kein API-Key |
| Transport | TfL API | gratis, kein API-Key |
| Flugstatus | AviationStack | 100 Calls/Monat Free Tier (optional) |
| Voice | Web Speech API + SpeechSynthesis | Browser-nativ |
| Icons | Lucide React | leichtgewichtig |
| Karten | Leaflet + OpenStreetMap | gratis (in Roadmap, siehe Phase 2) |
| Hosting | Vercel | Auto-Deploy, Edge-Functions |

Vollständige Dependency-Liste: `package.json`.

---

## Environment Variables

Alle Env-Vars werden in **Vercel Dashboard → Project Settings → Environment Variables**
gesetzt (für lokal: `.env.local`). Nach Änderung in Vercel: **Redeploy nötig**.

| Variable | Pflicht? | Wofür |
|---|---|---|
| `APP_PIN` | empfohlen | 4-stelliger Code für PIN-Gate. Ohne PIN ist die App offen. |
| `APP_ANTHROPIC_KEY` | für AI | AI-Companion (Claude Opus 4.7). Format `sk-ant-api03-…`. Fallback-Reihenfolge: `APP_ANTHROPIC_KEY` → `RCMK_ANTHROPIC_KEY` → `ANTHROPIC_API_KEY` |
| `BLOB_READ_WRITE_TOKEN` | für Photo-Sharing | Vercel-Blob-Token. Wird automatisch gesetzt wenn Blob-Storage im Vercel-Project aktiviert wird. |
| `AVIATIONSTACK_API_KEY` | optional | Live-Flugstatus. Ohne Key: Fallback auf Flightradar24-Tracker-Link. |
| `NEXT_PUBLIC_HARALD_WHATSAPP` | optional | „Problem melden"-WhatsApp-Link. Default im Code. |
| `VERCEL_GIT_COMMIT_SHA` | auto | wird von Vercel gesetzt, dient als Version-String |

**Wichtig**: Warum eigene `APP_ANTHROPIC_KEY`? Auf manchen Dev-Maschinen ist
`ANTHROPIC_API_KEY` global leer gesetzt (z.B. mit Claude Code CLI) — das würde
`.env.local` überschreiben. Daher app-eigener Name. Der Fallback funktioniert
weiterhin: wenn nur `ANTHROPIC_API_KEY` einen Wert hat, wird der genutzt.

Diagnose: `GET /api/version` zeigt welche Env-Vars erkannt wurden (ohne die
Secret-Werte selbst zu leaken).

---

## Verzeichnis-Struktur

```
src/
├── app/                          Next.js App Router
│   ├── [tripSlug]/page.tsx       Dynamische Reise-Seite (alle Slugs aus src/data/trips/)
│   ├── api/                      API-Routes (siehe docs/api.md)
│   ├── login, anleitung,         Public Pages (kein PIN)
│   │   datenschutz, impressum,
│   │   agb, diagnose
│   ├── layout.tsx, page.tsx      Root-Layout + Landing-Page
│   └── manifest.ts               PWA-Manifest
├── components/                   React-Komponenten
│   ├── layout/                   Header, Footer, Navigation, ScrollToTop
│   ├── tabs/                     Programm, Karte, Wunschliste, Fotos, Reservierungen, SOS, Info
│   ├── trip/                     TripHero, DayCard, EventBanner, TimelineItem
│   ├── places/                   PlaceCard, WunschPollShare
│   ├── photos/                   SharedGallery, PhotoUpload, BulkShareSheet, PhotoDetail
│   ├── reservations/             ReservationCard, ReservationTracker
│   ├── reel/                     GoodbyeReel (Goodbye-Slideshow)
│   ├── companion/                AI-Chat-Widget + Voice
│   ├── identity/                 PersonPicker, UserAvatarButton, ProfileCard
│   ├── info/, sos/, expenses/,   weitere Funktions-Blöcke
│   │   activities/, organize/,
│   │   pwa/, privacy/, support/,
│   │   ai/, dining/, discover/
│   └── ui/                       Card, Pill, GoldDivider, MapLink, TransportButtons
├── data/
│   └── trips/
│       ├── index.ts              exportiert `trips`-Array + Helpers
│       ├── london-2026.ts        Hauptdatei der London-Reise
│       ├── london-2026-places.ts 75 Place-Library-Einträge
│       └── london-2026-events.ts 15 Event-Einträge (v1.9.0)
├── hooks/                        React Hooks (siehe „Hooks-Übersicht" in docs/architecture.md)
├── lib/                          Helper-Funktionen (siehe gleicher Abschnitt)
├── types/                        TypeScript Interfaces (Trip, Place, Event, Photo, …)
└── middleware.ts                 Edge-Middleware: PIN-Gate

releases/                         Pro Version eine vX.Y.Z.md (siehe releases/README.md)
todo/                             Verbesserungsvorschläge / Audits (git-tracked)
releases/internal/                Interne Strategiepapiere (gitignored)
releases/workshop/                Workshop-Notizen (gitignored)
docs/                             Architektur, API, Genesis (siehe unten)
```

---

## Tiefer eintauchen

| Frage | Datei |
|---|---|
| Wie ist die App architektonisch aufgebaut? | [`docs/architecture.md`](./docs/architecture.md) |
| Welche API-Endpoints gibt es? | [`docs/api.md`](./docs/api.md) |
| Wie ist das Projekt entstanden? Was wurde vor v1.0.0 gebaut? | [`docs/genesis.md`](./docs/genesis.md) |
| Was wurde wann warum geändert? | [`releases/README.md`](./releases/README.md) |
| Welche Regeln gelten beim Entwickeln (Anti-Halluzination, Update-Format, Brand-Colors)? | [`CLAUDE.md`](./CLAUDE.md) |
| Welche Ideen/Audits liegen offen? | [`todo/README.md`](./todo/README.md) |
| Wo geht die Reise hin (Travel-Live-Vision)? | `releases/internal/travel-live-vision.md` (gitignored) |

---

## Neue Reise hinzufügen

1. Neue Datei `src/data/trips/[slug].ts` erstellen (`london-2026.ts` als Vorlage)
2. `Trip`-Interface aus `src/types/trip.ts` befüllen
3. In `src/data/trips/index.ts` exportieren
4. Push → Slug wird automatisch unter `/[slug]` verfügbar (statische Generierung
   via `generateStaticParams`)

Optional: bei AI-relevanten neuen Feldern den System-Prompt in
`src/lib/companionPrompt.ts` ergänzen.

---

## Release-Workflow

1. `package.json` → `version` hochsetzen (Semver-light, siehe `releases/README.md`)
2. Neue `releases/vX.Y.Z.md` anlegen (Standard-Format)
3. `releases/README.md` → Index oben aktualisieren
4. Commit-Message startet mit `vX.Y.Z: …`
5. Optional: Git-Tag `git tag vX.Y.Z && git push --tags`

---

## Wichtige Regeln (Auszug aus CLAUDE.md)

1. **Mobile-first** (max-width 480 px zentriert)
2. **Keine kostenpflichtigen APIs** (Open-Meteo + OSM = gratis)
3. **Externe Links** immer mit `target="_blank" rel="noopener noreferrer"`
4. **Reservierungs-Status** in localStorage persistieren
5. **Tailwind Custom Colors** nutzen (kein Hex hardcoden)
6. **Alle User-Texte auf Deutsch**
7. **Architektur generisch** — jede Reise eine Datei in `src/data/trips/`
8. ⚠ **KEINE ERFUNDENEN INFOS** (Anti-Halluzinations-Regel)
9. **Update-Kommunikation** an Reisegruppe immer im Short+Lang-Format

Volltext: [`CLAUDE.md`](./CLAUDE.md).

---

## Lizenz & Kontakt

Code-IP gehört **hp+ consulting & marketing gmbh, Leonding (AT)**.
Nicht öffentlich lizenziert.

Strategische Positionierung: B2B-Lizenz an Reisebüros und Veranstalter
(DACH-Markt). RCMK ist erster Pilot-Kunde; spätere Vertriebskanäle:
ÖVT-Mitgliedsbetriebe, KTP, weitere Reisebüro-Verbände.

Details + Wettbewerbs-/Markt-Recherchen (Polarsteps, Wayli, Print-Partner,
Namen, Lasten-/Pflichtenheft) in `Recherchen/` + `releases/internal/`
(beide gitignored — interne Strategiepapiere).

Bei Fragen: Harald Pree, hp+ consulting & marketing gmbh.
