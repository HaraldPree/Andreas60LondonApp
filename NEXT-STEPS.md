# NEXT-STEPS – Travel Concierge (vormals „RCMK Travel Companion")

Was nach dem ersten Prototyp (London 2026, Andrea-Geburtstag) noch ansteht.

---

## Sofortiges Nice-to-have (1–2h pro Punkt)

### Personalisierung vertiefen
- **Teilnehmer-Card im Info-Tab** – eigene Sektion "Unsere Reisegruppe" mit großen Fotos + Bios
- **Reservierungen einer Person zuordnen** – z.B. "Andreas Tisch bei Cedric"
- **Wer-bin-ich-Auswahl** – beim ersten Aufruf pro Browser ein "Welcher Reisender bist du?"-Dialog, gespeichert in localStorage. Personalisiert Begrüßung im AI-Companion ("Hi Andrea, wie war Cedric Grolet?")

### Programm-Daten erweitern
- **isoDate** für alle Tage steht, aber **Restaurants** als eigene Liste (separat von Reservierungen) fehlt
- **Tagesweise Restaurant-Empfehlung** im DayCard
- **Vollständigere Hidden Places mit Bildern** (aktuell nur Beschreibung)

### Quick Polish
- **Favicon im RCMK-Stil** (aktuell Next.js Default)
- **PWA Icons** (`icon-192.png`, `icon-512.png` in `/public/`, referenziert in manifest.json) – sonst 404 im Browser
- **Open Graph Meta-Tags** mit Headerbild als Vorschau (für WhatsApp-Link-Share)

---

## Sprint 7: SOS-Tab (~2h)
Eigener Tab oder Sektion im Info-Tab:
- **EmergencyInfo-Objekt** strukturiert: Polizei, Botschaft, Versicherung mit allen Daten
- **NearbyMedical** – Apotheke / Krankenhaus / Arzt als Google-Maps-Links (vordefiniert pro Stadt)
- **HealthCard** persönliche Daten: Blutgruppe, Allergien, Dauermedikation, Versicherungsnummer (localStorage, optional verschlüsselt)
- **Medikamenten-Übersetzer** – AI fragt "Markenname X in Land Y?" → Wirkstoff + lokaler Name

---

## Sprint 8: Sun/Rain Toggle umbauen (~3h)
**Aktuell:** `rainyAlternative` als aufklappbare Sektion in DayCard.
**V2-Plan:** Jeder Tag hat `itemsFairWeather` und `itemsRainWeather` – kompletter Toggle, automatisch vorselektiert basierend auf Live-Wetter.

Bedeutet:
- Datenmodell ändern (Day-Interface)
- Alle 5 London-Tage doppelt befüllen
- WeatherProgramToggle.tsx (☀️/🌧️ Switch)
- Auto-Vorauswahl bei `precipitation_probability > 60%`

---

## Sprint 9: Lokale Foto-Galerie (MVP, ~3h)
**Ohne Cloud-Storage:**
- User wählt Fotos aus Galerie (`<input type="file" accept="image/*" multiple>`)
- Fotos werden client-seitig in IndexedDB gespeichert
- EXIF-Parsing (`exifr`-Library) für Zeit + GPS → automatische Tag-Zuordnung
- Pro Foto: "Erzähl mir was" → Claude Vision API → KI-Erzählung
- Galerie pro Tag im Foto-Tab
- Kein Sharing, kein Cloud-Backup (Phase 3)

---

## Sprint 10: Flug-Tracking & TheFork (~3h)
- **AviationStack API** (Free 100 Req/Monat) für Live-Flugstatus
- **FlightTracker.tsx** zeigt Status + Delay + Gate
- **TheFork Deep Links** pro Restaurant (UK: `thefork.co.uk/r/RESTAURANT-SLUG`)
- **Restaurant-Liste** als eigene Komponente (separat von Reservierungen)
- Empfehlung "Restaurant heute Abend?" pro Tag

---

## Sprint 11: Organisationstools (~3h)
- **PackingList** – abhakelbar, mit Wetter-Ergänzungen (Regenjacke! / Sonnencreme!)
- **ExpenseTracker** – wer hat was bezahlt, Split-Berechnung wie Splitwise
- **CurrencyWidget** – EUR ↔ GBP Live (xe.com API kostenlos)
- **TipCalculator** – UK 10-15%, pro Land konfigurierbar
- **GroupPoll** – "Was machen wir heute Abend?" mit den 5 Teilnehmern als Stimm-Optionen

---

## Phase 2: Kommunikation & Erlebnis (~5h)
- **eSIM-Tipps + Steckdosen-Info** pro Land
- **Live-Übersetzer** – Kamera auf Speisekarte → Claude Vision übersetzt
- **Kulturknigge** – Do's und Don'ts pro Land, AI-Guide weiß Bescheid
- **Audio-Walking-Tours** – KI-Skript pro POI, Web Speech API spricht vor
- **Reisedokumente-Tresor** – Reisepass, Tickets, Versicherung als Bilder in localStorage
- **Countdown vor Abreise** auf Landing
- **Direkte WhatsApp-Verbindung** zum Reisebüro Mader-Kuoni

---

## Phase 3: Post-Trip (~6h)
- **Interaktives Fotobuch** – Auto-generiert aus hochgeladenen Fotos + KI-Texten
- **Sharing** – `reise.meinreisecenter.at/london-2026/fotobuch` als öffentlich teilbarer Link
- **Post-Trip E-Mail** – 3 Tage nach Rückkehr automatisch (NPS-Score, Fotobuch-Link, "Wohin geht die nächste Reise?")
- **Empfehlungs-Link** für Freunde

---

## Architektur / Infrastruktur
- **GitHub-Repo** anlegen für Versionskontrolle + Vercel Auto-Deploy
- **Custom Domain** `reise.meinreisecenter.at` verbinden
- **Vercel Blob** Setup für später (Foto-Upload Phase 3)
- **Service Worker / Offline-PWA** – Trip-Daten + Karten-Tiles vorgecached
- **Zustand** State-Management einführen wenn UI komplexer wird (aktuell reichen useState/localStorage)
- **Admin-Backend** für Reisebüro-Mitarbeiter:innen – Reisen anlegen ohne Code
- **DOCX-Auto-Import** – PLAN.md → Trip-Datei via Claude API (so wie wir London.docx eingelesen haben, nur als UI)

---

## Reine Wünsche / Ideen (irgendwann)
- Gamification (Sammelkarten, Badges, Schrittzähler-Challenge)
- AR-Modus (Kamera auf Gebäude → Info-Overlay)
- CO₂-Fußabdruck-Berechnung + Kompensations-Link
- Accessibility (Schriftgröße, Hoch-Kontrast, Vorlese-Funktion)
- Tax-Free-Reminder am Flughafen
- Events-Integration (Eventbrite API)
- Mehrere Reisen pro Kundengruppe verwalten
- Passwortschutz pro Reise (einfacher PIN)
- Mehrsprachig (DE/EN)
- Analytics: welche Seiten werden wie oft genutzt

---

*Stand: 2026-05-16 – nach erstem Prototyp mit London-2026 (Andrea-Geburtstag)*
