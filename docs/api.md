# API-Referenz — RCMK Travel Companion

> Alle API-Routes liegen unter `src/app/api/*`. PIN-Gate via Edge-Middleware
> blockiert unauthenticated Requests (siehe `src/middleware.ts`).

| Route | Method | Runtime | Auth | Zweck |
|---|---|---|---|---|
| `/api/login` | POST | edge | public | PIN setzen / Cookie ausstellen |
| `/api/logout` | POST | edge | PIN | Cookie löschen |
| `/api/version` | GET | edge | public | Build-Version + Env-Diagnose |
| `/api/chat` | POST | nodejs | PIN | AI-Companion Streaming Chat |
| `/api/photo-narrate` | POST | nodejs | PIN | KI-Foto-Erzählung |
| `/api/identify-location` | POST | nodejs | PIN | „Wo ist das?" Foto-Location |
| `/api/flight-status` | GET | nodejs | PIN | AviationStack-Status oder Fallback |
| `/api/photos/share` | POST | nodejs | PIN | Foto in Gemeinsame Galerie hochladen |
| `/api/photos/share` | PATCH | nodejs | PIN | Visibility ändern |
| `/api/photos/share` | DELETE | nodejs | PIN | Foto zurückziehen (Withdraw) |
| `/api/photos/list/[tripSlug]` | GET | nodejs | PIN | Sichtbare Fotos auflisten |

---

## `/api/login` — PIN-Eingabe

**POST** mit JSON-Body:

```json
{ "pin": "1234" }
```

**Response**:
- `200 { "ok": true }` — Cookie `app_session` wird gesetzt (httpOnly, 30 Tage)
- `200 { "ok": true, "note": "No PIN configured ..." }` — Dev-Modus ohne `APP_PIN`
- `401 { "error": "Falscher Code" }` — wrong PIN (mit 500 ms-Delay gegen Brute-Force)
- `400 { "error": "Invalid JSON" }`

**Quelle**: `src/app/api/login/route.ts`

---

## `/api/logout` — Logout

**POST** ohne Body. Löscht das `app_session`-Cookie. Response: `200 { "ok": true }`.

---

## `/api/version` — Build-Version + Env-Diagnose

**GET** ohne Parameter. Wird vom Client-Hook `useVersionCheck` alle 60 s gepollt
um Update-Banner anzuzeigen.

**Response (200)**:

```json
{
  "version": "abc1234",                       // VERCEL_GIT_COMMIT_SHA
  "deployedAt": "...",                        // VERCEL_DEPLOYMENT_ID
  "nodeEnv": "production",
  "pinConfigured": true,
  "pinLength": 4,
  "aviationstackConfigured": true,
  "anthropicConfigured": true,
  "blobConfigured": true,
  "kvConfigured": false,
  "photoSharingReady": true,
  "hints": [
    "AVIATIONSTACK_API_KEY nicht gesetzt — Flugstatus fällt auf Flightradar24-Link zurück."
  ]
}
```

**Wichtig**: Diese Route gibt KEINE Secret-Werte preis — nur ob sie konfiguriert
sind und wie lang sie sind. Sicher für Public-Diagnose.

Cache-Control: `no-store, must-revalidate`.

**Quelle**: `src/app/api/version/route.ts`

---

## `/api/chat` — AI-Companion (Streaming)

**POST** mit JSON-Body:

```ts
{
  tripSlug: string,
  messages: Anthropic.MessageParam[],   // bisheriger Conversation-Verlauf
  currentUserName?: string              // optional, für Personalisierung
}
```

**Response**: Server-Sent Events (Streaming). Body wird Token-by-Token gesendet.

**Limits** (kosten- und missbrauchsgesichert):
- Body max **100 KB**
- Max **50 Messages** pro Conversation
- Max **4000 Zeichen** pro Message
- `currentUserName` max 50 Zeichen
- Max **5 Tool-Iterationen** pro Request

**Errors**:
- `400` — invalid JSON / missing fields / message zu lang
- `404` — Trip-Slug unbekannt
- `413` — Body zu groß
- `500` — Anthropic-API-Fehler oder fehlender API-Key

**Tool-Use**: Claude kann während des Streamings folgende Tools aufrufen
(definiert in `src/lib/companionTools.ts`):
- `get_live_weather(lat, lng)` — Open-Meteo Live-Forecast
- `get_tfl_status()` — TfL Tube-Linien-Status

**System-Prompt-Caching**: Trip-Daten werden als `cache_control: ephemeral`
markiert. Bei Wiederverwendung innerhalb 5 min spart das ~95% Input-Tokens.

**Env-Var-Fallback**:
1. `APP_ANTHROPIC_KEY` (primär)
2. `RCMK_ANTHROPIC_KEY` (legacy)
3. `ANTHROPIC_API_KEY` (global)

**Quelle**: `src/app/api/chat/route.ts`

---

## `/api/photo-narrate` — KI-Foto-Erzählung

**POST** mit JSON-Body:

```ts
{
  tripSlug: string,
  imageBase64: string,                                       // ohne "data:..." Prefix
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif",
  assignedDay?: number,                                      // Kontext für die Geschichte
  caption?: string,                                          // max 500 Zeichen
  coordinates?: { lat: number, lng: number }
}
```

**Response**: JSON mit Erzähltext. Format-Details: siehe `route.ts`.

**Limits**:
- Body max **10 MB**
- Image-Base64 max **7 MB** (~5 MB binär)
- Caption max **500 Zeichen**
- maxDuration 30 s (Vercel-Funktions-Timeout)

**Quelle**: `src/app/api/photo-narrate/route.ts`

---

## `/api/identify-location` — „Wo ist das?"

