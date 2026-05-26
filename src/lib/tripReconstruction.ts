/**
 * v1.14.0 — Reise-Rückblick „Erlebt": Foto → Stops Algorithmus.
 *
 * Rekonstruiert aus den Foto-EXIF-Daten (GPS + Zeitstempel) was an
 * jedem Reise-Tag tatsächlich besucht wurde. Vollständig client-side,
 * keine API-Kosten — Anti-Halluzinations-konform (GPS lügt nicht, AI
 * Vision-Beschreibungen könnten).
 *
 * Vorgehen:
 *  1. Fotos eines Tages chronologisch sortieren
 *  2. Clustern: aufeinanderfolgende Fotos gehören zum selben Stop wenn
 *     - Zeit-Lücke < CLUSTER_TIME_GAP_MIN UND
 *     - Distanz < CLUSTER_DISTANCE_M (bei vorhandenem GPS)
 *  3. Pro Cluster: Center-of-Mass berechnen, nächsten Place aus der
 *     trip.places-Library suchen (Haversine, Radius PLACE_MATCH_RADIUS_M)
 *  4. Liste der Stops zurückgeben — gematchte zeigen Place-Name + Icon,
 *     ungematchte „Stopp ohne Place-Match" / „Stopp ohne GPS"
 *
 * Limitierungen:
 *  - Fotos ohne GPS können trotzdem geclustert werden, aber bekommen
 *    keinen Place-Match (sind dann „Stopp ohne GPS")
 *  - Sehr kurze Stops (z.B. Foto-Halt aus dem Bus) sehen aus wie eigene
 *    Cluster — das ist gewollt, der User sieht ehrliche Daten
 *  - Indoor-GPS ist ungenau (±50–100 m) → Radius 150 m großzügig gewählt
 */

import type { Coordinates } from "@/types/trip";
import type { Place } from "@/types/place";
import type { PhotoMeta } from "@/types/photo";
import { distanceMeters } from "@/hooks/useGeolocation";

// ═══════════════════════════════════════════════════════════════
// Tuning-Konstanten (bewusst exportiert für mögliches Per-Trip-Tuning)
// ═══════════════════════════════════════════════════════════════

/**
 * Pause zwischen zwei Fotos die einen neuen Stop einläutet.
 * v1.14.2 — von 45 auf 60 Min hochgezogen: London-Reisende
 * verbringen oft mehr als 45 Min an einem Ort ohne zu fotografieren
 * (Restaurant, Tour-Pause, Museum-Detail).
 */
export const CLUSTER_TIME_GAP_MIN = 60;

/**
 * Sprung-Distanz die einen neuen Stop einläutet (nur bei GPS-Vergleich).
 * v1.14.2 — von 250 auf 400 m: bei sehr großzügigem Indoor-GPS-Drift
 * (Tower of London, V&A etc., ±50–150 m) führten 250 m zu künstlichen
 * Cluster-Splits innerhalb ein und desselben Ortes.
 */
export const CLUSTER_DISTANCE_M = 400;

/**
 * Maximaler Abstand zwischen Cluster-Center und Place für Match.
 * v1.14.2 — von 150 auf 300 m hochgezogen: viele Place-Library-
 * Koordinaten zeigen aufs Building-Center, GPS aus Indoor-Aufnahmen
 * kann aber leicht 100–200 m daneben sein. 300 m fängt das ab, ohne
 * Nachbar-Places falsch zu matchen (typischer Place-Abstand in der
 * London-Library: 500 m+).
 */
export const PLACE_MATCH_RADIUS_M = 300;

/**
 * v1.22.1 — Thumbnail-Dedup-Konstanten. Innerhalb eines Stops bildet
 * der Algorithmus Sub-Cluster: Fotos die zeitlich nah UND örtlich
 * nah sind = vermutlich dieselbe Szene (Burst-Shot oder mehrere
 * Reisende fotografieren das Gleiche). Sub-Cluster bekommt EINEN
 * Repräsentanten.
 */
