import Link from "next/link";
import { GoldDivider } from "@/components/ui/GoldDivider";

export function Footer() {
  return (
    <footer className="mt-12 pb-32 px-4">
      <div className="mx-auto max-w-app text-center space-y-4">
        <GoldDivider width="sm" className="mx-auto" />

        <p className="font-display text-base text-navy font-semibold tracking-wide">
          Dein persönlicher Reisebegleiter
        </p>

        {/* "erstellt mit ♥ unterwegs" — block-level flex so it stays
            on its own line and centers cleanly, with proper gaps. */}
        <p className="text-xs text-ink-light flex items-center justify-center gap-1.5">
          <span>erstellt mit</span>
          <span
            className="text-warning text-base inline-block animate-heartbeat origin-center"
            aria-hidden="true"
          >
            ♥
          </span>
          <span>unterwegs</span>
        </p>

        {/* Footer links — own row, well-spaced, block-level so they
            don't sit next to the heart line. */}
        <nav className="flex items-center justify-center gap-3 text-[11px] flex-wrap">
          <Link
            href="/anleitung"
            className="text-ink-light hover:text-navy underline"
          >
            Anleitung
          </Link>
          <span className="text-ink-light/40" aria-hidden="true">
            ·
          </span>
          <Link
            href="/impressum"
            className="text-ink-light hover:text-navy underline"
          >
            Impressum
          </Link>
          <span className="text-ink-light/40" aria-hidden="true">
            ·
          </span>
          <Link
            href="/datenschutz"
            className="text-ink-light hover:text-navy underline"
          >
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