**POST** mit JSON-Body (gleiche Limits wie `photo-narrate`):

```ts
{
  tripSlug: string,
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
}
```

**Response (200)**:

```ts
{
  identified: boolean,
  confidence: "high" | "medium" | "low",
  name?: string,
  alternativeName?: string,
  category?: string,
  description?: string,
  coordinates?: { lat: number, lng: number },
  address?: string,
  distanceFromApartment?: string,
  transitOptions?: string[],
  bestTime?: string,
  estimatedVisitMinutes?: number,
  notes?: string,
  rawResponse?: string,           // raw text from Claude if JSON parse fails
  error?: string
}
```

**Quelle**: `src/app/api/identify-location/route.ts`

---

## `/api/flight-status` — Flug-Live-Status

**GET** mit Query-Parametern:

```
/api/flight-status?flight=FR1694&date=2026-05-18
```

- `flight` (Pflicht) — IATA-Flugcode
- `date` (optional) — Datum YYYY-MM-DD

**Response**: JSON mit Status + Quelle (`AviationStack` oder `Fallback`).

**Cache**: `public, s-maxage=300, stale-while-revalidate=600` (5 min hot, 10 min stale).

**Fallback-Verhalten**: Wenn `AVIATIONSTACK_API_KEY` nicht gesetzt oder
Rate-Limit überschritten ist, gibt die Route einen Hinweis-Status zurück, der
clientseitig zu einem Flightradar24-Tracker-Link führt.

**Quelle**: `src/app/api/flight-status/route.ts` + `src/lib/flightStatus.ts`

---

## `/api/photos/share` — Foto-Sharing

### POST — Foto hochladen

**multipart/form-data** mit Feldern:

| Feld | Typ | Beschreibung |
|---|---|---|
| `file` | Blob | Voll-aufgelöstes Foto |
| `thumb` | Blob | Thumbnail (client-side erzeugt) |
| `tripSlug` | string | z.B. `london-2026` |
| `photoId` | string | Client-UUID (gleich wie IndexedDB-ID) |
| `uploaderName` | string | aus localStorage Identity, **muss Mitglied der Reisegruppe sein** |
| `visibility` | `"celebrant"` \| `"group"` | `"private"` ist hier nicht erlaubt |
| `fileName`, `caption`, `takenAt`, `assignedDay` | string/number | optional |

**Response**: `200` mit `SharedPhotoView`-Objekt.

**Errors**:
- `400` — invalid form / uploaderName nicht Mitglied / fehlende Felder
- `503` — Blob nicht konfiguriert (`BLOB_READ_WRITE_TOKEN` fehlt)

### PATCH — Visibility ändern

Body: `{ tripSlug, photoId, uploaderName, visibility: "celebrant"|"group"|"private" }`.
Bei `"private"` wird das Blob hardgelöscht (man kann ein Foto vollständig
zurückziehen).

### DELETE — Foto zurückziehen

Setzt `withdrawnAt` und löscht den Blob-Inhalt.

**Auth-Hinweis**: PIN-Cookie wird via Middleware geprüft. Zusätzlich wird
`uploaderName` gegen die Trip-Teilnehmer-Liste validiert (`assertParticipant`).

**Quelle**: `src/app/api/photos/share/route.ts` + `src/lib/sharedPhotoStore.ts`

---

## `/api/photos/list/[tripSlug]` — Sichtbare Fotos auflisten

**GET** mit URL-Parameter `tripSlug` und Query `viewerName`:

```
/api/photos/list/london-2026?viewerName=Andrea
```

**Response (200)**: `SharedPhotoView[]` — nur Fotos, die der Viewer laut
`canViewSharedPhoto()` sehen darf:
- **Eigene Fotos**: immer (auch wenn nachträglich auf „private" runtergestuft)
- **`group`-Visibility**: alle Trip-Mitglieder
- **`celebrant`-Visibility**: nur das Geburtstagskind (Participant mit Role `celebrant`)
- **`private`-Visibility**: niemals (sollte gar nicht im Storage liegen)

**Errors**:
- `404` — Trip-Slug unbekannt
- `400` — viewerName fehlt
- `503` — Storage nicht konfiguriert

**Quelle**: `src/app/api/photos/list/[tripSlug]/route.ts`

---

## Was diese API **nicht** kann (Stand v1.8.1)

- **Kein Auth** außer PIN — alle Reise-Mitglieder teilen denselben Code
- **Keine Pagination** — Foto-Listen kommen vollständig zurück
- **Keine Webhooks** — kein Push-Mechanismus
- **Keine API-Versionierung** — Schema-Änderungen brechen ältere Clients
- **Kein Rate-Limit auf Endpoint-Ebene** — nur Per-Request-Limits in `/api/chat`
- **Kein Audit-Log** — Login-Versuche, Withdrawals etc. werden nicht persistiert

Für Markt-Reife siehe Roadmap in `docs/architecture.md` Abschnitt 12.

---

## Lokales Testen

```bash
# Health-Check
curl http://localhost:3000/api/version

# Login (DEV-Modus = kein APP_PIN, returns ok ohne Cookie)
curl -X POST http://localhost:3000/api/login -d '{"pin":"1234"}' \
     -H "Content-Type: application/json"

# Mit gesetztem APP_PIN: Cookie speichern
curl -X POST http://localhost:3000/api/login \
     -d '{"pin":"1234"}' \
     -H "Content-Type: application/json" \
     -c cookies.txt

# Authenticated Call
curl http://localhost:3000/api/version -b cookies.txt
```

---

**Stand**: v1.8.1 (23.05.2026). Wird bei jeder Route-Änderung mitgezogen.
