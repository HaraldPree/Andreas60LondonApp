"use client";

import { useEffect } from "react";

/**
 * v1.21.2 — Cleanup-Hook für alte Service-Worker aus v1.20.0–v1.21.x.
 * v1.22.0 — Mit localStorage-Flag versehen: läuft genau EINMAL pro
 * Browser, danach NIE wieder. Sonst würde der Hook bei jedem App-Open
 * den NEUEN v1.22.0+ SW direkt nach Install wieder killen — und wir
 * hätten dauerhaft keinen funktionierenden SW.
 *
 * Verhalten:
 *  - 1. Visit nach v1.22.0-Deploy: Flag noch nicht gesetzt → Cleanup
 *    läuft (alte v1.20-v1.21.x SWs werden gekillt, Caches gelöscht,
 *    Tab reloaded). Flag wird gesetzt.
 *  - 2. + alle weiteren Visits: Flag gesetzt → Hook returns sofort →
 *    neuer v1.22.0+ SW darf installieren + laufen.
 *  - Frischer User der nie alten SW hatte: Cleanup läuft trotzdem
 *    einmal leer durch (kostet ~5ms), Flag wird gesetzt, fine.
 *
 * Bei künftigem grundlegendem SW-Reset (z.B. v1.30.0 mit komplett
 * neuer Caching-Strategie): einfach `CLEANUP_DONE_KEY` auf v2/v3
 * incrementieren — alle User durchlaufen Cleanup einmalig erneut.
 */

const CLEANUP_DONE_KEY = "travelConcierge:sw-cleanup-done:v1";

export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // v1.22.0 — Idempotenz-Flag: einmal gelaufen, nie wieder.
    try {
      if (window.localStorage.getItem(CLEANUP_DONE_KEY)) {
        return;
      }
      // Sofort Flag setzen — damit selbst bei Race-Conditions (z.B.
      // schneller Tab-Switch während Cleanup läuft) nicht doppelt
      // gefeuert wird.
      window.localStorage.setItem(CLEANUP_DONE_KEY, new Date().toISOString());
    } catch {
      // localStorage disabled → kein Flag, Cleanup kann zwar mehrfach
      // laufen aber ist idempotent, kein Schaden.
    }

    // 1. SW unregister
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          if (regs.length === 0) return;
          regs.forEach((reg) => {
            reg
              .unregister()
              .then((success) => {
                if (success) {
                  // eslint-disable-next-line no-console
                  console.info("[SW-Cleanup] unregistered:", reg.scope);
                }
              })
              .catch(() => {
                /* silent */
              });
          });
        })
        .catch(() => {
          /* getRegistrations not available (Firefox private mode etc.) */
        });
    }

    // 2. Caches löschen — Workbox-Precache + alle benannten Runtime-Caches
    //    aus v1.20.0–v1.21.1. Wenn der User noch IndexedDB-Photos hat,
    //    bleibt das unangetastet (caches API ≠ IndexedDB).
    const STALE_CACHE_NAMES = [
      "weather-api",
      "tfl-api",
      "app-api",
      "static-images",
      "osm-tiles",
      "static-fonts",
      "next-static",
      "html-pages",
    ];
    if ("caches" in window) {
      caches
        .keys()
        .then((names) => {
          names.forEach((name) => {
            const matches =
              STALE_CACHE_NAMES.includes(name) ||
              name.startsWith("workbox-") ||
              name.startsWith("next-precache") ||
              name.startsWith("next-data");
            if (matches) {
              caches
                .delete(name)
                .then((deleted) => {
                  if (deleted) {
                    // eslint-disable-next-line no-console
                    console.info("[SW-Cleanup] cache deleted:", name);
                  }
                })
                .catch(() => {
                  /* silent */
                });
            }
          });
        })
        .catch(() => {
          /* silent */
        });
    }
  }, []);

  return null;
}
