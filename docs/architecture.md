# Architektur — RCMK Travel Companion

> Stand: v1.8.1 (Mai 2026). Wird bei jeder MAJOR/MINOR-Änderung mitgezogen.

---

## 1. Daten-Modell (Trip als Wurzel)

Eine Reise = **ein TypeScript-Objekt** vom Typ `Trip` in `src/data/trips/[slug].ts`.
Alle Datenklassen sind in `src/types/` definiert.

```
Trip
├── slug, destination, subtitle, group, occasion(Details)
├── participants[]            (5er-Gruppe London: Andrea, Harald, Martin, Lukas, Judith)
├── accommodation             (Adresse, Lockbox, WiFi, Türen-Trick, Hosts)
├── flights { outbound, inbound }   (Flugnummer, PNR, Sitzplätze, Check-in)
├── alerts[]                  (Warnungen, Hinweise, gültig von/bis)
├── disruptions[]             (Streiks, Closures mit 24h-Fenster)
├── days[]                    (Tageskarten — Items, MapPoints, Tips, RainyAlternative)
├── alternativeDays[]         (parallele Tagesversion für Variant-Switcher)
├── reservations[]            (Cedric Grolet etc., mit Menu-Detail)
├── hiddenPlaces[]            (9 kuratierte Geheimtipps)
├── places[]                  (75-er Place-Library, v1.7.0)
├── events[]                  (Chelsea Flower Show & Co., v1.9.0)
├── restaurants[]             (15 mit TheFork-Links)
├── runningRoutes[]
├── emergencyInfo             (999, NHS 111, Botschaft, 5 Apotheken)
├── quickActions[]
├── mapCenter, mapZoom
├── weatherLocation           (lat/lng/timezone für Open-Meteo)
└── currency, homeCurrency
```

**Wachstums-Strategie**: jede neue Datenklasse bekommt ein eigenes `Type`-File
unter `src/types/`. Wenn die Reise stark wächst, werden `places[]` und `events[]`
in separate Files ausgelagert (siehe `london-2026-places.ts`, `london-2026-events.ts`).

---

## 2. Routing (Next.js 14 App Router)

```
/                           Landing-Page mit Reise-Übersicht
/[tripSlug]                 Dynamische Reise-Seite (SSG via generateStaticParams)
/login                      PIN-Eingabe (public)
/anleitung                  User-Hilfe (public)
/datenschutz                DSGVO-Info (public)
/impressum                  Impressum (public)
/agb                        Geschäftsbedingungen (public)
/diagnose                   Device-Diagnose, ohne PIN erreichbar
/api/*                      Server-Endpoints (PIN-pflichtig, siehe docs/api.md)
```

**PIN-Gate** ist eine Edge-Middleware (`src/middleware.ts`). Sie lässt alle Pfade
aus `PUBLIC_PATH_PREFIXES` durch, alles andere wird gegen das `app_session`-Cookie
geprüft.

---

## 3. Komponenten-Hierarchie (vereinfacht)

```
app/[tripSlug]/page.tsx                         ─ Server Component, lädt Trip
└── TripPageClient (use client)                 ─ State-Wurzel
    ├── Header                                  ─ Logo + Avatar + UpdateBanner
    ├── Navigation                              ─ Bottom-Tabs (7 Stück)
    ├── <Tabs>
    │   ├── ProgrammTab                         ─ TripHero, EventBanner (v1.9.0),
    │   │                                         DayCard × N, TripVariantSwitcher
    │   ├── WunschlisteTab                      ─ PlaceCard, WunschPollShare
    │   ├── KarteTab                            ─ Leaflet (Phase 2)
    │   ├── FotosTab                            ─ SharedGallery (v1.8.0 tagweise),
    │   │                                         GoodbyeReel, PhotoUpload
    │   ├── ReservierungenTab                   ─ ReservationCard × N
    │   ├── SOSTab                              ─ Emergency, HealthCard
    │   └── InfoTab                             ─ AccommodationCard, FlightCard,
    │                                             Phrasebook, CurrencyConverter,
    │                                             ExpenseTracker, …
    ├── PersonPicker                            ─ Auto-Open bei erster Visit
    ├── CompanionWidget                         ─ AI-Chat Floating-Button
    └── Footer + ScrollToTop
```

