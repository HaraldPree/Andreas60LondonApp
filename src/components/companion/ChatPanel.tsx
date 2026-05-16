"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Send,
  Square,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCompanion } from "@/hooks/useCompanion";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/useSpeech";
import { classNames } from "@/lib/formatters";

interface ChatPanelProps {
  tripSlug: string;
  destination: string;
}

const QUICK_PROMPTS = [
  "Was empfiehlst du uns für heute?",
  "Wie ist das Wetter morgen?",
  "Funktioniert die Tube gerade?",
  "Indoor-Plan bei Regen?",
];

export function ChatPanel({ tripSlug, destination }: ChatPanelProps) {
  const { messages, loading, error, send, cancel, reset } = useCompanion({ tripSlug });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef<string>("");

  const speech = useSpeechRecognition({ lang: "de-DE" });
  const tts = useSpeechSynthesis({ lang: "de-DE" });

  // Auto-scroll to bottom on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Speak final assistant message
  useEffect(() => {
    if (!tts.enabled) return;
    const last = messages[messages.length - 1];
    if (
      last &&
      last.role === "assistant" &&
      !last.isStreaming &&
      last.content &&
      last.content !== lastSpokenRef.current
    ) {
      lastSpokenRef.current = last.content;
      tts.speak(last.content);
    }
  }, [messages, tts]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    send(input);
    setInput("");
  };

  const handleMic = () => {
    if (speech.listening) {
      speech.stop();
    } else {
      tts.cancel();
      speech.start((finalText) => {
        setInput(finalText);
        send(finalText);
        setInput("");
      });
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (loading) return;
    send(prompt);
  };

  const showEmptyState = messages.length === 0;

  return (
    <>
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-cream-50"
      >
        {showEmptyState && (
          <EmptyState
            destination={destination}
            quickPrompts={QUICK_PROMPTS}
            onPick={handleQuickPrompt}
            disabled={loading}
          />
        )}

        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}

        {error && (
          <div className="mx-auto rounded-xl bg-warning/10 border border-warning/30 px-3 py-2 text-xs text-warning text-center">
            {error}
          </div>
        )}
      </div>

      {/* Quick prompts (only when chat has started) */}
      {!showEmptyState && messages.length < 4 && (
        <div className="flex-shrink-0 px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleQuickPrompt(p)}
              disabled={loading}
              className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-cream-200 text-ink-mid hover:bg-cream-300 disabled:opacity-50 transition"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 border-t border-cream-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => tts.setEnabled(!tts.enabled)}
            disabled={!tts.supported}
            className={classNames(
              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition",
              tts.enabled
                ? "bg-gold/15 text-gold-600"
                : "bg-cream-200 text-ink-light",
              !tts.supported && "opacity-30",
            )}
            aria-label={tts.enabled ? "Sprachausgabe aus" : "Sprachausgabe an"}
            title={tts.enabled ? "Sprachausgabe aus" : "Sprachausgabe an"}
          >
            {tts.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                speech.listening ? "Höre zu…" : "Frag mich was…"
              }
              disabled={loading || speech.listening}
              className="w-full px-3 py-2 text-sm rounded-full border border-cream-200 bg-cream-50 focus:bg-white focus:border-gold focus:outline-none disabled:opacity-50"
            />
          </div>

          {speech.supported && (
            <button
              type="button"
              onClick={handleMic}
              disabled={loading}
              className={classNames(
                "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition",
                speech.listening
                  ? "bg-warning text-white animate-pulse"
                  : "bg-navy/10 text-navy hover:bg-navy/15",
              )}
              aria-label={speech.listening ? "Stop" : "Mikrofon"}
            >
              {speech.listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}

          {loading ? (
            <button
              type="button"
              onClick={cancel}
              className="w-9 h-9 rounded-full bg-warning text-white flex items-center justify-center flex-shrink-0"
              aria-label="Abbrechen"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full bg-navy text-cream flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition"
              aria-label="Senden"
            >
              <Send size={15} />
            </button>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="w-9 h-9 rounded-full bg-cream-200 text-ink-light hover:text-warning flex items-center justify-center flex-shrink-0"
              aria-label="Chat zurücksetzen"
              title="Chat zurücksetzen"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </form>
    </>
  );
}

function EmptyState({
  destination,
  quickPrompts,
  onPick,
  disabled,
}: {
  destination: string;
  quickPrompts: string[];
  onPick: (p: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
        <Sparkles size={28} className="text-gold-600" />
      </div>
      <h3 className="font-display text-lg font-semibold text-navy">
        Hallo! Wie kann ich dir helfen?
      </h3>
      <p className="text-xs text-ink-mid mt-2 max-w-[280px] mx-auto leading-relaxed">
        Ich kenne euer komplettes {destination}-Programm, kann live Wetter
        prüfen und sehe ob die Tube läuft. Frag mich was zur Reise!
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2 max-w-[300px] mx-auto">
        {quickPrompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            disabled={disabled}
            className="text-[11px] px-2.5 py-2 rounded-lg bg-white border border-cream-200 hover:border-gold/40 hover:bg-gold/5 text-ink-dark leading-tight transition disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({ message }: { message: { id: string; role: "user" | "assistant"; content: string; toolCalls?: string[]; isStreaming?: boolean } }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] bg-navy text-cream rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm leading-relaxed">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%]">
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-1">
            {message.toolCalls.map((t, i) => (
              <span
                key={i}
                className="text-[10px] text-ink-light uppercase tracking-wider font-semibold inline-flex items-center gap-1"
              >
                <Wrench size={9} />
                {toolLabel(t)}
              </span>
            ))}
          </div>
        )}
        <div className="bg-white border border-cream-200 rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm leading-relaxed text-ink-dark whitespace-pre-wrap">
          {message.content || (message.isStreaming ? <TypingDots /> : null)}
          {message.isStreaming && message.content && (
            <span className="inline-block w-1 h-3 bg-navy/40 ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1">
      <span className="w-1.5 h-1.5 bg-ink-light rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 bg-ink-light rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 bg-ink-light rounded-full animate-bounce" />
    </span>
  );
}

function toolLabel(name: string): string {
  if (name === "get_live_weather") return "Wetter live";
  if (name === "get_tfl_status") return "Tube Status";
  return name;
}
