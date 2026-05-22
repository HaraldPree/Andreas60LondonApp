# Genesis — wie das Projekt entstanden ist

> Diese Datei dokumentiert die Phase **vor v1.0.0** — also die ersten 35+ Commits,
> die in `releases/` als Blackbox erscheinen. Sie wird hauptsächlich auf Basis
> von `PLAN.md`, dem v1.0.0-Release-Doc und dem heutigen Codebase rekonstruiert.
>
> **Hinweis**: Anti-Halluzinations-Regel — was in den Quellen nicht steht, steht
> hier auch nicht. Lücken sind als „TODO: Harald ergänzt" markiert.

---

## Zeitlinie

```
April 2026          Projekt-Start
  · PLAN.md geschrieben (Tech-Stack-Entscheidungen, CI, Datenmodell-Skizze)
  · Inspiration: PUR Touristik Angebots-App (https://pur-angebots-app.vercel.app/)
  · Gleicher Stack wie PUR-App, aber anderes Ziel:
      PUR = Angebotspräsentation VOR der Buchung
      RCMK = Reisebegleiter WÄHREND der Reise
  · Erste Demo-Reise definiert: London 18.–22. Mai 2026, Andreas 60. Geburtstag

April–Mai 2026      35+ Commits ohne formelle Versionierung
  · Next.js-Setup, Tailwind-Theme, Trip-Datenmodell
  · Programm-, Karten-, Reservierungs-, Info-Tab gebaut
  · KI-Companion mit Claude Opus 4.7 + Streaming + Tool-Use
  · Foto-Storage (IndexedDB) + Foto-Buch-Export (PDF + ZIP)
  · PIN-Gate via Edge-Middleware
  · PWA-Manifest, iOS-Safe-Area, Update-Banner

21.05.2026          v1.0.0 Baseline — Versionierung formal eingeführt
  · Alle bisherigen Features als Baseline gewertet
  · Ab hier: jede Änderung = neue vX.Y.Z + releases/vX.Y.Z.md
  · App ist live während der London-Reise (Tag 4/5)

18.–22.05.2026      Live-Reise mit ~22 Live-Releases (v1.0.1 bis v1.8.0)
  · Iterative Anpassungen während die Gruppe in London ist
  · Feedback fließt direkt in den Code, Vercel deployed in <2 Min

23.05.2026          v1.8.1 + Retrospektive
  · Live-Phase abgeschlossen
  · Lessons in `releases/internal/london-2026-retro.md` festgehalten
  · v1.9.0 Events-Datenklasse in Vorbereitung
```

---

## Warum dieser Tech-Stack? (aus PLAN.md)

| Komponente | Wahl | Begründung |
|---|---|---|
| Framework | Next.js 14 App Router | wie PUR-App, Vercel-optimiert, SSG für Speed |
| Styling | Tailwind CSS | schnell, konsistent, responsive out of the box |
| Sprache | TypeScript | Typsicherheit für Reise-Datenstrukturen |
| Karten | Leaflet + OpenStreetMap | kostenlos, kein API-Key nötig |
| Wetter | Open-Meteo API | kostenlos, zuverlässig |
| Icons | Lucide React | leichtgewichtig |
| Animationen | Framer Motion | smoothe Tab-Übergänge |
| Fonts | Playfair Display + DM Sans | elegant + lesbar |
| Hosting | Vercel | Auto-Deploy via GitHub, kostenlos |
| Entwicklung | Claude Code | Haupt-Entwicklungstool |

**Eingehaltene Prinzipien**:
- Mobile-first (max-width 480 px zentriert)
- Keine kostenpflichtigen APIs
- Alle User-Texte auf Deutsch
- Brand-Colors über Tailwind-Theme (`navy`, `gold`, `cream`)
- Architektur generisch: neue Reise = neue Datei in `src/data/trips/`

---

## Feature-Inventur v1.0.0 (was vor Versionierung gebaut wurde)

Vollständig dokumentiert in [`releases/v1.0.0.md`](../releases/v1.0.0.md). Hier
nur die Bereiche:

