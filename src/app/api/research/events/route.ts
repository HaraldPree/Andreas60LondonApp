/**
 * v1.10.0 — POST /api/research/events
 *
 * AI-basierte Event-Recherche für eine Reise via Claude Opus 4.7.
 * Output ist ein strukturierter Vorschlag — KEIN Auto-Save in Trip-Daten.
 * User entscheidet via UI welche Events übernommen werden.
 *
 * Anti-Halluzinations-Pipeline:
 * 1. Strenger System-Prompt (eventResearchPrompt.ts)
 * 2. Server-seitige Validierung: Events ohne source/bookingUrl werden verworfen
 * 3. Events mit confidence:"low" werden verworfen
 * 4. UI zeigt source-URL als anklickbaren Link → User verifiziert manuell
 */

import Anthropic from "@anthropic-ai/sdk";
import { buildEventResearchPrompt } from "@/lib/eventResearchPrompt";
import type { Event, EventCategory, EventRecurring } from "@/types/event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_REQUEST_BYTES = 10 * 1024; // 10 KB — kleiner Request
const MAX_CITY_LENGTH = 80;
const MAX_CONTEXT_LENGTH = 500;

interface ResearchRequest {
  city: string;
  fromDate: string;
  toDate: string;
  existingEventIds?: string[];
  context?: string;
}

interface ResearchEvent extends Event {
  confidence?: "high" | "medium" | "low";
}

interface ResearchResponse {
  events: ResearchEvent[];
  notes?: string;
  /** Rohtext von Claude, falls JSON-Parse fehlschlug */
  rawResponse?: string;
  /** Wie viele Events verworfen wurden + warum */
  filteredCount?: number;
  filterReasons?: string[];
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const ALLOWED_CATEGORIES: EventCategory[] = [
  "festival",
  "exhibition",
  "sport",
  "music",
  "culture",
  "seasonal",
  "market",
  "fireworks",
  "pride",
  "other",
];

const ALLOWED_RECURRING: EventRecurring[] = [
  "annual-fixed-date",
  "annual-fixed-week",
  "annual-bank-holiday",
  "biennial",
  "one-off",
  "weekly",
  null,
];

export async function POST(req: Request) {
  // 1) Size check
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_BYTES) {
    return new Response("Request body too large", { status: 413 });
  }

  // 2) Parse JSON
  let body: ResearchRequest;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // 3) Validate input
  const { city, fromDate, toDate, existingEventIds, context } = body;

  if (!city || typeof city !== "string" || city.length === 0) {
    return new Response("city ist Pflicht", { status: 400 });
  }
  if (city.length > MAX_CITY_LENGTH) {
    return new Response(`city zu lang (max ${MAX_CITY_LENGTH})`, { status: 400 });
  }
  if (!fromDate || !ISO_DATE_RE.test(fromDate)) {
    return new Response("fromDate muss ISO YYYY-MM-DD sein", { status: 400 });
  }
  if (!toDate || !ISO_DATE_RE.test(toDate)) {
    return new Response("toDate muss ISO YYYY-MM-DD sein", { status: 400 });
  }
  if (fromDate > toDate) {
    return new Response("fromDate muss <= toDate sein", { status: 400 });
  }
  if (existingEventIds && !Array.isArray(existingEventIds)) {
    return new Response("existingEventIds muss Array sein", { status: 400 });
  }
  if (context && (typeof context !== "string" || context.length > MAX_CONTEXT_LENGTH)) {
    return new Response(`context zu lang (max ${MAX_CONTEXT_LENGTH})`, {
      status: 400,
    });
  }

  // 4) Anthropic-Key holen (gleiche Fallback-Kette wie /api/chat)
  const apiKey =
    process.env.APP_ANTHROPIC_KEY ||
    process.env.RCMK_ANTHROPIC_KEY ||
    process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("APP_ANTHROPIC_KEY fehlt — Recherche nicht möglich.", {
      status: 500,
    });
  }

  const client = new Anthropic({ apiKey });

  // 5) Claude-Call
  const systemPrompt = buildEventResearchPrompt({
    city,
    fromDate,
    toDate,
    existingEventIds,
    context,
  });

  let claudeText: string;
  try {
    const completion = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Recherche die Events für ${city} im Zeitraum ${fromDate} bis ${toDate}. Antworte ausschließlich mit dem JSON-Block.`,
        },
      ],
    });

    // Text-Content extrahieren
    const textBlock = completion.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return new Response("Claude lieferte keinen Text-Content", { status: 502 });
    }
    claudeText = textBlock.text;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return new Response(`Anthropic-Call fehlgeschlagen: ${message}`, {
      status: 502,
    });
  }

  // 6) JSON aus Claude-Antwort extrahieren
  const jsonMatch = claudeText.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) {
    const response: ResearchResponse = {
      events: [],
      rawResponse: claudeText,
      filterReasons: ["Kein ```json-Block in Antwort gefunden"],
    };
    return Response.json(response, { status: 200 });
  }

  let parsed: { events?: unknown; notes?: string };
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch {
    const response: ResearchResponse = {
      events: [],
      rawResponse: claudeText,
      filterReasons: ["JSON-Parse-Fehler im Antwort-Block"],
    };
    return Response.json(response, { status: 200 });
  }

  // 7) Pro-Event-Validierung (Anti-Halluzinations-Filter)
  const rawEvents = Array.isArray(parsed.events) ? parsed.events : [];
  const accepted: ResearchEvent[] = [];
  const filterReasons: string[] = [];

  for (const raw of rawEvents) {
    const reason = validateAndNormalize(raw);
    if (typeof reason === "string") {
      filterReasons.push(reason);
    } else {
      accepted.push(reason);
    }
  }

  const response: ResearchResponse = {
    events: accepted,
    notes: parsed.notes,
    filteredCount: rawEvents.length - accepted.length,
    filterReasons: filterReasons.length > 0 ? filterReasons : undefined,
  };

  return Response.json(response, {
    status: 200,
    headers: {
      // Recherche-Antworten dürfen 10 Min gecached werden — gleiche Anfrage
      // liefert (fast) gleiche Antwort
      "Cache-Control": "private, max-age=600",
    },
  });
}