/** Max Sekunden zwischen zwei Fotos um als „dieselbe Szene" zu gelten. */
export const SUB_CLUSTER_TIME_GAP_S = 30;
/** Max Meter zwischen zwei Fotos um als „dieselbe Szene" zu gelten. */
export const SUB_CLUSTER_DISTANCE_M = 5;
/** Anzahl Thumbnails die der Rückblick pro Stop anzeigt. */
export const THUMBNAIL_TARGET_COUNT = 3;

// ═══════════════════════════════════════════════════════════════
// Public types
// ═══════════════════════════════════════════════════════════════

export interface ReconstructedStop {
  /** Stabile ID für React-Keys (basiert auf Cluster-Position + erstes Foto). */
  id: string;
  /** Wenn Match vorhanden: Place-ID aus der Library */
  placeId?: string;
  /** Anzeigename. Bei Match: place.name. Sonst Fallback-Text. */
  placeName: string;
  /** Emoji wenn Place gematched. */
  placeIcon?: string;
  /** Kategorie wenn Place gematched (für Farb-Styling). */
  placeCategory?: Place["category"];
  /** Center-of-Mass der Foto-Coords (undefined wenn kein Foto GPS hatte). */
  coords?: Coordinates;
  /** ISO-Timestamp des frühesten Fotos im Cluster. */
  startAt: string;
  /** ISO-Timestamp des spätesten Fotos im Cluster. */
  endAt: string;
  /** Foto-IDs in chronologischer Reihenfolge — zum Thumbnail-Laden. */
  photoIds: string[];
  /**
   * Ob die Foto-IDs zur eigenen IndexedDB (own) oder zur Shared-Galerie
   * gehören. Wichtig fürs Thumbnail-Loading (IndexedDB vs HTTP).
   */
  photoSources: Array<"own" | "shared">;
  /**
   * v1.22.1 — Vorgewählte Thumbnail-Referenzen für die Erlebt-Anzeige.
   * Enthält max. `THUMBNAIL_TARGET_COUNT` (= 3) IDs, vorausgewählt durch
   * Sub-Cluster-Dedup (vermeidet 3× dasselbe Foto wenn mehrere Reisende
   * dieselbe Szene fotografiert haben) + Visual-Spread (zeitlich
   * verteilte Auswahl statt erste 3 in Folge).
   *
   * UI nutzt `thumbnails` (nicht `photoIds.slice(0,3)`); für die
   * Gesamt-Anzahl-Anzeige („+N weitere") bleibt `photoIds.length`.
   */
  thumbnails: Array<{ id: string; source: "own" | "shared" }>;
  /** Distanz zum Place-Match in Metern — für Debug + UI „ca. 80m entfernt". */
  matchDistanceM?: number;
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

/**
 * Internes Photo-Shape für die Reconstruction. Vereinheitlicht
 * eigene Fotos (IndexedDB) + geteilte Fotos (Vercel Blob) auf das
 * Minimum was wir brauchen.
 */
export interface PhotoForReconstruction {
  id: string;
  takenAt: string;
  coordinates?: Coordinates;
  assignedDay?: number;
  source: "own" | "shared";
}

/**
 * Rekonstruiert die Stops eines einzelnen Tages aus seinen Fotos.
 * Photos müssen vorher per `groupPhotosByDay` zugeordnet worden sein.
 */
export function reconstructDay(
  photos: PhotoForReconstruction[],
  places: Place[],
): ReconstructedStop[] {
  if (photos.length === 0) return [];

  // Stabil sortieren (gleiche Zeit → stabile Reihenfolge per ID)
  const sorted = [...photos].sort((a, b) => {
    const t = a.takenAt.localeCompare(b.takenAt);
    return t !== 0 ? t : a.id.localeCompare(b.id);
  });

  // Cluster aufbauen — greedy, aufeinanderfolgende Fotos prüfen
  const clusters: PhotoForReconstruction[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const photo = sorted[i];
    const lastCluster = clusters[clusters.length - 1];
    const lastPhoto = lastCluster[lastCluster.length - 1];

    const timeDiffMs =
      new Date(photo.takenAt).getTime() - new Date(lastPhoto.takenAt).getTime();
    const timeDiffMin = timeDiffMs / 60000;

    // Distanz nur prüfen wenn beide Fotos GPS haben — sonst nicht „abzweigen"
    let distOk = true;
    if (photo.coordinates && lastPhoto.coordinates) {
      const d = distanceMeters(photo.coordinates, lastPhoto.coordinates);
      distOk = d < CLUSTER_DISTANCE_M;
    }

    const sameCluster = timeDiffMin < CLUSTER_TIME_GAP_MIN && distOk;
    if (sameCluster) {
      lastCluster.push(photo);
    } else {
      clusters.push([photo]);
    }
  }

  // Pro Cluster einen Stop bauen
  return clusters.map((cluster, idx) => {
    const center = computeCenter(cluster);
    const match = center
      ? nearestPlace(center, places, PLACE_MATCH_RADIUS_M)
      : null;

    const placeName = match?.place.name
      ? match.place.name
      : center
        ? "Stopp ohne Place-Match"
        : "Stopp ohne GPS";

    return {
      id: `stop-${idx}-${cluster[0].id}`,
      placeId: match?.place.id,
      placeName,
      placeIcon: match?.place.icon,
      placeCategory: match?.place.category,
      coords: center,
      startAt: cluster[0].takenAt,
      endAt: cluster[cluster.length - 1].takenAt,
      photoIds: cluster.map((p) => p.id),
      photoSources: cluster.map((p) => p.source),
      // v1.22.1 — vorgewählte Thumbnails mit Sub-Cluster-Dedup
      thumbnails: selectRepresentativeThumbnails(cluster, THUMBNAIL_TARGET_COUNT),
      matchDistanceM: match?.distanceM,
    };
  });
}

/**
 * Gruppiert Fotos pro Tag-Index. Nutzt vorhandenes `assignedDay` falls
 * gesetzt (User hat manuell zugeordnet oder Upload-Logik hat's gemacht),
 * sonst fällt auf Datum-Vergleich mit `day.isoDate` zurück.
 *
 * Fotos die keinem Tag zugeordnet werden können (außerhalb Reisedatum)
 * landen unter Key -1 — Caller entscheidet ob die angezeigt werden.
 */
export function groupPhotosByDay(
  photos: PhotoForReconstruction[],
  days: Array<{ isoDate?: string }>,
): Map<number, PhotoForReconstruction[]> {
  const map = new Map<number, PhotoForReconstruction[]>();
  for (const p of photos) {
    let dayIdx: number | undefined = p.assignedDay;
    if (dayIdx == null) {
      const dateOnly = p.takenAt.slice(0, 10);
      const found = days.findIndex((d) => d.isoDate === dateOnly);
      dayIdx = found >= 0 ? found : -1;
    }
    const arr = map.get(dayIdx) ?? [];
    arr.push(p);
    map.set(dayIdx, arr);
  }
  return map;
}

// ═══════════════════════════════════════════════════════════════
// Internals
// ═══════════════════════════════════════════════════════════════

function computeCenter(
  photos: PhotoForReconstruction[],
): Coordinates | undefined {
  const withGps = photos.filter((p) => p.coordinates);
  if (withGps.length === 0) return undefined;
  const sumLat = withGps.reduce((s, p) => s + p.coordinates!.lat, 0);
  const sumLng = withGps.reduce((s, p) => s + p.coordinates!.lng, 0);
  return {
    lat: sumLat / withGps.length,
    lng: sumLng / withGps.length,
  };
}

function nearestPlace(
  coord: Coordinates,
  places: Place[],
  maxDistanceM: number,
): { place: Place; distanceM: number } | null {
  let best: { place: Place; distanceM: number } | null = null;
  for (const p of places) {
    const d = distanceMeters(coord, p.coordinates);
    if (d <= maxDistanceM && (!best || d < best.distanceM)) {
      best = { place: p, distanceM: d };
    }
  }
  return best;
}

// ═══════════════════════════════════════════════════════════════
// v1.22.1 — Thumbnail-Selection mit Sub-Cluster-Dedup + Visual Spread
// ═══════════════════════════════════════════════════════════════

/**
 * Bildet innerhalb eines Stops Sub-Cluster — Fotos die zeitlich UND
 * örtlich sehr nah sind = dieselbe Szene aus mehreren Devices oder
 * Burst-Shot.
 *
 * User-Feedback Mai 2026: „5 Reiseteilnehmer, jeder lädt das gleiche
 * Bild hoch → 5× gleiches Bild hintereinander". Plus eigener Burst.
 * Sub-Cluster fängt das ab.
 */
function buildSubClusters(
  photos: PhotoForReconstruction[],
): PhotoForReconstruction[][] {
  if (photos.length === 0) return [];

  // Chronologisch sortieren (Cluster ist normalerweise schon sortiert,
  // aber sicherheitshalber)
  const sorted = [...photos].sort((a, b) => {
    const t = a.takenAt.localeCompare(b.takenAt);
    return t !== 0 ? t : a.id.localeCompare(b.id);
  });

  const subClusters: PhotoForReconstruction[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const photo = sorted[i];
    const lastSub = subClusters[subClusters.length - 1];
    const lastPhoto = lastSub[lastSub.length - 1];

    const timeDiffMs =
      new Date(photo.takenAt).getTime() - new Date(lastPhoto.takenAt).getTime();
    const timeDiffS = Math.abs(timeDiffMs) / 1000;

    let coordsClose = true;
    if (photo.coordinates && lastPhoto.coordinates) {
      const d = distanceMeters(photo.coordinates, lastPhoto.coordinates);
      coordsClose = d < SUB_CLUSTER_DISTANCE_M;
    }
    // Wenn min. eines kein GPS hat: Zeit allein entscheidet — strenger
    // (10s statt 30s) damit nicht alles in einen Sub-Cluster fällt.
    const effectiveTimeGapS =
      !photo.coordinates || !lastPhoto.coordinates
        ? Math.min(SUB_CLUSTER_TIME_GAP_S, 10)
        : SUB_CLUSTER_TIME_GAP_S;

    if (timeDiffS < effectiveTimeGapS && coordsClose) {
      lastSub.push(photo);
    } else {
      subClusters.push([photo]);
    }
  }

  return subClusters;
}

/**
 * Wählt einen Repräsentanten pro Sub-Cluster. Eigene Fotos haben
 * Priorität (typischerweise höhere Qualität, schnellerer Zugriff aus
 * IndexedDB statt HTTP).
 */
function pickRepresentative(
  subCluster: PhotoForReconstruction[],
): PhotoForReconstruction {
  const ownFirst = subCluster.find((p) => p.source === "own");
  return ownFirst ?? subCluster[0];
}

/**
 * Wählt aus den Sub-Cluster-Repräsentanten `count` zeitlich verteilte
 * Fotos für die Thumbnail-Anzeige.
 *
 * Beispiel: 9 Sub-Cluster, count=3 → Indizes [0, 4, 8] (Anfang/Mitte/Ende).
 * Damit sieht der User visuell „diverse" Momente statt 3 fast identische
 * Burst-Aufnahmen.
 */
export function selectRepresentativeThumbnails(
  photos: PhotoForReconstruction[],
  count: number,
): Array<{ id: string; source: "own" | "shared" }> {
  if (photos.length === 0) return [];
  if (count <= 0) return [];

  // 1. Sub-Cluster bilden + Repräsentanten pro Sub-Cluster wählen
  const subClusters = buildSubClusters(photos);
  const representatives = subClusters.map(pickRepresentative);

  // 2. Wenn weniger oder gleich viele Repräsentanten wie gewünscht:
  //    alle nehmen
  if (representatives.length <= count) {
    return representatives.map((p) => ({ id: p.id, source: p.source }));
  }

  // 3. Visual Spread: zeitlich verteilte Auswahl
  const picks: PhotoForReconstruction[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * (representatives.length - 1)) / (count - 1));
    picks.push(representatives[idx]);
  }

  return picks.map((p) => ({ id: p.id, source: p.source }));
}

// ═══════════════════════════════════════════════════════════════
// Helper für UI-Anzeige
// ═══════════════════════════════════════════════════════════════

/** Formatiert ISO-Zeit als „HH:MM" in lokaler Zeitzone. */
export function formatStopTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(11, 16);
  }
}

/** Zeit-Range „10:15 – 10:48" oder nur „10:15" wenn Single-Photo. */
export function formatStopTimeRange(startAt: string, endAt: string): string {
  const s = formatStopTime(startAt);
  const e = formatStopTime(endAt);
  return s === e ? s : `${s} – ${e}`;
}
