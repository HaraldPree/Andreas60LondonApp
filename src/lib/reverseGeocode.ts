/**
 * v1.14.2 — Sanftes Reverse-Geocoding via OSM Nominatim.
 *
 * Wird im „Erlebt"-Rückblick verwendet wenn ein Foto-Cluster GPS hat,
 * aber keinem Place aus der Library zugeordnet werden konnte. Statt
 * „Stopp ohne Place-Match" zeigt die UI dann „Stopp bei Southwark"
 * o.ä. — das ist viel hilfreicher.
 *
 * Wichtige Eigenschaften:
 *  - **Kostenlos** (OSM Nominatim Public API)
 *  - **Gecached** im localStorage mit 3-Nachkommastellen-Granularität
 *    (≈ 110 m × Lat). Nach erstem Stop-Lookup nie wieder Netz nötig.
 *  - **Rate-limited** auf 1 req/sec wie von Nominatim T&C verlangt
 *    (Lazy-Init, gemeinsame Queue über alle Aufrufer).
 *  - **Soft-fail**: wenn Nominatim 4xx/5xx liefert oder das Netz hakt,
 *    wird `null` zurückgegeben — die UI fällt auf den Standard-Fallback
 *    zurück, kein Fehler-Banner.
 *
 * Privacy-Hinweis: GPS-Koords verlassen das Gerät und gehen zu
 * Nominatim (osm.org). Bei stark privaten Stops (Hotel-Zimmer etc.)
 * sind die Koords dann in Nominatims Logs sichtbar. Für die Reise-
 * Rückblick-Funktion ist das akzeptabel — keine personenbezogene
 * Verknüpfung, kein User-Identifier mitgesendet.
 */

import type { Coordinates } from "@/types/trip";

const CACHE_PREFIX = "rcmk:revgeo:";
const MIN_INTERVAL_MS = 1100; // 1 req/sec + 100 ms Puffer
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

let lastRequestAt = 0;
const inflight = new Map<string, Promise<string | null>>();

interface NominatimReverseResponse {
  address?: {
    road?: string;
    neighbourhood?: string;
    quarter?: string;
    suburb?: string;
    city_district?: string;
    village?: string;
    town?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

function cacheKey(coords: Coordinates): string {
  // 3 Nachkommastellen ~ 111 m in Lat. Für „in welchem Stadtteil"-
  // Granularität mehr als ausreichend — und nicht so viele Cache-
  // Einträge dass localStorage gesprengt wird.
  return `${CACHE_PREFIX}${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`;
}

function readCache(coords: Coordinates): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(cacheKey(coords));
    return v ?? null;
  } catch {
    return null;
  }
}

function writeCache(coords: Coordinates, label: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cacheKey(coords), label);
  } catch {
    // Quota voll oder localStorage gesperrt — ignorieren, ist nur Cache
  }
}

/**
 * Wählt das spezifischste sinnvolle Label aus dem Nominatim-Response.
 * Priorität: Stadtteil-Level > Straße > breitere Geo-Einheiten.
 */
function deriveLabel(data: NominatimReverseResponse): string | null {
  const a = data.address;
  if (!a) return null;
  return (
    a.neighbourhood ??
    a.quarter ??
    a.suburb ??
    a.city_district ??
    a.road ??
    a.village ??
    a.town ??
    a.city ??
    null
  );
}

/**
 * Hauptfunktion: gibt das beste Nominatim-Label für die Coords zurück
 * oder null wenn nichts ermittelbar ist.
 *
 * Cache-first. Bei In-flight-Request für die selbe Cache-Key wartet
 * der Aufrufer auf das laufende Promise (verhindert N parallele Calls
 * für die gleichen Coords beim First-Render eines Tags mit mehreren
 * Stops am selben Ort).
 */
export async function reverseGeocode(
  coords: Coordinates,
): Promise<string | null> {
  // 1. Cache
  const cached = readCache(coords);
  if (cached !== null) return cached;

  // 2. In-flight Dedup
  const key = cacheKey(coords);
  const existing = inflight.get(key);
  if (existing) return existing;

  // 3. Neue Anfrage — auf 1 req/sec drosseln (global queue)
  const promise = (async () => {
    const now = Date.now();
    const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - now);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();

    try {
      const url = `${NOMINATIM_URL}?lat=${coords.lat}&lon=${coords.lng}&zoom=16&format=json&accept-language=de`;
      const res = await fetch(url, {
        headers: {
          // Browser dürfen User-Agent nicht setzen — Nominatim akzeptiert
          // das, weil Referer automatisch mitkommt.
          Accept: "application/json",
        },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as NominatimReverseResponse;
      const label = deriveLabel(data);
      if (label) writeCache(coords, label);
      return label;
    } catch {
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
