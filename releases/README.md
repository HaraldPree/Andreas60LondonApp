# Releases & Änderungs-Historie

Pro Release-Eintrag eine eigene Markdown-Datei nach Schema `vMAJOR.MINOR.PATCH.md`,
damit wir jederzeit nachvollziehen können was wann warum geändert wurde.

## Versionierungs-Schema (Semver-light)

| Komponente | Wann erhöhen | Beispiel |
|---|---|---|
| **MAJOR** | Architektonische Änderungen (z.B. Backend dazu, Auth-Konzept, Datenmodell-Bruch) | 1.x → 2.0 |
| **MINOR** | Neue Features die abwärtskompatibel sind (z.B. Foto-Buch, Diagnose-Seite, Phrasebook) | 1.0 → 1.1 |
| **PATCH** | Bug-Fixes, kleine UX-Verbesserungen, Copy-Updates ohne neue Features | 1.1.0 → 1.1.1 |

Bei mehreren Themen in einem Release: das **höchste** wirkt (1 Feature + 5 Bugfixes = MINOR-Bump).

## Format pro Release-Doc

Jede `vX.Y.Z.md` enthält:

```markdown
# vX.Y.Z — Kurzer Titel

**Datum**: TT.MM.JJJJ
**Status**: deployed / pending / rollback
**Git Tag**: vX.Y.Z

## Was ist neu / fixed
- … (mit Commit-Hash falls praktisch)

## Was funktioniert NICHT
- … (bekannte offene Probleme)

## Migrations-Hinweise
- … (z.B. "Cache leeren nötig", "neue Env-Var XYZ erforderlich")

## User-Kommunikation
- … (was wurde der Reisegruppe / Kunden mitgeteilt)
```

## Workflow ab v1.0.0

Wenn ich (Claude) eine Code-Änderung mache:
1. **Vor dem Push**: `package.json` Version hochsetzen (Semver-Regel oben)
2. **Vor dem Push**: neue Datei `releases/vX.Y.Z.md` mit Format oben anlegen
3. **Commit-Message** referenziert die Version: z.B. `chore: bump to v1.0.1`
4. **Optional Git-Tag**: `git tag vX.Y.Z && git push --tags` — macht Releases auf GitHub sichtbar

## Index

| Version | Datum | Titel | Status |
|---|---|---|---|
| [v1.7.9](./v1.7.9.md) | 22.05.2026 | Rückflug-Flugnummer-Korrektur (FR1695 → RK1695) | deployed |
| [v1.7.8](./v1.7.8.md) | 21.05.2026 | Heutiger Tag default offen + Foto-Tag manuell zuordnen | deployed |
| [v1.7.7](./v1.7.7.md) | 21.05.2026 | Tag 4 Leger angepasst (Borough Market → Uber Boat → Greenwich) | deployed |
| [v1.7.6](./v1.7.6.md) | 20.05.2026 | Fotos-Tab: Tage + Gemeinsame Galerie ausklappbar (Lukas-Feedback) | deployed |
| [v1.7.5](./v1.7.5.md) | 20.05.2026 | Frag-Button auch bei „👁 Vorbei" + Update-Format-Regelwerk | deployed |
| [v1.7.4](./v1.7.4.md) | 20.05.2026 | Poll pro Wunsch (Single-Place-Poll) | deployed |
| [v1.7.3](./v1.7.3.md) | 20.05.2026 | Poll-Button immer sichtbar (Discoverability-Fix) | deployed |
| [v1.7.2](./v1.7.2.md) | 20.05.2026 | WhatsApp-Poll aus der Wunschliste | deployed |
| [v1.7.1](./v1.7.1.md) | 20.05.2026 | 4 Status + Programm↔Wunschliste-Verzahnung | deployed |
| [v1.7.0](./v1.7.0.md) | 20.05.2026 | Wunschliste-Tab + London Place-Library (75 Places) | deployed |
| [v1.6.2](./v1.6.2.md) | 20.05.2026 | Wording „Teilen" → „Freigeben" + Users-Icon | deployed |
| [v1.6.1](./v1.6.1.md) | 20.05.2026 | Multi-Photo-Share entdeckbar machen (Button + Hilfe-Zeile) | deployed |
| [v1.6.0](./v1.6.0.md) | 20.05.2026 | Leger vs. Original-Programm umschalten + Editor deaktiviert | deployed |
| [v1.5.1](./v1.5.1.md) | 19.05.2026 | KI-Companion Sparkle wieder mit Pulse + Live-Punkt (Revert) | deployed |
| [v1.5.0](./v1.5.0.md) | 19.05.2026 | Mehrere Fotos auf einmal teilen (iOS-Photos Selection-Mode) | deployed |
| [v1.4.0](./v1.4.0.md) | 19.05.2026 | In-App-Editor Phase 2: „Ab hier Rest des Tages offen" | deployed |
| [v1.3.1](./v1.3.1.md) | 19.05.2026 | Apple-Way Polish-Bundle (Sparkle ruhig, Touch-Targets, Reservation-Sheet, Firefox-Hint) | deployed |
| [v1.3.0](./v1.3.0.md) | 19.05.2026 | In-App-Editor für Tagesprogramm (Phase 1: Done/Skip/Notiz) | deployed |
| [v1.2.4](./v1.2.4.md) | 19.05.2026 | PWA-Retour-UX (Sentinel-History für Direkt-Open) | deployed |
| [v1.2.3](./v1.2.3.md) | 19.05.2026 | Live-Bug-Fixes: Back-Geste, Galerie-Cache, iOS-Hint | deployed |
| [v1.2.2](./v1.2.2.md) | 19.05.2026 | Dienstag live-angepasst (Royal Walk + Cedric, Rest offen) | deployed |
| [v1.2.1](./v1.2.1.md) | 21.05.2026 | Tube-Streik abgesagt (Content-Update) | deployed |
| [v1.2.0](./v1.2.0.md) | 21.05.2026 | Programm-Varianten-Switch (Wetter-Anpassung) | deployed |
| [v1.1.3](./v1.1.3.md) | 21.05.2026 | Foto-Sharing Blob-only (KV nicht mehr nötig) | deployed |
| [v1.1.2](./v1.1.2.md) | 21.05.2026 | Foto-Sharing Storage-Diagnose im /api/version | deployed |
| [v1.1.1](./v1.1.1.md) | 21.05.2026 | Todo-Ordner für Verbesserungsvorschläge | deployed (Doku-only) |
| [v1.1.0](./v1.1.0.md) | 21.05.2026 | Foto-Sharing Frontend (Phase 1 komplett) | deployed (wartet auf Storage-Aktivierung) |
| [v1.0.1](./v1.0.1.md) | 21.05.2026 | Foto-Sharing Backend-Foundation | deployed |
| [v1.0.0](./v1.0.0.md) | 21.05.2026 | Baseline — London-Reise Live-Phase | deployed |

(Neue Releases werden hier oben eingefügt.)

## Workshop & Produkt-Doku

Geht in `releases/workshop/` (eigener Unterordner). Diese Doku ist:
- nicht für Endbenutzer
- nicht öffentlich sichtbar
- in `.gitignore` enthalten (separate Workshop-Notizen, Produkt-Architektur, Kompatibilitäts-Matrizen)

Wird beim Erstellen separat angelegt.
