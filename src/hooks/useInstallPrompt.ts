"use client";

import { useEffect, useState } from "react";

export type Platform = "ios" | "android" | "desktop" | "unknown";

interface InstallState {
  platform: Platform;
  /** True when the app is launched as PWA (display-mode standalone) */
  isStandalone: boolean;
  /** User explicitly dismissed the install hint */
  dismissed: boolean;
  /** Whether hint should be shown */
  shouldShow: boolean;
  dismiss: () => void;
}

const DISMISS_KEY = "rcmk:install-hint-dismissed";

export function useInstallPrompt(): InstallState {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    let p: Platform = "unknown";
    if (/iPhone|iPad|iPod/i.test(ua)) p = "ios";
    else if (/Android/i.test(ua)) p = "android";
    else p = "desktop";
    setPlatform(p);

    // iOS PWA check
    interface NavigatorWithStandalone extends Navigator {
      standalone?: boolean;
    }
    const nav = window.navigator as NavigatorWithStandalone;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    setIsStandalone(standalone);

    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  return {
    platform,
    isStandalone,
    dismissed,
    shouldShow:
      hydrated && !isStandalone && !dismissed && (platform === "ios" || platform === "android"),
    dismiss,
  };
}