Vollständige Komponenten-Liste: `src/components/` (74 Files in 17 Unterordnern).

---

## 4. State-Management — keine globale Lib, sondern Hooks

Statt Redux/Zustand wird **state per Hook** verwaltet, jeder Hook persistiert
selbst in `localStorage`. Pattern: `use*` gibt `{value, setter, hydrated}` zurück.

| Hook | Verantwortet | Persistenz |
|---|---|---|
| `useCurrentUser` | aktiver Reisender pro Trip | localStorage |
| `useTripVariant` | Original / Alternative | localStorage |
| `usePlaceStatus` | 4-Status Wunschliste | localStorage |
| `useItemState` | Programm-Item Done/Skip/Notiz | localStorage |
| `useReservations` | Reservierungs-Status offen/reserviert/erledigt | localStorage |
| `useSharedPhotos` | Gemeinsame Galerie | Vercel Blob via Fetch |
| `usePhotos` | Eigene Fotos | IndexedDB |
| `useWeather` | Open-Meteo Forecast | In-Memory + 30 min auto-refresh |
| `useTflStatus` | TfL-Linien-Status | In-Memory |
| `useFlightStatus` | Live-Flugstatus | In-Memory, server-cached 5 min |
| `useCompanion` | AI-Chat-Sitzung | localStorage (Verlauf pro User) |
| `useSpeech` | Web Speech API | In-Memory + localStorage (Voice-Toggle) |
| `useVersionCheck` | Build-Version-Polling | In-Memory, alle 60 s |
| `useDismissOnBack` | iOS-Swipe-Back-Handling | History-API |
| `useTripPageBackToHome` | PWA-Direct-Open Sentinel | History-API |
| `useExpenses` | Ausgaben-Tracker | localStorage |
| `useExchangeRate` | Wechselkurs mit 4-stufiger Fallback-Kette | In-Memory + localStorage |
| `useHealthCards` | Persönliche Gesundheits-Info | localStorage |
| `usePackingList` | Persönliche Packliste | localStorage |
| `useInstallPrompt` | PWA-Install-Banner | localStorage |
| `useScrollPosition` | Scroll-Restoration | In-Memory |
| `useBlobUrl` | IndexedDB-Blob → Object-URL | In-Memory |
| `useCountdown` | Reise-Countdown | In-Memory |
| `useAiConsent` | AI-Datenschutz-Consent | localStorage |
| `useGeolocation` | Browser Geo | In-Memory |
| `useUserPlaces` | User-eigene Place-Notizen | localStorage |
| `useIdentificationHistory` | Wo-ist-das-Verlauf | localStorage |

**Konvention**: Jeder Hook hat ein `hydrated`-Flag. Vor `hydrated === true` keine
Schreibvorgänge → vermeidet Hydration-Mismatches in SSR.

---

## 5. Library-Layer (`src/lib/`)

Helper-Funktionen ohne React. Werden aus Hooks oder Server-Routes genutzt.

