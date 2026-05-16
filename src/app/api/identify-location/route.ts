import Anthropic from "@anthropic-ai/sdk";
import { getTripBySlug } from "@/data/trips";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_REQUEST_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_BASE64_BYTES = 7 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

interface IdentifyRequest {
  tripSlug: string;
  imageBase64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
}

export interface LocationResult {
  identified: boolean;
  confidence: "high" | "medium" | "low";
  name?: string;
  alternativeName?: string;
  category?: string;
  description?: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  distanceFromApartment?: string;
  transitOptions?: string[];
  bestTime?: string;
  estimatedVisitMinutes?: number;
  notes?: string;
  /** Raw text from Claude if JSON parse fails */
  rawResponse?: string;
  error?: string;
}

export async function POST(req: Request) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_BYTES) {
    return new Response("Foto zu groß (max 10 MB).", { status: 413 });
  }

  let body: IdentifyRequest;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { tripSlug, imageBase64, mediaType } = body;
  if (!tripSlug || !imageBase64 || !mediaType) {
    return new Response("tripSlug, imageBase64, mediaType required", {
      status: 400,
    });
  }

  if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
    return new Response("Bildformat nicht unterstützt.", { status: 400 });
  }
  if (imageBase64.length > MAX_IMAGE_BASE64_BYTES) {
    return new Response("Foto zu groß für AI-Analyse (max ~5 MB).", {
      status: 413,
    });
  }

  const trip = getTripBySlug(tripSlug);
  if (!trip) return new Response("Trip not found", { status: 404 });

  const apiKey =
    process.env.APP_ANTHROPIC_KEY ||
    process.env.RCMK_ANTHROPIC_KEY ||
    process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Kein Anthropic API-Key konfiguriert." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const client = new Anthropic({ apiKey });

  const apartmentInfo = `${trip.accommodation.name}, ${trip.accommodation.address} (lat ${trip.accommodation.coordinates.lat}, lng ${trip.accommodation.coordinates.lng})`;

  // Build disruption context for transit recommendations
  let disruptionInfo = "";
  if (trip.disruptions && trip.disruptions.length > 0) {
    disruptionInfo = trip.disruptions
      .map(
        (d) =>
          `${d.shortLabel} (${d.service}): ${new Date(d.startIso).toLocaleString("de-DE")} → ${new Date(d.endIso).toLocaleString("de-DE")} — Alternativen: ${d.alternatives.join(", ")}`,
      )
      .join("\n");
  }

  const systemPrompt = `Du bist ein London-Experte und identifizierst Orte in Fotos für eine Reisegruppe.

KONTEXT:
- Apartment: ${apartmentInfo}
- Reise: ${trip.subtitle}
${disruptionInfo ? `- AKTIVE STÖRUNGEN:\n${disruptionInfo}` : ""}

AUFGABE:
Identifiziere den Ort im Foto. Antworte AUSSCHLIESSLICH mit gültigem JSON, KEIN Vorwort, KEIN Markdown.

Wenn IDENTIFIZIERT:
{
  "identified": true,
  "confidence": "high"|"medium"|"low",
  "name": "Name des Orts auf Deutsch falls üblich, sonst Englisch",
  "alternativeName": "alternativer Name falls relevant",
  "category": "Sehenswürdigkeit"|"Restaurant"|"Park"|"Markt"|"Museum"|"Stadtteil"|"Pub"|...,
  "description": "2-3 warme deutsche Sätze MIT 1 interessantem Fakt",
  "coordinates": { "lat": X.XXXX, "lng": Y.YYYY },
  "address": "Adresse falls bekannt",
  "distanceFromApartment": "ca. X.X km",
  "transitOptions": [
    "Beste Option: ... (mit Streik-Hinweis falls relevant)",
    "Alternative: ..."
  ],
  "bestTime": "z.B. 'Vormittags ruhig'",
  "estimatedVisitMinutes": 60,
  "notes": "Eintritt, Reservierung, Tipp"
}

Wenn NICHT identifizierbar:
{
  "identified": false,
  "confidence": "low",
  "description": "Was du auf dem Foto siehst (Szene + Stimmung)",
  "notes": "Was der User tun könnte (Google Reverse Image, Freund fragen)"
}

REGELN:
- ZWINGEND nur gültiges JSON, beginnt mit { und endet mit }
- coordinates nur wenn du SICHER bist (sonst weglassen)
- Bei Transit IMMER auf aktive Störungen oben Rücksicht nehmen
- KEINE Erfindungen – lieber "low confidence" als raten
- Auf Deutsch (Du-Form)`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Identifiziere diesen Ort in London. Antworte nur mit JSON.",
            },
          ],
        },
      ],
    });

    // Extract text from response
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Try to parse as JSON (Claude sometimes wraps in code fence)
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let parsed: LocationResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Couldn't parse → return raw text so UI can show something useful
      return Response.json(
        {
          identified: false,
          confidence: "low",
          description: text.slice(0, 600),
          notes: "Antwort konnte nicht strukturiert geparst werden.",
          rawResponse: text,
        } satisfies LocationResult,
        { status: 200 },
      );
    }

    return Response.json(parsed satisfies LocationResult);
  } catch (err) {
    let message = "Unbekannter Fehler";
    if (err instanceof Anthropic.APIError) {
      message = `Claude API: ${err.status} ${err.message}`;
    } else if (err instanceof Error) {
      message = err.message;
    }
    return Response.json(
      {
        identified: false,
        confidence: "low",
        error: message,
      } satisfies LocationResult,
      { status: 500 },
    );
  }
}
