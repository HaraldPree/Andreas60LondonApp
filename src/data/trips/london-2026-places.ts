/**
 * London 2026 — kuratierte Place-Library für die Wunschliste-Tab.
 *
 * v1.7.0 — erste Iteration. Pro Place:
 *  - id (slug-style, stabil)
 *  - Kategorie + Beschreibung
 *  - Koordinaten + ggf. Adresse
 *  - Verfügbarkeit (Öffnungszeiten, Quellen, lastVerified)
 *
 * Anti-Halluzinations-Hinweis: Öffnungszeiten sind nach bestem
 * Wissen erfasst und mit Quelle markiert. Saisonale Schwankungen
 * + Feiertage können abweichen — bei kritischen Besuchen IMMER
 * unter `bookingUrl` selbst verifizieren.
 *
 * `lastVerified` = ISO-Datum der letzten Recherche (heute alles
 * 2026-05-20). Künftige Updates aktualisieren das pro Place.
 */

import type { Place } from "@/types/place";

const VERIFIED = "2026-05-20";
const SRC_GENERAL = "Recherche 20.05.2026, vor kritischem Besuch offizielle Website prüfen";

export const LONDON_PLACES: Place[] = [
  // ═══════════════════════════════════════════════════
  // 🏰 KLASSISCHE SIGHTSEEING-HIGHLIGHTS
  // ═══════════════════════════════════════════════════
  {
    id: "big-ben",
    name: "Big Ben & Westminster Bridge",
    category: "classic",
    icon: "🕰️",
    coordinates: { lat: 51.4994, lng: -0.1245 },
    description:
      "Wahrzeichen Londons — Elizabeth Tower mit Glockenspiel. Beste Foto-Spots von der Westminster Bridge.",
    availability: {
      type: "always-open",
      note: "Außenbesichtigung jederzeit. Innenführungen nur für UK-Residents.",
      lastVerified: VERIFIED,
      source: "parliament.uk",
    },
    cost: "gratis (außen)",
    tags: ["fotogen", "outdoor"],
  },
  {
    id: "westminster-abbey",
    name: "Westminster Abbey",
    category: "classic",
    icon: "⛪",
    coordinates: { lat: 51.4994, lng: -0.1273 },
    description:
      "Krönungskirche der britischen Monarchen. Atemberaubendes gotisches Innere, Poet's Corner, Grab des unbekannten Soldaten.",
    bookingUrl: "https://www.westminster-abbey.org/",
    availability: {
      type: "scheduled",
      openDays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      openHours: "Mo–Sa 9:30–15:30 (Sa bis 13:00)",
      note: "Sonntag nur für Gottesdienste geöffnet. Tickets online empfohlen.",
      reservationRequired: false,
      lastVerified: VERIFIED,
      source: "westminster-abbey.org",
    },
    cost: "~£29",
    tags: ["indoor", "muss-online"],
  },
  {
    id: "buckingham-palace",
    name: "Buckingham Palace",
    category: "classic",
    icon: "💂",
    coordinates: { lat: 51.5014, lng: -0.1419 },
    description:
      "Hauptresidenz der britischen Monarchen. Außen jederzeit, State Rooms nur im Sommer geöffnet.",
    bookingUrl: "https://www.rct.uk/visit/buckingham-palace",
    availability: {
      type: "scheduled",
      openHours: "Außen always-open. State Rooms: Juli–September täglich.",
      note: "Wachablöse Mo / Mi / Fr / So 11:00 (vorab unter householddivision.org.uk prüfen).",
      lastVerified: VERIFIED,
      source: "rct.uk + householddivision.org.uk",
    },
    cost: "Außen gratis, State Rooms ~£32",
    tags: ["outdoor", "klassisch"],
  },
  {
    id: "trafalgar-square",
    name: "Trafalgar Square & Nelson's Column",
    category: "classic",
    icon: "🦁",
    coordinates: { lat: 51.508, lng: -0.1281 },
    description:
      "Zentraler Platz mit Nelson's Column + vier Bronze-Löwen. National Gallery direkt dahinter.",
    availability: {
      type: "always-open",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["outdoor", "zentral"],
  },
  {
    id: "tower-bridge",
    name: "Tower Bridge",
    category: "classic",
    icon: "🌉",
    coordinates: { lat: 51.5055, lng: -0.0754 },
    description:
      "Ikonische Brücke über die Themse. Außenfotos jederzeit, Glass-Floor-Walk im Inneren ist sein Geld wert.",
    bookingUrl: "https://www.towerbridge.org.uk/",
    availability: {
      type: "scheduled",
      openHours: "Glass Floor täglich 9:30–17:00 (letzter Einlass 16:30)",
      note: "Außenbesichtigung 24/7. Innenbesichtigung mit Aufstieg + Glass Floor ticket-pflichtig.",
      lastVerified: VERIFIED,
      source: "towerbridge.org.uk",
    },
    cost: "Außen gratis, Glass Floor ~£12.30",
    tags: ["fotogen", "outdoor"],
  },
  {
    id: "piccadilly-circus",
    name: "Piccadilly Circus",
    category: "classic",
    icon: "🎯",
    coordinates: { lat: 51.5101, lng: -0.1342 },
    description:
      "Times-Square-mäßiger Knotenpunkt mit den berühmten Leuchtreklamen + Eros-Statue.",
    availability: {
      type: "always-open",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["outdoor", "zentral"],
  },
  {
    id: "st-james-park",
    name: "St. James's Park",
    category: "classic",
    icon: "🦆",
    coordinates: { lat: 51.5028, lng: -0.1346 },
    description:
      "Ältester Royal Park, zwischen Buckingham + Whitehall. See mit Pelikanen, schöner Walk zum Palace.",
    availability: {
      type: "scheduled",
      openHours: "täglich 5:00–24:00",
      lastVerified: VERIFIED,
      source: "royalparks.org.uk",
    },
    cost: "gratis",
    tags: ["outdoor", "natur", "zentral"],
  },
  {
    id: "liberty-london",
    name: "Liberty London",
    category: "classic",
    icon: "🛍️",
    coordinates: { lat: 51.5141, lng: -0.1411 },
    description:
      "Historisches Tudor-Kaufhaus, weltberühmte Stoffe + Tea Room. Allein das Gebäude ist eine Sehenswürdigkeit.",
    bookingUrl: "https://www.libertylondon.com/",
    availability: {
      type: "scheduled",
      openHours: "Mo–Sa 10:00–20:00, So 12:00–18:00",
      lastVerified: VERIFIED,
      source: "libertylondon.com",
    },
    cost: "Eintritt gratis",
    tags: ["indoor", "fotogen", "shopping"],
  },
  {
    id: "oxford-street",
    name: "Oxford Street",
    category: "classic",
    icon: "🛍️",
    coordinates: { lat: 51.5152, lng: -0.1418 },
    description:
      "Hauptshopping-Straße Londons. Selfridges, Primark, John Lewis — alles dort.",
    availability: {
      type: "scheduled",
      openHours: "Stores meist Mo–Sa 10:00–20:00, So 12:00–18:00",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis (außer Shopping)",
    tags: ["zentral", "shopping"],
  },
  {
    id: "soho-chinatown",
    name: "Soho & Chinatown",
    category: "classic",
    icon: "🏮",
    coordinates: { lat: 51.5118, lng: -0.1305 },
    description:
      "Buntes Restaurant-Viertel, abends besonders lebendig. Chinatown mit Toren + Lampions.",
    availability: {
      type: "always-open",
      note: "Restaurants/Bars meist 12:00–24:00.",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis (Spaziergang)",
    tags: ["outdoor", "abends", "zentral"],
  },
  {
    id: "tower-of-london",
    name: "Tower of London (Crown Jewels)",
    category: "classic",
    icon: "👑",
    coordinates: { lat: 51.5081, lng: -0.0759 },
    description:
      "Burg aus dem 11. Jh. mit Crown Jewels, Yeoman Warders (Beefeaters) + Raben. 2-3h für vollständigen Besuch einplanen.",
    bookingUrl: "https://www.hrp.org.uk/tower-of-london/",
    availability: {
      type: "scheduled",
      openHours: "Di–Sa 9:00–17:30, So+Mo 10:00–17:30 (letzter Einlass 17:00)",
      reservationRequired: true,
      note: "Tickets online deutlich günstiger als an der Kasse. Crown Jewels auch separat schnell zu sehen (~30 Min).",
      lastVerified: VERIFIED,
      source: "hrp.org.uk",
    },
    cost: "~£35 (online)",
    tags: ["indoor", "muss-online"],
  },
  {
    id: "st-pauls-cathedral",
    name: "St. Paul's Cathedral (+ Whispering Gallery)",
    category: "classic",
    icon: "⛪",
    coordinates: { lat: 51.5138, lng: -0.0984 },
    description:
      "Wren-Kathedrale mit der berühmten Kuppel. Whispering Gallery (259 Stufen) + Stone Gallery (Aussicht, 528 Stufen). 30-90 Min je nach Treppen-Lust.",
    bookingUrl: "https://www.stpauls.co.uk/",
    availability: {
      type: "scheduled",
      openDays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      openHours: "Mo–Sa 8:30–16:30",
      note: "Sonntag nur für Gottesdienste. Kuppel-Aufstieg ab Mo 9:30.",
      lastVerified: VERIFIED,
      source: "stpauls.co.uk",
    },
    cost: "~£25",
    tags: ["indoor", "treppen-viele"],
  },
  {
    id: "millennium-bridge",
    name: "Millennium Bridge",
    category: "classic",
    icon: "🌉",
    coordinates: { lat: 51.5099, lng: -0.0985 },
    description:
      "Fußgänger-Brücke, führt direkt zur St. Paul's. Bekannt aus Harry Potter (Half-Blood Prince).",
    availability: {
      type: "always-open",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["outdoor", "fotogen"],
  },
  {
    id: "hms-belfast",
    name: "HMS Belfast",
    category: "classic",
    icon: "🚢",
    coordinates: { lat: 51.5066, lng: -0.0814 },
    description:
      "Imperial-War-Museum-Ableger an Bord eines Kriegsschiffs von 1938. 9 Decks zu erkunden.",
    bookingUrl: "https://www.iwm.org.uk/visits/hms-belfast",
    availability: {
      type: "scheduled",
      openHours: "täglich 10:00–18:00 (letzter Einlass 17:00)",
      lastVerified: VERIFIED,
      source: "iwm.org.uk",
    },
    cost: "~£24",
    tags: ["indoor", "industrial"],
  },
  {
    id: "st-katherine-docks",
    name: "St. Katherine's Dock & Butler's Wharf",
    category: "classic",
    icon: "⚓",
    coordinates: { lat: 51.5074, lng: -0.0728 },
    description:
      "Schöne Marina östlich von Tower Bridge. Restaurants direkt am Wasser, ruhiger als die Themse-Promenade.",
    availability: {
      type: "always-open",
      note: "Spazieren jederzeit, Restaurants Lunch + Dinner.",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis (Spaziergang)",
    tags: ["outdoor", "ruhig"],
  },
  {
    id: "paternoster-square",
    name: "Paternoster Square",
    category: "classic",
    icon: "🏢",
    coordinates: { lat: 51.5142, lng: -0.0982 },
    description:
      "Architektur-Spaziergang rund um St. Paul's. Temple Bar Tor, Bronze-Hirten-Skulptur, moderne + historische Bauten.",
    availability: {
      type: "always-open",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["outdoor", "architektur"],
  },
  {
    id: "barbican-conservatory",
    name: "Barbican Conservatory",
    category: "classic",
    icon: "🌿",
    coordinates: { lat: 51.5202, lng: -0.0938 },
    description:
      "Zweitgrößter Tropengarten in London, versteckt im brutalistischen Barbican Centre. Atemberaubend.",
    bookingUrl: "https://www.barbican.org.uk/whats-on/conservatory",
    availability: {
      type: "scheduled",
      openDays: ["So"],
      openHours: "Sonntag 12:00–17:00 (an offenen Tagen)",
      note: "Eingeschränkte Öffnung: NUR sonntags + ausgewählte Bank Holidays. Termine vorab auf barbican.org.uk prüfen — Eintritt frei aber Ticket-Reservierung empfohlen.",
      reservationRequired: false,
      lastVerified: VERIFIED,
      source: "barbican.org.uk + lokaler Hinweis Mitreisende 20.05.2026",
    },
    cost: "gratis",
    tags: ["indoor", "ruhig", "fotogen", "nur-sonntag"],
  },
  {
    id: "guildhall-art-gallery",
    name: "Guildhall Art Gallery (+ Römisches Amphitheater)",
    category: "classic",
    icon: "🖼️",
    coordinates: { lat: 51.5159, lng: -0.0922 },
    description:
      "Bilder zur Londoner Geschichte plus die Ruinen des römischen Amphitheaters im Untergeschoss.",
    bookingUrl: "https://www.guildhall.cityoflondon.gov.uk/visit/guildhall-art-gallery",
    availability: {
      type: "scheduled",
      openDays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      openHours: "Mo–Sa 10:30–16:00",
      note: "Sonntag geschlossen.",
      lastVerified: VERIFIED,
      source: "cityoflondon.gov.uk",
    },
    cost: "gratis",
    tags: ["indoor", "kostenlos", "history"],
  },
  {
    id: "london-eye-outside",
    name: "London Eye (Foto-Spot außen)",
    category: "classic",
    icon: "🎡",
    coordinates: { lat: 51.5033, lng: -0.1196 },
    description:
      "Riesenrad an der Südseite der Themse. Außenfotos kostenlos. Eine Fahrt (£40+) lohnt nur wenn klar.",
    bookingUrl: "https://www.londoneye.com/",
    availability: {
      type: "always-open",
      note: "Außenbesichtigung jederzeit. Fahrt täglich 11:00–18:00 (Sommer länger).",
      lastVerified: VERIFIED,
      source: "londoneye.com",
    },
    cost: "Außen gratis, Fahrt ab £40",
    tags: ["outdoor", "fotogen"],
  },

  // ═══════════════════════════════════════════════════
  // 🎨 HIDDEN GEMS
  // ═══════════════════════════════════════════════════
  {
    id: "leake-street-tunnel",
    name: "Leake Street Tunnel",
    category: "hidden",
    icon: "🎨",
    coordinates: { lat: 51.5025, lng: -0.1148 },
    description:
      "Legaler Graffiti-Tunnel unter Waterloo Station. ~150m Banksy-Vibe-Streetart, wechselt fast täglich. Foto-Paradies.",
    availability: {
      type: "always-open",
      note: "24/7 frei zugänglich, gratis.",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["fotogen", "outdoor", "off-beat"],
  },
  {
    id: "leinster-square-statuen",
    name: "Leinster Square Statuen (Mary Poppins, Mr Bean, Stan & Ollie)",
    category: "hidden",
    icon: "🗿",
    coordinates: { lat: 51.5121, lng: -0.1873 },
    description:
      "Bronze-Statuen weltberühmter britischer Komik-Charaktere im Notting-Hill-nahen Square. Foto-Spot.",
    availability: {
      type: "always-open",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["fotogen", "outdoor", "off-beat"],
  },
  {
    id: "gods-own-junkyard",
    name: "God's Own Junkyard (Walthamstow Neon)",
    category: "hidden",
    icon: "💡",
    coordinates: { lat: 51.58, lng: -0.0207 },
    description:
      "Spektakuläre Neon-Light-Sammlung in einer Lagerhalle in Walthamstow. Foto-Paradies + Café.",
    bookingUrl: "https://www.godsownjunkyard.co.uk/",
    availability: {
      type: "scheduled",
      openDays: ["Fr", "Sa", "So"],
      openHours: "Fr 11:00–21:00, Sa 11:00–21:00, So 11:00–18:00",
      note: "Geschlossen Mo–Do. Etwa 30 Min mit Overground aus Liverpool Street.",
      lastVerified: VERIFIED,
      source: "godsownjunkyard.co.uk",
    },
    cost: "gratis (Eintritt)",
    tags: ["indoor", "fotogen", "off-beat", "weiter-weg"],
  },
  {
    id: "daunt-books-marylebone",
    name: "Daunt Books Marylebone",
    category: "hidden",
    icon: "📚",
    coordinates: { lat: 51.5191, lng: -0.1521 },
    description:
      "Eduardanischer Buchladen, lange Galerie mit Holzbalkonen + Glasdach. Wahrscheinlich schönster Buchladen Londons.",
    bookingUrl: "https://www.dauntbooks.co.uk/",
    availability: {
      type: "scheduled",
      openHours: "Mo–Sa 9:00–19:30, So 11:00–18:00",
      lastVerified: VERIFIED,
      source: "dauntbooks.co.uk",
    },
    cost: "gratis",
    tags: ["indoor", "fotogen", "ruhig"],
  },
  {
    id: "postmans-park",
    name: "Postman's Park",
    category: "hidden",
    icon: "🪧",
    coordinates: { lat: 51.5173, lng: -0.0992 },
    description:
      "Kleiner Park mit dem 'Memorial to Heroic Self-Sacrifice' — Tafeln zu Ehren ganz normaler Menschen die andere Leben retteten.",
    availability: {
      type: "always-open",
      note: "Park täglich frei zugänglich.",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["outdoor", "ruhig", "geheim"],
  },
  {
    id: "sir-john-soanes-museum",
    name: "Sir John Soane's Museum",
    category: "hidden",
    icon: "🏛️",
    coordinates: { lat: 51.5175, lng: -0.1175 },
    description:
      "Privat-Sammlung eines Architekten aus dem 19. Jh., voller Antike + Kunst. Wie verwunschen.",
    bookingUrl: "https://www.soane.org/",
    availability: {
      type: "scheduled",
      openDays: ["Mi", "Do", "Fr", "Sa"],
      openHours: "Mi–Sa 10:00–17:00",
      note: "Mo, Di, So geschlossen. Donnerstag-Abend gelegentlich 'Candle-lit' Öffnung — vorab prüfen.",
      lastVerified: VERIFIED,
      source: "soane.org",
    },
    cost: "gratis",
    tags: ["indoor", "kostenlos", "ruhig"],
  },
  {
    id: "neals-yard",
    name: "Neal's Yard",
    category: "hidden",
    icon: "🌈",
    coordinates: { lat: 51.5147, lng: -0.1262 },
    description:
      "Versteckter bunter Hof in Covent Garden mit Cafés, Smoothies, kleinen Läden. Instagram-Klassiker.",
    availability: {
      type: "always-open",
      note: "Hof immer offen, Geschäfte etwa Mo–Sa 10:00–18:00.",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["outdoor", "fotogen", "zentral"],
  },
  {
    id: "leadenhall-market",
    name: "Leadenhall Market",
    category: "hidden",
    icon: "🏛️",
    coordinates: { lat: 51.5128, lng: -0.0834 },
    description:
      "Viktorianische Markthalle aus 1881 mit bemalter Decke. Diente als 'Diagon Alley' in Harry Potter (auch in Filmspots).",
    bookingUrl: "https://www.leadenhallmarket.co.uk/",
    availability: {
      type: "scheduled",
      openDays: ["Mo", "Di", "Mi", "Do", "Fr"],
      openHours: "Mo–Fr 7:00–18:00 (Geschäfte), Bars länger",
      note: "Halle 24/7 begehbar als Architektur. Geschäfte Mo–Fr offen, Sa Bars, So weitgehend tot.",
      lastVerified: VERIFIED,
      source: "leadenhallmarket.co.uk",
    },
    cost: "gratis",
    tags: ["indoor", "fotogen", "architektur"],
  },

  // ═══════════════════════════════════════════════════
  // 🎬 FILMSPOTS
  // ═══════════════════════════════════════════════════
  {
    id: "love-actually-pink-house",
    name: "Pinkes Haus 'Love Actually'",
    category: "film",
    icon: "🌸",
    coordinates: { lat: 51.5212, lng: -0.2069 },
    description:
      "Das pinke Reihenhaus aus der berühmten Schild-Szene mit Mark + Juliet. St. Luke's Mews, Notting Hill.",
    address: "St. Luke's Mews, London W11",
    availability: {
      type: "always-open",
      note: "Reines Außen-Foto-Spot in einer ruhigen Wohnstraße — bitte respektvoll und leise (Bewohner!).",
      lastVerified: VERIFIED,
      source: "Film-Locations-Recherche",
    },
    cost: "gratis",
    filmContext: "Love Actually (2003) — Mark hält Juliet die Schilder hin",
    tags: ["outdoor", "fotogen", "off-beat"],
    related: ["notting-hill-bookshop", "notting-hill-pastell"],
  },
  {
    id: "notting-hill-bookshop",
    name: "The Notting Hill Bookshop",
    category: "film",
    icon: "📚",
    coordinates: { lat: 51.5158, lng: -0.2043 },
    description:
      "Der echte Buchladen der die Vorlage für 'Travel Book Co.' aus dem Film war. Heute funktionierender Indie-Buchladen.",
    address: "13 Blenheim Crescent, London W11 2EE",
    bookingUrl: "https://thenottinghillbookshop.co.uk/",
    availability: {
      type: "scheduled",
      openHours: "Mo–Sa 9:00–19:00, So 10:00–18:00",
      lastVerified: VERIFIED,
      source: "thenottinghillbookshop.co.uk",
    },
    cost: "gratis (außer Bücher)",
    filmContext: "Notting Hill (1999) — Hugh Grants Buchladen",
    tags: ["indoor", "fotogen"],
    related: ["love-actually-pink-house", "notting-hill-pastell"],
  },
  {
    id: "platform-nine-three-quarters",
    name: "Platform 9¾ Foto-Spot",
    category: "film",
    icon: "🪄",
    coordinates: { lat: 51.5322, lng: -0.1241 },
    description:
      "Halber Trolley in der Wand + Schild 'Platform 9¾'. Foto-Op + Shop daneben. Innerhalb King's Cross Station.",
    address: "King's Cross Station, Konkurs zwischen Plattform 8+9",
    bookingUrl: "https://www.harrypotterplatform934.com/",
    availability: {
      type: "scheduled",
      openHours: "täglich 8:00–22:00",
      note: "Foto-Op kostenlos (lange Schlangen am Wochenende), professionelle Photo-Op kostenpflichtig.",
      lastVerified: VERIFIED,
      source: "harrypotterplatform934.com",
    },
    cost: "Foto gratis, Pro-Foto ~£12",
    filmContext: "Harry Potter (alle Filme) — Tor nach Hogwarts",
    tags: ["indoor", "fotogen", "zentral"],
  },
  {
    id: "bridget-jones-flat",
    name: "Bridget Jones Wohnung",
    category: "film",
    icon: "🏠",
    coordinates: { lat: 51.5048, lng: -0.0902 },
    description:
      "Außenfassade der Bridget-Jones-Wohnung direkt am Borough Market. Über dem 'Globe Tavern' Pub.",
    address: "9 Bedale Street, London SE1 9AL",
    availability: {
      type: "always-open",
      note: "Reines Außen-Foto-Spot, im Borough Market integriert.",
      lastVerified: VERIFIED,
      source: "Film-Locations-Recherche",
    },
    cost: "gratis",
    filmContext: "Bridget Jones's Diary (2001)",
    tags: ["outdoor", "fotogen"],
    related: ["borough-market"],
  },
  {
    id: "st-pancras-station",
    name: "St. Pancras International + Renaissance Hotel",
    category: "film",
    icon: "🚉",
    coordinates: { lat: 51.5308, lng: -0.1262 },
    description:
      "Spektakulärer viktorianischer Bahnhof + Hotel-Lobby. Mehrere Film-Auftritte. Innen frei begehbar.",
    availability: {
      type: "always-open",
      note: "Bahnhof 24/7, Hotel-Lobby tagsüber zugänglich.",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    filmContext: "Harry Potter / Bridget Jones / Spice World — vielfach genutzt",
    tags: ["indoor", "fotogen", "architektur"],
  },
  {
    id: "royal-albert-hall",
    name: "Royal Albert Hall",
    category: "film",
    icon: "🎭",
    coordinates: { lat: 51.5009, lng: -0.1773 },
    description:
      "Konzerthalle aus 1871, viktorianische Architektur, viele Filme. Tagsüber Tour, abends Konzerte.",
    bookingUrl: "https://www.royalalberthall.com/",
    availability: {
      type: "scheduled",
      openHours: "Touren täglich 10:00–16:30, Konzerte abends",
      note: "Außenfoto immer möglich. Innen-Tour kostenpflichtig (~£18).",
      lastVerified: VERIFIED,
      source: "royalalberthall.com",
    },
    cost: "Außen gratis, Tour ~£18",
    filmContext: "Spice World, Bohemian Rhapsody, A Knight's Tale u.v.m.",
    tags: ["outdoor-inneren", "architektur"],
  },
  {
    id: "gherkin-30-st-mary-axe",
    name: "The Gherkin / 30 St Mary Axe",
    category: "film",
    icon: "🥒",
    coordinates: { lat: 51.5145, lng: -0.0803 },
    description:
      "Norman-Foster-Wolkenkratzer in Gurken-Form (180m). Außen-Wahrzeichen der City-Skyline.",
    availability: {
      type: "always-open",
      note: "Außenfoto jederzeit. Innen normalerweise nicht öffentlich.",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis (außen)",
    filmContext: "Match Point (Woody Allen 2005), Harry Potter Half-Blood Prince",
    tags: ["outdoor", "fotogen", "architektur"],
  },

  // ═══════════════════════════════════════════════════
  // 🥪 MÄRKTE
  // ═══════════════════════════════════════════════════
  {
    id: "borough-market",
    name: "Borough Market",
    category: "market",
    icon: "🥪",
    coordinates: { lat: 51.5055, lng: -0.0909 },
    description:
      "Berühmtester Foodie-Markt von London. Käse, Pies, Doughnuts, Pasta, Bratwurst. Mittagessen direkt am Markt.",
    bookingUrl: "https://boroughmarket.org.uk/",
    availability: {
      type: "scheduled",
      openDays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      openHours: "Mo–Do 10:00–17:00, Fr 10:00–18:00, Sa 8:00–17:00",
      note: "Sonntag geschlossen.",
      lastVerified: VERIFIED,
      source: "boroughmarket.org.uk",
    },
    cost: "Eintritt gratis (essen kostet)",
    tags: ["outdoor-und-indoor", "foodie", "zentral"],
  },
  {
    id: "greenwich-market",
    name: "Greenwich Market",
    category: "market",
    icon: "🛍️",
    coordinates: { lat: 51.4814, lng: -0.0099 },
    description:
      "Kleinerer Markt im Herzen von Greenwich: Kunsthandwerk, Streetfood, Souvenirs.",
    bookingUrl: "https://www.greenwichmarket.london/",
    availability: {
      type: "scheduled",
      openDays: ["Mi", "Do", "Fr", "Sa", "So"],
      openHours: "Mi–So 10:00–17:30",
      note: "Montag + Dienstag geschlossen.",
      lastVerified: VERIFIED,
      source: "greenwichmarket.london",
    },
    cost: "gratis",
    tags: ["outdoor", "foodie", "kunsthandwerk"],
  },
  {
    id: "portobello-road-market",
    name: "Portobello Road Market",
    category: "market",
    icon: "🛒",
    coordinates: { lat: 51.5165, lng: -0.2056 },
    description:
      "Berühmter Antiquitäten-Markt + bunte Häuserzeile in Notting Hill. Samstag voll, andere Tage ruhiger.",
    bookingUrl: "https://portobelloroad.co.uk/",
    availability: {
      type: "scheduled",
      openHours: "Sa Antiquitäten-Markt 9:00–19:00, Mo–Fr Stores 10:00–18:00",
      note: "Antiquitäten + Vintage am vollständigsten am Samstag. Häuser-Spaziergang jederzeit.",
      lastVerified: VERIFIED,
      source: "portobelloroad.co.uk",
    },
    cost: "gratis",
    tags: ["outdoor", "fotogen", "samstag-am-besten"],
  },
  {
    id: "maltby-street-market",
    name: "Maltby Street Market",
    category: "market",
    icon: "🌮",
    coordinates: { lat: 51.5004, lng: -0.0794 },
    description:
      "Hipper Streetfood-Markt unter Bahn-Bögen in Bermondsey. Kleiner + lokaler als Borough Market.",
    bookingUrl: "https://maltby.st/",
    availability: {
      type: "scheduled",
      openDays: ["Sa", "So"],
      openHours: "Sa 10:00–17:00, So 11:00–16:00",
      note: "Nur Wochenende geöffnet.",
      lastVerified: VERIFIED,
      source: "maltby.st",
    },
    cost: "gratis (Eintritt)",
    tags: ["outdoor", "foodie", "wochenende"],
  },

  // ═══════════════════════════════════════════════════
  // 🏛️ MUSEEN (alle gratis)
  // ═══════════════════════════════════════════════════
  {
    id: "british-museum",
    name: "British Museum",
    category: "museum",
    icon: "🏛️",
    coordinates: { lat: 51.5194, lng: -0.127 },
    description:
      "Eines der größten Museen der Welt. Rosetta Stone, Elgin Marbles, ägyptische Mumien. 2-4h einplanen.",
    bookingUrl: "https://www.britishmuseum.org/",
    availability: {
      type: "scheduled",
      openHours: "täglich 10:00–17:00 (Fr bis 20:30)",
      note: "Gratis aber Online-Slot empfohlen für Stoßzeiten.",
      lastVerified: VERIFIED,
      source: "britishmuseum.org",
    },
    cost: "gratis",
    tags: ["indoor", "kostenlos", "regen-tauglich"],
  },
  {
    id: "vanda-museum",
    name: "Victoria & Albert Museum (V&A)",
    category: "museum",
    icon: "🏛️",
    coordinates: { lat: 51.4966, lng: -0.1722 },
    description:
      "Größtes Mode- + Design-Museum der Welt. Mode, Schmuck, Skulpturen, asiatische Kunst.",
    bookingUrl: "https://www.vam.ac.uk/",
    availability: {
      type: "scheduled",
      openHours: "täglich 10:00–17:45 (Fr bis 22:00)",
      lastVerified: VERIFIED,
      source: "vam.ac.uk",
    },
    cost: "gratis",
    tags: ["indoor", "kostenlos", "regen-tauglich"],
  },
  {
    id: "natural-history-museum",
    name: "Natural History Museum",
    category: "museum",
    icon: "🦖",
    coordinates: { lat: 51.4967, lng: -0.1764 },
    description:
      "Dinosaurier-Skelette, Blauwal-Skelett in der Hintze Hall, Mineraliensaal. Gratis.",
    bookingUrl: "https://www.nhm.ac.uk/",
    availability: {
      type: "scheduled",
      openHours: "täglich 10:00–17:50",
      note: "Gratis aber Online-Slot empfohlen.",
      lastVerified: VERIFIED,
      source: "nhm.ac.uk",
    },
    cost: "gratis",
    tags: ["indoor", "kostenlos", "regen-tauglich"],
  },
  {
    id: "tate-modern",
    name: "Tate Modern",
    category: "museum",
    icon: "🎨",
    coordinates: { lat: 51.5074, lng: -0.0997 },
    description:
      "Modern + zeitgenössisch in einem alten Kraftwerk an der Themse. Turbine Hall ist gigantisch. Café mit Aussicht.",
    bookingUrl: "https://www.tate.org.uk/visit/tate-modern",
    availability: {
      type: "scheduled",
      openHours: "täglich 10:00–18:00",
      lastVerified: VERIFIED,
      source: "tate.org.uk",
    },
    cost: "gratis",
    tags: ["indoor", "kostenlos", "regen-tauglich"],
  },

  // ═══════════════════════════════════════════════════
  // 🌳 PARKS & GRÜNE LUNGEN
  // ═══════════════════════════════════════════════════
  {
    id: "hyde-park",
    name: "Hyde Park",
    category: "park",
    icon: "🌳",
    coordinates: { lat: 51.5074, lng: -0.1657 },
    description:
      "Größter Royal Park. Serpentine-See, Princess Diana Memorial, Speakers' Corner.",
    bookingUrl: "https://www.royalparks.org.uk/parks/hyde-park",
    availability: {
      type: "scheduled",
      openHours: "täglich 5:00–24:00",
      lastVerified: VERIFIED,
      source: "royalparks.org.uk",
    },
    cost: "gratis",
    tags: ["outdoor", "natur", "groß"],
  },
  {
    id: "kensington-gardens",
    name: "Kensington Gardens",
    category: "park",
    icon: "🌹",
    coordinates: { lat: 51.5074, lng: -0.1801 },
    description:
      "An Hyde Park anschließend. Kensington Palace, Albert Memorial, Sunken Garden.",
    bookingUrl: "https://www.royalparks.org.uk/parks/kensington-gardens",
    availability: {
      type: "scheduled",
      openHours: "täglich 6:00–Sonnenuntergang",
      lastVerified: VERIFIED,
      source: "royalparks.org.uk",
    },
    cost: "gratis",
    tags: ["outdoor", "natur"],
  },
  {
    id: "regents-park",
    name: "Regent's Park",
    category: "park",
    icon: "🌷",
    coordinates: { lat: 51.5313, lng: -0.157 },
    description:
      "Inner Circle mit Rosengarten, Open-Air-Theater im Sommer, ZSL London Zoo am Nordrand.",
    bookingUrl: "https://www.royalparks.org.uk/parks/the-regents-park",
    availability: {
      type: "scheduled",
      openHours: "täglich 5:00–21:00",
      lastVerified: VERIFIED,
      source: "royalparks.org.uk",
    },
    cost: "gratis",
    tags: ["outdoor", "natur"],
  },
  {
    id: "primrose-hill",
    name: "Primrose Hill",
    category: "park",
    icon: "⛰️",
    coordinates: { lat: 51.5388, lng: -0.1612 },
    description:
      "Hügel nördlich von Regent's Park. Gratis Skyline-Aussicht über ganz London — Geheimtipp für Sonnenuntergang.",
    availability: {
      type: "always-open",
      note: "Park 5:00–22:00, Aussicht jederzeit.",
      lastVerified: VERIFIED,
      source: "royalparks.org.uk",
    },
    cost: "gratis",
    tags: ["outdoor", "skyline", "geheim"],
  },
  {
    id: "greenwich-park",
    name: "Greenwich Park",
    category: "park",
    icon: "🌳",
    coordinates: { lat: 51.4769, lng: -0.001 },
    description:
      "Ältester Royal Park. Hügel mit Royal Observatory + Aussicht. Park selbst groß und ruhig.",
    bookingUrl: "https://www.royalparks.org.uk/parks/greenwich-park",
    availability: {
      type: "scheduled",
      openHours: "täglich 6:00–Sonnenuntergang",
      lastVerified: VERIFIED,
      source: "royalparks.org.uk",
    },
    cost: "gratis",
    tags: ["outdoor", "natur", "skyline"],
  },
  {
    id: "little-venice",
    name: "Little Venice",
    category: "park",
    icon: "🛶",
    coordinates: { lat: 51.5223, lng: -0.183 },
    description:
      "Idyllische Kanal-Promenade im Westen Londons, Hausboote + Pubs am Wasser. Spaziergang zum Camden Market möglich (~1h).",
    availability: {
      type: "always-open",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["outdoor", "ruhig", "geheim"],
  },

  // ═══════════════════════════════════════════════════
  // 🌇 AUSSICHTEN & SKYLINE
  // ═══════════════════════════════════════════════════
  {
    id: "garden-at-120",
    name: "Garden at 120 (Fen Court)",
    category: "skyline",
    icon: "🌇",
    coordinates: { lat: 51.513, lng: -0.0826 },
    description:
      "Gratis Roof Garden im 15. Stock — Walk-in, keine Reservierung. Aussicht über St. Paul's, Tower, Themse.",
    bookingUrl: "https://thegardenat120.com/",
    availability: {
      type: "scheduled",
      openHours: "Mo–Fr 10:00–18:30, Sa+So 11:00–21:00",
      note: "Walk-in, keine Reservierung. Der Sky-Garden-Geheimtipp ohne Buchungsstress.",
      lastVerified: VERIFIED,
      source: "thegardenat120.com",
    },
    cost: "gratis",
    tags: ["indoor-outdoor", "fotogen", "skyline", "kostenlos"],
  },
  {
    id: "royal-observatory-hill",
    name: "Royal Observatory Hügel (Aussicht außen)",
    category: "skyline",
    icon: "🌍",
    coordinates: { lat: 51.4769, lng: 0.0005 },
    description:
      "Hügel im Greenwich Park — kostenlose Skyline-Aussicht über die ganze Stadt. Im Observatory innen kostet's.",
    availability: {
      type: "always-open",
      note: "Hügel + Aussicht 24/7 kostenlos. Observatory-Gebäude innen täglich 10:00–17:00, ~£20.",
      lastVerified: VERIFIED,
      source: "rmg.co.uk",
    },
    cost: "Aussicht gratis, Observatory innen ~£20",
    tags: ["outdoor", "fotogen", "skyline", "kostenlos"],
  },
  {
    id: "halcyon-gallery",
    name: "Halcyon Gallery (Bond Street)",
    category: "skyline",
    icon: "🖼️",
    coordinates: { lat: 51.5085, lng: -0.1399 },
    description:
      "Zeitgenössische Kunstgalerie an der New Bond Street. Auch ohne Kauf einen Besuch wert.",
    bookingUrl: "https://halcyongallery.com/",
    availability: {
      type: "scheduled",
      openHours: "Mo–Sa 10:00–18:00, So 11:00–17:00",
      lastVerified: VERIFIED,
      source: "halcyongallery.com",
    },
    cost: "gratis",
    tags: ["indoor", "kostenlos"],
  },

  // ═══════════════════════════════════════════════════
  // 🚣 GREENWICH-KOMPLEX
  // ═══════════════════════════════════════════════════
  {
    id: "cutty-sark",
    name: "Cutty Sark",
    category: "greenwich",
    icon: "⛵",
    coordinates: { lat: 51.4827, lng: -0.0096 },
    description:
      "Historischer Tee-Klipper (1869), aufgebockt + besichtigbar. Außenfoto kostenlos.",
    bookingUrl: "https://www.rmg.co.uk/cutty-sark",
    availability: {
      type: "scheduled",
      openHours: "täglich 10:00–17:00 (letzter Einlass 16:00)",
      note: "Außen always-open, innen ticket-pflichtig.",
      lastVerified: VERIFIED,
      source: "rmg.co.uk",
    },
    cost: "Außen gratis, innen ~£20",
    tags: ["outdoor-indoor", "fotogen"],
  },
  {
    id: "royal-observatory",
    name: "Royal Observatory & Prime Meridian",
    category: "greenwich",
    icon: "🌍",
    coordinates: { lat: 51.4769, lng: 0.0005 },
    description:
      "Greenwich-Meridian (Foto-Highlight: ein Fuß auf jeder Halbkugel), Astronomie-Museum, Aussicht.",
    bookingUrl: "https://www.rmg.co.uk/royal-observatory",
    availability: {
      type: "scheduled",
      openHours: "täglich 10:00–17:00",
      note: "Hügel + Aussicht außen gratis. Innen ticket-pflichtig.",
      lastVerified: VERIFIED,
      source: "rmg.co.uk",
    },
    cost: "Aussicht gratis, innen ~£20",
    tags: ["outdoor-indoor", "fotogen", "skyline"],
  },
  {
    id: "painted-hall",
    name: "Painted Hall (Old Royal Naval College)",
    category: "greenwich",
    icon: "🎨",
    coordinates: { lat: 51.4836, lng: -0.005 },
    description:
      "'Sixtinische Kapelle Englands' — atemberaubende Decken-Fresken von James Thornhill. Geheimtipp für viele Touristen.",
    bookingUrl: "https://ornc.org/visit/things-to-do/painted-hall/",
    availability: {
      type: "scheduled",
      openHours: "täglich 10:00–17:00 (letzter Einlass 16:00)",
      lastVerified: VERIFIED,
      source: "ornc.org",
    },
    cost: "~£15",
    tags: ["indoor", "fotogen"],
  },
  {
    id: "canary-wharf",
    name: "Canary Wharf",
    category: "greenwich",
    icon: "🏙️",
    coordinates: { lat: 51.5049, lng: -0.0195 },
    description:
      "Skyline-Kontrast nach historischem Greenwich — Wolkenkratzer-Viertel. Per DLR 5 Min weg.",
    availability: {
      type: "always-open",
      note: "Außenbesichtigung jederzeit. Shopping Mall meist Mo–Sa 10:00–20:00.",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["outdoor", "architektur"],
  },
  {
    id: "crossrail-roof-garden",
    name: "Crossrail Place Roof Garden",
    category: "greenwich",
    icon: "🌴",
    coordinates: { lat: 51.5054, lng: -0.0186 },
    description:
      "Versteckter Dachgarten ÜBER der Crossrail-Station in Canary Wharf. Tropische Pflanzen unter einer Holzkonstruktion. Geheimtipp.",
    availability: {
      type: "scheduled",
      openHours: "täglich 5:00–24:00",
      lastVerified: VERIFIED,
      source: "canarywharf.com",
    },
    cost: "gratis",
    tags: ["outdoor", "ruhig", "geheim", "kostenlos"],
  },

  // ═══════════════════════════════════════════════════
  // 🌈 NOTTING HILL / WEST
  // ═══════════════════════════════════════════════════
  {
    id: "notting-hill-pastell",
    name: "Notting Hill Pastell-Häuser",
    category: "westside",
    icon: "🌈",
    coordinates: { lat: 51.5093, lng: -0.1957 },
    description:
      "Bunte Pastell-Häuserreihen — Instagram-Klassiker. Beste Spots: Lancaster Road, Westbourne Park Road, Elgin Crescent.",
    availability: {
      type: "always-open",
      note: "Spaziergang jederzeit. Bewohner-Respekt!",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "gratis",
    tags: ["outdoor", "fotogen"],
    related: ["love-actually-pink-house", "notting-hill-bookshop", "portobello-road-market"],
  },

  // ═══════════════════════════════════════════════════
  // 🍝 FOODIE-HIGHLIGHTS
  // ═══════════════════════════════════════════════════
  {
    id: "cedric-grolet-berkeley",
    name: "Cedric Grolet @ The Berkeley",
    category: "foodie",
    icon: "🥐",
    coordinates: { lat: 51.5014, lng: -0.1525 },
    description:
      "Der Star-Pâtissier aus Paris. Trompe-l'œil-Früchte + goûtea Afternoon Tea. Andreas 60er-Highlight.",
    bookingUrl: "https://www.the-berkeley.co.uk/restaurants-and-bars/cedric-grolet/",
    availability: {
      type: "by-appointment",
      openHours: "goûtea-Service 12:00–16:30",
      reservationRequired: true,
      note: "Reservierung pflicht, oft Wochen ausverkauft.",
      lastVerified: VERIFIED,
      source: "the-berkeley.co.uk",
    },
    cost: "~£85 p.P.",
    tags: ["indoor", "reservation-pflicht", "highlight"],
  },
  {
    id: "ronnie-scotts",
    name: "Ronnie Scott's Jazz Club",
    category: "foodie",
    icon: "🎷",
    coordinates: { lat: 51.5132, lng: -0.1311 },
    description:
      "Berühmtester Jazz-Club Londons seit 1959. Dinner-Show oder Late-Show (ab 23:00).",
    bookingUrl: "https://www.ronniescotts.co.uk/",
    availability: {
      type: "by-appointment",
      openHours: "Shows ca. 18:30 / 22:30",
      reservationRequired: true,
      lastVerified: VERIFIED,
      source: "ronniescotts.co.uk",
    },
    cost: "ab £25 Eintritt",
    tags: ["indoor", "abends", "reservation-pflicht"],
  },
  {
    id: "sketch-the-gallery",
    name: "Sketch (The Gallery — Pink Egg Toilets)",
    category: "foodie",
    icon: "🥚",
    coordinates: { lat: 51.5135, lng: -0.1407 },
    description:
      "Komplett pinker Raum von David Shrigley designed. Bekannt für die Insta-berühmten Ei-förmigen Toiletten. Tea oder Drinks.",
    bookingUrl: "https://sketch.london/",
    availability: {
      type: "by-appointment",
      openHours: "Tea Mo–Fr 12:00–17:00, Sa+So 11:00–18:30. Dinner abends.",
      reservationRequired: true,
      lastVerified: VERIFIED,
      source: "sketch.london",
    },
    cost: "Tea ab £85",
    tags: ["indoor", "fotogen", "reservation-pflicht"],
  },
  {
    id: "padella",
    name: "Padella (Borough)",
    category: "foodie",
    icon: "🍝",
    coordinates: { lat: 51.5046, lng: -0.0901 },
    description:
      "Kult-Pasta direkt neben Borough Market. Frisch gemacht, schnell, günstig. Keine Reservierung — Schlange anstellen.",
    bookingUrl: "https://www.padella.co/",
    availability: {
      type: "scheduled",
      openHours: "täglich 12:00–15:45 + 17:00–22:15",
      note: "Keine Reservierung, Schlange ist normal.",
      lastVerified: VERIFIED,
      source: "padella.co",
    },
    cost: "~£10–15 Hauptgang",
    tags: ["indoor", "schnell", "günstig", "schlange"],
  },
  {
    id: "kappacasein",
    name: "Kappacasein Grilled Cheese (Borough)",
    category: "foodie",
    icon: "🧀",
    coordinates: { lat: 51.5055, lng: -0.0909 },
    description:
      "Berühmtester Grilled Cheese Londons. Stand im Borough Market — riesige Schlange aber lohnt.",
    availability: {
      type: "scheduled",
      openDays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      openHours: "während Borough-Market-Zeiten",
      note: "Folgt Borough Market-Zeiten. Mo+Di nur Lunch.",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "~£9",
    tags: ["outdoor", "schnell", "schlange"],
  },
  {
    id: "bao-soho",
    name: "Bao Soho",
    category: "foodie",
    icon: "🥟",
    coordinates: { lat: 51.5138, lng: -0.1335 },
    description:
      "Taiwanesische Bao-Brötchen. Kult-Restaurant — Bestellung am Eingang.",
    bookingUrl: "https://baolondon.com/",
    availability: {
      type: "scheduled",
      openDays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      openHours: "Mo–Sa 12:00–15:00 + 17:00–22:00",
      note: "Sonntag zu. Keine Reservierung.",
      lastVerified: VERIFIED,
      source: "baolondon.com",
    },
    cost: "~£20–30 p.P.",
    tags: ["indoor", "schnell"],
  },
  {
    id: "kiln",
    name: "Kiln (Soho)",
    category: "foodie",
    icon: "🌶️",
    coordinates: { lat: 51.5126, lng: -0.1342 },
    description:
      "Thai-Restaurant, am Counter sitzen, Köche kochen direkt vor dir. Michelin Bib Gourmand.",
    bookingUrl: "https://kilnsoho.com/",
    availability: {
      type: "scheduled",
      openHours: "täglich 12:00–22:00",
      note: "Reservierung möglich, Walk-ins auch.",
      lastVerified: VERIFIED,
      source: "kilnsoho.com",
    },
    cost: "~£30 p.P.",
    tags: ["indoor", "michelin"],
  },
  {
    id: "bocca-di-lupo",
    name: "Bocca di Lupo (Soho)",
    category: "foodie",
    icon: "🍷",
    coordinates: { lat: 51.5113, lng: -0.1339 },
    description:
      "Italienisch von verschiedenen Regionen. Klein, lebendig. Reservierung empfohlen.",
    bookingUrl: "https://boccadilupo.com/",
    availability: {
      type: "scheduled",
      openHours: "täglich 12:30–15:00 + 17:00–23:00",
      reservationRequired: true,
      lastVerified: VERIFIED,
      source: "boccadilupo.com",
    },
    cost: "~£40 p.P.",
    tags: ["indoor", "reservation-empfohlen"],
  },
  {
    id: "the-audley",
    name: "The Audley (Mayfair Pub)",
    category: "foodie",
    icon: "🍺",
    coordinates: { lat: 51.5099, lng: -0.1518 },
    description:
      "Wiedereröffneter viktorianischer Pub von Artemis-Macaroni-Gallery-Investor. Ober: kunst-orientiertes Dining.",
    bookingUrl: "https://theaudleypublichouse.com/",
    availability: {
      type: "scheduled",
      openHours: "täglich 11:00–23:00",
      lastVerified: VERIFIED,
      source: "theaudleypublichouse.com",
    },
    cost: "Pub-Preise",
    tags: ["indoor", "abends"],
  },
  {
    id: "the-cock-and-bottle",
    name: "The Cock & Bottle (Notting Hill)",
    category: "foodie",
    icon: "🍻",
    coordinates: { lat: 51.5106, lng: -0.1985 },
    description:
      "Gemütlicher Notting-Hill-Pub mit Booths. Klassisches Pub-Essen.",
    availability: {
      type: "scheduled",
      openHours: "täglich 11:00–23:00",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "Pub-Preise",
    tags: ["indoor", "abends"],
  },
  {
    id: "the-lyric-soho",
    name: "The Lyric (Soho)",
    category: "foodie",
    icon: "🎭",
    coordinates: { lat: 51.5124, lng: -0.1349 },
    description:
      "Klassischer Soho-Pub direkt am Theatre District. Pub-Klassiker.",
    availability: {
      type: "scheduled",
      openHours: "täglich 11:00–23:00",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "Pub-Preise",
    tags: ["indoor"],
  },
  {
    id: "the-toucan-soho",
    name: "The Toucan (Soho — Guinness)",
    category: "foodie",
    icon: "🍀",
    coordinates: { lat: 51.5147, lng: -0.1332 },
    description:
      "Berühmtester Guinness-Spot in London. Kleiner irischer Pub, oft voll, gute Stimmung.",
    availability: {
      type: "scheduled",
      openHours: "Mo–Fr 11:00–23:00, Sa 12:00–23:00, So 12:00–22:00",
      lastVerified: VERIFIED,
      source: SRC_GENERAL,
    },
    cost: "Pub-Preise",
    tags: ["indoor", "guinness"],
  },
  {
    id: "the-swan-globe",
    name: "The Swan at the Globe (Themse)",
    category: "foodie",
    icon: "🦢",
    coordinates: { lat: 51.5083, lng: -0.0974 },
    description:
      "Pub direkt neben dem Shakespeare's Globe Theatre, mit Terrasse zur Themse. Aussicht auf St. Paul's.",
    bookingUrl: "https://www.swanlondon.co.uk/",
    availability: {
      type: "scheduled",
      openHours: "täglich 11:30–23:00 (Sommer länger)",
      lastVerified: VERIFIED,
      source: "swanlondon.co.uk",
    },
    cost: "Pub-Preise",
    tags: ["outdoor-möglich", "themse", "aussicht"],
  },
  {
    id: "the-trafalgar-tavern",
    name: "The Trafalgar Tavern (Greenwich)",
    category: "foodie",
    icon: "⚓",
    coordinates: { lat: 51.4845, lng: -0.0064 },
    description:
      "Klassischer Themse-Pub in Greenwich, neben dem Royal Naval College. Charles Dickens war Stammgast.",
    bookingUrl: "https://www.trafalgartavern.co.uk/",
    availability: {
      type: "scheduled",
      openHours: "täglich 11:00–23:00",
      lastVerified: VERIFIED,
      source: "trafalgartavern.co.uk",
    },
    cost: "Pub-Preise",
    tags: ["indoor", "themse", "history"],
  },

  // ═══════════════════════════════════════════════════
  // 🚆 TRANSPORT-ERLEBNISSE (Wege als Erlebnis)
  // ═══════════════════════════════════════════════════
  {
    id: "thames-clipper",
    name: "Thames Clipper (Uber Boat)",
    category: "transport",
    icon: "⛴️",
    coordinates: { lat: 51.5074, lng: -0.1219 },
    description:
      "Schnellboot-Linie auf der Themse. Vom Westminster Pier bis Greenwich (~45 Min) — Aussicht auf Big Ben, Tower Bridge, Skyline.",
    bookingUrl: "https://www.thamesclippers.com/",
    availability: {
      type: "scheduled",
      openHours: "ca. 6:00–22:30 (alle 20–30 Min)",
      note: "River Roamer £21/Tag unbegrenzt, beste Wahl für Sightseeing-Boot.",
      lastVerified: VERIFIED,
      source: "thamesclippers.com",
    },
    cost: "River Roamer £21/Tag",
    tags: ["outdoor", "fotogen", "transport-als-sightseeing"],
  },
  {
    id: "dlr",
    name: "DLR Docklands Light Railway",
    category: "transport",
    icon: "🚇",
    coordinates: { lat: 51.5074, lng: -0.0883 },
    description:
      "Fahrerlose Hochbahn durch die Docklands. Vorderster Wagen → Panorama-Aussicht wie in einem Tagungs-Cab.",
    availability: {
      type: "scheduled",
      openHours: "Mo–Sa 5:30–24:30, So 7:00–23:30",
      note: "Setzt euch ganz vorne hin (Fahrer-Sicht ohne Fahrer).",
      lastVerified: VERIFIED,
      source: "tfl.gov.uk/dlr",
    },
    cost: "Standard-Tube-Tarif",
    tags: ["outdoor-blick", "fotogen", "transport-als-sightseeing"],
  },
  {
    id: "bus-11-doubledecker",
    name: "Bus 11 (Doppeldecker-Tour gratis)",
    category: "transport",
    icon: "🚌",
    coordinates: { lat: 51.5074, lng: -0.1219 },
    description:
      "Linienbus 11 fährt durch alle Sightseeing-Highlights (Liverpool Street → Trafalgar → Westminster → Sloane Square). Oben vorne sitzen!",
    availability: {
      type: "scheduled",
      openHours: "Mo–Sa 5:00–24:30, So 6:00–23:30",
      note: "Linientarif ~£1.75 (Tap mit Karte). Gratis-Hop-on-Hop-off-Tour-Alternative.",
      lastVerified: VERIFIED,
      source: "tfl.gov.uk",
    },
    cost: "~£1.75",
    tags: ["outdoor-blick", "transport-als-sightseeing"],
  },
];
