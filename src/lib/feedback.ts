/**
 * v1.16.0 — User-Feedback Storage + WhatsApp-Versand.
 *
 * Persistiert pro `(tripSlug, userName)` im localStorage (kein Server),
 * baut für den Versand an Travel-Concierge-Team einen WhatsApp-
 * Prefill-Link (wa.me + URL-encoded Body).
 */

import type { FeedbackEntry } from "@/types/feedback";
import { npsCategoryOf } from "@/types/feedback";
import { getCurrentTenant } from "./tenant/current";

const KEY_PREFIX = "travelConcierge:feedback:";

function key(tripSlug: string, userName: string): string {
  return `${KEY_PREFIX}${tripSlug}:${userName}`;
}

/** Lädt bestehendes Feedback (falls vorhanden). */
export function loadFeedback(
  tripSlug: string,
  userName: string,
): FeedbackEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(tripSlug, userName));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FeedbackEntry;
    if (typeof parsed.appScore !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Speichert (überschreibt bestehendes). */
export function saveFeedback(entry: FeedbackEntry): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      key(entry.tripSlug, entry.userName),
      JSON.stringify(entry),
    );
  } catch {
    // Quota / Disabled — ignore, User kann zumindest WhatsApp-Link aufrufen
  }
}

/**
 * Baut die WhatsApp-Prefill-Nachricht für die Submission.
 * Klare Struktur damit Harald in 30 Sek alle Werte sieht.
 */
export function buildFeedbackWhatsappMessage(
  entry: FeedbackEntry,
  tripLabel: string,
): string {
  const tenant = getCurrentTenant();
  const lines: string[] = [];
  lines.push(`🎯 ${tenant.brand.name} — Feedback`);
  lines.push("");
  lines.push(`Von: ${entry.userName}`);
  lines.push(`Reise: ${tripLabel}`);
  lines.push(
    `App-NPS: ${entry.appScore}/10  (${npsCategoryLabel(entry.appScore)})`,
  );
  if (typeof entry.contentScore === "number") {
    lines.push(`Inhalt der Reise: ${entry.contentScore}/10`);
  }
  if (typeof entry.organizationScore === "number") {
    lines.push(`Organisation der Reise: ${entry.organizationScore}/10`);
  }
  lines.push("");

  if (entry.appComment?.trim()) {
    lines.push("App-Kommentar:");
    lines.push(`> ${entry.appComment.trim()}`);
    lines.push("");
  }
  if (entry.contentComment?.trim()) {
    lines.push("Inhalt-Kommentar:");
    lines.push(`> ${entry.contentComment.trim()}`);
    lines.push("");
  }
  if (entry.organizationComment?.trim()) {
    lines.push("Organisation-Kommentar:");
    lines.push(`> ${entry.organizationComment.trim()}`);
    lines.push("");
  }

  if (entry.allowFollowUp) {
    lines.push(
      `📞 Persönlicher Rückruf gewünscht: ja${entry.followUpContact ? ` (${entry.followUpContact})` : ""}`,
    );
    lines.push("");
  }

  lines.push(
    `— ${tenant.brand.name} v${entry.appVersion}, abgegeben ${formatTimestamp(entry.submittedAt)}`,
  );
  return lines.join("\n");
}

/**
 * Baut die wa.me-URL für die Submission. Liefert null wenn keine
 * gültige Nummer konfiguriert ist.
 */
export function buildFeedbackWhatsappUrl(
  entry: FeedbackEntry,
  tripLabel: string,
): string | null {
  const tenant = getCurrentTenant();
  const raw =
    process.env.NEXT_PUBLIC_HARALD_WHATSAPP || tenant.contact.whatsapp;
  const sanitised = raw.replace(/[^\d]/g, "").replace(/^00/, "");
  if (sanitised.length < 8) return null;
  const text = buildFeedbackWhatsappMessage(entry, tripLabel);
  return `https://wa.me/${sanitised}?text=${encodeURIComponent(text)}`;
}

/**
 * mailto:-Fallback wenn User WhatsApp nicht installiert hat oder
 * lieber Mail will. Empfänger derzeit nicht konfigurierbar — Default
 * leer (User muss Empfänger im Mail-Programm ergänzen, schickt einfach).
 */
export function buildFeedbackMailtoUrl(
  entry: FeedbackEntry,
  tripLabel: string,
): string {
  const tenant = getCurrentTenant();
  const text = buildFeedbackWhatsappMessage(entry, tripLabel);
  const subject = `${tenant.brand.name} Feedback — ${entry.userName} · ${tripLabel}`;
  return `mailto:${tenant.contact.email ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}

function npsCategoryLabel(score: number): string {
  const cat = npsCategoryOf(score);
  if (cat === "promoter") return "Promoter";
  if (cat === "passive") return "Passive";
  return "Detractor";
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("de-AT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
