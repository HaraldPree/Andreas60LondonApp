import type Anthropic from "@anthropic-ai/sdk";

export const companionTools: Anthropic.Tool[] = [
  {
    name: "get_live_weather",
    description:
      "Aktuelles Wetter und 5-Tage-Vorhersage für eine Stadt. Nutze diese Funktion wenn der User Fragen zum Wetter stellt oder du Empfehlungen geben willst die wetterabhängig sind (z.B. Indoor-Aktivitäten bei Regen).",
    input_schema: {
      type: "object",
      properties: {
        latitude: { type: "number", description: "Breitengrad der Stadt" },
        longitude: { type: "number", description: "Längengrad der Stadt" },
        timezone: {
          type: "string",
          description: "IANA-Zeitzone, z.B. Europe/London",
        },
      },
      required: ["latitude", "longitude", "timezone"],
    },
  },
  {
    name: "get_tfl_status",
    description:
      "Live-Status aller Londoner U-Bahn-Linien (Transport for London). Nutze dies wenn der User über öffentliche Verkehrsmittel, Streiks oder Anreise in London spricht. Gibt Status pro Linie zurück (Good Service, Minor Delays, Severe Delays, Part Suspended etc.).",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

interface ToolHandlerMap {
  [key: string]: (input: Record<string, unknown>) => Promise<string>;
}

export const companionToolHandlers: ToolHandlerMap = {
  async get_live_weather(input) {
    const lat = input.latitude as number;
    const lng = input.longitude as number;
    const tz = (input.timezone as string) ?? "Europe/London";

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set(
      "current",
      "temperature_2m,weathercode,windspeed_10m,relative_humidity_2m,precipitation",
    );
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,precipitation_sum",
    );
    url.searchParams.set("timezone", tz);
    url.searchParams.set("forecast_days", "5");

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        return JSON.stringify({ error: `Wetter API Fehler ${res.status}` });
      }
      const data = await res.json();
      return JSON.stringify({
        current: data.current,
        daily: data.daily,
        codes_legend: {
          "0": "Klar",
          "1-3": "Sonnig bis bewölkt",
          "45-48": "Nebel",
          "51-65": "Regen",
          "71-77": "Schnee",
          "80-82": "Regenschauer",
          "95-99": "Gewitter",
        },
      });
    } catch (e) {
      return JSON.stringify({ error: `Netzwerkfehler: ${(e as Error).message}` });
    }
  },

  async get_tfl_status() {
    try {
      const res = await fetch("https://api.tfl.gov.uk/Line/Mode/tube/Status");
      if (!res.ok) {
        return JSON.stringify({ error: `TfL API Fehler ${res.status}` });
      }
      const data = await res.json();
      const summary = data.map((line: { name: string; lineStatuses: Array<{ statusSeverityDescription: string; reason?: string }> }) => ({
        line: line.name,
        status: line.lineStatuses[0]?.statusSeverityDescription ?? "Unknown",
        reason: line.lineStatuses[0]?.reason,
      }));
      return JSON.stringify({
        fetched_at: new Date().toISOString(),
        lines: summary,
      });
    } catch (e) {
      return JSON.stringify({ error: `Netzwerkfehler: ${(e as Error).message}` });
    }
  },
};
