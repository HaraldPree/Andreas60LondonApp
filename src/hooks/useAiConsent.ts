"use client";

import { useCallback } from "react";

export type ConsentChoice = "once" | "always" | "never";

/**
 * AI-consent hook.
 *
 * ⚠️ TEMPORARILY BYPASSED — the consent modal had display bugs on
 * mobile and was blocking AI features (location identification,
 * photo narration). For this private 5-person trip the participants
 * are informed about Anthropic / Claude Vision usage out-of-band
 * (WhatsApp briefing + /datenschutz page + /anleitung), so the
 * additional per-action modal is unneeded friction.
 *
 * To re-enable: revert to the previous localStorage-backed
 * implementation in git history (commit 0720a7e or earlier).
 *
 * @param featureKey kept for API compatibility (no-op for now)
 */
export function useAiConsent(_featureKey: string) {
  // Always grant consent silently — never trigger the modal.
  const grant = useCallback((_choice: ConsentChoice) => {
    // no-op
  }, []);

  const revoke = useCallback(() => {
    // no-op — consent is implicit while bypass is active
  }, []);

  return {
    persistent: true,
    hydrated: true,
    grant,
    revoke,
  };
}
