"use client";

import { useState } from "react";
import {
  MessageCircle,
  MapPin,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  Apple,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { classNames } from "@/lib/formatters";

export function LocationSharingCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center flex-shrink-0">
          <MapPin size={18} className="text-info" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-display text-base font-semibold text-navy">
            Wer ist wo? Standort teilen
          </h3>
          <p className="text-[11px] text-ink-mid">
            Sicher, privat – über bestehende Apps statt eigenes Tracking
          </p>
        </div>
        <ChevronDown
          size={18}
          className={classNames(
            "text-ink-light transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="bg-success/5 border border-success/20 rounded-xl p-3 flex items-start gap-2">
                <ShieldCheck
                  size={14}
                  className="text-success flex-shrink-0 mt-0.5"
                />
                <p className="text-[11px] text-ink-dark leading-relaxed">
                  <span className="font-semibold">
                    Diese App trackt euch nicht.
                  </span>{" "}
                  Standortdaten sind besonders sensibel (ePrivacy / Art.&nbsp;9
                  DSGVO). Statt eigener Speicherung nutzen wir bestehende
                  Tools, bei denen <em>ihr</em> kontrolliert wer wann wie lange
                  euren Standort sieht.
                </p>
              </div>

              <SharingOption
                icon={<MessageCircle size={14} />}
                title="WhatsApp Live Location"
                bestFor="Spontan in der Reisegruppe (1h, 8h oder 24h)"
                steps={[
                  "WhatsApp öffnen → Reisegruppen-Chat",
                  "📎 / + Anhängen-Symbol antippen",
                  "Standort → Live-Standort teilen → Dauer wählen",
                ]}
                href="https://wa.me/"
                cta="WhatsApp öffnen"
                color="bg-success/10 text-success border-success/30"
              />

              <SharingOption
                icon={<MapPin size={14} />}
                title="Google Maps Standort-Freigabe"
                bestFor="Präziser, längerer Zeitraum (bis 24h oder dauerhaft)"
                steps={[
                  "Google Maps öffnen → Profil oben rechts",
                  '"Standortfreigabe" auswählen',
                  "Zeitraum + Personen wählen (Link kopieren oder direkt teilen)",
                ]}
                href="https://www.google.com/maps/timeline"
                cta="Google Maps öffnen"
                color="bg-info/10 text-info border-info/30"
              />

              <SharingOption
                icon={<Apple size={14} />}
                title="Apple Wo ist? (Find My)"
                bestFor="iPhone-User unter sich"
                steps={[
                  '„Wo ist?" App öffnen → Personen → Teilen',
                  "Person + Dauer (1h / Ende des Tages / unbegrenzt) wählen",
                  "Empfänger:in muss ebenfalls iPhone haben",
                ]}
                cta=""
                color="bg-navy/10 text-navy border-navy/30"
              />

              <div className="bg-cream-50 rounded-xl p-3 border border-cream-200">
                <p className="text-[11px] text-ink-mid leading-relaxed">
                  <strong className="text-ink-dark">Tipp für die Crew:</strong>{" "}
                  Vor dem Laufengehen kurz die Live-Location im
                  Reisegruppen-Chat für 1–2 Stunden teilen. So weiß jeder wo
                  ihr seid, ohne dauerhaft getrackt zu werden.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SharingOption({
  icon,
  title,
  bestFor,
  steps,
  href,
  cta,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  bestFor: string;
  steps: string[];
  href?: string;
  cta?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-cream-200 bg-white p-3 space-y-2">
      <div className="flex items-start gap-2.5">
        <div
          className={classNames(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border",
            color,
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-dark">{title}</p>
          <p className="text-[10px] text-ink-mid">{bestFor}</p>
        </div>
      </div>
      <ol className="text-[11px] text-ink-mid leading-relaxed pl-3 space-y-0.5">
        {steps.map((s, i) => (
          <li key={i} className="list-decimal list-inside marker:text-ink-light">
            {s}
          </li>
        ))}
      </ol>
      {href && cta && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-navy font-semibold hover:text-gold transition"
        >
          {cta}
          <ExternalLink size={9} />
        </a>
      )}
    </div>
  );
}
