"use client";

import { useMemo, useState } from "react";
import {
  Languages,
  ChevronDown,
  Volume2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PHRASES,
  PHRASE_CATEGORIES,
  type PhraseCategory,
} from "@/lib/phrasebook";
import { classNames } from "@/lib/formatters";

export function Phrasebook() {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState<PhraseCategory | "all">("all");
  const [query, setQuery] = useState("");

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB";
    u.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const british = voices.find(
      (v) => v.lang === "en-GB" || v.lang.startsWith("en-GB"),
    );
    if (british) u.voice = british;
    window.speechSynthesis.speak(u);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PHRASES.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.de.toLowerCase().includes(q) ||
        p.en.toLowerCase().includes(q) ||
        p.pronunciation?.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center flex-shrink-0">
          <Languages size={18} className="text-info" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-display text-base font-semibold text-navy">
            Phrasebook
          </h3>
          <p className="text-[11px] text-ink-mid">
            {PHRASES.length} Sätze DE→EN mit Aussprache + Vorlesen
          </p>
        </div>
        <ChevronDown
          size={18}
          className={classNames(
            "text-ink-light transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-cream-200 p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-light"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Suche, z.B. Apotheke oder bill…"
                  className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
                />
              </div>

              {/* Category filter */}
              <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                <CategoryChip
                  label="Alle"
                  active={category === "all"}
                  onClick={() => setCategory("all")}
                />
                {PHRASE_CATEGORIES.map((c) => (
                  <CategoryChip
                    key={c.key}
                    label={`${c.icon} ${c.label}`}
                    active={category === c.key}
                    onClick={() => setCategory(c.key)}
                  />
                ))}
              </div>

              {/* List */}
              {filtered.length === 0 ? (
                <p className="text-xs text-ink-mid italic text-center py-3">
                  Keine Sätze gefunden für „{query}"
                </p>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((p, i) => (
                    <li
                      key={`${p.de}-${i}`}
                      className="rounded-xl bg-cream-50 border border-cream-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-ink-mid italic mb-0.5">
                            🇩🇪 {p.de}
                          </p>
                          <p className="text-sm font-semibold text-navy leading-snug">
                            🇬🇧 {p.en}
                          </p>
                          {p.pronunciation && (
                            <p className="text-[11px] text-gold-600 font-mono italic mt-0.5">
                              [{p.pronunciation}]
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => speak(p.en)}
                          className="w-9 h-9 rounded-full bg-info/15 hover:bg-info/25 text-info flex items-center justify-center flex-shrink-0 transition"
                          aria-label="Englisch vorlesen"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-[10px] text-ink-light italic text-center">
                💡 Lautsprecher-Button spielt die englische Phrase per
                Browser-TTS – funktioniert offline.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition",
        active
          ? "bg-navy text-cream"
          : "bg-cream-200 text-ink-mid hover:bg-cream-300",
      )}
    >
      {label}
    </button>
  );
}
