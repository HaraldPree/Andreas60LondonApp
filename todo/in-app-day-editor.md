# In-App-Editor für Tagesprogramm (Selbstbedienung statt Claude pingen)

**Status**: proposed
**Priorität**: mittel
**Aufwand**: ~2-3 Tage
**Vorgeschlagen am**: 19.05.2026
**Vorgeschlagen von**: Harald (live während London-Reise, Di Nachmittag)
**Betrifft**: UI / UX / Datenmodell / Sync

## Problem

Während der Reise will man das Tagesprogramm spontan anpassen
(z.B. „Vormittag wie geplant, Rest offen — wir sind kaputt nach Cedric").
Aktuell geht das nur über Code-Change durch mich (Claude) →
Harald muss mich pingen, Release-Workflow durchziehen, push, Vercel-Deploy
abwarten. Das ist:

- zu langsam für „spontan auf der Bank im Park"-Anpassungen
- ein Single-Point-of-Failure (wenn ich offline bin, geht nichts)
- bringt die App in einen unschönen Zwiespalt: einerseits gemeinsamer
  Companion für 5 Leute, andererseits nicht editierbar im Live-Use

Konkretes Beispiel (Di 19.05.2026, live):
- Geplant: Royal Walk + Cedric + Hyde Park + Harrods + V&A + Notting Hill + Pub
- Realität: Royal Walk + Cedric → „viel zu viel", Rest abgebrochen, Rückzug ins
  Hotel
- Harald musste mich von unterwegs anschreiben damit das Programm das
  widerspiegelt

## Vorgeschlagene Lösung

### Phase 1 — „Done / Skip / Free"-Toggle pro Item (klein, schnell)

Jedes Item im Tages-Card kriegt drei Mini-Buttons:
- ✓ erledigt → Item bleibt sichtbar, aber grau + durchgestrichen
- ⊘ ausgelassen → Item bleibt sichtbar, durchgestrichen, kein Highlight
- ✏️ Notiz → freie Notiz hinzufügen („war super", „zu voll, abgebrochen")

Speicherung: localStorage pro Trip, pro Item-ID (Item-IDs müssen wir noch
einführen — bisher sind Items anonym).

**Vorteil**: keine Datenmodell-Brüche, kein Backend nötig, kein Sync zwischen
Reisenden (jeder hat seine eigene Sicht — wie bei v1.2.0 Varianten-Switch).

**Aufwand**: ~1 Tag UI + ~0.5 Tag Item-ID-Schema + Tests.

### Phase 2 — „Tag offen lassen"-Modus pro Tag

Neben den Item-Toggles ein Day-Level-Button:
- „Tag teilweise offen lassen" → User kann ein Cut-off-Zeitfenster setzen
  („ab 14:00 alles offen"), alle Items ab dem Zeitpunkt werden grau + zu
  einem einzigen „Rest des Tages offen"-Item zusammengefasst.

**Aufwand**: ~0.5 Tag zusätzlich.

### Phase 3 — Gruppen-Sync (optional, später)

Aktuell pro Gerät. Bei Bedarf: Backend-Sync (selber Mechanismus wie
gemeinsame Foto-Galerie, also Blob + Manifest), damit alle 5 dieselbe
„erledigt"-Sicht haben. Frage an die Gruppe: „wollt ihr das?" — manche
mögen vielleicht ihre persönliche Sicht.

**Aufwand**: ~1 Tag + Tests.

## Alternativen

1. **Verbal-Approach beibehalten** (jetziger Stand): Harald pingt Claude →
   Code-Change. Funktioniert solange Claude verfügbar ist + Internet da.
2. **Externes Tool** (z.B. Google Doc / Notion): bricht die Companion-Idee
   ein, Leute müssten aus der App rausspringen.
3. **In-App-Editor mit Backend von Anfang an**: aufwendiger, mehr Kosten,
   mehr Komplexität — die Phase-1-localStorage-Variante deckt 90% der
   Use Cases.

Phase 1 ist klar der erste Schritt.

## Abhängigkeiten / Voraussetzungen

- Items brauchen stabile IDs (aktuell sind sie nur durch Array-Index
  identifiziert → ungeeignet für persistente Markierungen). Schema:
  `${tripSlug}-${dayIndex}-${itemIndex}` oder eindeutige slugs pro Item.
- localStorage-Schema (analog zu `useTripVariant`, `useUserPlaces`).
- DayCard.tsx muss die Toggles + State-Sichtbarkeit (grau/durchgestrichen)
  rendern.

## Geschätzter Aufwand

| Phase | Zeit | Risiko |
|---|---|---|
| Item-IDs einführen | 0.5 Tag | klein (mechanisch) |
| Phase 1 Toggles + UI | 1 Tag | klein |
| Phase 2 Tag-Cut-off | 0.5 Tag | mittel (UX) |
| Phase 3 Backend-Sync | +1 Tag | mittel (Blob-Manifest erweitern) |

Total Phase 1+2 = ~2 Tage = 1 Wochenend-Sprint.

## Entscheidung

Offen. Vorschlag: Nach Rückkehr von London-Reise (ab 23.05.) entscheiden ob
Phase 1+2 vor der nächsten Reise umgesetzt werden soll. Bis dahin
Workaround = ich (Claude) edit via Chat.
