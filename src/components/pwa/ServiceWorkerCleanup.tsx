"use client";

import { useEffect } from "react";

/**
 * v1.21.2 — Cleanup-Hook für alte Service-Worker.
 *
 * Hintergrund: v1.20.0–v1.21.1 hatten Service-Worker installiert. Bei
 * v1.21.1 wurde der SW per Hotfix korrigiert, aber Workbox+Cross-Origin
 * blieben unzuverlässig (Wetter blieb tot). Pragmatischer Schritt:
 * SW komplett deaktiviert in v1.21.2 (`next-pwa` `disable: true`).
 *
 * Problem dabei: Der ALTE SW im Browser läuft weiter bis er explizit
 * geunregistert ist. Dieser Hook macht das beim ersten App-Mount:
 *  1. Findet alle registrierten Service-Worker
 *  2. Deregistert jeden (`reg.unregister()`)
 *  3. Löscht alle bekannten Workbox- + App-Caches
 *
 * Effekt für User: beim nächsten Reload ist die App SW-frei, Wetter
 * funktioniert wieder direkt online.
 *
 * **Wenn wir später SW wieder einführen**: diesen Hook entfernen, sonst
 * killt er bei jedem App-Open den neuen SW.
 */
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") return;

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
