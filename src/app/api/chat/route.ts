import Anthropic from "@anthropic-ai/sdk";
import { getTripBySlug } from "@/data/trips";
import { buildCompanionSystemPrompt } from "@/lib/companionPrompt";
import { companionTools, companionToolHandlers } from "@/lib/companionTools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TOOL_ITERATIONS = 5;

interface ChatRequest {
  tripSlug: string;
  messages: Anthropic.MessageParam[];
  currentUserName?: string;
}

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { tripSlug, messages, currentUserName } = body;
  if (!tripSlug || !Array.isArray(messages) || messages.length === 0) {
    return new Response("tripSlug and messages required", { status: 400 });
  }

  const trip = getTripBySlug(tripSlug);
  if (!trip) {
    return new Response("Trip not found", { status: 404 });
  }

  const apiKey =
    process.env.RCMK_ANTHROPIC_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    undefined;
  if (!apiKey) {
    return new Response(
      "Kein Anthropic API-Key gefunden. Setze RCMK_ANTHROPIC_KEY in .env.local.",
      { status: 500 },
    );
  }

  const client = new Anthropic({ apiKey });
  // System prompt is stable per trip (cacheable). The current-user identity
  // changes between requests, so it goes into an ephemeral system message via
  // the messages array (as a system-reminder pattern that doesn't break cache).
  const systemPrompt = buildCompanionSystemPrompt(trip);
  const workingMessages: Anthropic.MessageParam[] =
    currentUserName && trip.participants?.some((p) => p.name === currentUserName)
      ? [
          {
            role: "user",
            content: `<system-context>Der User der jetzt fragt ist ${currentUserName}. Sprich sie/ihn namentlich an wenn passend.</system-context>`,
          },
          {
            role: "assistant",
            content: "Verstanden – ich antworte persönlich.",
          },
          ...messages,
        ]
      : [...messages];

  const encoder = new TextEncoder();
  const sseStream = new ReadableStream({
    async start(controller) {
      const send = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
          const stream = client.messages.stream({
            model: "claude-opus-4-7",
            max_tokens: 4096,
            system: [
              {
                type: "text",
                text: systemPrompt,
                cache_control: { type: "ephemeral" },
              },
            ],
            tools: companionTools,
            messages: workingMessages,
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              send({ type: "text", text: event.delta.text });
            } else if (
              event.type === "content_block_start" &&
              event.content_block.type === "tool_use"
            ) {
              send({
                type: "tool_start",
                name: event.content_block.name,
              });
            }
          }

          const finalMessage = await stream.finalMessage();

          if (finalMessage.stop_reason === "end_turn") {
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
            return;
          }

          if (finalMessage.stop_reason !== "tool_use") {
            send({
              type: "done",
              stop_reason: finalMessage.stop_reason,
              usage: {
                input: finalMessage.usage.input_tokens,
                output: finalMessage.usage.output_tokens,
              },
            });
            controller.close();
            return;
          }

          const toolUseBlocks = finalMessage.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
          );

          workingMessages.push({
            role: "assistant",
            content: finalMessage.content,
          });

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const tu of toolUseBlocks) {
            send({ type: "tool_done", name: tu.name });
            const handler = companionToolHandlers[tu.name];
            const result = handler
              ? await handler(tu.input as Record<string, unknown>)
              : JSON.stringify({ error: `Unknown tool: ${tu.name}` });
            toolResults.push({
              type: "tool_result",
              tool_use_id: tu.id,
              content: result,
            });
          }

          workingMessages.push({ role: "user", content: toolResults });
        }

        send({ type: "error", message: "Tool loop max iterations exceeded" });
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
