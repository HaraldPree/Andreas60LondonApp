/**
 * v1.21.3 — Self-Destroying Service-Worker (Kill-Switch).
 *
 * Hintergrund: User mit altem SW aus v1.20.0–v1.21.1 bekommen die
 * neue Code-Version (mit React-Cleanup-Hook in v1.21.2) nicht
 * angeliefert — der alte SW liefert noch die alte HTML-Page aus seinem
 * Cache, also läuft der Cleanup-Hook nie. Klassischer „SW-Death-Loop".
 *
 * Lösung: dieser Kill-Switch-SW. Browser prüft regelmäßig auf
 * `/sw.js`-Updates (bei jedem Page-Visit + alle ~24h periodisch).
 * Findet er diese Version, wird sie installiert + aktiviert. Bei
 * Activate räumt sie alles auf:
 *   1. alle Caches löschen
 *   2. sich selbst deregistern
 *   3. alle offenen Tabs reloaden (= neue HTML-Page wird geladen,
 *      SW-frei, Wetter funktioniert direkt online)
 *
 * Idempotent: wenn nach erfolgreichem Cleanup nochmal getriggert,
 * macht nix kaputt (kein Cache da, kein SW da → schnell durch).
 *
 * Wichtig: kein `fetch`-Handler — der SW soll während seiner kurzen
 * Lebenszeit NICHTS intercepten. Browser handelt alle Requests selbst.
 *
 * Wenn wir später SW wieder einführen (geplant v1.22.0 mit static-only):
 * diese Datei muss durch den neuen SW ersetzt werden. Alle User die
 * den Kill-Switch durchlaufen haben sind dann sauber für den neuen SW.
 */

self.addEventListener("install", () => {
  // Sofort aktivieren, nicht auf nächsten Tab-Close warten
  // eslint-disable-next-line no-console
  console.info("[Kill-Switch SW] install — skipWaiting");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // eslint-disable-next-line no-console
  console.info("[Kill-Switch SW] activate — running cleanup");
  event.waitUntil(
    (async () => {
      try {
        // 1. Alle Caches löschen (Workbox-Precache + alle Runtime-Caches
        //    aus v1.20.0/v1.21.x).
        if (typeof caches !== "undefined") {
          const names = await caches.keys();
          await Promise.all(
            names.map((name) => {
              // eslint-disable-next-line no-console
              console.info("[Kill-Switch SW] deleting cache:", name);
              return caches.delete(name);
            }),
          );
        }

        // 2. Sich selbst deregistern
        await self.registration.unregister();
        // eslint-disable-next-line no-console
        console.info("[Kill-Switch SW] self unregistered");

        // 3. Alle offenen Tabs reloaden — damit das HTML neu vom Server
        //    geladen wird, ohne SW-Interception. Wetter funktioniert
        //    dann direkt online.
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          // eslint-disable-next-line no-console
          console.info("[Kill-Switch SW] reloading client:", client.url);
          if ("navigate" in client) {
            await client.navigate(client.url);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[Kill-Switch SW] cleanup failed:", err);
      }
    })(),
  );
});

// Bewusst KEIN fetch-Handler — Browser handelt alle Requests selbst.
// Der SW lebt nur lang genug um sich zu deregistern.