| Modul | Zweck |
|---|---|
| `companionPrompt.ts` | Baut System-Prompt für Claude aus Trip-Objekt |
| `companionTools.ts` | Tool-Definitionen `get_live_weather`, `get_tfl_status` |
| `weather.ts` | Open-Meteo-Fetcher + Forecast-Parser |
| `flightStatus.ts` | AviationStack-Fetcher + Fallback-Logik |
| `disruptions.ts` | Filter aktiver Transport-Disruptions (24h-Fenster) |
| `sharedPhotoStore.ts` | Vercel-Blob CRUD + Manifest-Pattern (KV-frei) |
| `photoStorage.ts` | IndexedDB-Wrapper für eigene Fotos |
| `photoProcessing.ts` | Resize/Thumbnail (`createImageBitmap`, Samsung HDR safe) |
| `photoBookExport.ts` | PDF + ZIP-Export für Foto-Bücher |
| `dataExport.ts` | DSGVO-Datenexport |
| `phrasebook.ts` | DE→EN Phrasen mit Aussprache |
| `expenseSettlement.ts` | Wer-zahlt-wem Algorithmus |
| `exchangeRate.ts` | 4-stufige Fallback-Kette für Wechselkurs |
| `transportLinks.ts` | Tube / Bus / Walking Deep-Links |
| `formatters.ts` | `mapsUrl`, `classNames`, `formatTime`, … |
| `consentStorage.ts` | DSGVO-Consent localStorage |
| `wunschPoll.ts` | WhatsApp-Poll Templates |
| `reportIssue.ts` | „Problem melden" → WhatsApp Deep-Link |
| `downloadBlob.ts` | iOS-friendly Download-Helper |
| `packingDefaults.ts` | Default-Packliste pro Reise |

---

## 6. AI-Companion (Claude Opus 4.7)

```
User-Frage
  ↓
useCompanion Hook                        (localStorage-Verlauf laden)
  ↓
POST /api/chat (SSE-Streaming)
  ↓
buildCompanionSystemPrompt(trip)         (Prompt-Caching: cache_control: ephemeral)
  ↓
Anthropic.messages.stream({
  model: "claude-opus-4-7",
  tools: [get_live_weather, get_tfl_status],
  max tool iterations: 5
})
  ↓
Tool-Use? → companionToolHandlers[name](args) → Tool-Result
  ↓
Final Text-Stream zurück an Client
  ↓
ChatPanel rendert + persistiert
```

**Wichtige Stellen**:
- System-Prompt-Sektion **„Verbote"** in `companionPrompt.ts` muss bei
  neuen Halluzinations-Klassen erweitert werden.
- Pro-Request-Limits: 100 KB Body, 50 Messages, 4000 Zeichen/Message.
- Voice-Toggle in localStorage (`useSpeech`).

---

## 7. Foto-Sharing (Vercel Blob, KV-frei seit v1.1.3)

```
Eigene Fotos (private)
  ↓ IndexedDB lokal
  ↓ User wählt „Teilen" / „Freigeben"
  ↓
POST /api/photos/share (FormData)
  ↓
sharedPhotoStore.uploadSharedPhoto()
  ↓
Vercel Blob: file + thumb getrennt hochladen
+ Manifest-JSON ({tripSlug}/_manifest.json) aktualisieren
  ↓
Andere User: GET /api/photos/list/[tripSlug]?viewerName=X
→ canViewSharedPhoto Filter (group / celebrant / private)
→ SharedPhotoView (ohne `withdrawnAt`)
```

**Visibility-Werte**: `private` (bleibt lokal) · `group` · `celebrant` (nur das
Geburtstagskind sieht es).

---

## 8. PIN-Gate (Edge-Middleware)

`src/middleware.ts` läuft auf der Edge bei jedem Request:

1. `PUBLIC_PATH_PREFIXES` (login, manifest, icons, public legal pages, /api/version) → durch
2. Kein `APP_PIN` gesetzt → Dev-Modus, alles offen
3. Cookie `app_session === APP_PIN` → durch
4. API-Path → `401 JSON`
5. Seite → Redirect zu `/login?redirect=…`

PIN-Wert wird via `POST /api/login` gesetzt (httpOnly, 30 Tage MaxAge).

---

## 9. Variant-System (Original ↔ Alternative)

In `src/types/trip.ts`:
- `trip.days[]` = die Standard-Version
- `trip.alternativeDays[]` = parallele Version (z.B. „Leger"-Variante, „Plan B bei Regen")
- `trip.defaultVariant` = welche neue Besucher sehen
- `useTripVariant`-Hook merkt sich pro Gerät die Wahl
- `TripPageClient.effectiveTrip` berechnet den effektiven Tagesplan

