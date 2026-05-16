"use client";

import { useEffect, useState } from "react";

const CLIENT_VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "dev";
const POLL_INTERVAL = 5 * 60_000; // 5 min

/**
 * Polls /api/version and reports whether a newer deployment is live.
 * Uses the client-side baked version vs the server's currently-running one.
 */
export function useVersionCheck(): {
  updateAvailable: boolean;
  serverVersion: string | null;
  clientVersion: string;
} {
  const [serverVersion, setServerVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/version", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { version?: string };
        if (!cancelled && json.version) {
          setServerVersion(json.version);
        }
      } catch {
        // network blip – try again on next interval
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL);
    const onFocus = () => check();
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const updateAvailable =
    !!serverVersion &&
    serverVersion !== "dev" &&
    CLIENT_VERSION !== "dev" &&
    serverVersion !== CLIENT_VERSION;

  return {
    updateAvailable,
    serverVersion,
    clientVersion: CLIENT_VERSION,
  };
}
