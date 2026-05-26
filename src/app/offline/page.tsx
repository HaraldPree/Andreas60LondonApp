"use client";

import Link from "next/link";
import { CloudOff, RefreshCw } from "lucide-react";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { getCurrentTenant } from "@/lib/tenant/current";

/**
 * v1.20.0 — Offline-Fallback-Page.
 *
 * Wird von next-pwa als `fallbacks.document` ausgeliefert wenn der
 * User eine **ungecachte** Route ohne Netz aufruft. Bereits besuchte
 * Seiten kommen aus dem Workbox-Cache (NetworkFirst-Strategie) und
 * brauchen diese Seite nicht.
 *
 * Client-Component weil wir einen onClick-Handler für „Nochmal
 * versuchen" brauchen (Window-Reload). Sonst wirft Next.js
 * „Event handlers cannot be passed to Client Component props".
 *
 * Bewusst ohne dynamische Daten, ohne API-Aufrufe, ohne Hooks die
 * Network bräuchten — die Seite muss garantiert ohne Verbindung
 * funktionieren.
 */
export default function OfflinePage() {
  const tenant = getCurrentTenant();
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-app w-full">
        <p className="font-display text-[11px] tracking-[0.22em] text-gold font-semibold uppercase">
          {tenant.brand.name}
        </p>
        <GoldDivider width="sm" className="mx-auto my-4" />

        <div className="w-16 h-16 rounded-full bg-cream-200 text-ink-mid flex items-center justify-center mx-auto mb-4">
          <CloudOff size={28} strokeWidth={1.8} />
        </div>

        <h1 className="font-display text-2xl font-semibold text-navy leading-tight">
          Du bist gerade offline
        </h1>

        <p className="text-sm text-ink-mid mt-3 leading-relaxed max-w-sm mx-auto">
          Bereits besuchte Seiten dieser App funktionieren weiter —
          einfach im Tab darunter wechseln oder zurück zur Reise gehen.
          Nur das was du noch nie geöffnet hattest, lädt jetzt nicht.
        </p>

        <p className="text-xs text-ink-light mt-2 leading-relaxed max-w-sm mx-auto">
          Eigene Fotos + Notizen liegen auf deinem Gerät und sind
          immer verfügbar.
        </p>

        <div className="mt-6 flex flex-col gap-2 items-center">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-cream text-sm font-semibold hover:bg-navy-700 transition shadow-sm"
          >
            <RefreshCw size={14} />
            Nochmal versuchen
          </button>
          <Link
            href="/"
            className="text-[12px] text-ink-mid hover:text-navy underline"
          >
            Zur Reise-Übersicht
          </Link>
        </div>

        <p className="text-[10px] text-ink-light italic mt-8">
          Funktioniert die App offline schlecht? Beim nächsten Online-
          Besuch wird sie für später vollständig vorbereitet (Cache
          läuft automatisch im Hintergrund).
        </p>
      </div>
    </div>
  );
}

