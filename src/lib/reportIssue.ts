/**
 * Builds a WhatsApp deep-link URL that pre-fills a bug report with
 * context (current page, app version, identity, device info, time)
 * so users can hit one button to send Harald a useful issue report
 * without having to remember all the diagnostic context.
 *
 * The destination phone number defaults to Harald's personal mobile
 * (this is a private app for the travel group, Harald explicitly
 * shared the number for this purpose). Can be overridden via
 * NEXT_PUBLIC_HARALD_WHATSAPP if needed (e.g. holiday-cover number).
 */

/** Harald's personal WhatsApp — only used by the 5 travelers to
 *  report bugs during the trip. Format: international without "+" or
 *  leading "00", just digits. wa.me requires this exact format. */
const DEFAULT_HARALD_WHATSAPP = "4369918888002";

export interface IssueContext {
  /** Optional: user's chosen identity from localStorage */
  identityName?: string | null;
  /** Page the user is currently on, e.g. "/london-2026" */
  currentPath?: string;
  /** Optional user-typed description that overrides the placeholder */
  userMessage?: string;
}

/** Builds the WhatsApp prefilled body text. */
export function buildIssueMessage(ctx: IssueContext = {}): string {
  const lines: string[] = [];
  lines.push("Hey Harald, ich hab ein Problem in der Reise-App:");
  lines.push("");
  lines.push(ctx.userMessage ?? "[hier beschreiben was nicht funktioniert]");
  lines.push("");
  lines.push("— Tipp: Screenshot mit anhängen 📸 —");
  lines.push("");
  lines.push("--- Debug-Info ---");
  if (ctx.identityName) {
    lines.push(`Ich bin: ${ctx.identityName}`);
  }
  if (ctx.currentPath) {
    lines.push(`Seite: ${ctx.currentPath}`);
  }
  if (typeof window !== "undefined") {
    lines.push(`Zeit: ${new Date().toLocaleString("de-AT")}`);
    if (window.navigator?.userAgent) {
      const ua = window.navigator.userAgent;
      // Strip the noisy long UA into a short readable hint
      const short = shortUserAgent(ua);
      lines.push(`Browser/Gerät: ${short}`);
    }
    if (typeof navigator?.onLine === "boolean") {
      lines.push(`Online: ${navigator.onLine ? "ja" : "NEIN ⚠️"}`);
    }
  }
  const version =
    process.env.NEXT_PUBLIC_BUILD_VERSION?.slice(0, 7) ?? "dev";
  lines.push(`App-Version: ${version}`);
  return lines.join("\n");
}

/**
 * Returns wa.me URL or null if no usable number is available.
 *
 * Sanitisation pipeline:
 *   1. Strip everything except digits (handles "+43 ..." or "0043...")
 *   2. Strip a leading "00" (international dial prefix that wa.me
 *      rejects — it wants country code without the 00)
 *   3. Require ≥8 digits as a sanity check
 */
export function buildWhatsappUrl(ctx: IssueContext = {}): string | null {
  const raw =
    process.env.NEXT_PUBLIC_HARALD_WHATSAPP || DEFAULT_HARALD_WHATSAPP;
  const sanitised = raw.replace(/[^\d]/g, "").replace(/^00/, "");
  if (sanitised.length < 8) return null;
  const text = buildIssueMessage(ctx);
  return `https://wa.me/${sanitised}?text=${encodeURIComponent(text)}`;
}

function shortUserAgent(ua: string): string {
  // Quick-and-dirty browser+OS extraction. We just want something
  // human-readable in the message, not a perfect fingerprint.
  let browser = "Unknown";
  if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "Safari";
  else if (/SamsungBrowser\//.test(ua)) browser = "Samsung Internet";

  let os = "Unknown";
  if (/Android/.test(ua)) {
    const m = ua.match(/Android ([\d.]+)/);
    os = m ? `Android ${m[1]}` : "Android";
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    const m = ua.match(/OS ([\d_]+)/);
    os = m ? `iOS ${m[1].replace(/_/g, ".")}` : "iOS";
  } else if (/Windows/.test(ua)) {
    os = "Windows";
  } else if (/Mac OS X/.test(ua)) {
    os = "macOS";
  } else if (/Linux/.test(ua)) {
    os = "Linux";
  }

  return `${browser} auf ${os}`;
}