/**
 * Validiert ein Raw-Event aus Claude-Output. Liefert entweder einen
 * normalisierten ResearchEvent ODER einen String mit dem Ablehnungsgrund.
 */
function validateAndNormalize(raw: unknown): ResearchEvent | string {
  if (!raw || typeof raw !== "object") return "Eintrag ist kein Object";
  const r = raw as Record<string, unknown>;

  // Pflichtfelder Anti-Halluzination:
  // id, name, startDate, endDate, source — ohne diese: verwerfen
  if (typeof r.id !== "string" || r.id.length === 0) {
    return "id fehlt";
  }
  if (typeof r.name !== "string" || r.name.length === 0) {
    return `${r.id}: name fehlt`;
  }
  if (typeof r.source !== "string" || r.source.length < 5) {
    return `${r.id}: source fehlt oder zu kurz (Anti-Halluzination)`;
  }
  if (typeof r.startDate !== "string" || !ISO_DATE_RE.test(r.startDate)) {
    return `${r.id}: startDate ungültig`;
  }
  if (typeof r.endDate !== "string" || !ISO_DATE_RE.test(r.endDate)) {
    return `${r.id}: endDate ungültig`;
  }
  if (r.startDate > r.endDate) {
    return `${r.id}: startDate > endDate`;
  }

  // confidence: "low" → verwerfen (Anti-Halluzinations-Strenge)
  if (r.confidence === "low") {
    return `${r.id}: confidence=low (verworfen, zu unsicher)`;
  }

  // Category-Whitelist
  const category = ALLOWED_CATEGORIES.includes(r.category as EventCategory)
    ? (r.category as EventCategory)
    : "other";

  // Recurring-Whitelist
  const recurring: EventRecurring = ALLOWED_RECURRING.includes(
    r.recurring as EventRecurring,
  )
    ? (r.recurring as EventRecurring)
    : null;

  // Location ist Pflicht aber kann generisch sein → wir nehmen Stadt als Fallback nicht,
  // sondern verwerfen
  if (typeof r.location !== "string" || r.location.length === 0) {
    return `${r.id}: location fehlt`;
  }
  if (typeof r.description !== "string" || r.description.length === 0) {
    return `${r.id}: description fehlt`;
  }

  // Coordinates: nur wenn beide Zahlen sind
  let coordinates: { lat: number; lng: number } | undefined;
  if (
    r.coordinates &&
    typeof r.coordinates === "object" &&
    typeof (r.coordinates as { lat?: unknown }).lat === "number" &&
    typeof (r.coordinates as { lng?: unknown }).lng === "number"
  ) {
    const c = r.coordinates as { lat: number; lng: number };
    coordinates = { lat: c.lat, lng: c.lng };
  }

  // visitorTips: nur strings akzeptieren
  const visitorTips = Array.isArray(r.visitorTips)
    ? r.visitorTips.filter((t): t is string => typeof t === "string" && t.length > 0)
    : undefined;

  // tags: nur strings akzeptieren
  const tags = Array.isArray(r.tags)
    ? r.tags.filter((t): t is string => typeof t === "string" && t.length > 0)
    : undefined;

  const event: ResearchEvent = {
    id: r.id,
    name: r.name,
    category,
    icon: typeof r.icon === "string" ? r.icon : undefined,
    startDate: r.startDate,
    endDate: r.endDate,
    location: r.location,
    coordinates,
    description: r.description,
    visitorTips: visitorTips && visitorTips.length > 0 ? visitorTips : undefined,
    bookingUrl: typeof r.bookingUrl === "string" ? r.bookingUrl : undefined,
    cost: typeof r.cost === "string" ? r.cost : undefined,
    bookingRequired: typeof r.bookingRequired === "boolean" ? r.bookingRequired : undefined,
    recurring,
    lastVerified: new Date().toISOString().slice(0, 10),
    source: r.source,
    city: typeof r.city === "string" ? r.city : undefined,
    tags: tags && tags.length > 0 ? tags : undefined,
    confidence:
      r.confidence === "high" || r.confidence === "medium" ? r.confidence : undefined,
  };

  return event;
}
