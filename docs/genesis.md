# Genesis — wie das Projekt entstanden ist

> Diese Datei dokumentiert die Phase **vor v1.0.0** — also die ersten 35+ Commits,
> die in `releases/` als Blackbox erscheinen. Sie wird hauptsächlich auf Basis
> von `PLAN.md`, dem v1.0.0-Release-Doc und dem heutigen Codebase rekonstruiert.
>
> **Hinweis**: Anti-Halluzinations-Regel — was in den Quellen nicht steht, steht
> hier auch nicht. Lücken sind als „TODO: Harald ergänzt" markiert.

## Heutiger Eigentums-Status (Stand 26.05.2026, v1.14.4)

Code-IP gehört **hp+ consulting & marketing gmbh, Leonding (OÖ)**. RCMK ist
**erster Pilot-Kunde** und namensgebender Test-Trip. Plan ist die Vermarktung
als B2B-Plattform an Reisebüros und Veranstalter über ÖVT-Netzwerk, KTP und
direkte Kundenakquise.

Vor der Repositionierung 25.05.2026 war das Projekt ein RCMK-internes
Werkzeug ohne explizite Vermarktungs-Strategie. Die Wettbewerbs- und
Markt-Recherche-Phase (Polarsteps-Tiefenanalyse, Wayli, Mitbewerber-
Inventur, Print-Partner-Vergleich, Namen-Recherche) erfolgte am 24./25.
Mai 2026.

**Hybrid-Strategie** (verabschiedet 25.05.2026):
- Phase 1 Komplement (Reisebüro-Addon + Print-Anker) — heute
- Phase 2 Daten + API (Multi-Tenant + white-label CI) — 2027
- Phase 3 Substitut optional (B2C-DACH-Memory-Plattform) — 2028+

**Aktueller Status**: Reise vorbei, App in Iterations-/Plattform-Phase.
Foto-Buch-Marge wird strategisch hinterfragt (User-Diskussion 25.05.):
das Reisebüro will auch dran verdienen, gleichzeitiger Doppel-Margen-
Anspruch lässt für beide wenig übrig. Vermutlich pivot zu „App als
digitaler Reiseführer-Ersatz pro Reise lizenziert", Foto-Buch wird
Up-Sell statt Hauptcashflow. Demografie-Test (App-affin vs. haptik-
affin) bei RCMK-Kunden steht aus.

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

23.–25.05.2026      Iterations-Phase (v1.9.0 – v1.13.0)
  · Events-Datenklasse + KI Event-Recherche
  · PDF-Layout-Marathon (v1.10.x)
  · Bilder-Auswahl PDF/ZIP + Selection-Sheet
  · Video-Support (v1.12.0)
  · Leaflet interaktive Karte (v1.13.0)

25.05.2026          Strategische Repositionierung
  · Wettbewerbs-Recherchen (Polarsteps-Tiefenanalyse, Wayli,
    Mitbewerber-Inventur, Print-Partner-Vergleich, Namen-Recherche,
    Lasten-/Pflichtenheft)
  · Klar: Projekt ist eine HP+ CONSULTING-PLATTFORM, nicht ÖVT/RCMK-
    intern. RCMK = erster Pilot-Kunde. ÖVT/KTP/weitere = Vertriebskanäle.
  · Hybrid-Strategie verabschiedet (Komplement → Daten → Substitut)
  · Marken-Name „Travel Life" wegen ABTA-/TravelLife-AG-Konflikten
    verworfen. KURATIO/VIORA/REISARA als Kandidaten.
  · Doku-Stand auf hp+-Eigentum umgestellt (v1.13.1)
  · Trust-Badge sichtbar gemacht (v1.13.2)
  · Header-z-index-Fix für Leaflet (v1.13.3)

25.–26.05.2026      Reise-Rückblick „Erlebt" + Foto-Buch-Strategie-Debatte
  · v1.14.0: „Geplant" ↔ „Erlebt"-Switcher im ProgrammTab. „Erlebt"
    rekonstruiert aus Foto-EXIF (GPS + Zeitstempel via Haversine zur
    Place-Library). 0-Cent (vs. ~€1,50–2,00 Claude Vision pro Reise).
    Polarsteps-Parität-Move. Leger-Daten aus london-2026.ts entfernt.
  · v1.14.1: „Groß"-Karten-Link Stack-Folgefix (z-[400] → z-10)
  · v1.14.2: Geplant=Original wiederhergestellt (war Leger-Stand),
    Cluster-Parameter lockerer, Nominatim-Reverse-Geocoding als
    zweite Match-Quelle, max. 3 Fotos pro Stop statt 4.
  · v1.14.3: ProgramItem-Match als 3. Fallback bei GPS-losen Fotos
    → reverted in v1.14.4 (attribuierte Orte falsch wenn Realität vom
    Plan abwich, Anti-Halluzinations-Verstoß).
  · v1.14.4: clean Revert auf v1.14.2-Stand. Lessons-Learned-
    Eintrag: ehrliche Datenlücke > kreative Annahme, auch für
    Algorithmen nicht nur für Texte.
  · Strategiedebatte Foto-Buch-Marge (User-Einwand 25.05.): wenn
    Reisebüro UND hp+ beide am Foto-Buch verdienen wollen, bleibt
    für beide zu wenig. Vermutliches Pivot zu „App als digitaler
    Reiseführer pro Reise lizenziert" — Foto-Buch als optionaler
    Up-Sell. Demografie-Test offen (App-affin vs. haptik-affin).
  · 6 nächste Schritte verabschiedet: CLAUDE.md/docs Update (jetzt),
    Print-Adapter, NPS, Tenant-Branding, Service-Worker.
    GPS-Live-Tracker auf der Liste, nicht vorrangig.
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

**Diese Datei wird ergänzt sobald neue Details verfügbar sind. Stand: 26.05.2026.**
