"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * PWA-Retour-UX (v1.2.4).
 *
 * Wenn die App via Home-Screen-Shortcut direkt auf der Reise-Seite
 * gestartet wird (`start_url: "/london-2026"` im manifest.ts), hat
 * die Browser-History KEINEN vorherigen Eintrag. Die Retour-Geste
 * (iOS swipe-back, Android system-back) findet nichts zum Popen:
 *  - iOS Safari Standalone: PWA schließt sich
 *  - Firefox Android Standalone: grauer/schwarzer Bildschirm
 *  - Chrome Android Standalone: PWA-Switcher
 *
 * Lösung: beim Mount der Reise-Seite einen Sentinel-State pushen,
 * der bei popstate zur Übersicht "/" navigiert. Damit hat die Retour-
 * Geste ein konsistentes Ziel egal wie der User reinkommt.
 *
 * Nur aktiv wenn `history.length === 1` (PWA-Direct-Open ohne
 * vorherige Navigation). Wer via "/" reinkommt hat eh schon einen
 * History-Eintrag davor — Retour funktioniert natürlich.
 *
 * Verschachtelung mit `useDismissOnBack` (Modal-Sentinel): unser
 * Trip-Sentinel wird ZUERST gepusht, Modal-Sentinel kommt darüber.
 * Beim ersten Back schließt das Modal (Modal-Handler erkennt
 * unseren Trip-Flag und bleibt selbst untätig), beim zweiten Back
 * kommt unser Sentinel dran → Navigation zu /.
 */
export function useTripPageBackToHome() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Nur in PWA-Direct-Mode aktiv. Wenn der User über die Übersicht
    // navigiert ist, hat history.length bereits >= 2 — kein Eingriff
    // nötig, Retour funktioniert von selbst.
    if (window.history.length > 1) return;

    let popped = false;
    try {
      window.history.pushState({ rcmkTripBackToHome: true }, "");
    } catch {
      // pushState in manchen Embedded-WebViews gesperrt — degradieren.
      return;
    }

    const handlePop = (event: PopStateEvent) => {
      if (popped) return;
      const flag = (
        event.state as { rcmkTripBackToHome?: boolean } | null
      )?.rcmkTripBackToHome;
      // Wenn der NEUE state unser Sentinel ist, wurde nur ein Modal
      // darüber geschlossen — wir bleiben auf der Trip-Seite.
      if (flag) return;
      popped = true;
      router.replace("/");
    };

    window.addEventListener("popstate", handlePop);

    return () => {
      window.removeEventListener("popstate", handlePop);
      // Bewusst KEIN history.back() im Cleanup: wenn der User via
      // Link/Router wegnavigiert (z.B. /agb), soll die Trip-Sentinel
      // in der History bleiben — beim Zurück landet er dann sauber
      // auf der Trip-Seite, und ein weiterer Back geht zu /.
    };
  }, [router]);
}
