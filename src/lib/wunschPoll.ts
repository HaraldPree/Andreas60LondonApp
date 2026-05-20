import type { Place } from "@/types/place";

/**
 * v1.7.2 — Generator für WhatsApp-Poll-Texte aus der Wunschliste.
 *
 * Apple-Way: kein eigener Voting-Server, sondern Reise-Gruppe pollt
 * über das Tool wo sie eh kommunizieren (WhatsApp). App generiert nur
 * den fertig formatierten Text — die Auswertung läuft über Emoji-
 * Reaktionen in WhatsApp.
 */

/** Vorgefertigte Frage-Templates für typische Gruppen-Entscheidungen. */
export interface PollTemplate {
  key: string;
  label: string;
  question: string;
  /** Optional: kurze Beschreibung wann sinnvoll */
  hint?: string;
}

export const POLL_TEMPLATES: PollTemplate[] = [
  {
    key: "tomorrow",
    label: "Wer kommt mit?",
    question: "Wer kommt mit zu folgenden Punkten?",
    hint: "Klassiker für Tages- oder Ausflugs-Abstimmung",
  },
  {
    key: "dinner",
    label: "Wohin essen?",
    question: "Wohin sollen wir heute Abend essen gehen?",
    hint: "Wenn die Liste Restaurants / Pubs enthält",
  },
  {
    key: "top",
    label: "Top 3 voten",
    question: "Welche Top 3 wollen wir am letzten Tag noch schaffen?",
    hint: "Prioritäten für die verbleibende Zeit",
  },
  {
    key: "custom",
    label: "Eigener Text",
    question: "",
    hint: "Frei formulierte Frage",
  },
];

/**
 * Templates für Single-Place-Polls (v1.7.4).
 *
 * Frage adressiert den einen Place direkt — kürzer, klarer als
 * Sammel-Poll-Templates. Der Platzhalter `{name}` wird vom Caller
 * mit dem konkreten Place-Namen ersetzt.
 */
export interface SingleTemplate {
  key: string;
  label: string;
  /** Frage-Vorlage. `{name}` wird durch place.name ersetzt. */
  template: string;
}

export const SINGLE_POLL_TEMPLATES: SingleTemplate[] = [
  {
    key: "join",
    label: "Wer kommt mit?",
    template: "Wer kommt mit zur {name}?",
  },
  {
    key: "should",
    label: "Sollen wir?",
    template: "Sollen wir die {name} machen?",
  },
  {
    key: "interest",
    label: "Hat Interesse?",
    template: "Würdet ihr zur {name} mitkommen?",
  },
  {
    key: "custom",
    label: "Eigene Frage",
    template: "",
  },
];

export function fillSingleTemplate(template: string, placeName: string): string {
  return template.replace(/\{name\}/g, placeName);
}

interface GeneratePollTextArgs {
  /** Die eigentliche Frage / Header-Zeile */
  question: string;
  /** Welche Places sollen rein? Nur die hier übergebenen werden gelistet. */
  places: Place[];
  /** Wer hat den Poll erstellt? Wird in der Footer-Zeile erwähnt. */
  authorName: string;
  /** Reise-Destination für den Footer ("London", "Barcelona", …) */
  destination: string;
}

/**
 * Erzeugt einen fertig formatierten WhatsApp-Text aus dem Wunschliste-
 * Stand. Verzichtet auf Markdown weil WhatsApp es nicht überall rendert.
 * Setzt auf Emoji-Reaktionen die in jedem Chat funktionieren.
 */
export function generatePollText({
  question,
  places,
  authorName,
  destination,
}: GeneratePollTextArgs): string {
  const lines: string[] = [];

  // Header
  lines.push(`🗳️ ${question}`);
  lines.push("");

  // Liste mit Icon + Name + Voting-Optionen
  for (const place of places) {
    const icon = place.icon ?? "📍";
    lines.push(`${icon} ${place.name} — 👍 / ❌`);
  }

  // Voting-Anleitung
  lines.push("");
  lines.push("Reagiert mit Emoji:");
  lines.push("👍 ich will mit");
  lines.push("❌ ohne mich");
  lines.push("🤷 egal, machen wir");

  // Footer
  lines.push("");
  const countLabel = places.length === 1 ? "Wunsch" : "Wünsche";
  lines.push(
    `(von ${authorName} · ${places.length} ${countLabel} · via Travel Live ${destination})`,
  );

  return lines.join("\n");
}

/**
 * Versucht erst `navigator.share` (System-Share-Sheet → WhatsApp, iMessage
 * etc.). Wenn nicht verfügbar oder Cancel: fällt zurück auf einen
 * `wa.me`-Link der direkt WhatsApp öffnet.
 */
export async function sharePollText(text: string): Promise<"shared" | "copied" | "cancelled"> {
  // Web Share API (iOS Safari, Chrome Mobile, Edge — funktioniert für alle
  // 5 Mitreisende)
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (err) {
      // User hat abgebrochen oder API-Fehler
      if (err instanceof Error && err.name === "AbortError") {
        return "cancelled";
      }
      // Fallthrough zu wa.me-Link
    }
  }

  // Fallback: WhatsApp wa.me-Link mit pre-filled Text
  if (typeof window !== "undefined") {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    return "shared";
  }

  // Letzter Fallback: Clipboard
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      // ignore
    }
  }

  return "cancelled";
}
