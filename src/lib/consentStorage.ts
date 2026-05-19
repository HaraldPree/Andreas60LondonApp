/**
 * Consent-Storage Helper (Client-Side).
 *
 * Verwaltet die AGB- und Datenschutz-Einwilligungs-Marker im
 * localStorage. Bevor ein:e Reisende:r ein Foto teilen kann, müssen
 * beide Marker gesetzt sein.
 *
 * Format pro Reisende:in (key inkl. tripSlug + userName):
 *   {
 *     agbVersion: "1.0",
 *     agbAcceptedAt: "2026-05-21T14:30:00Z",
 *     datenschutzVersion: "1.0",
 *     datenschutzAcceptedAt: "2026-05-21T14:30:00Z"
 *   }
 *
 * Wenn die Versionen später erhöht werden (z.B. AGB-Update), muss
 * der Marker erneut bestätigt werden — Compare gegen aktuelle
 * CURRENT_VERSIONS unten.
 */

export const CURRENT_AGB_VERSION = "1.0";
export const CURRENT_DATENSCHUTZ_VERSION = "1.0";

export interface ConsentState {
  agbVersion?: string;
  agbAcceptedAt?: string;
  datenschutzVersion?: string;
  datenschutzAcceptedAt?: string;
}

const KEY = (tripSlug: string, userName: string) =>
  `rcmk:consent:${tripSlug}:${userName}`;

/**
 * Liest den aktuellen Consent-Status für eine:n Reisende:n.
 * SSR-safe: gibt leeres Objekt zurück wenn `window` nicht da.
 */
export function readConsent(
  tripSlug: string,
  userName: string,
): ConsentState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY(tripSlug, userName));
    if (!raw) return {};
    return JSON.parse(raw) as ConsentState;
  } catch {
    return {};
  }
}

/**
 * Speichert (oder updated) den Consent-Status.
 */
export function writeConsent(
  tripSlug: string,
  userName: string,
  state: ConsentState,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY(tripSlug, userName),
      JSON.stringify(state),
    );
  } catch {
    // localStorage voll oder deaktiviert — silent
  }
}

/**
 * Markiert beide (AGB + Datenschutz) als aktuell akzeptiert.
 * Wird vom Consent-Modal beim "Annehmen"-Klick aufgerufen.
 */
export function acceptCurrentVersions(
  tripSlug: string,
  userName: string,
): ConsentState {
  const now = new Date().toISOString();
  const next: ConsentState = {
    agbVersion: CURRENT_AGB_VERSION,
    agbAcceptedAt: now,
    datenschutzVersion: CURRENT_DATENSCHUTZ_VERSION,
    datenschutzAcceptedAt: now,
  };
  writeConsent(tripSlug, userName, next);
  return next;
}

/**
 * Widerruft die Einwilligung (z.B. via Profil-Seite).
 * Nach Widerruf darf nichts mehr geteilt werden.
 */
export function revokeConsent(tripSlug: string, userName: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY(tripSlug, userName));
  } catch {
    // ignore
  }
}

/**
 * Sind beide Einwilligungen in den aktuellen Versionen erteilt?
 */
export function hasFullConsent(state: ConsentState): boolean {
  return (
    state.agbVersion === CURRENT_AGB_VERSION &&
    state.datenschutzVersion === CURRENT_DATENSCHUTZ_VERSION
  );
}
