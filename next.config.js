/** @type {import('next').NextConfig} */

// v1.21.2 — Package-Version für User-sichtbare Anzeige (Info-Tab Footer).
const pkg = require("./package.json");

// v1.22.0 — Service-Worker Comeback nach Open-Meteo-Erkenntnis.
//
// Rückblick: v1.20.0 hatte Static-Caching + Offline-Page. Hat technisch
// vermutlich funktioniert — wir haben es falsch interpretiert, weil zur
// selben Zeit Open-Meteo's API mit HTTP 502 down war (siehe
// `releases/v1.21.4.md`). v1.21.0-v1.21.3 waren halber Tag SW-Bug-Jagd
// für einen externen API-Ausfall.
//
// Heute (v1.22.0): SW wieder eingeschaltet, aber bewusst **NUR
// Static-Caching** — kein Cross-Origin, keine eigene API. Das war
// die Architektur die schon in v1.20.0 funktional war und keinen
// echten Bug verursacht hat.
//
// Future-Etappen falls gewünscht:
//   v1.23.0 (optional) /api/weather-Server-Proxy (Same-Origin)
//   v1.24.0 (optional) SW-Caching für Same-Origin-API-Routes
//   Cross-Origin-Caching: bleibt deaktiviert (Open-Meteo, TfL direkt)
//
// User mit altem v1.20-v1.21.x-SW werden vom ServiceWorkerCleanup-
// Hook (in RootLayout, mit Idempotenz-Flag v1.22.0+) einmalig aufgeräumt.
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Workbox räumt alte Cache-Versionen automatisch auf bei SW-Updates
  cleanupOutdatedCaches: true,
  // Offline-Fallback wenn User eine ungecachte Route ohne Netz aufruft.
  // Wichtig: KEIN Underscore-Prefix — Next.js App Router behandelt
  // `_*`-Ordner als private folders und routet sie nicht.
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
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
      // OSM-Tiles für Leaflet — offline-Karte für besuchte Regions
      urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "osm-tiles",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
      },
    },
    {
      // Fonts (Playfair Display, DM Sans, JetBrains Mono)
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-fonts",
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 90 },
      },
    },
    {
      // Next.js JS/CSS-Bundles
      urlPattern: /\/_next\/static\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // HTML-Pages (App-Routes) — NetworkFirst mit Cache-Fallback.
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
    // BEWUSST KEIN CROSS-ORIGIN-CACHING (Open-Meteo, TfL etc.) —
    // war die Bug-Quelle in v1.21.0. Wetter-Resilienz läuft jetzt
    // über localStorage-Cache im useWeather-Hook (v1.21.4).
    // BEWUSST KEIN EIGENES API-CACHING — kommt ggf. in v1.24.0,
    // wenn überhaupt nötig.
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
    // v1.21.2 — Semver-Version aus package.json für User-sichtbare
    // Anzeige (Info-Tab Footer). Build-SHA bleibt zusätzlich für
    // Debug-Reports.
    NEXT_PUBLIC_APP_VERSION: pkg.version,
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
