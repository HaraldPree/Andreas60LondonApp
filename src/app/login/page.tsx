"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { getBrandName } from "@/lib/tenant/current";

const PIN_LENGTH = 4;

function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search?.get("redirect") ?? "/london-2026";
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const brandName = getBrandName();

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const submit = async (fullPin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: fullPin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Falscher Code");
        setPin(Array(PIN_LENGTH).fill(""));
        inputs.current[0]?.focus();
      } else {
        router.replace(redirectTo);
      }
    } catch {
      setError("Verbindung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[i] = digit;
    setPin(next);
    if (digit && i < PIN_LENGTH - 1) {
      inputs.current[i + 1]?.focus();
    }
    if (next.every((c) => c !== "")) {
      submit(next.join(""));
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = text.split("").concat(Array(PIN_LENGTH - text.length).fill(""));
    setPin(next);
    if (next.every((c) => c !== "")) {
      submit(next.join(""));
    } else {
      inputs.current[text.length]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-app">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-navy text-cream mx-auto mb-3 flex items-center justify-center shadow-elevated">
            <Lock size={24} />
          </div>
          <p className="font-display text-[11px] tracking-[0.22em] text-gold font-semibold uppercase">
            {brandName}
          </p>
          <GoldDivider width="sm" className="mx-auto my-3" />
          <h1 className="font-display text-2xl font-semibold text-navy">
            Zugangs-Code
          </h1>
          <p className="text-sm text-ink-mid mt-2 max-w-xs mx-auto leading-relaxed">
            Diese App ist privat. Bitte den 4-stelligen Code eingeben, den du
            erhalten hast.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-cream-200/50 p-5">
          <div
            className="flex justify-center gap-2 mb-3"
            onPaste={handlePaste}
          >
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                disabled={loading}
                className="w-12 h-14 text-center text-xl font-mono font-bold rounded-lg border-2 border-cream-300 bg-cream-50 focus:border-gold focus:outline-none transition disabled:opacity-50"
                aria-label={`Code-Ziffer ${i + 1}`}
              />
            ))}
          </div>

          {loading && (
            <p className="text-xs text-ink-mid text-center inline-flex items-center gap-1 justify-center w-full">
              <Loader2 size={12} className="animate-spin" /> Prüfe…
            </p>
          )}

          {error && (
            <p className="text-xs text-warning text-center font-semibold mt-2">
              {error}
            </p>
          )}

          <p className="text-[11px] text-ink-light text-center mt-4 italic">
            Code vergessen? Frag bei Harald nach.
          </p>
        </div>

        <p className="text-[10px] text-ink-light text-center mt-4">
          Privates Test-Produkt · keine Daten gespeichert ohne deine Zustimmung
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <LoginContent />
    </Suspense>
  );
}
