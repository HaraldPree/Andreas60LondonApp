import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Andreas 60. Geburtstag · London",
    short_name: "Andrea London",
    description:
      "Persönlicher Reisebegleiter für Andreas 60. Geburtstag in London",
    start_url: "/london-2026",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8F6F1",
    theme_color: "#003366",
    lang: "de-AT",
    categories: ["travel", "lifestyle"],
    // Home-screen icons: Andrea's photo (square-cropped). Pre-rendered as
    // static PNGs via `node scripts/build-pwa-icons.mjs` because Android
    // adaptive-icon launchers prefer exact-size matches and runtime
    // ImageResponse fails on Windows paths with spaces during build.
    icons: [
      {
        src: "/icons/andrea-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/andrea-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Same source as "any" — Samsung One UI / Pixel launchers crop
        // this into a circle/squircle. Andrea's face is centred so the
        // safe-zone crop keeps her smile visible.
        src: "/icons/andrea-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/andrea-180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
