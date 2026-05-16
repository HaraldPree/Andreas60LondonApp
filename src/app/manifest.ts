import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Andreas 60. Geburtstag · London",
    short_name: "Andrea London",
    description:
      "Reisebegleiter für Andreas 60. Geburtstag in London – ReiseCenter Mader-Kuoni",
    start_url: "/london-2026",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8F6F1",
    theme_color: "#003366",
    lang: "de-AT",
    categories: ["travel", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
