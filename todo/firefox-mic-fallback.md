# Mikrofon-Fallback für Firefox (Web Speech API nicht da)

**Status**: proposed
**Priorität**: nice-to-have
**Aufwand**: 15 Min (Tooltip) bis 5 Std (echtes Voice-to-Text)
**Vorgeschlagen am**: 21.05.2026
**Vorgeschlagen von**: Harald
**Betrifft**: KI-Companion / Sprach-Eingabe

## Problem

Harald hat am Laptop (Chrome/Edge) den Mikrofon-Button im KI-Chat, am
Handy (Firefox Android) nicht. Browser-Limit, nicht App-Bug:

| Browser | Web Speech API verfügbar |
|---|---|
| Chrome Desktop / Android | ✅ |
| Safari iOS 14.5+ | ✅ |
| Samsung Internet | ✅ |
| Edge | ✅ |
| **Firefox Desktop** | ❌ (Mozilla-Position) |
| **Firefox Android** | ❌ (← Haralds Fall) |

`useSpeechRecognition()` in `src/hooks/useSpeech.ts` setzt `supported`
auf `false` wenn weder `SpeechRecognition` noch `webkitSpeechRecognition`
am `window`-Objekt da sind → der Mikro-Button wird komplett ausgeblendet.

## Sofortige Lösung (ohne Code)

**Keyboard-Mikrofon des Handys nutzen**:
1. Tap auf das Chat-Eingabefeld
2. Samsung-Tastatur/Gboard öffnet
3. 🎤-Symbol auf der Tastatur (meistens neben Leertaste)
4. Sprechen → Text erscheint im Eingabefeld
5. Senden

Funktioniert auf jedem Handy unabhängig vom Browser.

## Vorgeschlagene Code-Lösungen

### Variante A — Mini-Tooltip statt fehlendem Button (15 Min)
Wenn `speech.supported === false`: einen kleinen Hinweis-Icon zeigen
statt nichts. Bei Tap erscheint Tooltip: "Spracherkennung in diesem
Browser nicht da. Tipp: 🎤 auf deiner Tastatur drücken."

### Variante B — Browser-Empfehlungs-Modal (30 Min)
Bei erstem Klick auf Mikro-Hinweis: Modal mit "Volles Mikro nur in
Chrome / Samsung Internet / Safari. Möchtest du dorthin wechseln?" +
Deep-Link-Versuch (falls möglich).

### Variante C — MediaRecorder + Claude Audio API (4–5 Std)
Echte Voice-to-Text in JEDEM Browser:
1. `MediaRecorder` API → Audio aufnehmen
2. Audio-Blob an neuen API-Endpoint `/api/transcribe`
3. Endpoint sendet Audio an Whisper (OpenAI) oder Anthropic Audio
4. Transkript zurück, in Chat-Input einfügen

**Pro**: Funktioniert überall, bessere Erkennung als Web Speech API
**Kontra**:
- Zusätzliche API-Kosten (~$0.006/Min Whisper)
- DSGVO-Update: Audio geht an OpenAI/Anthropic
- Längere Latency (Upload + Transkription)

## Bonus-Empfehlung

Für Harald persönlich: auf Samsung Galaxy A53 statt Firefox mal
**Samsung Internet** ausprobieren — ist vorinstalliert, Chromium-basiert,
hat vollen Web-Speech-API-Support. Firefox als Backup behalten.

## Entscheidung

**Heute (21.05.2026)**: Nichts ändern, Harald nutzt Keyboard-Mikro auf
dem Handy. Audit-Punkt notiert.

**Optional für v1.2.0 oder später**: Variante A oder B implementieren.
Variante C nur wenn echtes Verkaufs-Feature gebraucht.
