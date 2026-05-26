/**
 * v1.16.0 — User-Feedback (NPS + Reise-Bewertung).
 *
 * Anti-Halluzinations-Regel: Nur was der User selbst eingibt. Keine
 * Aggregat-Schätzungen, keine errechneten „Trends" — die echten Insights
 * kommen mit Multi-Tenant Phase 2 (Server-side).
 */

export type NpsCategory = "detractor" | "passive" | "promoter";

/**
 * Standard-NPS-Klassifizierung: 0–6 = Detractor, 7–8 = Passive, 9–10 = Promoter.
 */
export function npsCategoryOf(score: number): NpsCategory {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

export interface FeedbackEntry {
  tripSlug: string;
  /** Wer hat das Feedback abgegeben (aus PersonPicker / useCurrentUser). */
  userName: string;
  /**
   * Hauptscore: App-NPS — „Wie wahrscheinlich würdest du Travel
   * Concierge weiterempfehlen?"  0–10. Pflichtfeld.
   */
  appScore: number;
  /**
   * Score-abhängiger Folge-Kommentar:
   *  - Detractor (0-6): „Was sollten wir verbessern?" (Pflicht)
   *  - Passive (7-8):   „Was fehlt damit du sie empfehlen würdest?" (optional)
   *  - Promoter (9-10): „Was hat dir besonders gefallen?" (optional)
   */
  appComment?: string;
  /** Reise-Inhalts-Bewertung — „Wurden deine Wünsche erfüllt?" 0-10 (optional). */
  contentScore?: number;
  contentComment?: string;
  /** Reise-Organisations-Bewertung — „Hat alles geklappt wie geplant?" 0-10 (optional). */
  organizationScore?: number;
  organizationComment?: string;
  /**
   * Detractor-Follow-Up: User erlaubt explizit dass hp+ sich persönlich meldet
   * (z.B. Telefon-Kontakt für Detail-Klärung).
   */
  allowFollowUp?: boolean;
  /** Optional: Kontakt-Info (Tel/Mail) wenn `allowFollowUp` gesetzt. */
  followUpContact?: string;
  /** ISO-Timestamp der Submission. */
  submittedAt: string;
  /** App-Version zum Zeitpunkt der Submission (für Korrelation mit Bugs). */
  appVersion: string;
}
