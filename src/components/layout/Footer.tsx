import Link from "next/link";
import { GoldDivider } from "@/components/ui/GoldDivider";
// v1.19.0 — Tagline + Reisebüro-/Plattform-Block aus Tenant-Config.
import { getCurrentTenant } from "@/lib/tenant/current";

export function Footer() {
  const tenant = getCurrentTenant();
  return (
    <footer className="mt-12 pb-32 px-4">
      <div className="mx-auto max-w-app text-center space-y-4">
        <GoldDivider width="sm" className="mx-auto" />

        <p className="font-display text-base text-navy font-semibold tracking-wide">
          {tenant.brand.tagline}
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
        <nav className="flex items-center justify-center gap-x-3 gap-y-1 text-[11px] flex-wrap">
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
            href="/agb"
            className="text-ink-light hover:text-navy underline"
          >
            AGB
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
          <span className="text-ink-light/40" aria-hidden="true">
            ·
          </span>
          <Link
            href="/impressum"
            className="text-ink-light hover:text-navy underline"
          >
            Impressum
          </Link>
        </nav>

        {/* v1.19.0 — Pilot-Reisebüro + Plattform-Hinweis. Bei
            Multi-Tenant (Phase 2) zeigt jeder Tenant hier seine eigene
            Reisebüro-Info, die Plattform-Zeile bleibt (hp+). */}
        <div className="pt-2 border-t border-cream-200 space-y-0.5">
          <p className="text-[10px] text-ink-light">
            Pilot-Reisebüro:{" "}
            <a
              href={`https://${tenant.agency.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-navy underline"
            >
              {tenant.agency.name}
            </a>{" "}
            · {tenant.agency.city}
          </p>
          <p className="text-[10px] text-ink-light">
            Plattform: {tenant.owner.name}, {tenant.owner.city}
          </p>
        </div>
      </div>
    </footer>
  );
}
