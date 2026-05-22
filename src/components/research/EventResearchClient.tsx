"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { Event } from "@/types/event";
import { EVENT_CATEGORY_META } from "@/types/event";
import { classNames } from "@/lib/formatters";

interface ResearchEvent extends Event {
  confidence?: "high" | "medium" | "low";
}

interface ResearchDefaults {
  tripSlug: string;
  city: string;
  fromDate: string;
  toDate: string;
  existingEventIds: string[];
  context: string;
}

interface Props {
  defaults: ResearchDefaults | null;
}

interface ResearchResponse {
  events: ResearchEvent[];
  notes?: string;
  rawResponse?: string;
  filteredCount?: number;
  filterReasons?: string[];
}

/**
 * v1.10.0 — AI-Pre-Trip-Event-Recherche.
 *
 * Form → POST /api/research/events → Vorschläge anzeigen → User klickt
 * "Als TS kopieren" pro Event ODER "Alle als Array kopieren" → fügt in
 * src/data/trips/[city]-events.ts ein.
 */
export function EventResearchClient({ defaults }: Props) {
  const [city, setCity] = useState(defaults?.city ?? "");
  const [fromDate, setFromDate] = useState(defaults?.fromDate ?? "");
  const [toDate, setToDate] = useState(defaults?.toDate ?? "");
  const [context, setContext] = useState(defaults?.context ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ResearchResponse | null>(null);

  const existingEventIds = defaults?.existingEventIds ?? [];

  const canSubmit = useMemo(
    () => city.length > 0 && fromDate.length === 10 && toDate.length === 10 && !loading,
    [city, fromDate, toDate, loading],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/research/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          fromDate,
          toDate,
          existingEventIds,
          context: context || undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data: ResearchResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream-50 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <header className="flex items-start gap-3 pb-2">
          {defaults?.tripSlug && (
            <Link
              href={`/${defaults.tripSlug}`}
              className="text-ink-mid hover:text-navy transition flex items-center gap-1 text-xs font-medium pt-1"
              aria-label="Zurück zur Reise"
            >
              <ArrowLeft size={14} /> zurück
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-gold-600 font-bold flex items-center gap-1">
              <Sparkles size={11} /> v1.10.0 — AI-Recherche
            </p>
            <h1 className="font-display text-2xl font-bold text-navy leading-tight">
              Events recherchieren
            </h1>
            <p className="text-sm text-ink-mid mt-1">
              Claude sucht nach Festivals, Sport, Konzerten & Sonderausstellungen
              die in den Reisezeitraum fallen. Strikt Anti-Halluzination: jedes
              Event braucht eine offizielle Quelle.
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white border border-cream-200 p-4 space-y-3 shadow-sm"
        >
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-mid font-semibold">
              Stadt
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="London"
              className="mt-1 w-full rounded-lg border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink-dark focus:outline-none focus:ring-2 focus:ring-gold/40"
              maxLength={80}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-ink-mid font-semibold">
                Von
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink-dark focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-ink-mid font-semibold">
                Bis
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink-dark focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-mid font-semibold">
              Kontext (optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="z.B. 60. Geburtstag, 5 Erwachsene, Foodie-Affinität"
              className="mt-1 w-full rounded-lg border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink-dark focus:outline-none focus:ring-2 focus:ring-gold/40"
              maxLength={500}
            />
          </div>

          {existingEventIds.length > 0 && (
            <p className="text-[11px] text-ink-mid">
              {existingEventIds.length} bekannte Event-IDs werden an Claude
              übergeben (zur Duplikat-Vermeidung).
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-navy text-cream-50 py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Claude recherchiert …
              </>
            ) : (
              <>
                <Search size={16} /> Events recherchieren
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 text-sm text-warning">
            <p className="font-semibold">Fehler:</p>
            <p className="text-xs mt-1 font-mono whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {response && <ResultBlock response={response} />}
      </div>
    </main>
  );
}

function ResultBlock({ response }: { response: ResearchResponse }) {
  const { events, notes, filteredCount, filterReasons, rawResponse } = response;

  if (events.length === 0 && rawResponse) {
    return (
      <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4 space-y-2">
        <p className="font-semibold text-warning text-sm">Keine Events extrahiert</p>
        <p className="text-xs text-ink-dark">
          Claude lieferte keine parsbare JSON-Antwort. Rohtext zum Debuggen:
        </p>
        <pre className="text-[10px] font-mono bg-cream-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
          {rawResponse.slice(0, 2000)}
        </pre>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl bg-cream-100 border border-cream-200 p-4">
        <p className="text-sm text-ink-mid">
          Keine Events für diesen Zeitraum gefunden. Vielleicht andere Daten
          probieren?
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-success/8 border border-success/25 p-3 flex items-start gap-2">
        <ShieldCheck size={16} className="text-success mt-0.5 flex-shrink-0" />
        <div className="text-xs text-ink-dark flex-1">
          <p className="font-semibold">
            {events.length} {events.length === 1 ? "Event" : "Events"} verifiziert
          </p>
          {filteredCount && filteredCount > 0 && (
            <p className="text-ink-mid mt-0.5">
              {filteredCount} weitere(s) verworfen (Anti-Halluzinations-Filter)
            </p>
          )}
          {notes && <p className="text-ink-mid italic mt-1">{notes}</p>}
        </div>
      </div>

      <CopyAllSnippet events={events} />

      {events.map((ev) => (
        <EventResultCard key={ev.id} event={ev} />
      ))}

      {filterReasons && filterReasons.length > 0 && (
        <details className="rounded-xl bg-cream-100 border border-cream-200 p-3">
          <summary className="text-xs font-semibold text-ink-mid cursor-pointer flex items-center gap-1">
            <ShieldAlert size={12} /> Verworfen ({filterReasons.length})
          </summary>
          <ul className="mt-2 space-y-1 text-[11px] text-ink-mid font-mono">
            {filterReasons.map((r, i) => (
              <li key={i}>· {r}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function EventResultCard({ event }: { event: ResearchEvent }) {
  const [copied, setCopied] = useState(false);
  const catMeta = EVENT_CATEGORY_META[event.category];

  const snippet = useMemo(() => buildEventSnippet(event), [event]);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: alert
      window.alert("Clipboard nicht verfügbar — Snippet selbst markieren:\n\n" + snippet);
    }
  }

  return (
    <article className="rounded-2xl bg-white border border-cream-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">
            {event.icon ?? catMeta.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-base font-bold text-navy leading-tight">
                {event.name}
              </h3>
              {event.confidence && (
                <ConfidencePill confidence={event.confidence} />
              )}
            </div>
            <p className="text-[11px] text-ink-mid mt-0.5 inline-flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(event.startDate)}
              {event.endDate !== event.startDate
                ? ` – ${formatDate(event.endDate)}`
                : ""}
              <span className="text-ink-light mx-1">·</span>
              <span>{catMeta.label}</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-ink-dark leading-relaxed">{event.description}</p>

        {event.location && (
          <p className="text-[11px] text-ink-mid inline-flex items-center gap-1">
            <MapPin size={11} /> {event.location}
          </p>
        )}

        {event.cost && (
          <p className="text-[11px] inline-block px-2 py-0.5 rounded bg-cream-100 text-ink-mid font-mono">
            {event.cost}
            {event.bookingRequired ? " · ticket-pflicht" : ""}
          </p>
        )}

        {event.visitorTips && event.visitorTips.length > 0 && (
          <ul className="space-y-1 mt-1">
            {event.visitorTips.map((tip, i) => (
              <li
                key={i}
                className="text-[11px] text-ink-dark leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-gold"
              >
                {tip}
              </li>
            ))}
          </ul>
        )}

        <div className="pt-2 flex items-center flex-wrap gap-3 border-t border-cream-100">
          {event.bookingUrl && (
            <a
              href={event.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-navy hover:text-gold transition inline-flex items-center gap-1 font-medium"
            >
              <ExternalLink size={11} /> Quelle prüfen
            </a>
          )}
          <button
            type="button"
            onClick={copySnippet}
            className={classNames(
              "text-[11px] inline-flex items-center gap-1 font-semibold ml-auto px-3 py-1.5 rounded-md transition",
              copied
                ? "bg-success/15 text-success"
                : "bg-navy text-cream-50 hover:bg-navy/90",
            )}
          >
            {copied ? (
              <>
                <Check size={11} /> kopiert
              </>
            ) : (
              <>
                <Copy size={11} /> Als TS kopieren
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-ink-light italic pt-1">
          Quelle: {event.source} · Stand: {event.lastVerified}
        </p>
      </div>
    </article>
  );
}

function CopyAllSnippet({ events }: { events: ResearchEvent[] }) {
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    const items = events.map(buildEventSnippet).join(",\n  ");
    return `// Auto-Recherche v1.10.0\n[\n  ${items}\n]`;
  }, [events]);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.alert("Clipboard nicht verfügbar.");
    }
  }

  return (
    <button
      type="button"
      onClick={copyAll}
      className={classNames(
        "w-full rounded-xl py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-2 transition",
        copied
          ? "bg-success/15 text-success"
          : "bg-gold/15 border border-gold/40 text-navy hover:bg-gold/25",
      )}
    >
      {copied ? (
        <>
          <Check size={14} /> {events.length}-Event-Array kopiert!
        </>
      ) : (
        <>
          <Copy size={14} /> Alle {events.length} als TS-Array kopieren
        </>
      )}
    </button>
  );
}

function ConfidencePill({ confidence }: { confidence: "high" | "medium" | "low" }) {
  if (confidence === "high") {
    return (
      <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-success/15 text-success">
        verified
      </span>
    );
  }
  if (confidence === "medium") {
    return (
      <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-info/15 text-info">
        prüfen
      </span>
    );
  }
  return null;
}

/** Wandelt ein Event in ein TypeScript-Snippet zum Einkleben in [city]-events.ts. */
function buildEventSnippet(event: ResearchEvent): string {
  const lines: string[] = [];
  lines.push("{");
  lines.push(`    id: ${JSON.stringify(event.id)},`);
  lines.push(`    name: ${JSON.stringify(event.name)},`);
  lines.push(`    category: ${JSON.stringify(event.category)},`);
  if (event.icon) lines.push(`    icon: ${JSON.stringify(event.icon)},`);
  lines.push(`    startDate: ${JSON.stringify(event.startDate)},`);
  lines.push(`    endDate: ${JSON.stringify(event.endDate)},`);
  lines.push(`    location: ${JSON.stringify(event.location)},`);
  if (event.coordinates) {
    lines.push(
      `    coordinates: { lat: ${event.coordinates.lat}, lng: ${event.coordinates.lng} },`,
    );
  }
  lines.push(`    description: ${JSON.stringify(event.description)},`);
  if (event.visitorTips && event.visitorTips.length > 0) {
    lines.push(
      `    visitorTips: [${event.visitorTips.map((t) => "\n      " + JSON.stringify(t)).join(",")},\n    ],`,
    );
  }
  if (event.bookingUrl) lines.push(`    bookingUrl: ${JSON.stringify(event.bookingUrl)},`);
  if (event.cost) lines.push(`    cost: ${JSON.stringify(event.cost)},`);
  if (event.bookingRequired !== undefined) {
    lines.push(`    bookingRequired: ${event.bookingRequired},`);
  }
  if (event.recurring) {
    lines.push(`    recurring: ${JSON.stringify(event.recurring)},`);
  }
  lines.push(`    lastVerified: VERIFIED,`);
  lines.push(`    source: ${JSON.stringify(event.source)},`);
  if (event.city) lines.push(`    city: ${JSON.stringify(event.city)},`);
  if (event.tags && event.tags.length > 0) {
    lines.push(`    tags: [${event.tags.map((t) => JSON.stringify(t)).join(", ")}],`);
  }
  lines.push("  }");
  return lines.join("\n  ");
}

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
