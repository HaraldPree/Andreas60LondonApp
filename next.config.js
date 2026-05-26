/** @type {import('next').NextConfig} */

// Service-Worker via next-pwa (schrittweise Polarsteps-Parität).
//   v1.20.0  static caching + offline fallback page (done)
//   v1.21.0  API-Caching: Open-Meteo Wetter, TfL Tube, /api/photos/list,
//             /api/flight-status (jetzt aktiv)
//   v1.22.0  Foto-Thumbnail-Caching (Vercel-Blob-URLs der geteilten
//             Galerie) — letzte Etappe für voll-offline-Erlebnis
//
// AUSGESCHLOSSEN vom Caching (bleiben immer online-frisch):
//   /api/version   → sonst funktioniert Update-Detection nicht
//   /api/chat      → LLM-Cost, jeder Call frisch
//   /api/photo-narrate → LLM-Cost
//   /api/research/events → LLM-Cost
//
// Library-Wahl: next-pwa wraps Workbox (Google-Standard). Vorteile gegenüber
// Vanilla-SW: keine Edge-Cases selbst bauen (iOS Safari, Samsung Internet),
// versionierte Caches mit Auto-Purge, sauberer Update-Flow.
const withPWA = require("next-pwa")({
  dest: "public",
  // SW im Dev-Modus deaktiviert — kein versehentliches Caching beim Entwickeln
  disable: process.env.NODE_ENV === "development",
  // Neuer SW übernimmt sofort beim nächsten App-Open. User-Update-Banner
  // (existing useVersionCheck) bleibt der eigentliche „Reload jetzt"-Trigger.
  register: true,
  skipWaiting: true,
  // Offline-Fallback: wenn User eine ungecachte Route offline aufruft,
  // landet er auf /offline statt im Browser-Fehlerbildschirm.
  // Wichtig: KEIN Underscore-Prefix — Next.js App Router behandelt
  // `_*`-Ordner als private folders und routet sie nicht.
  fallbacks: {
    document: "/offline",
  },
  // Workbox-Runtime-Caching. Reihenfolge zählt: erste passende Regel
  // gewinnt. API-Patterns kommen vor den static-Patterns damit sie
  // nicht versehentlich von der HTML-NetworkFirst-Regel gefangen werden.
  runtimeCaching: [
    // ═══════════════════════════════════════════════════════════════
    // v1.21.0 — API-Caching (Schritt b)
    // ═══════════════════════════════════════════════════════════════
    {
      // Open-Meteo Wetter-API. NetworkFirst mit 3s-Timeout: aktuell
      // wenn online, Cache wenn nicht. 30 Min Cache-Frische — Wetter
      // ändert sich nicht alle 5 Min.
      urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "weather-api",
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 30 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // TfL Tube-Status. Kurzer Cache (10 Min) — Streiks/Delays sind
      // zeitkritisch, aber offline lieber „letzter Stand" als gar nichts.
      urlPattern: /^https:\/\/api\.tfl\.gov\.uk\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "tfl-api",
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 10 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // Eigene App-API-Routes — nur idempotente Read-Calls cachen.
      // Bewusst NICHT in dieser Whitelist:
      //   /api/version       — sonst sieht useVersionCheck keine Updates
      //   /api/chat          — LLM-Cost, jede Frage frisch
      //   /api/photo-narrate — LLM-Cost
      //   /api/research/events — LLM-Cost
      //   /api/photos/share  — POST (wird ohnehin nicht gecacht)
      //   /api/login,logout  — Auth, niemals cachen
      urlPattern: /^\/api\/(photos\/list|flight-status)/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "app-api",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // v1.20.0 — Static-Caching (Schritt a)
    // ═══════════════════════════════════════════════════════════════
    {
      // Hero-Bilder, Icons, Avatare aus /public/images + /public/icons
      urlPattern: /\/(images|icons)\/.*\.(?:png|jpg|jpeg|webp|svg)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-images",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // Tile-Cache für Leaflet-Karten — offline-Karte ohne Pan/Zoom-Reload
      urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "osm-tiles",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
      },
    },
    {
      // Fonts (Playfair Display, DM Sans)
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-fonts",
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 90 },
      },
    },
    {
      // JS/CSS-Bundles aus Next.js
      urlPattern: /\/_next\/static\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // HTML-Seiten (App-Routes) — Network-First mit Cache-Fallback.
      // Damit ist navigieren offline möglich nach mind. einem Online-
      // Besuch der Seite.
      urlPattern: /^\/(?!api|_next).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "html-pages",
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 14 },
      },
    },
  ],
});

const securityHeaders = [
  // Prevent click-jacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Block MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer leakage when navigating off-site
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser APIs to same-origin only
  {
    key: "Permissions-Policy",
    value:
      "camera=(self), microphone=(self), geolocation=(self), payment=(), usb=(), accelerometer=(), gyroscope=()",
  },
  // Enforce HTTPS for 2 years (Vercel already does this, but explicit is better)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BUILD_VERSION:
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GITHUB_SHA ||
      `local-${Date.now()}`,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
