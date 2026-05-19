"use client";

import { useEffect, useRef } from "react";

let overlayCounter = 0;

/**
 * Schließt ein Overlay (Modal / Sheet / Drawer / Lightbox) wenn der
 * Browser-Back-Button oder die iOS-Swipe-Back-Geste benutzt wird.
 *
 * Vorgeschichte (v1.2.3): iOS-User haben beim Swipe-Back im Foto-Share-
 * Modal einen grauen Bildschirm gesehen — die Geste hat die Browser-
 * History zurückgesetzt, das Modal blieb aber sichtbar mit kaputtem
 * Stacking-Context.
 *
 * Mechanik:
 *  1. Beim Öffnen pusht der Hook einen Sentinel-State in die History
 *     (mit eindeutiger ID damit auch verschachtelte Overlays nicht
 *     gegenseitig schließen).
 *  2. Bei popstate: prüft ob das Event "zurück zu MIR" geht (state.id
 *     stimmt → ignorieren, Overlay bleibt offen) oder "an mir vorbei"
 *     (state.id stimmt nicht → onClose).
 *  3. Beim Schließen via X / Backdrop / setState: pop'd der Hook
 *     seinen Sentinel sauber zurück, damit keine Phantom-Einträge in
 *     der History bleiben.
 *
 * @param open  ob das Overlay aktuell sichtbar ist
 * @param onClose Callback der das Overlay schließt
 */
export function useDismissOnBack(open: boolean, onClose: () => void) {
  // Stable callback ref — wir wollen die popstate-Listener-Identität
  // nicht bei jedem Re-Render des Parents wechseln.
  const callbackRef = useRef(onClose);
  useEffect(() => {
    callbackRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    overlayCounter += 1;
    const myStateId = `rcmk-overlay-${overlayCounter}-${Date.now()}`;
    let popDispatched = false;

    try {
      window.history.pushState({ rcmkOverlayId: myStateId }, "");
    } catch {
      // Manche Embedded-WebViews blockieren pushState — dann degradieren
      // wir still: das Overlay bleibt funktional, nur die Swipe-Back-
      // Geste wirkt wie zuvor (= unschön, aber nicht kaputter als jetzt).
      return;
    }

    const handlePop = (event: PopStateEvent) => {
      // popstate feuert IMMER wenn der aktive History-Eintrag wechselt —
      // auch wenn ein inneres Overlay zurückkehrt und uns dabei "passiert".
      // Wir prüfen: wenn der NEUE state unsere eigene ID hat, navigiert
      // der User zurück AN UNS → bleiben.
      const nextStateId =
        (event.state as { rcmkOverlayId?: string } | null)?.rcmkOverlayId;
      if (nextStateId === myStateId) return;
      if (popDispatched) return;
      popDispatched = true;
      callbackRef.current();
    };

    window.addEventListener("popstate", handlePop);

    return () => {
      window.removeEventListener("popstate", handlePop);
      if (!popDispatched) {
        // Overlay wurde durch X / Backdrop / setState geschlossen —
        // unseren Sentinel-State aus der History rauspoppen.
        try {
          window.history.back();
        } catch {
          // ignore
        }
      }
    };
  }, [open]);
}
