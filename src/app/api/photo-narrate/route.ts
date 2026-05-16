import Anthropic from "@anthropic-ai/sdk";
import { getTripBySlug } from "@/data/trips";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface NarrateRequest {
  tripSlug: string;
  /** Base64 image data without the "data:image/jpeg;base64," prefix. */
  imageBase64: string;
  /** "image/jpeg" or "image/png" */
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  /** Optional context to ground the narrative */
  assignedDay?: number;
  caption?: string;
  coordinates?: { lat: number; lng: number };
}

export async function POST(req: Request) {
  let body: NarrateRequest;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { tripSlug, imageBase64, mediaType, assignedDay, caption, coordinates } =
    body;
  if (!tripSlug || !imageBase64 || !mediaType) {
    return new Response("tripSlug, imageBase64, mediaType required", {
      status: 400,
    });
  }

  const trip = getTripBySlug(tripSlug);
  if (!trip) return new Response("Trip not found", { status: 404 });

  const apiKey =
    process.env.RCMK_ANTHROPIC_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    undefined;
  if (!apiKey) {
    return new Response(
      "Kein Anthropic API-Key gefunden. Setze RCMK_ANTHROPIC_KEY.",
      { status: 500 },
    );
  }

  const client = new Anthropic({ apiKey });

  // Build context-aware system prompt
  const day =
    typeof assignedDay === "number" ? trip.days[assignedDay] : undefined;
  const contextLines: string[] = [
    `Reise: ${trip.destination}, ${trip.subtitle}.`,
  ];
  if (trip.occasionDetails) {
    contextLines.push(
      `Anlass: ${trip.occasionDetails.title}${trip.occasionDetails.reason ? ` – ${trip.occasionDetails.reason}` : ""}`,
    );
  }
  if (day) {
    contextLines.push(`Aufgenommen am: ${day.date} (${day.title}).`);
  }
  if (coordinates) {
    contextLines.push(
      `GPS: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}.`,
    );
  }
  if (caption) {
    contextLines.push(`Bildunterschrift der Reisenden: "${caption}"`);
  }
  if (trip.participants) {
    contextLines.push(
      `Reisende: ${trip.participants.map((p) => p.name).join(", ")}.`,
    );
  }

  const systemPrompt = `Du bist der KI-Reisebegleiter für die Gruppe (siehe Kontext unten). Du bekommst ein Foto und erklärst freundlich auf Deutsch (Du-Form), was zu sehen ist.

# Stil
- Maximal 3 kurze Sätze.
- Warm aber nicht überdreht.
- Wenn der Ort eindeutig erkennbar ist (z.B. ein berühmtes Gebäude): kurze interessante Info dazu, gerne ein Fun-Fact.
- Wenn nur die Szene erkennbar ist (Restaurant, Park, Straße): bezogen auf das Reiseprogramm einordnen.
- KEINE Personen-Identifikation (nicht raten wer auf dem Foto ist) – aber wenn ein Name in der Bildunterschrift steht, darfst du ihn übernehmen.
- Optional am Ende: eine Frage anbieten ("Soll ich mehr erzählen?").

# Kontext
${contextLines.join("\n")}`;

  const encoder = new TextEncoder();
  const sseStream = new ReadableStream({
    async start(controller) {
      const send = (payload: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));

      try {
        const stream = client.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 600,
          system: [
            {
              type: "text",
              text: systemPrompt,
              cache_control: { type: "ephemeral" },
            },
          ],
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
                  text: "Erzähl mir was zu diesem Foto.",
                },
              ],
            },
          ],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            send({ type: "text", text: event.delta.text });
          }
        }

        const finalMessage = await stream.finalMessage();
        send({
          type: "done",
          usage: {
            input: finalMessage.usage.input_tokens,
            output: finalMessage.usage.output_tokens,
            cache_read: finalMessage.usage.cache_read_input_tokens ?? 0,
            cache_write: finalMessage.usage.cache_creation_input_tokens ?? 0,
          },
        });
        controller.close();
      } catch (err) {
        let message = "Interner Fehler";
        if (err instanceof Anthropic.APIError) {
          message = `Claude API: ${err.status} ${err.message}`;
        } else if (err instanceof Error) {
          message = err.message;
        }
        send({ type: "error", message });
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