- **Reise-Kern**: 5-Tages-Programm, Live-Wetter, TfL-Status, „Plan B bei Regen", 5 Reisende
- **Karten & Orte**: 9 Hidden Places, 15 Restaurants, Apartment-Details, Notfallnummern
- **Reservierungen**: Cedric Grolet, goûtea-Menü, 3-Status-Toggle
- **Flüge**: FR1694/RK1695 mit PNR, Sitzplätzen, AviationStack-Status
- **KI-Companion**: Claude Opus 4.7 mit Streaming, Voice, Tool-Use
- **Fotos**: IndexedDB-Storage, ZIP/PDF-Export, KI-Foto-Erzählung, „Wo ist das?"
- **Logistik**: Packliste, Gesundheitskarte, Währungsrechner, Ausgaben-Split, Phrasebook, Laufrouten
- **Sicherheit**: PIN-Gate, AGB, Impressum, Datenschutz, „Problem melden"
- **PWA / Mobile**: Update-Banner, iOS-Safe-Area, Maskable Icons

---

## Entscheidungen die nicht protokolliert sind

> Diese Lücken können wir nur aus dem Code ableiten oder durch Harald ergänzen.

- **Wann wurde der Wechsel von `RCMK_ANTHROPIC_KEY` zu `APP_ANTHROPIC_KEY` entschieden?**
  Heute existieren beide Namen im Code (Fallback-Kette in `src/app/api/chat/route.ts`
  und `src/app/api/version/route.ts`). Vermutlich Konsolidierungs-Bewegung.
  → TODO: Harald ergänzt.

- **Warum Manifest-Pattern statt KV?**
  v1.1.3 hat KV abgeräumt. Begründung im Release-Doc: KV-Free-Tier
  zu klein für Foto-Metadaten, Manifest-JSON im Blob ist atomic genug.

- **Warum 7 Tabs trotz Apple-HIG-Empfehlung von max 5?**
  Wunschliste kam als 7. Tab dazu (v1.7.0). UX-Audit hat's als Compromise notiert,
  Konsolidierungs-TODO (z.B. SOS in Info) bleibt offen.

- **Warum Claude Opus 4.7 statt Sonnet 4.6?**
  CLAUDE.md sagt: Standard Opus, bei Kostendruck Sonnet. Heute keine Kosten-Probleme.

- **Wieso wurden 35+ Commits vor v1.0.0 nicht versioniert?**
  → TODO: Harald ergänzt. Vermutung: Projekt war erst nach erstem realen Live-Test
  als „release-fähig" eingestuft.

---

## Was ein Programmierer aus der Genesis lernen soll

1. **Inkrementelles Bauen mit Live-User-Feedback ist möglich** — wenn der
   Deploy-Pfad <2 Min ist und Cache-Bust zuverlässig.
2. **TypeScript-Files als „Datenbank"** funktioniert für genau eine Reise sehr
   gut, skaliert aber nicht für Multi-Trip oder mehrere Kunden.
3. **localStorage als Single-Source-of-Truth pro Gerät** ist OK solange Gruppen-Sync
   nicht nötig ist. Sobald Cross-User-State auftaucht (z.B. Foto-Sharing),
   braucht's ein Backend.
4. **Anti-Halluzinations-Regel war von Anfang an Pflicht** — und hat in der
   Live-Reise mehrfach Schaden verhindert (siehe RK1695-Vorfall im Retro-Dok).
5. **Apple-Way als Maxime** funktioniert meistens, ist aber nicht universell
   (siehe Sparkle-Pulse-Revert v1.5.1).

---

## Verwandte Dokumente

- [`PLAN.md`](../PLAN.md) — Ursprünglicher Plan vom April 2026
- [`releases/v1.0.0.md`](../releases/v1.0.0.md) — Feature-Inventur Baseline
- [`releases/README.md`](../releases/README.md) — Index aller Releases
- `releases/internal/london-2026-retro.md` (gitignored) — Lessons aus der Live-Reise
- `releases/internal/travel-live-vision.md` (gitignored) — Wo's hin will

---

**Diese Datei wird ergänzt sobald neue Details verfügbar sind. Stand: 23.05.2026.**
