"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Heart,
  MessageCircle,
  Send,
  Sparkles,
  ThumbsUp,
  AlertCircle,
  Mail,
  RotateCcw,
  Check,
} from "lucide-react";
import type { Trip } from "@/types/trip";
import { classNames } from "@/lib/formatters";
import type { FeedbackEntry, NpsCategory } from "@/types/feedback";
import { npsCategoryOf } from "@/types/feedback";
import {
  loadFeedback,
  saveFeedback,
  buildFeedbackWhatsappUrl,
  buildFeedbackMailtoUrl,
} from "@/lib/feedback";

interface Props {
  trip: Trip;
  userName: string;
}

/**
 * v1.16.0 — Feedback-Karte „an Travel Concierge".
 *
 * Erscheint im Programm-Tab nach Reise-Ende für identifizierten User.
 * Drei-Schichten-Modell:
 *  1. App-NPS (Pflicht, 0-10) — der primäre Polarsteps-Vergleichswert
 *  2. Score-abhängige Folge-Frage (rot/grau/gold)
 *  3. Optionale Sekundär-Scores: Inhalt der Reise + Organisation
 *
 * Submission per WhatsApp an Travel-Concierge-Team (= Harald, hp+).
 * mailto-Fallback wenn kein WhatsApp.
 *
 * Persistiert in localStorage. Bei bereits abgegebenem Feedback:
 * minimierte „Du hast Feedback gegeben"-Anzeige mit Re-Submit-Option.
 */
