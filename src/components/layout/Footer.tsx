import Link from "next/link";
import { GoldDivider } from "@/components/ui/GoldDivider";

export function Footer() {
  return (
    <footer className="mt-12 pb-32 px-4">
      <div className="mx-auto max-w-app text-center">
        <GoldDivider width="sm" className="mx-auto mb-4" />
        <p className="font-display text-base text-navy font-semibold tracking-wide">
          Dein persönlicher Reisebegleiter
        </p>
        <p className="text-xs text-ink-light mt-3 inline-flex items-center gap-1.5">
          erstellt mit
          <span
            className="text-warning text-base inline-block animate-heartbeat origin-center"
            aria-hidden="true"
          >
            ♥
          </span>
          unterwegs
        </p>
        <div className="inline-flex items-center gap-3 mt-3 text-[11px]">
          <Link
            href="/anleitung"
            className="text-ink-light hover:text-navy underline"
          >
            Anleitung
          </Link>
          <span className="text-ink-light/40">·</span>
          <Link
            href="/datenschutz"
            className="text-ink-light hover:text-navy underline"
          >
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}
