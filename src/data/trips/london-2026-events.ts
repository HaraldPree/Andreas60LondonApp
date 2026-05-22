/**
 * London-Events 2026 — Annual-Recurring + relevante One-Offs.
 *
 * Pflege-Disziplin: jedes Event mit `source` + `lastVerified`.
 *
 * Anlass-Reise (Mai 2026, Andreas 60. Geburtstag) hatte die Chelsea
 * Flower Show GENAU in der Reisewoche — wurde aber nicht angezeigt.
 * Diese Datei korrigiert das rückwirkend + legt die Basis für künftige
 * Reisen.
 *
 * Datums-Konvention: ISO YYYY-MM-DD. Jährlich wiederkehrende Events
 * haben das jeweilige Jahres-Datum. Beim Jahres-Update (z.B. 2027)
 * werden die Daten neu eingetragen.
 */

import type { Event } from "@/types/event";

const VERIFIED = "2026-05-23";

export const LONDON_EVENTS_2026: Event[] = [
  // ═══════════════════════════════════════════════════
  // 🌸 MAI 2026 (Reise-Zeitraum-relevant)
  // ═══════════════════════════════════════════════════
  {
    id: "chelsea-flower-show-2026",
    name: "RHS Chelsea Flower Show 2026",
    category: "festival",
    icon: "🌸",
    startDate: "2026-05-19",
    endDate: "2026-05-23",
    location: "Royal Hospital Chelsea, London SW3",
    coordinates: { lat: 51.4866, lng: -0.1556 },
    description:
      "Eines der weltweit bedeutendsten Garten-Events. Die Royal Horticultural Society zeigt Show Gardens, Großtreibhaus-Pflanzen, Designer-Kreationen.",
    visitorTips: [
      "Di+Mi nur RHS-Members, Mi-Nachmittag bis Sa öffentlich (Tickets pflicht).",
      "Letzter Verkaufstag Sa: Pflanzen zu reduzierten Preisen — beliebt + voll.",
      "Sloane Square (District/Circle) ist die nächste Tube-Station, ~10 Min Fußweg.",
    ],
    bookingUrl: "https://www.rhs.org.uk/shows-events/rhs-chelsea-flower-show",
    cost: "ab ~£45 (Tagesticket)",
    bookingRequired: true,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "rhs.org.uk (vor Buchung Termine + Preise prüfen)",
    city: "London",
    tags: ["royal", "gartenkunst", "fotogen", "ticket-pflicht"],
  },
  {
    id: "trooping-the-colour-2026",
    name: "Trooping the Colour — Königs-Geburtstagsparade",
    category: "culture",
    icon: "👑",
    startDate: "2026-06-13",
    endDate: "2026-06-13",
    location: "Horse Guards Parade + The Mall",
    coordinates: { lat: 51.5044, lng: -0.1294 },
    description:
      "Militärparade zur offiziellen Geburtstagsfeier des Monarchen. Königliche Familie auf dem Balkon des Buckingham Palace.",
    visitorTips: [
      "Strecke kostenlos zugänglich, aber sehr früh ankommen für gute Sicht (vor 9:00).",
      "Tribünen-Plätze ticket-pflichtig (rhrcd.com).",
      "Tube-Closures rund um Westminster, Vorab prüfen.",
    ],
    bookingUrl: "https://www.royal.uk/trooping-colour",
    cost: "Straßenseite gratis, Tribüne ab £40",
    bookingRequired: false,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "royal.uk (Datum traditionell zweiter Samstag im Juni)",
    city: "London",
    tags: ["royal", "kostenlos-option", "fotogen", "wachablöse"],
  },

  // ═══════════════════════════════════════════════════
  // 🎾 SOMMER 2026
  // ═══════════════════════════════════════════════════
  {
    id: "wimbledon-2026",
    name: "Wimbledon Tennis Championships 2026",
    category: "sport",
    icon: "🎾",
    startDate: "2026-06-29",
    endDate: "2026-07-12",
    location: "All England Lawn Tennis Club, Wimbledon",
    coordinates: { lat: 51.434, lng: -0.2143 },
    description:
      "Ältestes und prestigeträchtigstes Tennis-Turnier der Welt. 2 Wochen Turnier auf Rasenplätzen.",
    visitorTips: [
      "Tickets via Ballot-System (Lotterie) Monate vorher. Restbestände am Morgen vor Ort (The Queue).",
      "Erdbeeren mit Sahne + Pimm's = Wimbledon-Klassiker.",
      "Murray Mound (außen) ist mit Tagesticket zugänglich, Großleinwand-Atmosphäre.",
    ],
    bookingUrl: "https://www.wimbledon.com/",
    cost: "Tagesticket ab £30 (Außen), Centre Court ab £100",
    bookingRequired: true,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "wimbledon.com",
    city: "London",
    tags: ["sport", "tradition", "ticket-pflicht"],
  },
  {
    id: "notting-hill-carnival-2026",
    name: "Notting Hill Carnival 2026",
    category: "festival",
    icon: "🪘",
    startDate: "2026-08-30",
    endDate: "2026-08-31",
    location: "Notting Hill / Ladbroke Grove",
    coordinates: { lat: 51.515, lng: -0.205 },
    description:
      "Europas größte Straßenparty — karibischer Karneval mit Sound-Systems, Steel-Bands, Soca, kostümierten Tanzgruppen. Familien-Day So, Adults-Day Mo (Bank Holiday).",
    visitorTips: [
      "Sehr voll — bequeme Schuhe, keine wertvollen Sachen, vorher Wasser kaufen.",
      "Sonntag familienfreundlicher als Montag.",
      "Tubes rund um Notting Hill Gate teilweise geschlossen — Westbourne Park / Royal Oak als Alternative.",
    ],
    bookingUrl: "https://nhcarnival.org/",
    cost: "gratis",
    bookingRequired: false,
    recurring: "annual-bank-holiday",
    lastVerified: VERIFIED,
    source: "nhcarnival.org",
    city: "London",
    tags: ["kostenlos", "outdoor", "musik", "voll", "karibisch"],
  },
  {
    id: "bst-hyde-park-2026",
    name: "BST Hyde Park (Konzert-Reihe)",
    category: "music",
    icon: "🎤",
    startDate: "2026-06-26",
    endDate: "2026-07-12",
    location: "Hyde Park",
    coordinates: { lat: 51.508, lng: -0.165 },
    description:
      "Mega-Konzerte im Hyde Park über zwei Wochenenden. Headliner werden jeweils Anfang des Jahres bekanntgegeben.",
    visitorTips: [
      "Tickets schnell weg — bei Bekanntgabe der Headliner sofort buchen.",
      "Picknick-Plätze auf der Wiese, aber Drink-Restriktionen beachten.",
    ],
    bookingUrl: "https://www.bst-hydepark.com/",
    cost: "ab ~£90",
    bookingRequired: true,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "bst-hydepark.com (Headliner 2026 prüfen)",
    city: "London",
    tags: ["musik", "outdoor", "ticket-pflicht"],
  },
  {
    id: "pride-london-2026",
    name: "Pride in London 2026",
    category: "pride",
    icon: "🏳️‍🌈",
    startDate: "2026-07-04",
    endDate: "2026-07-04",
    location: "Hyde Park → Trafalgar Square (Parade-Strecke)",
    coordinates: { lat: 51.508, lng: -0.1281 },
    description:
      "Eine der größten Pride-Paraden Europas. Parade durch West End + Konzerte/Bühnen am Trafalgar + Soho Stages.",
    visitorTips: [
      "Strecke + Trafalgar gratis. Bühnen-Tickets für VIP-Areas.",
      "Tube-Closures Picadilly + Oxford Street ab Vormittag.",
    ],
    bookingUrl: "https://prideinlondon.org/",
    cost: "Parade gratis",
    bookingRequired: false,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "prideinlondon.org",
    city: "London",
    tags: ["kostenlos", "outdoor", "musik", "voll"],
  },

  // ═══════════════════════════════════════════════════
  // 🍂 HERBST 2026
  // ═══════════════════════════════════════════════════
  {
    id: "london-fashion-week-2026",
    name: "London Fashion Week SS27",
    category: "culture",
    icon: "👗",
    startDate: "2026-09-18",
    endDate: "2026-09-22",
    location: "verschiedene Locations (Strand, Shoreditch, Somerset House)",
    description:
      "Eine der vier großen Modewochen. Shows hauptsächlich Industry-only, aber Public-Pop-Ups + Showroom-Verkäufe gibt es.",
    visitorTips: [
      "Designer-Stores in Mayfair haben Sonder-Aktionen.",
      "Pop-Ups in Shoreditch oft öffentlich zugänglich.",
    ],
    bookingUrl: "https://londonfashionweek.co.uk/",
    cost: "Public-Events oft gratis",
    bookingRequired: false,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "londonfashionweek.co.uk",
    city: "London",
    tags: ["mode", "indoor-outdoor"],
  },
  {
    id: "bfi-london-film-festival-2026",
    name: "BFI London Film Festival 2026",
    category: "culture",
    icon: "🎬",
    startDate: "2026-10-07",
    endDate: "2026-10-18",
    location: "BFI Southbank + verschiedene Kinos",
    coordinates: { lat: 51.5066, lng: -0.1146 },
    description:
      "Eines der wichtigsten Film-Festivals Europas. ~250 Filme aus aller Welt, World-/UK-Premieren.",
    visitorTips: [
      "Tickets gehen schnell weg, BFI-Members bevorzugt.",
      "Pressetermine + Q&A mit Regisseuren bei vielen Vorführungen.",
    ],
    bookingUrl: "https://www.bfi.org.uk/london-film-festival",
    cost: "Tickets ab £15",
    bookingRequired: true,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "bfi.org.uk",
    city: "London",
    tags: ["film", "kultur"],
  },
  {
    id: "lord-mayors-show-2026",
    name: "Lord Mayor's Show 2026",
    category: "culture",
    icon: "🎩",
    startDate: "2026-11-14",
    endDate: "2026-11-14",
    location: "City of London (Mansion House → Royal Courts of Justice)",
    coordinates: { lat: 51.514, lng: -0.0884 },
    description:
      "800 Jahre alte Tradition — Parade des neuen Bürgermeisters der City of London. Goldene Kutsche, Militärbands, ~7000 Teilnehmer.",
    visitorTips: [
      "Komplett kostenlos.",
      "Feuerwerk abends ab Themse.",
      "Bank Tube-Station kann geschlossen sein.",
    ],
    bookingUrl: "https://lordmayorsshow.london/",
    cost: "gratis",
    bookingRequired: false,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "lordmayorsshow.london",
    city: "London",
    tags: ["kostenlos", "tradition", "royal", "outdoor"],
  },

  // ═══════════════════════════════════════════════════
  // 🎆 WINTER 2026/2027
  // ═══════════════════════════════════════════════════
  {
    id: "bonfire-night-2026",
    name: "Bonfire Night — Feuerwerke",
    category: "fireworks",
    icon: "🎆",
    startDate: "2026-11-05",
    endDate: "2026-11-07",
    location: "Diverse Parks (Battersea, Alexandra Palace, Wimbledon)",
    description:
      "Guy Fawkes Night — britische Feuerwerks-Tradition. Größte Shows in den Royal Parks + Alexandra Palace, kleinere überall.",
    visitorTips: [
      "Tickets für große Events Wochen vorher buchen.",
      "Warm anziehen, oft kalt + nass.",
      "Sonntag-Schows + 5.11. (Mittwoch) selbst sind primäre Termine.",
    ],
    bookingUrl: "https://visitlondon.com/things-to-do/whats-on/bonfire-night",
    cost: "Tickets ab £10, kleinere Shows gratis",
    bookingRequired: false,
    recurring: "annual-fixed-date",
    lastVerified: VERIFIED,
    source: "visitlondon.com",
    city: "London",
    tags: ["outdoor", "tradition", "feuerwerk"],
  },
  {
    id: "winter-wonderland-2026",
    name: "Hyde Park Winter Wonderland 2026/27",
    category: "seasonal",
    icon: "🎄",
    startDate: "2026-11-20",
    endDate: "2027-01-03",
    location: "Hyde Park",
    coordinates: { lat: 51.5074, lng: -0.1657 },
    description:
      "Größter Christmas-Markt + Funfair Londons. Schlittschuhbahn, Eis-Skulpturen, Karussells, Glühwein-Stände, Schausteller-Shows.",
    visitorTips: [
      "Eintritt gratis, einzelne Attraktionen kostenpflichtig.",
      "Abends sehr voll — vormittags + werktags ruhiger.",
      "Online-Tickets für die Schlittschuhbahn vorab buchen.",
    ],
    bookingUrl: "https://hydeparkwinterwonderland.com/",
    cost: "Eintritt gratis, Rides ab £5",
    bookingRequired: false,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "hydeparkwinterwonderland.com",
    city: "London",
    tags: ["kostenlos-eintritt", "outdoor", "weihnacht", "familie"],
  },
  {
    id: "nye-fireworks-london-2026",
    name: "Silvester-Feuerwerk an der Themse 2026/27",
    category: "fireworks",
    icon: "🎆",
    startDate: "2026-12-31",
    endDate: "2027-01-01",
    location: "Themse-Ufer (Embankment / South Bank)",
    coordinates: { lat: 51.508, lng: -0.123 },
    description:
      "Spektakuläres 10-Minuten-Feuerwerk über der Themse um Mitternacht, zentriert um London Eye / Westminster.",
    visitorTips: [
      "Beste Plätze ticket-pflichtig (Verkauf September).",
      "Gratis-Plätze: Primrose Hill, Greenwich Park, Tower Hill.",
      "Tube läuft die ganze Nacht durch (kostenlos für Silvester).",
    ],
    bookingUrl: "https://london.gov.uk/new-years-eve",
    cost: "Themse-Ufer-Tickets £20, gratis-Spots verfügbar",
    bookingRequired: true,
    recurring: "annual-fixed-date",
    lastVerified: VERIFIED,
    source: "london.gov.uk",
    city: "London",
    tags: ["feuerwerk", "outdoor", "winter"],
  },

  // ═══════════════════════════════════════════════════
  // 🏃 FRÜHLING 2026 (frühe + Reise-vor-Zeitraum)
  // ═══════════════════════════════════════════════════
  {
    id: "london-marathon-2026",
    name: "London Marathon 2026",
    category: "sport",
    icon: "🏃",
    startDate: "2026-04-26",
    endDate: "2026-04-26",
    location: "Greenwich Park → The Mall (42 km Strecke)",
    description:
      "Eines der weltweit größten Marathon-Events. ~50.000 Läufer. Strecke führt durch ganz London — viel Atmosphäre an der Strecke.",
    visitorTips: [
      "Beste Zuschauer-Punkte: Tower Bridge (Mile 12), Canary Wharf, Embankment vor dem Ziel.",
      "Strecken-Closures massiv — Tube-Pläne checken.",
    ],
    bookingUrl: "https://www.tcslondonmarathon.com/",
    cost: "Zuschauen gratis",
    bookingRequired: false,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "tcslondonmarathon.com",
    city: "London",
    tags: ["sport", "outdoor", "kostenlos-zuschauen"],
  },
  {
    id: "boat-race-2026",
    name: "Oxford vs Cambridge Boat Race 2026",
    category: "sport",
    icon: "🚣",
    startDate: "2026-03-29",
    endDate: "2026-03-29",
    location: "Themse — Putney bis Mortlake",
    coordinates: { lat: 51.4707, lng: -0.2178 },
    description:
      "Tradition seit 1829. Männer- und Frauen-Boots-Rennen zwischen Oxford und Cambridge auf der Themse, 6,8 km.",
    visitorTips: [
      "Putney Bridge oder Hammersmith für Start-Sicht.",
      "Live-Übertragung BBC + überall an den Themse-Pubs.",
    ],
    bookingUrl: "https://theboatrace.org/",
    cost: "gratis",
    bookingRequired: false,
    recurring: "annual-fixed-week",
    lastVerified: VERIFIED,
    source: "theboatrace.org",
    city: "London",
    tags: ["sport", "tradition", "kostenlos", "outdoor"],
  },
];
