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

export const metadata: Metadata = {
  title: "RCMK Travel Companion",
  description:
    "Ihr persönlicher Reisebegleiter vom ReiseCenter Mader-Kuoni – Live-Wetter, Karte, Reservierungen und Tagesplan in einer App.",
  manifest: "/manifest.json",
  openGraph: {
    title: "RCMK Travel Companion",
    description: "Ihre Reise in einer App – ReiseCenter Mader-Kuoni",
    type: "website",
    locale: "de_AT",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#003366",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${playfair.variable} ${dmSans.variable} ${jetBrains.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
