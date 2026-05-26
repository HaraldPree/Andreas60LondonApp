# PLAN.md – Ur-Plan vom April 2026

> Historisches Dokument aus der Projektstart-Phase. Damals noch „RCMK
> Travel Companion App" genannt. Seit v1.16.0 (26.05.2026) heißt das
> Produkt **Travel Concierge** (hp+ consulting, RCMK = erster Pilot).

## Projekt-Übersicht
Eine interaktive **Reise-Companion-Webapp** für Kunden des ReiseCenter Mader-Kuoni. Die App verwandelt ein statisches Reiseprogramm (DOCX/PDF) in eine lebendige, mobile-first Webapp mit Live-Wetter, interaktiver Karte, Reservierungstracker und Tagesplaner. Kunden bekommen einen Link (z.B. `reise.meinreisecenter.at/london-2026`) und haben ihren gesamten Reiseplan in der Tasche.

**Referenz-Projekt:** Die PUR Touristik Angebots-App (https://pur-angebots-app.vercel.app/) – gleicher Tech-Stack, ähnliche Architektur, aber anderes Ziel: PUR = Angebotspräsentation VOR der Buchung, RCMK = Reisebegleiter WÄHREND der Reise.

**Erste Demo-Reise:** London, 18.–22. Mai 2026, 5 Erwachsene, 60. Geburtstag.

---

## Tech-Stack
| Komponente | Technologie | Begründung |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | Wie PUR-App, Vercel-optimiert, SSG für Speed |
| Styling | **Tailwind CSS** | Schnell, konsistent, responsive out of the box |
| Sprache | **TypeScript** | Typsicherheit für Reise-Datenstrukturen |
| Karten | **Leaflet + OpenStreetMap** | Kostenlos, kein API-Key nötig, offline-fähig |
| Wetter | **Open-Meteo API** | Kostenlos, kein API-Key nötig, zuverlässig |
| Icons | **Lucide React** | Leichtgewichtig, schöne Icons |
| Animationen | **Framer Motion** | Smooth Transitions zwischen Tabs/Cards |
| Fonts | **Google Fonts: Playfair Display + DM Sans** | Elegant + lesbar |
| Hosting | **Vercel** (alternativ Netlify) | Auto-Deploy via GitHub, kostenloser Tier |
| Entwicklung | **Claude Code** | Hauptentwicklungstool |

---

## Corporate Identity – ReiseCenter Mader-Kuoni
```
Primärfarbe:     #003366 (Dunkelblau) – Überschriften, Header, Buttons
Akzentfarbe:     #E5A00D (Gold) – Highlights, Trennlinien, CTAs
Hintergrund:     #F8F6F1 (Warmweiß) – Page Background
Karten-BG:       #FFFFFF (Weiß) – Cards
Text dunkel:     #1A1A2E
Text mittel:     #4A4A5A
Text hell:       #7A7A8A
Erfolg:          #2D8F5E (Grün)
Warnung:         #D44638 (Rot)
Info:            #2980B9 (Blau)

Display-Font:    Playfair Display (Überschriften)
Body-Font:       DM Sans (Fließtext, UI)
Monospace:       JetBrains Mono (Zeiten, Codes)

Logo-Text:       "ReiseCenter Mader-Kuoni" (Versalien im Header)
Footer:          "ReiseCenter Mader-Kuoni | www.meinreisecenter.at"
```

**Logo:** Das Mader-Kuoni Logo (Weltkugel mit Goldtönen) wird als PNG/SVG im `/public/images/` Ordner abgelegt. Bis ein echtes Logo vorliegt, wird der Textlogotyp "REISECENTER MADER·KUONI" in Gold-auf-Dunkelblau als Platzhalter verwendet.

---

## Architektur & Ordnerstruktur (siehe Projektstruktur im Repo)

## Datenmodell

TypeScript Interfaces sind in `src/types/trip.ts` definiert.
Die Trip-Datenstruktur ist generisch — neue Reisen werden als neue TypeScript-Datei in `src/data/trips/` angelegt und automatisch von der dynamischen Route geladen.

---

## Seiten & Routing

### `/` – Landing Page
Übersicht aller verfügbaren Reisen.

### `/[tripSlug]` – Reise-Companion (Hauptansicht)
Vier Tabs als Bottom-Navigation:
1. **📅 Programm** – Wetter, Forecast, Alerts, Tageskarten
2. **🗺️ Karte** – Leaflet-Karte mit allen POIs (Phase 2)
3. **🎫 Reservierungen** – Tracker mit localStorage-Status
4. **ℹ️ Info & Hilfe** – Unterkunft, Flug, QuickActions, Hidden Places

---

## Wichtige Regeln

1. Mobile-first (max-width 480px zentriert)
2. Keine kostenpflichtigen APIs (Open-Meteo + OpenStreetMap = gratis)
3. Alle externen Links mit target="_blank" rel="noopener noreferrer"
4. Reservierungs-Status in localStorage persistieren
5. Wetter-Daten alle 30 Min auto-refresh
6. Tailwind Custom Colors verwenden (nicht Hex hardcoden)
7. Alle Texte auf Deutsch
8. Google Maps Links im Format: https://maps.google.com/?q=...
9. Architektur muss generisch sein — neue Reisen als neue Datei in src/data/trips/

---

## Neue Reise anlegen
1. Neue Datei erstellen: `src/data/trips/[slug].ts`
2. Trip-Objekt ausfüllen (siehe `london-2026.ts` als Vorlage)
3. Slug wird automatisch von `src/app/[tripSlug]/page.tsx` aufgegriffen
4. Commit + Push → Vercel deployt automatisch

Langfristig (Phase 3): Admin-Interface mit DOCX/PDF Upload und Claude API zur automatischen Datenextraktion.

---

*Erstellt: Mai 2026 | Projekt: RCMK Travel Companion*
*Harald Pree, hp+ consulting & marketing gmbh*
