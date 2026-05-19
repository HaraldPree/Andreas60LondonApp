"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, MessageCircle, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Footer } from "@/components/layout/Footer";
import { buildWhatsappUrl } from "@/lib/reportIssue";

/**
 * Device diagnostic page.
 *
 * Goal: when a Reisende reports "Foto-Upload geht bei mir nicht",
 * Harald can ask them to open /diagnose, hit "Bericht an Harald",
 * and get a complete picture of what works on that specific device
 * (without needing screenshots or back-and-forth).
 *
 * Tests run on mount; manual buttons trigger interactive tests
 * (camera permission, geolocation) since those can't fire without
 * a user gesture.
 */

interface CheckResult {
  name: string;
  status: "ok" | "warn" | "fail" | "pending";
  detail: string;
}

type Section = {
  title: string;
  checks: CheckResult[];
};

function statusIcon(s: CheckResult["status"]) {
  switch (s) {
    case "ok":
      return <CheckCircle2 size={14} className="text-success" />;
    case "warn":
      return <AlertTriangle size={14} className="text-warning" />;
    case "fail":
      return <XCircle size={14} className="text-warning" />;
    default:
      return <RefreshCw size={14} className="text-ink-light animate-spin" />;
  }
}

function parseUA(ua: string) {
  let browser = "Unknown";
  let browserVer = "";
  if (/Firefox\/([\d.]+)/.test(ua)) {
    browser = "Firefox";
    browserVer = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? "";
  } else if (/Edg\/([\d.]+)/.test(ua)) {
    browser = "Edge";
    browserVer = ua.match(/Edg\/([\d.]+)/)?.[1] ?? "";
  } else if (/SamsungBrowser\/([\d.]+)/.test(ua)) {
    browser = "Samsung Internet";
    browserVer = ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] ?? "";
  } else if (/Chrome\/([\d.]+)/.test(ua) && !/Edg\//.test(ua)) {
    browser = "Chrome";
    browserVer = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? "";
  } else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
    browser = "Safari";
    browserVer = ua.match(/Version\/([\d.]+)/)?.[1] ?? "";
  }

  let os = "Unknown";
  if (/Android/.test(ua)) {
    const m = ua.match(/Android ([\d.]+)/);
    os = m ? `Android ${m[1]}` : "Android";
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    const m = ua.match(/OS ([\d_]+)/);
    os = m ? `iOS ${m[1].replace(/_/g, ".")}` : "iOS";
  } else if (/Windows NT ([\d.]+)/.test(ua)) {
    os = `Windows ${ua.match(/Windows NT ([\d.]+)/)?.[1]}`;
  } else if (/Mac OS X/.test(ua)) {
    os = "macOS";
  } else if (/Linux/.test(ua)) {
    os = "Linux";
  }

  let device = "";
  // Samsung models look like "SM-A525F" (A52)
  const samsungMatch = ua.match(/SM-[A-Z0-9]+/);
  if (samsungMatch) device = samsungMatch[0];
  // Common OnePlus pattern
  const onePlusMatch = ua.match(/OnePlus|OP\d+|GM\d+|IN\d+|CPH\d+|HD\d+/i);
  if (onePlusMatch) device = onePlusMatch[0];

  return { browser, browserVer, os, device };
}

