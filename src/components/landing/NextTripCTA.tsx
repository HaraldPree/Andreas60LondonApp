"use client";

import { useState } from "react";
import { MessageCircle, Mail, Phone, Plus, X } from "lucide-react";

/**
 * v1.18.0 — „Nächste Reise anlegen"-Call-to-Action auf der Landing-Page.
 *
 * Phase 1 (heute): Kontakt-Variante. User klickt → Auswahl-Sheet
 * (WhatsApp / Mail / Telefon) → öffnet entsprechende App mit
 * vorformulierter Anfrage.
 *
 * Phase 2 (später, Multi-Tenant): wird zu einem echten Trip-Wizard
 * der eine Reise-Spec generiert + an das gewählte Reisebüro schickt.
 *
 * Default-Kontakt: Harald / hp+ (gleiche Nummer wie reportIssue.ts).
 * Wird in Phase 2 pro Tenant überschrieben.
 */

const DEFAULT_HARALD_WHATSAPP = "4369918888002";

export function NextTripCTA() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy via-navy-700 to-navy text-cream p-5 shadow-card">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gold/20 text-gold flex items-center justify-center flex-shrink-0">
          <Plus size={22} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">
            Bereit für die nächste Reise?
          </p>
          <h3 className="font-display text-lg font-semibold leading-tight mt-1">
            Wir kuratieren deine Travel-Concierge-Reise
          </h3>
          <p className="text-[12px] text-cream/85 mt-1.5 leading-relaxed">
            Sag uns wohin und wann — wir bauen die App für deine
            nächste Gruppe oder dein nächstes Erlebnis.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold text-navy text-[12px] font-bold hover:bg-gold-400 transition shadow-sm"
          >
            <MessageCircle size={13} />
            Beratung anfragen
          </button>
        </div>
      </div>

      {open && <ContactSheet onClose={() => setOpen(false)} />}
    </div>
  );
}

function ContactSheet({ onClose }: { onClose: () => void }) {
  const message = encodeURIComponent(
    "Hallo, ich interessiere mich für eine Travel-Concierge-Reise. Bitte ruf mich zurück oder antworte einfach hier.",
  );
  const whatsappUrl = `https://wa.me/${DEFAULT_HARALD_WHATSAPP}?text=${message}`;
  const mailUrl = `mailto:?subject=Travel%20Concierge%20-%20Reise-Anfrage&body=${message}`;
  const telUrl = `tel:+${DEFAULT_HARALD_WHATSAPP}`;

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-navy/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-[60] bg-white rounded-2xl shadow-elevated overflow-hidden">
        <div className="p-4 border-b border-cream-200 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
              Beratung anfragen
            </p>
            <h3 className="font-display text-base font-semibold text-navy mt-0.5">
              Wie sollen wir uns melden?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="w-8 h-8 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-light"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl bg-success/10 text-success hover:bg-success/15 transition border border-success/30"
          >
            <MessageCircle size={18} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">WhatsApp</p>
              <p className="text-[11px] opacity-80">
                Schreib direkt mit fertiger Vorlage
              </p>
            </div>
          </a>
          <a
            href={mailUrl}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl bg-info/10 text-info hover:bg-info/15 transition border border-info/30"
          >
            <Mail size={18} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">E-Mail</p>
              <p className="text-[11px] opacity-80">
                Öffnet dein Mail-Programm
              </p>
            </div>
          </a>
          <a
            href={telUrl}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl bg-cream-100 text-ink-dark hover:bg-cream-200 transition border border-cream-300"
          >
            <Phone size={18} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Anrufen</p>
              <p className="text-[11px] opacity-70">
                +43 699 18 88 80 02 (Harald, hp+)
              </p>
            </div>
          </a>
        </div>

        <div className="px-4 pb-4">
          <p className="text-[10px] text-ink-light italic text-center">
            Trip-Wizard mit Selbst-Eingabe kommt in einer späteren
            Plattform-Version. Heute: persönliche Beratung.
          </p>
        </div>
      </div>
    </>
  );
}
