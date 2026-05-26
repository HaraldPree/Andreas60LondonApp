export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  time: string;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
}

export async function fetchWeather(
  lat: number,
  lng: number,
  timezone: string = "Europe/London",
  days: number = 7,
): Promise<WeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set("current", "temperature_2m,weathercode,windspeed_10m,relative_humidity_2m");
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max",
  );
  url.searchParams.set("timezone", timezone);
  url.searchParams.set("forecast_days", days.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    // v1.21.4 — spezifischere Error-Messages je nach HTTP-Status, damit
    // bei API-Ausfällen (Open-Meteo war am 26.05.2026 mit 502 down,
    // halben Tag SW-Bugs gejagt für einen API-Bug der nicht bei uns lag)
    // der User direkt sieht dass es eine externe Störung ist.
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        `Wetter-Server hat gerade Probleme (HTTP ${res.status} ${res.statusText || "Bad Gateway"})`,
      );
    }
    if (res.status === 429) {
      throw new Error("Zu viele Wetter-Anfragen — kurz warten + erneut versuchen");
    }
    throw new Error(`Wetter konnte nicht geladen werden (HTTP ${res.status})`);
  }

  const data = await res.json();

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weathercode,
      windSpeed: Math.round(data.current.windspeed_10m),
      humidity: data.current.relative_humidity_2m,
      time: data.current.time,
    },
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      weatherCode: data.daily.weathercode[i],
      precipitationProbability: data.daily.precipitation_probability_max[i] ?? 0,
    })),
  };
}

// ═══════════════════════════════════════════════════════════════
// v1.21.4 — localStorage-Cache für Wetter (Resilienz gegen API-Ausfälle)
// ═══════════════════════════════════════════════════════════════

const WEATHER_CACHE_PREFIX = "weather:cache:";
const WEATHER_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 h

interface CachedWeatherEntry {
  data: WeatherData;
  cachedAt: number;
}

function weatherCacheKey(lat: number, lng: number): string {
  // 4 Nachkommastellen ~ 11 m Genauigkeit, reicht für Wetter (Stadt-Level)
  return `${WEATHER_CACHE_PREFIX}${lat.toFixed(4)}:${lng.toFixed(4)}`;
}

/**
 * Lädt gecachte Wetter-Daten aus localStorage. Returns null wenn kein
 * Cache da oder älter als 24h.
 */
export function loadCachedWeather(
  lat: number,
  lng: number,
): { data: WeatherData; cachedAt: number; ageMs: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(weatherCacheKey(lat, lng));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWeatherEntry;
    if (!parsed?.data?.current || typeof parsed.cachedAt !== "number") {
      return null;
    }
    const ageMs = Date.now() - parsed.cachedAt;
    if (ageMs > WEATHER_CACHE_MAX_AGE_MS) return null;
    return { data: parsed.data, cachedAt: parsed.cachedAt, ageMs };
  } catch {
    return null;
  }
}

/** Speichert die zuletzt erfolgreich geladenen Wetter-Daten. */
export function saveCachedWeather(
  lat: number,
  lng: number,
  data: WeatherData,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedWeatherEntry = { data, cachedAt: Date.now() };
    window.localStorage.setItem(
      weatherCacheKey(lat, lng),
      JSON.stringify(payload),
    );
  } catch {
    // Quota voll oder localStorage disabled — silent fail, kein Schaden
  }
}

/**
 * Formatiert „vor X Min" / „vor X Std" / „vor X Tagen" für UI-Anzeige
 * des Cache-Alters.
 */
export function formatRelativeAge(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std`;
  const days = Math.floor(hours / 24);
  return `vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;
}

/**
 * Open-Meteo Weather Codes (WMO) → German Description + Emoji
 * https://open-meteo.com/en/docs
 */
export function weatherCodeToInfo(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Klar", icon: "☀️" };
  if (code === 1) return { label: "Überwiegend klar", icon: "🌤️" };
  if (code === 2) return { label: "Teilweise bewölkt", icon: "⛅" };
  if (code === 3) return { label: "Bewölkt", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "Nebel", icon: "🌫️" };
  if (code >= 51 && code <= 55) return { label: "Nieselregen", icon: "🌦️" };
  if (code >= 56 && code <= 57) return { label: "Gefrierender Niesel", icon: "🌧️" };
  if (code >= 61 && code <= 65) return { label: "Regen", icon: "🌧️" };
  if (code >= 66 && code <= 67) return { label: "Gefrierender Regen", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { label: "Schnee", icon: "🌨️" };
  if (code >= 80 && code <= 82) return { label: "Regenschauer", icon: "🌦️" };
  if (code >= 85 && code <= 86) return { label: "Schneeschauer", icon: "🌨️" };
  if (code === 95) return { label: "Gewitter", icon: "⛈️" };
  if (code >= 96 && code <= 99) return { label: "Gewitter mit Hagel", icon: "⛈️" };
  return { label: "Unbekannt", icon: "❓" };
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export function formatForecastDay(isoDate: string): string {
  const d = new Date(isoDate);
  return WEEKDAYS[d.getDay()];
}

export function formatForecastDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}
