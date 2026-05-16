"use client";

import { useCallback, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: string[];
  isStreaming?: boolean;
}

interface UseCompanionOptions {
  tripSlug: string;
}

export function useCompanion({ tripSlug }: UseCompanionOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text.trim(),
      };
      const assistantId = `a-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        toolCalls: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setLoading(true);
      setError(null);

      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const conversationForApi = [
          ...messages
            .filter((m) => !m.isStreaming)
            .map((m) => ({ role: m.role, content: m.content })),
          { role: userMsg.role, content: userMsg.content },
        ];

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripSlug, messages: conversationForApi }),
          signal: abort.signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API ${res.status}: ${errText || res.statusText}`);
        }
        if (!res.body) throw new Error("Kein Response-Stream");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const evt of events) {
            const line = evt.trim();
            if (!line.startsWith("data:")) continue;
            const json = line.slice(5).trim();
            if (!json) continue;
            try {
              const payload = JSON.parse(json) as {
                type: string;
                text?: string;
                name?: string;
                message?: string;
              };

              if (payload.type === "text" && payload.text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + payload.text }
                      : m,
                  ),
                );
              } else if (payload.type === "tool_start" && payload.name) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          toolCalls: [...(m.toolCalls ?? []), payload.name!],
                        }
                      : m,
                  ),
                );
              } else if (payload.type === "error" && payload.message) {
                setError(payload.message);
              } else if (payload.type === "done") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, isStreaming: false } : m,
                  ),
                );
              }
            } catch {
              // Skip malformed SSE events
            }
          }
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          // User cancelled
        } else {
          const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
          setError(msg);
        }
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m,
          ),
        );
        setLoading(false);
        abortRef.current = null;
      }
    },
    [tripSlug, messages, loading],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    cancel();
  }, [cancel]);

  return { messages, loading, error, send, cancel, reset };
}