Das spart Duplikate und erlaubt Live-Switching während der Reise. Wurde z.B.
verwendet, um eine entspannte Tag-4-Version (Borough Market → Uber Boat → Greenwich)
einzubauen, ohne das Original zu verlieren.

---

## 10. Update-Mechanik (PWA + Banner)

```
User hat alte Version offen
  ↓
Server-Deploy ändert VERCEL_GIT_COMMIT_SHA
  ↓
useVersionCheck pollt GET /api/version alle 60 s
  ↓
Hat sich version vs. NEXT_PUBLIC_BUILD_VERSION geändert?
  ↓ ja
UpdateBanner unten am Bildrand
  ↓ User klickt „Neu laden"
window.location.reload()
```

Wichtig: Update-Banner am **unteren** Bildrand wegen iPhone Dynamic Island.

---

## 11. Was bewusst NICHT gebaut wurde (Stand v1.8.1)

| Feature | Warum nicht | Wo es hingehört |
|---|---|---|
| Gruppen-Chat in der App | WhatsApp ist da | Travel-Live Phase D |
| Per-Device Programm-Editor live | „bei jedem anders, verwirrt" (v1.6.0) | Travel-Live Phase C (Server-Sync) |
| HEIC-Foto-Dekodierung | kein Browser-Decoder | Wäre Server-side ImageMagick |
| Echter Offline-Modus | Service-Worker-Komplexität | später, sobald Trip eingefroren ist |
| Multi-Trip-Erstellungs-UI | Trips heute via Code-Datei | Phase B+C |
| Auth-System | PIN reicht für aktuelle Gruppe | Phase B+C/D (Magic-Link) |
| Externe Place-APIs (Google Places, OSM-Datenbank) | Plattform-Unabhängigkeit, Qualitäts-Hoheit | Travel-Live nutzt eigenes Curator-Netzwerk |
| Voting-Server | WhatsApp-Bridge reicht (v1.7.2) | Phase C: in-App Polls mit Persistenz |

---

## 12. Tech-Schulden & Bekannte Limits

- **Keine Tests** — kein Unit, kein E2E, nichts.
- **Keine CI-Pipeline mit Quality-Gates** — Build läuft erst bei Vercel.
- **Kein Error-Monitoring** — Crashes bei Usern unsichtbar.
- **`places[]` und `events[]` sind heute pro Trip** — sollten später globale DB sein.
- **localStorage ohne Migration-Strategie** — Schema-Änderungen müssen Schlüssel-versioniert
  werden, sonst alte Daten unbrauchbar.
- **Manche Komponenten 800+ Zeilen** (z.B. ProgrammTab, FotosTab) — Split-Kandidaten.
- **Bundle-Size**: Framer Motion + jsPDF + jszip sind dicke Brocken — Code-Splitting prüfen.
- **Kein Rate-Limit auf `/api/chat`** außer Per-Request-Limits — Cost-Risiko bei Abuse.

Vollständiger Plan zur Markt-Reife: siehe Antwort vom 23.05.2026 im Chat-Verlauf
(„Was zu Markt-Reife alles fehlt").

---

## 13. Wo die Reise hingeht (Phasen-Roadmap)

| Phase | Inhalt | Aufwand |
|---|---|---|
| A (laufend) | Bucketliste-Modus (v1.7.x) | ✓ teilweise |
| B | AI-Plan-Generator (Tempo, Wetter, Routing) | ~3 Wochen |
| C | Echter Gruppen-Sync via Blob-Manifest | ~2-3 Tage |
| D | Friend-Network mit DSGVO + viralem Einladen | ~3-4 Wochen |

Details: `releases/internal/travel-live-vision.md` (gitignored, internes Strategiepapier).
