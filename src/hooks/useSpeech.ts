"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResult[];
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: Event) => void) | null;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: { new (): SpeechRecognitionInstance };
  webkitSpeechRecognition?: { new (): SpeechRecognitionInstance };
}

export function useSpeechRecognition({
  lang = "de-DE",
}: { lang?: string } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as WindowWithSpeech;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang]);

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      const recognition = recognitionRef.current;
      if (!recognition) return;

      let finalText = "";
      setTranscript("");

      recognition.onresult = (e: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const result = e.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        setTranscript(finalText + interim);
      };

      recognition.onend = () => {
        setListening(false);
        if (finalText.trim()) onFinal(finalText.trim());
      };

      recognition.onerror = () => {
        setListening(false);
      };

      try {
        recognition.start();
        setListening(true);
      } catch {
        // Already started
      }
    },
    [],
  );

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { supported, listening, transcript, start, stop };
}

export function useSpeechSynthesis({ lang = "de-DE" }: { lang?: string } = {}) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported("speechSynthesis" in window);
    try {
      const stored = localStorage.getItem("rcmk:tts-enabled");
      setEnabledState(stored === "true");
    } catch {
      // ignore
    }
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    try {
      localStorage.setItem("rcmk:tts-enabled", String(v));
    } catch {
      // ignore
    }
    if (!v && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabled || !text) return;
      if (typeof window === "undefined") return;

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      const germanVoice = voices.find((v) => v.lang.startsWith("de"));
      if (germanVoice) utter.voice = germanVoice;

      window.speechSynthesis.speak(utter);
    },
    [supported, enabled, lang],
  );

  const cancel = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { supported, enabled, speaking, setEnabled, speak, cancel };
}
