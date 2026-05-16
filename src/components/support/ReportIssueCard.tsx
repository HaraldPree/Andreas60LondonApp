"use client";

import { useState } from "react";
import { Bug, MessageCircle, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import { buildWhatsappUrl } from "@/lib/reportIssue";

interface Props {
  /** The current user's chosen name, if any (for debug context) */
  currentUserName?: string | null;
}

/**
 * "Problem melden" card — produces a WhatsApp deep-link to Harald
 * pre-filled with diagnostic context (page, version, browser, time,
 * identity). Sits on the Info-Tab so all 5 travelers can reach Harald
 * with a useful bug report in one tap.
 *
 * If NEXT_PUBLIC_HARALD_WHATSAPP isn't set, falls back to a hint that
 * tells the user to message Harald via their normal WhatsApp contact.
 */
export function ReportIssueCard({ currentUserName }: Props) {
  const pathname = usePathname();
  const [userMessage, setUserMessage] = useState("");
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const whatsappUrl = buildWhatsappUrl({
    identityName: currentUserName,
    currentPath: pathname ?? undefined,
    userMessage: userMessage.trim() || undefined,
  });

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
            <Bug size={18} className="text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base font-semibold text-navy">
              Problem melden
            </h3>
            <p className="text-[11px] text-ink-mid mt-0.5 leading-relaxed">
              Was klappt nicht? Tipp&apos;s kurz hier rein, dann öffnet sich
              WhatsApp mit allen technischen Infos schon vor-ausgefüllt für
              Harald.
            </p>
          </div>
        </div>

        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="z.B. &quot;Foto-Upload geht nicht&quot; oder &quot;Karte zeigt falsche Adresse für Cedric Grolet&quot;"
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2 text-sm rounded-lg border border-cream-300 bg-cream-50 focus:border-gold focus:outline-none resize-none placeholder:text-ink-light/70"
        />

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setHasOpenedOnce(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-success text-white text-sm font-semibold hover:bg-success/90 transition shadow-sm"
          >
            <MessageCircle size={14} />
            WhatsApp an Harald öffnen
            <ExternalLink size={11} className="opacity-70" />
          </a>
        ) : (
          <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 space-y-1.5">
            <p className="text-xs text-warning font-semibold">
              ⚠️ Harald-WhatsApp nicht konfiguriert
            </p>
            <p className="text-[11px] text-ink-mid leading-relaxed">
              Bitte Harald in der WhatsApp-Reisegruppe direkt ansprechen.
              (Admin-Hinweis: <code className="text-[10px]">
                NEXT_PUBLIC_HARALD_WHATSAPP
              </code>{" "}
              in Vercel setzen.)
            </p>
          </div>
        )}

        {hasOpenedOnce && (
          <p className="text-[11px] text-success-700 italic text-center">
            ✓ WhatsApp wurde geöffnet. Vergiss nicht ein Screenshot
            anzuhängen!
          </p>
        )}

        <details className="group">
          <summary className="text-[11px] text-ink-light cursor-pointer hover:text-ink-mid select-none">
            Welche Infos werden mitgesendet?
          </summary>
          <ul className="mt-2 text-[10px] text-ink-mid leading-relaxed space-y-0.5 pl-2 border-l-2 border-cream-200">
            <li>• Dein Name (falls Avatar gewählt)</li>
            <li>• Aktuelle Seite (z.B. „/london-2026")</li>
            <li>• Uhrzeit + Datum</li>
            <li>• Browser/Gerät (z.B. „Chrome auf Android 14")</li>
            <li>• Online/Offline-Status</li>
            <li>• App-Version (Git Commit-Hash)</li>
            <li className="italic pt-1">
              Keine Fotos, keine Gesundheitsdaten, keine Ausgaben.
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
}