export function FeedbackCard({ trip, userName }: Props) {
  const [existing, setExisting] = useState<FeedbackEntry | null>(() =>
    loadFeedback(trip.slug, userName),
  );
  const [resubmitting, setResubmitting] = useState(false);

  if (existing && !resubmitting) {
    return (
      <FeedbackDoneCard
        entry={existing}
        onResubmit={() => setResubmitting(true)}
      />
    );
  }

  return (
    <FeedbackForm
      trip={trip}
      userName={userName}
      initial={existing}
      onSubmitted={(entry) => {
        saveFeedback(entry);
        setExisting(entry);
        setResubmitting(false);
      }}
      onCancel={() => setResubmitting(false)}
      isResubmit={resubmitting}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// Submitted State
// ═══════════════════════════════════════════════════════════════

function FeedbackDoneCard({
  entry,
  onResubmit,
}: {
  entry: FeedbackEntry;
  onResubmit: () => void;
}) {
  const cat = npsCategoryOf(entry.appScore);
  const submittedDate = new Date(entry.submittedAt).toLocaleDateString(
    "de-AT",
    { day: "numeric", month: "long" },
  );
  return (
    <div className="rounded-2xl bg-success/5 border-2 border-success/30 p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
        <Check size={18} className="text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-success font-semibold">
          Feedback gegeben
        </p>
        <p className="font-display text-sm font-semibold text-navy leading-tight mt-0.5">
          Danke {entry.userName} — am {submittedDate} abgegeben
        </p>
        <p className="text-[11px] text-ink-mid mt-0.5">
          App-NPS: <strong>{entry.appScore}/10</strong> (
          {labelOf(cat)})
          {typeof entry.contentScore === "number" &&
            ` · Inhalt ${entry.contentScore}/10`}
          {typeof entry.organizationScore === "number" &&
            ` · Organisation ${entry.organizationScore}/10`}
        </p>
        <button
          type="button"
          onClick={onResubmit}
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-navy hover:text-gold transition font-medium"
        >
          <RotateCcw size={11} />
          Nochmal Feedback geben
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Form
// ═══════════════════════════════════════════════════════════════

function FeedbackForm({
  trip,
  userName,
  initial,
  onSubmitted,
  onCancel,
  isResubmit,
}: {
  trip: Trip;
  userName: string;
  initial: FeedbackEntry | null;
  onSubmitted: (entry: FeedbackEntry) => void;
  onCancel: () => void;
  isResubmit: boolean;
}) {
  const [appScore, setAppScore] = useState<number | null>(
    initial?.appScore ?? null,
  );
  const [appComment, setAppComment] = useState(initial?.appComment ?? "");
  const [secondaryOpen, setSecondaryOpen] = useState(
    typeof initial?.contentScore === "number" ||
      typeof initial?.organizationScore === "number",
  );
  const [contentScore, setContentScore] = useState<number | null>(
    initial?.contentScore ?? null,
  );
  const [contentComment, setContentComment] = useState(
    initial?.contentComment ?? "",
  );
  const [organizationScore, setOrganizationScore] = useState<number | null>(
    initial?.organizationScore ?? null,
  );
  const [organizationComment, setOrganizationComment] = useState(
    initial?.organizationComment ?? "",
  );
  const [allowFollowUp, setAllowFollowUp] = useState(
    initial?.allowFollowUp ?? false,
  );
  const [followUpContact, setFollowUpContact] = useState(
    initial?.followUpContact ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cat = appScore === null ? null : npsCategoryOf(appScore);

  const detractorCommentMissing =
    cat === "detractor" && (appComment.trim().length < 3);

  const canSubmit =
    appScore !== null && !detractorCommentMissing && !submitting;

  const handleSubmit = async (channel: "whatsapp" | "email") => {
    if (appScore === null) return;
    setSubmitting(true);
    setError(null);

    const entry: FeedbackEntry = {
      tripSlug: trip.slug,
      userName,
      appScore,
      appComment: appComment.trim() || undefined,
      contentScore: contentScore ?? undefined,
      contentComment: contentComment.trim() || undefined,
      organizationScore: organizationScore ?? undefined,
      organizationComment: organizationComment.trim() || undefined,
      allowFollowUp: cat === "detractor" ? allowFollowUp : undefined,
      followUpContact:
        cat === "detractor" && allowFollowUp
          ? followUpContact.trim() || undefined
          : undefined,
      submittedAt: new Date().toISOString(),
      appVersion:
        process.env.NEXT_PUBLIC_BUILD_VERSION?.slice(0, 12) ?? "dev",
    };

    const tripLabel = `${trip.destination} ${trip.subtitle ? `· ${trip.subtitle}` : ""}`.trim();

    let url: string | null = null;
    if (channel === "whatsapp") {
      url = buildFeedbackWhatsappUrl(entry, tripLabel);
      if (!url) {
        setError(
          "WhatsApp-Nummer nicht konfiguriert — bitte stattdessen Mail-Versand nutzen.",
        );
        setSubmitting(false);
        return;
      }
    } else {
      url = buildFeedbackMailtoUrl(entry, tripLabel);
    }

    // Speichern erst nachdem WhatsApp/Mail-App geöffnet wurde — damit
    // bei Abbruch der Versand-App das Feedback nicht „verloren" wirkt.
    // Aber: wir speichern auch wenn User Versand-Tab schließt. Pragmatisch:
    // gleich speichern (User kann ja Re-Submit).
    onSubmitted(entry);

    // Versand-Link öffnen — neuer Tab/App
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }

    setSubmitting(false);
  };

  return (
    <div
      className={classNames(
        "rounded-2xl border-2 overflow-hidden bg-white",
        cat === "detractor"
          ? "border-warning/40"
          : cat === "promoter"
            ? "border-gold/40"
            : "border-cream-300",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-cream-200 bg-cream-50/60 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-navy" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-ink-mid font-semibold">
            {isResubmit ? "Feedback aktualisieren" : "Test-Phase"}
          </p>
          <h3 className="font-display text-base font-semibold text-navy leading-tight">
            Feedback an Travel Concierge
          </h3>
          <p className="text-[11px] text-ink-mid mt-1 leading-relaxed">
            Du nutzt die App als Test-User. Dein Feedback geht direkt
            an das Travel-Concierge-Team und hilft uns die nächste Reise
            für andere Gruppen besser zu machen.
          </p>
        </div>
        {isResubmit && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] text-ink-light hover:text-warning transition font-medium px-2 py-1"
            aria-label="Abbrechen"
          >
            abbrechen
          </button>
        )}
      </div>

      {/* Haupt-Score: App-NPS */}
      <div className="p-4 space-y-3">
        <ScoreRow
          label="Wie wahrscheinlich würdest du Travel Concierge weiterempfehlen?"
          sublabel="Hauptfrage (für unseren NPS — Polarsteps-Vergleichswert)"
          value={appScore}
          onChange={setAppScore}
          required
        />

        {/* Score-abhängige Folge-Frage */}
        {cat && (
          <FollowUpBlock
            category={cat}
            comment={appComment}
            onChangeComment={setAppComment}
            allowFollowUp={allowFollowUp}
            onChangeAllowFollowUp={setAllowFollowUp}
            followUpContact={followUpContact}
            onChangeFollowUpContact={setFollowUpContact}
          />
        )}
      </div>

      {/* Sekundär-Scores ausklappbar */}
      <div className="border-t border-cream-200">
        <button
          type="button"
          onClick={() => setSecondaryOpen((v) => !v)}
          className="w-full px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-1.5 text-[11px] text-ink-mid hover:text-navy transition"
        >
          {secondaryOpen
            ? "Reise-Bewertung ausblenden"
            : "Bonus: auch noch die Reise bewerten (optional)"}
          <ChevronDown
            size={11}
            className={classNames(
              "transition-transform",
              secondaryOpen && "rotate-180",
            )}
          />
        </button>
        {secondaryOpen && (
          <div className="px-4 pb-4 space-y-4 border-t border-cream-200">
            <SecondaryScoreBlock
              label="Wie war der Inhalt der Reise — wurden deine Wünsche erfüllt?"
              score={contentScore}
              comment={contentComment}
              onChangeScore={setContentScore}
              onChangeComment={setContentComment}
            />
            <SecondaryScoreBlock
              label="Wie war die Organisation der Reise — hat alles geklappt wie geplant?"
              score={organizationScore}
              comment={organizationComment}
              onChangeScore={setOrganizationScore}
              onChangeComment={setOrganizationComment}
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="p-4 border-t border-cream-200 bg-cream-50/40 space-y-2">
        {error && (
          <p className="text-[11px] text-warning inline-flex items-start gap-1">
            <AlertCircle size={11} className="mt-[1px] flex-shrink-0" />
            {error}
          </p>
        )}
        {detractorCommentMissing && (
          <p className="text-[11px] text-warning inline-flex items-start gap-1">
            <AlertCircle size={11} className="mt-[1px] flex-shrink-0" />
            Bei Bewertung 0–6 brauchen wir kurz deinen Verbesserungs-Vorschlag —
            sonst können wir nichts daraus lernen.
          </p>
        )}
        <button
          type="button"
          onClick={() => handleSubmit("whatsapp")}
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 min-h-[48px] rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <Send size={14} />
          An Travel Concierge senden (WhatsApp)
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("email")}
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] rounded-xl bg-cream-100 text-ink-dark text-[11px] font-semibold hover:bg-cream-200 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <Mail size={11} />
          Stattdessen per E-Mail (öffnet Mail-App)
        </button>
        <p className="text-[10px] text-ink-light text-center italic pt-1">
          Wird lokal gespeichert + öffnet WhatsApp/Mail mit fertiger Nachricht.
          Du musst nur noch auf „Senden" tippen.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════

function ScoreRow({
  label,
  sublabel,
  value,
  onChange,
  required,
}: {
  label: string;
  sublabel?: string;
  value: number | null;
  onChange: (v: number) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-ink-dark leading-snug">
        {label}
        {required && <span className="text-warning"> *</span>}
      </label>
      {sublabel && (
        <p className="text-[10px] text-ink-light mt-0.5">{sublabel}</p>
      )}
      <div className="mt-2 grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={classNames(
              "h-9 rounded-md text-[11px] font-semibold transition border",
              value === n
                ? n <= 6
                  ? "bg-warning text-white border-warning"
                  : n <= 8
                    ? "bg-ink-mid text-white border-ink-mid"
                    : "bg-success text-white border-success"
                : n <= 6
                  ? "bg-warning/5 text-warning border-warning/30 hover:bg-warning/15"
                  : n <= 8
                    ? "bg-cream-100 text-ink-mid border-cream-300 hover:bg-cream-200"
                    : "bg-success/5 text-success border-success/30 hover:bg-success/15",
            )}
            aria-label={`Score ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-ink-light mt-1 px-0.5 uppercase tracking-wider">
        <span>Gar nicht</span>
        <span>Sehr wahrscheinlich</span>
      </div>
    </div>
  );
}

function FollowUpBlock({
  category,
  comment,
  onChangeComment,
  allowFollowUp,
  onChangeAllowFollowUp,
  followUpContact,
  onChangeFollowUpContact,
}: {
  category: NpsCategory;
  comment: string;
  onChangeComment: (v: string) => void;
  allowFollowUp: boolean;
  onChangeAllowFollowUp: (v: boolean) => void;
  followUpContact: string;
  onChangeFollowUpContact: (v: string) => void;
}) {
  const config = FOLLOW_UP_CONFIG[category];
  return (
    <div
      className={classNames(
        "rounded-xl p-3 border",
        config.bg,
        config.border,
      )}
    >
      <p className="text-[12px] font-semibold text-ink-dark leading-snug inline-flex items-start gap-1.5">
        <config.icon size={13} className={classNames("mt-[1px] flex-shrink-0", config.iconColor)} />
        {config.question}
        {config.required && <span className="text-warning"> *</span>}
      </p>
      <textarea
        value={comment}
        onChange={(e) => onChangeComment(e.target.value)}
        placeholder={config.placeholder}
        rows={3}
        className="mt-2 w-full text-[12px] p-2.5 rounded-md border border-cream-300 bg-white focus:border-navy focus:outline-none resize-none"
      />
      {category === "detractor" && (
        <div className="mt-3 pt-3 border-t border-warning/20 space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowFollowUp}
              onChange={(e) => onChangeAllowFollowUp(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-warning"
            />
            <span className="text-[11px] text-ink-dark leading-relaxed">
              Travel Concierge darf sich gerne persönlich melden — zum
              gemeinsamen Klären was schief lief.
            </span>
          </label>
          {allowFollowUp && (
            <input
              type="text"
              value={followUpContact}
              onChange={(e) => onChangeFollowUpContact(e.target.value)}
              placeholder="Telefon oder E-Mail (optional)"
              className="w-full text-[11px] p-2 rounded-md border border-cream-300 bg-white focus:border-navy focus:outline-none"
            />
          )}
        </div>
      )}
    </div>
  );
}

function SecondaryScoreBlock({
  label,
  score,
  comment,
  onChangeScore,
  onChangeComment,
}: {
  label: string;
  score: number | null;
  comment: string;
  onChangeScore: (v: number | null) => void;
  onChangeComment: (v: string) => void;
}) {
  const cat = score === null ? null : npsCategoryOf(score);
  return (
    <div>
      <ScoreRow label={label} value={score} onChange={onChangeScore} />
      {cat && (
        <textarea
          value={comment}
          onChange={(e) => onChangeComment(e.target.value)}
          placeholder={
            cat === "promoter"
              ? "Was war besonders gut? (optional)"
              : cat === "passive"
                ? "Was hätte besser sein können? (optional)"
                : "Was sollten wir verbessern? (optional)"
          }
          rows={2}
          className="mt-2 w-full text-[12px] p-2.5 rounded-md border border-cream-300 bg-white focus:border-navy focus:outline-none resize-none"
        />
      )}
      {score !== null && (
        <button
          type="button"
          onClick={() => {
            onChangeScore(null);
            onChangeComment("");
          }}
          className="mt-1 text-[10px] text-ink-light hover:text-warning transition"
        >
          zurücksetzen
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Config + Helpers
// ═══════════════════════════════════════════════════════════════

const FOLLOW_UP_CONFIG: Record<
  NpsCategory,
  {
    question: string;
    placeholder: string;
    required: boolean;
    bg: string;
    border: string;
    icon: typeof MessageCircle;
    iconColor: string;
  }
> = {
  detractor: {
    question: "Was hat nicht funktioniert? Was sollten wir verbessern?",
    placeholder:
      "Bitte 1–2 Sätze — auch ein kurzes Foto-Upload-Problem hilft uns enorm.",
    required: true,
    bg: "bg-warning/5",
    border: "border-warning/30",
    icon: AlertCircle,
    iconColor: "text-warning",
  },
  passive: {
    question:
      "Was fehlt noch damit du Travel Concierge wirklich empfehlen würdest?",
    placeholder: "Optional — kurze Idee reicht.",
    required: false,
    bg: "bg-cream-50",
    border: "border-cream-300",
    icon: MessageCircle,
    iconColor: "text-ink-mid",
  },
  promoter: {
    question: "Schön! Was hat dir besonders gefallen?",
    placeholder:
      "Optional — hilft uns zu verstehen welche Features wir ausbauen sollen.",
    required: false,
    bg: "bg-success/5",
    border: "border-success/30",
    icon: Heart,
    iconColor: "text-success",
  },
};

function labelOf(cat: NpsCategory): string {
  if (cat === "promoter") return "Promoter";
  if (cat === "passive") return "Passive";
  return "Detractor";
}
