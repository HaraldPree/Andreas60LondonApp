# Foto-Auswahl für PDF- und ZIP-Export

**Status**: planned
**Priorität**: hoch
**Aufwand**: ~1 Tag
**Vorgeschlagen am**: 23.05.2026
**Vorgeschlagen von**: Harald
**Betrifft**: Fotos-Tab / Export / UX

## Problem

Aktuell exportieren **PDF-Reise-Tagebuch** und **Foto-Buch-ZIP** automatisch
**alle eigenen Fotos** (aus IndexedDB). User kann nicht:

- Einzelne Fotos vom Export ausschließen (z.B. Test-Schüsse, Doubletten)
- Fotos aus der **gemeinsamen Galerie** (anderer Reisender via Vercel Blob)
  in den Export einbeziehen
- Fotos aus mehreren Quellen mischen

Harald-Zitat:
> „weiters würde ich gerne die bilder auswählen, die in das fotobuch
> aber auch in das Zip kommen und zwar aus allen bildern die es gibt"

## Vorgeschlagene Lösung

### UX

Pro Export-Card (PDF + ZIP) ein **„Bilder auswählen…"**-Button vor „Generieren":

- Öffnet ein Sheet (analog `BulkShareSheet`)
- Liste **aller verfügbaren Fotos**: eigene + alle sichtbaren shared
- Default: alle eigenen ausgewählt, geteilte aus
- Quellen-Filter-Pills oben: „Eigene · Geteilt · Tag 1 · Tag 2 · …"
- „Alle auswählen" / „Keine" / „Nur eigene"
- Multi-Tap pro Foto
- Footer: „N Fotos für Export ausgewählt" + „Übernehmen"

Nach Schließen merkt sich die Card die Auswahl, „Generieren" verwendet sie.

### Datenfluss

```
usePhotos (IndexedDB) ─┐
                       ├─ unifyForExport() ─→ PhotoExportItem[]
useSharedPhotos (Blob)─┘                            │
                                                    ↓
                                       PdfBookExportButton + ZIP
```

Neuer Typ:
```ts
type PhotoExportItem = {
  id: string;
  source: "own" | "shared";
  takenAt: string;
  caption?: string;
  aiNarrative?: string;
  dataUrl?: string;        // für eigene: aus IndexedDB
  remoteUrl?: string;      // für shared: aus Blob
  assignedDay?: number;
  uploaderName?: string;   // bei shared: wer's geteilt hat
};
```

Generator (`photoBookPdfGenerator.tsx` + `photoBookExport.ts`) muss beide
Datenquellen verarbeiten:
- IndexedDB-Blobs wie bisher
- Vercel-Blob-URLs via fetch → blob → dataUrl

### Performance-Auswirkung

- 50 shared Photos fetchen = ~10-30 MB Download + base64-Encoding
- Sollte auf Mobile mit Progress-Anzeige machbar sein
- Cap: max 100 Fotos pro Export

## Alternativen

- **Selection-Mode aus dem Fotos-Tab wiederverwenden** statt eigenes Sheet:
  einfacher, aber kombiniert nicht mit shared Photos. Verworfen.
- **„Pre-Filter" nur per Tag/Tag-Auswahl** ohne Pro-Foto-Toggle: weniger
  granular, aber 80%-Lösung. Als Fallback wenn Aufwand zu groß.

## Abhängigkeiten / Voraussetzungen

- `useSharedPhotos`-Hook liefert schon `SharedPhotoView[]` mit `blobUrl`
- PDF-Generator muss erweitert werden für externe URLs (fetch + base64)
- ZIP-Generator (`buildPhotoBookZip` in `photoBookExport.ts`) auch erweitern

## Geschätzter Aufwand

- Typen + Datenflow: 2h
- Selection-Sheet UI: 3h
- PDF-Generator-Erweiterung: 2h
- ZIP-Generator-Erweiterung: 2h
- Testing + Polish: 2h
- Doku + Release: 1h

**Total**: ~1 Arbeitstag

## Entscheidung

Geplant für **v1.11.0**, sobald die PDF-Layout-Fixes (v1.10.2) bestätigt sind.
