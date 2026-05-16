import Link from "next/link";
import { GoldDivider } from "@/components/ui/GoldDivider";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <p className="font-display text-[11px] tracking-[0.22em] text-gold font-semibold uppercase">
        Travel Companion
      </p>
      <GoldDivider width="sm" className="my-4" />
      <h1 className="font-display text-3xl font-semibold text-navy">
        Reise nicht gefunden
      </h1>
      <p className="text-sm text-ink-mid mt-3 max-w-xs">
        Die angefragte Reise existiert nicht oder wurde noch nicht freigegeben.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block px-5 py-2.5 rounded-full bg-navy text-cream text-sm font-semibold hover:bg-navy-600 transition"
      >
        ← Zur Übersicht
      </Link>
    </div>
  );
}