export default function DiagnosePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [reportText, setReportText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    runChecks().then((s) => {
      setSections(s);
      setReportText(buildReport(s));
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const whatsappUrl = buildWhatsappUrl({
    userMessage: `Diagnose-Bericht:\n\n${reportText}`,
  });

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy text-cream sticky top-0 z-30">
        <div className="mx-auto max-w-app px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
            aria-label="Zurück"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="font-display text-lg font-semibold">
            Geräte-Diagnose
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6 space-y-4">
        <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4">
          <p className="text-sm text-ink-dark leading-relaxed">
            Hier siehst du was dein Browser / Handy alles kann und wo es
            evtl. Probleme gibt. Bei Bug-Reports an Harald: einmal{" "}
            <strong>„An Harald senden"</strong> drücken — er bekommt alle
            Infos auf einen Blick.
          </p>
        </div>

        {sections.map((sec) => (
          <section
            key={sec.title}
            className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden"
          >
            <div className="bg-navy/5 border-b border-cream-200 px-4 py-2.5">
              <h2 className="font-display text-sm font-semibold text-navy">
                {sec.title}
              </h2>
            </div>
            <ul className="divide-y divide-cream-200">
              {sec.checks.map((c) => (
                <li
                  key={c.name}
                  className="flex items-start gap-2.5 px-4 py-2.5"
                >
                  <span className="mt-0.5 flex-shrink-0">
                    {statusIcon(c.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-dark">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-ink-mid leading-relaxed mt-0.5 break-words">
                      {c.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="rounded-2xl bg-gold/10 border border-gold/30 p-4 space-y-2">
          <h2 className="font-display text-sm font-semibold text-navy">
            Bericht senden
          </h2>
          <p className="text-[11px] text-ink-mid leading-relaxed">
            Wenn du einen Bug meldest, hilft dieser Bericht Harald
            sofort zu sehen was bei dir anders ist.
          </p>
          <div className="flex flex-col gap-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-success text-white text-sm font-semibold hover:bg-success/90 transition"
              >
                <MessageCircle size={14} />
                Bericht via WhatsApp an Harald
              </a>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-navy/10 text-navy text-sm font-semibold hover:bg-navy/15 transition"
            >
              <Copy size={14} />
              {copied ? "✓ kopiert" : "Bericht in Zwischenablage"}
            </button>
          </div>
        </section>

        <details className="rounded-2xl bg-white shadow-card border border-cream-200/50">
          <summary className="cursor-pointer px-4 py-3 text-xs text-ink-mid font-semibold">
            Bericht als Text ansehen
          </summary>
          <pre className="px-4 pb-4 text-[10px] text-ink-dark leading-relaxed whitespace-pre-wrap break-words font-mono">
            {reportText}
          </pre>
        </details>

        <GoldDivider width="sm" className="mx-auto my-4" />
        <Footer />
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// Checks
// ----------------------------------------------------------------------

async function runChecks(): Promise<Section[]> {
  if (typeof window === "undefined") return [];

  const ua = navigator.userAgent;
  const { browser, browserVer, os, device } = parseUA(ua);

  const env: CheckResult[] = [
    {
      name: "Browser",
      status: "ok",
      detail: `${browser} ${browserVer}`,
    },
    {
      name: "Betriebssystem",
      status: "ok",
      detail: os,
    },
    {
      name: "Gerät",
      status: device ? "ok" : "warn",
      detail: device || "Modell nicht im UA-String — siehe Rohtext unten",
    },
    {
      name: "Bildschirm",
      status: "ok",
      detail: `${window.innerWidth}×${window.innerHeight} px @${window.devicePixelRatio || 1}× DPR`,
    },
    {
      name: "Standalone PWA",
      status:
        // matchMedia is the standard check; iOS uses navigator.standalone
        window.matchMedia?.("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).standalone === true
          ? "ok"
          : "warn",
      detail:
        window.matchMedia?.("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).standalone === true
          ? "Ja — als App installiert"
          : "Nein — läuft im normalen Browser-Tab",
    },
    {
      name: "Online",
      status: navigator.onLine ? "ok" : "fail",
      detail: navigator.onLine ? "Verbunden" : "OFFLINE",
    },
    {
      name: "Safe-Area Top",
      status: "ok",
      detail: `${getComputedSafeAreaInset("top")}px (iPhone-Notch wenn > 0)`,
    },
    {
      name: "Safe-Area Bottom",
      status: "ok",
      detail: `${getComputedSafeAreaInset("bottom")}px (iPhone Home-Indicator wenn > 0)`,
    },
  ];

  const storage: CheckResult[] = [
    {
      name: "localStorage",
      status: testStorage("localStorage") ? "ok" : "fail",
      detail: testStorage("localStorage")
        ? `funktioniert (~${estimateLocalStorageBytes()} verfügbar)`
        : "blockiert — manche Features funktionieren nicht",
    },
    {
      name: "IndexedDB",
      status: typeof indexedDB !== "undefined" ? "ok" : "fail",
      detail:
        typeof indexedDB !== "undefined"
          ? "funktioniert (für Foto-Speicherung verwendet)"
          : "fehlt — Fotos lassen sich nicht speichern",
    },
    {
      name: "Storage-Quota",
      status: "pending",
      detail: "wird ermittelt…",
    },
  ];

  const apis: CheckResult[] = [
    {
      name: "createImageBitmap",
      status: typeof createImageBitmap === "function" ? "ok" : "warn",
      detail:
        typeof createImageBitmap === "function"
          ? "verfügbar (für moderne Bildformate wie Samsung HDR)"
          : "fehlt — Fallback auf altes <img> Decoding",
    },
    {
      name: "Web Share API",
      status:
        typeof navigator.share === "function"
          ? typeof navigator.canShare === "function"
            ? "ok"
            : "warn"
          : "fail",
      detail:
        typeof navigator.share === "function"
          ? typeof navigator.canShare === "function"
            ? "voll (inkl. Datei-Sharing)"
            : "Basis (kein canShare check)"
          : "nicht verfügbar — Downloads klassisch",
    },
    {
      name: "Web Share Files",
      status: testShareFiles() ? "ok" : "warn",
      detail: testShareFiles()
        ? "Datei-Sharing funktioniert"
        : "kein Datei-Sharing — Fallback auf Download-Link",
    },
    {
      name: "Clipboard API",
      status:
        typeof navigator.clipboard?.writeText === "function" ? "ok" : "warn",
      detail:
        typeof navigator.clipboard?.writeText === "function"
          ? "Text-Kopieren funktioniert"
          : "fehlt — manuell markieren nötig",
    },
    {
      name: "Service Worker",
      status: "serviceWorker" in navigator ? "ok" : "warn",
      detail:
        "serviceWorker" in navigator
          ? "verfügbar (für Offline-Modus, wird derzeit nicht genutzt)"
          : "fehlt",
    },
    {
      name: "Geolocation",
      status: navigator.geolocation ? "ok" : "warn",
      detail: navigator.geolocation
        ? "API da — Berechtigung wird bei Bedarf erfragt"
        : "API fehlt",
    },
    {
      name: "Notification",
      status: typeof Notification !== "undefined" ? "ok" : "warn",
      detail:
        typeof Notification !== "undefined"
          ? `Status: ${Notification.permission}`
          : "API fehlt",
    },
  ];

  // Async checks
  const storageQuota = await estimateStorageQuota();
  storage[2] = {
    name: "Storage-Quota",
    status: storageQuota ? "ok" : "warn",
    detail: storageQuota ?? "konnte nicht ermittelt werden",
  };

  return [
    { title: "Gerät & Browser", checks: env },
    { title: "Speicher", checks: storage },
    { title: "Browser-Fähigkeiten", checks: apis },
    {
      title: "Rohtext",
      checks: [
        { name: "User Agent", status: "ok", detail: ua },
        {
          name: "App-Version",
          status: "ok",
          detail:
            process.env.NEXT_PUBLIC_BUILD_VERSION?.slice(0, 7) ?? "dev",
        },
        {
          name: "Sprache",
          status: "ok",
          detail: navigator.language,
        },
      ],
    },
  ];
}

function getComputedSafeAreaInset(
  side: "top" | "bottom" | "left" | "right",
): number {
  if (typeof document === "undefined") return 0;
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style[side] = `env(safe-area-inset-${side}, 0px)`;
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  const value = parseFloat(getComputedStyle(el)[side as never]) || 0;
  document.body.removeChild(el);
  return value;
}

function testStorage(kind: "localStorage" | "sessionStorage"): boolean {
  try {
    const test = "__test__";
    window[kind].setItem(test, test);
    window[kind].removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function estimateLocalStorageBytes(): string {
  // Rough — most browsers allow ~5-10 MB
  try {
    let used = 0;
    for (const k in localStorage) {
      // eslint-disable-next-line no-prototype-builtins
      if (localStorage.hasOwnProperty(k)) {
        used += (localStorage[k]?.length || 0) + k.length;
      }
    }
    return `${(used / 1024).toFixed(0)} KB belegt`;
  } catch {
    return "?";
  }
}

async function estimateStorageQuota(): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (!nav.storage?.estimate) return null;
    const { quota, usage } = await nav.storage.estimate();
    if (!quota) return null;
    const usedMB = ((usage ?? 0) / 1024 / 1024).toFixed(1);
    const quotaMB = (quota / 1024 / 1024).toFixed(0);
    return `${usedMB} MB belegt von ${quotaMB} MB verfügbar`;
  } catch {
    return null;
  }
}

function testShareFiles(): boolean {
  if (typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare !== "function") return false;
  if (typeof File === "undefined") return false;
  try {
    const f = new File([new Blob(["x"])], "test.txt", { type: "text/plain" });
    return navigator.canShare({ files: [f] });
  } catch {
    return false;
  }
}

function buildReport(sections: Section[]): string {
  const lines: string[] = [];
  lines.push("=== Geräte-Diagnose ===");
  lines.push(`Zeitpunkt: ${new Date().toLocaleString("de-AT")}`);
  lines.push("");
  for (const sec of sections) {
    lines.push(`— ${sec.title} —`);
    for (const c of sec.checks) {
      const icon =
        c.status === "ok"
          ? "✓"
          : c.status === "warn"
            ? "⚠"
            : c.status === "fail"
              ? "✗"
              : "…";
      lines.push(`${icon} ${c.name}: ${c.detail}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
