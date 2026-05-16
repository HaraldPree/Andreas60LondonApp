/**
 * AviationStack flight status types and helpers.
 * Free tier: 100 requests/month → server-side cached to share across users.
 */

export interface FlightStatusData {
  flightIata: string;
  flightDate?: string;
  /** "scheduled" | "active" | "landed" | "cancelled" | "incident" | "diverted" */
  status: FlightStatusValue;
  airline?: string;
  departure?: {
    airport: string;
    iata: string;
    terminal?: string;
    gate?: string;
    scheduled?: string;
    estimated?: string;
    actual?: string;
    delayMinutes?: number;
  };
  arrival?: {
    airport: string;
    iata: string;
    terminal?: string;
    gate?: string;
    scheduled?: string;
    estimated?: string;
    actual?: string;
    delayMinutes?: number;
  };
}

export type FlightStatusValue =
  | "scheduled"
  | "active"
  | "landed"
  | "cancelled"
  | "incident"
  | "diverted"
  | "unknown";

export interface FlightStatusResponse {
  data?: FlightStatusData;
  /** Empty data = no flight found. */
  empty?: boolean;
  /** Diagnostic states (not API errors): "no_key" | "too_early" | "not_found" */
  state?: "no_key" | "too_early" | "not_found" | "ok";
  error?: string;
  /** When AviationStack was last queried. */
  fetchedAt?: string;
  /** Source URL for "track on web" deep link */
  trackerUrl?: string;
}

interface AviationStackFlight {
  flight_date?: string;
  flight_status?: FlightStatusValue;
  departure?: {
    airport?: string;
    iata?: string;
    terminal?: string;
    gate?: string;
    delay?: number;
    scheduled?: string;
    estimated?: string;
    actual?: string;
  };
  arrival?: {
    airport?: string;
    iata?: string;
    terminal?: string;
    gate?: string;
    delay?: number;
    scheduled?: string;
    estimated?: string;
    actual?: string;
  };
  airline?: { name?: string; iata?: string };
  flight?: { iata?: string; number?: string };
}

interface AviationStackResponse {
  data?: AviationStackFlight[];
  error?: { code?: string; message?: string };
}

/**
 * Server-side cache so multiple users / refreshes share the same request.
 * Free tier = 100/month, so we cache aggressively.
 */
const CACHE_TTL_MS = 5 * 60_000; // 5 min
const cache = new Map<string, { data: FlightStatusResponse; expires: number }>();

export async function fetchFlightStatus(
  flightIata: string,
  flightDate?: string,
): Promise<FlightStatusResponse> {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) {
    return { state: "no_key", trackerUrl: rememberTracker(flightIata) };
  }

  // Check window: AviationStack only has data ~48h out
  if (flightDate) {
    const now = new Date();
    const flightDay = new Date(flightDate);
    const diffMs = flightDay.getTime() - now.getTime();
    if (diffMs > 48 * 3600_000) {
      return { state: "too_early", trackerUrl: rememberTracker(flightIata) };
    }
  }

  const cacheKey = `${flightIata}|${flightDate ?? ""}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const url = new URL("https://api.aviationstack.com/v1/flights");
    url.searchParams.set("access_key", apiKey);
    url.searchParams.set("flight_iata", flightIata);
    if (flightDate) url.searchParams.set("flight_date", flightDate);

    const res = await fetch(url.toString());
    if (!res.ok) {
      return { error: `AviationStack ${res.status}`, trackerUrl: rememberTracker(flightIata) };
    }
    const json = (await res.json()) as AviationStackResponse;
    if (json.error) {
      return { error: json.error.message ?? "API-Fehler", trackerUrl: rememberTracker(flightIata) };
    }
    const first = json.data?.[0];
    if (!first) {
      const out: FlightStatusResponse = {
        state: "not_found",
        empty: true,
        fetchedAt: new Date().toISOString(),
        trackerUrl: rememberTracker(flightIata),
      };
      cache.set(cacheKey, { data: out, expires: Date.now() + CACHE_TTL_MS });
      return out;
    }

    const data: FlightStatusData = {
      flightIata,
      flightDate: first.flight_date,
      status: first.flight_status ?? "unknown",
      airline: first.airline?.name,
      departure: first.departure
        ? {
            airport: first.departure.airport ?? "",
            iata: first.departure.iata ?? "",
            terminal: first.departure.terminal,
            gate: first.departure.gate,
            scheduled: first.departure.scheduled,
            estimated: first.departure.estimated,
            actual: first.departure.actual,
            delayMinutes: first.departure.delay,
          }
        : undefined,
      arrival: first.arrival
        ? {
            airport: first.arrival.airport ?? "",
            iata: first.arrival.iata ?? "",
            terminal: first.arrival.terminal,
            gate: first.arrival.gate,
            scheduled: first.arrival.scheduled,
            estimated: first.arrival.estimated,
            actual: first.arrival.actual,
            delayMinutes: first.arrival.delay,
          }
        : undefined,
    };

    const out: FlightStatusResponse = {
      data,
      state: "ok",
      fetchedAt: new Date().toISOString(),
      trackerUrl: rememberTracker(flightIata),
    };
    cache.set(cacheKey, { data: out, expires: Date.now() + CACHE_TTL_MS });
    return out;
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Netzwerkfehler",
      trackerUrl: rememberTracker(flightIata),
    };
  }
}

/**
 * Generic tracker URL that works without auth.
 * Flightradar24's flight page is the most reliable public tracker.
 */
function rememberTracker(flightIata: string): string {
  return `https://www.flightradar24.com/data/flights/${flightIata.toLowerCase()}`;
}
