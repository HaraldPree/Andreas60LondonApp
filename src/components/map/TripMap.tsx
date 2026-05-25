"use client";

/**
 * v1.13.0 — Interaktive Leaflet-Karte für die Karte-Tab.
 *
 * Erfüllt Lastenheft 7.9 (Karte und Orte): "Alle relevanten Orte
 * erscheinen auf der Karte. Navigation kann aus Programmpunkten
 * gestartet werden. Karte kann nach Tagen/Kategorien/relevanten Orten
 * gefiltert werden."
 *
 * Schließt Polarsteps-Benchmark-Lücke (Mapbox-Equivalent mit OSM, kostenfrei).
 *
 * Wichtig: Komponente MUSS dynamisch importiert werden mit ssr:false,
 * da Leaflet `window`-Zugriff beim Mount macht (SSR-inkompatibel).
 */

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  Coordinates,
  MapPoint,
  MapPointCategory,
  Trip,
} from "@/types/trip";
import { mapsUrl } from "@/lib/formatters";

interface MapPointEx extends MapPoint {
  dayIdx?: number;
  _distance?: number;
}

interface Props {
  trip: Trip;
  points: MapPointEx[];
  userPosition?: Coordinates | null;
  /** Optional: nur diese eine POI zentrieren (z.B. nach Filter-Klick) */
  focusPoint?: Coordinates | null;
}

// ── Marker-Stil ───────────────────────────────────────────────

const CATEGORY_FALLBACK_ICONS: Record<MapPointCategory, string> = {
  sight: "🏛",
  food: "🍽",
  transport: "🚇",
  accommodation: "🏠",
  hidden: "✨",
};

/**
 * Markerfarben — abgeleitet aus Tailwind-Theme (siehe KarteTab.tsx
 * CATEGORY_COLORS). Hier als Hex, damit Inline-SVG/HTML in Leaflet
 * funktioniert.
 */
const CATEGORY_COLORS_HEX: Record<MapPointCategory, string> = {
  sight: "#003366",       // navy
  food: "#E5A00D",        // gold
  transport: "#2980B9",   // info
  accommodation: "#2D8F5E", // success
  hidden: "#D44638",      // warning
};

function makeMarkerIcon(category: MapPointCategory, icon?: string) {
  const emoji = icon ?? CATEGORY_FALLBACK_ICONS[category];
  const color = CATEGORY_COLORS_HEX[category];
  // DivIcon (HTML-basiert) statt PNG-Marker — keine Asset-Loading-Probleme
  // mit Next.js/Webpack, plus brand-konformer Look.
  return L.divIcon({
    className: "rcmk-poi-marker",
    html: `<div style="
      width: 36px;
      height: 36px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      line-height: 1;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    ">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -16],
  });
}

const USER_ICON = L.divIcon({
  className: "rcmk-user-marker",
  html: `<div style="
    width: 18px;
    height: 18px;
    background: #2980B9;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 8px rgba(41,128,185,0.25), 0 1px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -8],
});

// ── Bounds-Autofit ────────────────────────────────────────────

/**
 * Passt den View an, sodass alle Points + UserPosition sichtbar sind.
 * Bei focusPoint wird stattdessen dort hingezoomt.
 */
function ViewController({
  points,
  userPosition,
  focusPoint,
}: {
  points: MapPointEx[];
  userPosition?: Coordinates | null;
  focusPoint?: Coordinates | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusPoint) {
      map.setView([focusPoint.lat, focusPoint.lng], 16, { animate: true });
      return;
    }

    const coords: [number, number][] = points.map((p) => [
      p.coordinates.lat,
      p.coordinates.lng,
    ]);
    if (userPosition) coords.push([userPosition.lat, userPosition.lng]);

    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.setView(coords[0], 15, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
  }, [points, userPosition, focusPoint, map]);

  return null;
}

// ── Hauptkomponente ──────────────────────────────────────────

export function TripMap({ trip, points, userPosition, focusPoint }: Props) {
  const initialCenter: [number, number] = [
    trip.mapCenter.lat,
    trip.mapCenter.lng,
  ];

  return (
    <MapContainer
      center={initialCenter}
      zoom={trip.mapZoom}
      scrollWheelZoom={false} // Mobile-friendly default — verhindert Scroll-Klau
      style={{
        height: "100%",
        width: "100%",
        background: "#F8F6F1", // cream während Tiles laden
      }}
      attributionControl={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {points.map((p, i) => (
        <Marker
          key={`${p.name}-${p.coordinates.lat}-${p.coordinates.lng}-${i}`}
          position={[p.coordinates.lat, p.coordinates.lng]}
          icon={makeMarkerIcon(p.category, p.icon)}
        >
          <Popup>
            <div style={{ minWidth: 180, lineHeight: 1.4 }}>
              <strong
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#003366",
                  fontSize: 14,
                }}
              >
                {p.name}
              </strong>
              {typeof p.dayIdx === "number" && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    marginTop: 2,
                  }}
                >
                  Tag {p.dayIdx + 1}
                </div>
              )}
              <a
                href={mapsUrl(p.coordinates.lat, p.coordinates.lng, p.name)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#003366",
                  display: "inline-block",
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                In Google Maps öffnen ↗
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      {userPosition && (
        <Marker
          position={[userPosition.lat, userPosition.lng]}
          icon={USER_ICON}
        >
          <Popup>
            <strong style={{ color: "#2980B9" }}>Du bist hier</strong>
          </Popup>
        </Marker>
      )}

      <ViewController
        points={points}
        userPosition={userPosition}
        focusPoint={focusPoint}
      />
    </MapContainer>
  );
}
