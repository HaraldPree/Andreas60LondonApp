# Todo / Verbesserungsvorschläge

Hier sammeln wir **alle Ideen, Audits, Verbesserungsvorschläge** die NICHT
sofort umgesetzt werden. Jedes Markdown-File ist ein eigenständiger Vorschlag
oder Audit-Eintrag — kein riesiger TODO-Pool.

## Workflow

1. **Idee taucht auf** (im Chat, beim Testen, durch Audit) → neues `.md` File anlegen
2. **Datei-Name**: kurzer, sprechender slug wie `firefox-mic-fallback.md` oder
   `dark-mode.md` — kein Datum/Versions-Prefix nötig
3. **Inhalt-Format** (siehe Template unten)
4. **Status-Tag** ganz oben: `proposed` / `planned` / `in-progress` / `done` / `rejected`
5. Wenn umgesetzt → ggf. nicht löschen, sondern Status auf `done` + Verweis auf
   Release-Version in `releases/`

## Template pro Eintrag

```markdown
# Titel des Vorschlags

**Status**: proposed
**Priorität**: hoch | mittel | nice-to-have
**Aufwand**: ~2h / ~1 Tag / ~1 Woche
**Vorgeschlagen am**: TT.MM.JJJJ
**Vorgeschlagen von**: Harald / Andrea / Lukas / etc.
**Betrifft**: Foto-Sharing / UI / Performance / DSGVO / etc.

## Problem
Was funktioniert nicht gut, oder fehlt komplett.

## Vorgeschlagene Lösung
Konkret was getan werden soll.

## Alternativen
Andere Wege die diskutiert wurden + warum nicht gewählt.

## Abhängigkeiten / Voraussetzungen
Was muss vorher passieren (z.B. Backend, neue Lib, User-Feedback).

## Geschätzter Aufwand
Code, UI, Tests, Doku, Deploy.

## Entscheidung
Wann + von wem entschieden → on / off / wann implementieren.
```

## Aktuelle Einträge

| Datei | Titel | Status | Priorität |
|---|---|---|---|
| [in-app-day-editor.md](./in-app-day-editor.md) | In-App-Editor für Tagesprogramm (Phase 1 = v1.3.0 ✓, Phase 2 = v1.4.0 ✓; Phase 3 offen) | Phase 1+2 done, Phase 3 proposed | mittel |
| [v1.1.0-ux-audit.md](./v1.1.0-ux-audit.md) | UX-Audit Apple-Style / Cross-Platform (Quick-Wins teilweise in v1.3.1 ✓) | partly done | mittel |
| [firefox-mic-fallback.md](./firefox-mic-fallback.md) | Mikrofon-Fallback für Firefox (Variante A = v1.3.1 ✓) | Variante A done | nice-to-have |

(Neue Einträge oben einfügen oder nach Priorität sortieren.)

## Beziehung zu `releases/`

```
todo/             → was wir machen könnten, noch nicht umgesetzt
releases/         → was tatsächlich deployed wurde, pro Version
releases/workshop/ + releases/internal/ → interne Strategiepapiere (gitignored)
```

Wenn ein Todo umgesetzt wird:
1. Code-Change + Release-Doc (siehe `releases/README.md`)
2. Im Todo-File: Status → `done`, Verweis auf die Release-Version
