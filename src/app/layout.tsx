import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});

const jetBrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://birthdaytravelguidelondon.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Andreas 60. Geburtstag · London",
    template: "%s · London",
  },
  description:
    "Persönlicher Reisebegleiter für Andreas 60. Geburtstag in London (18.–22. Mai 2026) – Live-Wetter, Karte, Programm, Tube-Status & KI-Guide.",
  applicationName: "Andrea London",
  appleWebApp: {
    capable: true,
    title: "Andrea London",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Andreas 60. Geburtstag · London 2026",
    description:
      "Happy 60th, Andrea! Persönlicher Reisebegleiter mit Live-Wetter, Karte, KI-Guide und allem rund um Cedric Grolet, Big Ben und Co.",
    type: "website",
    locale: "de_AT",
    siteName: "Andrea London",
    images: [
      {
        url: "/images/Headerbild.jpeg",
        width: 880,
        height: 441,
        alt: "Happy 60th Andrea – London 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Andreas 60. Geburtstag · London 2026",
    description:
      "Happy 60th, Andrea! Live-Wetter, Karte, KI-Guide, Cedric Grolet & mehr.",
    images: ["/images/Headerbild.jpeg"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Andrea London",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#003366" },
    { media: "(prefers-color-scheme: dark)", color: "#003366" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${playfair.variable} ${dmSans.variable} ${jetBrains.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
