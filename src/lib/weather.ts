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
  if (!res.ok) throw new Error(`Wetter konnte nicht geladen werden (${res.status})`);

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
