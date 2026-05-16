"use client";

import { useCallback, useEffect, useState } from "react";

export type ConsentChoice = "once" | "always" | "never";

interface ConsentState {
  /** "always": persistent consent recorded. "once" (transient) or null = ask each time. */
  persistent: boolean;
  hydrated: boolean;
}

/**
 * Stores a per-feature AI-consent in localStorage so we can ask once for
 * "always" and skip the modal for repeat uses.
 *
 * @param featureKey e.g. "photo-vision" | "photo-narration"
 */
export function useAiConsent(featureKey: string) {
  const storageKey = `rcmk:ai-consent:${featureKey}`;
  const [state, setState] = useState<ConsentState>({
    persistent: false,
    hydrated: false,
  });

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      setState({ persistent: stored === "always", hydrated: true });
    } catch {
      setState({ persistent: false, hydrated: true });
    }
  }, [storageKey]);

  const grant = useCallback(
    (choice: ConsentChoice) => {
      if (choice === "always") {
        try {
          window.localStorage.setItem(storageKey, "always");
        } catch {
          // ignore
        }
        setState((s) => ({ ...s, persistent: true }));
      }
      // "once" doesn't persist; "never" is just a cancel signal
    },
    [storageKey],
  );

  const revoke = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setState((s) => ({ ...s, persistent: false }));
  }, [storageKey]);

  return { ...state, grant, revoke };
}
