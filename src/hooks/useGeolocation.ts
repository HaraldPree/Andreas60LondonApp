"use client";

import { useCallback, useState } from "react";
import type { Coordinates } from "@/types/trip";

interface GeoState {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  permission: "prompt" | "granted" | "denied" | "unsupported";
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    coords: null,
    loading: false,
    error: null,
    permission: typeof navigator !== "undefined" && navigator.geolocation
      ? "prompt"
      : "unsupported",
  });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((s) => ({ ...s, permission: "unsupported", error: "Geolocation nicht verfügbar" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          loading: false,
          error: null,
          permission: "granted",
        });
      },
      (err) => {
        let msg = "Standort nicht verfügbar";
        let perm: GeoState["permission"] = "denied";
        if (err.code === err.PERMISSION_DENIED) msg = "Zugriff verweigert – im Browser erlauben";
        else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Standort konnte nicht ermittelt werden";
          perm = "granted";
        } else if (err.code === err.TIMEOUT) {
          msg = "Zeitüberschreitung";
          perm = "granted";
        }
        setState({
          coords: null,
          loading: false,
          error: msg,
          permission: perm,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const clear = useCallback(() => {
    setState((s) => ({ ...s, coords: null, error: null }));
  }, []);

  return { ...state, request, clear };
}

/** Distance in meters between two coordinates (Haversine). */
export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
