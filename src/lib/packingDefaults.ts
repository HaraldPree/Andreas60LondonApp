export type PackingCategory =
  | "Dokumente"
  | "Kleidung"
  | "Toilette"
  | "Tech"
  | "Sonstiges";

export interface PackingItem {
  id: string;
  label: string;
  category: PackingCategory;
  essential?: boolean;
  /** If present, only included when forecast matches the rule. */
  weatherRule?: WeatherRule;
  /** True if user added this item (so it can be removed). */
  custom?: boolean;
  /** Hint shown below label (e.g. "Wegen Regen Di 19.5.") */
  hint?: string;
}

export type WeatherRule =
  | { type: "rain_above"; threshold: number }
  | { type: "max_temp_above"; threshold: number }
  | { type: "min_temp_below"; threshold: number }
  | { type: "sunny_days_at_least"; threshold: number };

export const PACKING_CATEGORIES: PackingCategory[] = [
  "Dokumente",
  "Kleidung",
  "Toilette",
  "Tech",
  "Sonstiges",
];

export const DEFAULT_PACKING: PackingItem[] = [
  // Dokumente
  { id: "passport", category: "Dokumente", label: "Reisepass / Personalausweis", essential: true },
  { id: "boarding", category: "Dokumente", label: "Boarding Pass (Online-Check-in)", essential: true },
  { id: "insurance", category: "Dokumente", label: "Reiseversicherungskarte" },
  { id: "ehic", category: "Dokumente", label: "EHIC / EU-Krankenversicherungskarte" },
  { id: "cash", category: "Dokumente", label: "Etwas Bargeld (£ – ca. 50)" },
  { id: "cards", category: "Dokumente", label: "Kreditkarte (Contactless aktiviert)" },

  // Kleidung
  { id: "shoes", category: "Kleidung", label: "Bequeme Schuhe (viel zu Fuß)", essential: true },
  { id: "underwear", category: "Kleidung", label: "Unterwäsche für 5 Tage" },
  { id: "socks", category: "Kleidung", label: "Socken für 5 Tage" },
  { id: "sleep", category: "Kleidung", label: "Schlafkleidung" },
  { id: "smart", category: "Kleidung", label: "Smart-casual Outfit (Cedric Grolet, Pubs)" },

  // Toilette
  { id: "toothbrush", category: "Toilette", label: "Zahnbürste + Zahnpasta", essential: true },
  { id: "shampoo", category: "Toilette", label: "Shampoo / Shower-Gel (Reisegröße)" },
  { id: "deo", category: "Toilette", label: "Deo" },
  { id: "meds", category: "Toilette", label: "Eigene Medikamente", essential: true },

  // Tech
  { id: "phone", category: "Tech", label: "Handy + Ladekabel", essential: true },
  { id: "adapter", category: "Tech", label: "UK-Adapter (Type G, 3-Pin)", essential: true },
  { id: "powerbank", category: "Tech", label: "Powerbank für unterwegs" },
  { id: "headphones", category: "Tech", label: "Kopfhörer" },

  // Sonstiges
  { id: "daybag", category: "Sonstiges", label: "Kleine Tasche / Rucksack für tagsüber" },
  { id: "waterbottle", category: "Sonstiges", label: "Wiederbefüllbare Wasserflasche" },
  { id: "snacks", category: "Sonstiges", label: "Snacks für den Flug" },
];

/**
 * Items that are added dynamically based on weather forecast.
 * Each rule references the same `id`, so checking state persists when the
 * rule re-triggers in subsequent sessions.
 */
export const WEATHER_PACKING: PackingItem[] = [
  {
    id: "raincoat",
    category: "Kleidung",
    label: "Regenjacke",
    weatherRule: { type: "rain_above", threshold: 40 },
  },
  {
    id: "umbrella",
    category: "Sonstiges",
    label: "Kleiner Regenschirm",
    weatherRule: { type: "rain_above", threshold: 50 },
  },
  {
    id: "warm-jacket",
    category: "Kleidung",
    label: "Warme Jacke (abends kühl)",
    weatherRule: { type: "min_temp_below", threshold: 13 },
  },
  {
    id: "sunscreen",
    category: "Toilette",
    label: "Sonnencreme (LSF 30+)",
    weatherRule: { type: "max_temp_above", threshold: 21 },
  },
  {
    id: "sunglasses",
    category: "Tech",
    label: "Sonnenbrille",
    weatherRule: { type: "sunny_days_at_least", threshold: 2 },
  },
];
