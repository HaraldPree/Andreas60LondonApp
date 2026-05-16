"use client";

import { useEffect, useState } from "react";
import { ArrowRightLeft, RefreshCw, Coins } from "lucide-react";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { convertAmount, formatCurrency } from "@/lib/exchangeRate";
import { classNames } from "@/lib/formatters";

interface CurrencyConverterProps {
  /** Primary trip currency, e.g. "GBP" */
  tripCurrency: string;
  /** Home currency, e.g. "EUR" */
  homeCurrency?: string;
}

export function CurrencyConverter({
  tripCurrency,
  homeCurrency = "EUR",
}: CurrencyConverterProps) {
  const { rate, loading, error, refresh } = useExchangeRate(
    tripCurrency,
    homeCurrency,
  );

  // Reverse rate (homeCurrency → tripCurrency)
  const { rate: reverseRate } = useExchangeRate(homeCurrency, tripCurrency);

  const [tripValue, setTripValue] = useState<string>("10");
  const [homeValue, setHomeValue] = useState<string>("");
  const [lastEdited, setLastEdited] = useState<"trip" | "home">("trip");

  // Sync values when rate loads or when one side changes
  useEffect(() => {
    if (lastEdited === "trip" && rate) {
      const n = parseFloat(tripValue);
      if (!isNaN(n)) {
        setHomeValue(convertAmount(n, rate.rate).toFixed(2));
      } else {
        setHomeValue("");
      }
    }
  }, [tripValue, rate, lastEdited]);

  useEffect(() => {
    if (lastEdited === "home" && reverseRate) {
      const n = parseFloat(homeValue);
      if (!isNaN(n)) {
        setTripValue(convertAmount(n, reverseRate.rate).toFixed(2));
      } else {
        setTripValue("");
      }
    }
  }, [homeValue, reverseRate, lastEdited]);

  const symbol = (c: string) =>
    c === "GBP" ? "£" : c === "EUR" ? "€" : c === "USD" ? "$" : c;

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="bg-gradient-to-br from-gold/15 to-cream-50 px-4 py-3 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center">
          <Coins size={16} className="text-gold-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-semibold text-navy">
            Währungsrechner
          </h3>
          <p className="text-[10px] text-ink-mid">
            Live-Kurs via Frankfurter / EZB
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="text-ink-light hover:text-navy"
          aria-label="Kurs aktualisieren"
        >
          <RefreshCw size={14} className={classNames(loading && "animate-spin")} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {error && (
          <p className="text-xs text-warning text-center bg-warning/5 rounded p-2">
            Kurs konnte nicht geladen werden: {error}
          </p>
        )}

        {rate?.source === "static" && (
          <p className="text-[11px] text-gold-600 text-center bg-gold/10 rounded p-2 leading-relaxed">
            ⚠️ Live-Kurs zurzeit nicht erreichbar — wir nutzen einen
            ungefähren Standard-Kurs. Werte sind eine grobe Schätzung.
          </p>
        )}

        {/* Two input row */}
        <div className="flex items-center gap-2">
          <label className="flex-1 block">
            <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
              {tripCurrency}
            </span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-light text-sm font-semibold">
                {symbol(tripCurrency)}
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={tripValue}
                onChange={(e) => {
                  setLastEdited("trip");
                  setTripValue(e.target.value);
                }}
                className="w-full pl-7 pr-2.5 py-2 text-sm font-mono rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </label>

          <ArrowRightLeft size={14} className="text-ink-light mt-4 flex-shrink-0" />

          <label className="flex-1 block">
            <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
              {homeCurrency}
            </span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-light text-sm font-semibold">
                {symbol(homeCurrency)}
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={homeValue}
                onChange={(e) => {
                  setLastEdited("home");
                  setHomeValue(e.target.value);
                }}
                className="w-full pl-7 pr-2.5 py-2 text-sm font-mono rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </label>
        </div>

        {/* Quick conversion buttons */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-1.5">
            Schnellumrechnung
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {[5, 10, 20, 50, 100, 200].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setLastEdited("trip");
                  setTripValue(v.toString());
                }}
                className="text-xs px-2 py-1.5 rounded-md bg-cream-100 hover:bg-gold/10 hover:text-gold-600 transition font-medium"
              >
                {symbol(tripCurrency)}
                {v}
                {rate &&
                  ` → ${formatCurrency(convertAmount(v, rate.rate), homeCurrency)}`}
              </button>
            ))}
          </div>
        </div>

        {rate && (
          <p className="text-[10px] text-center text-ink-light italic">
            1 {tripCurrency} = {rate.rate.toFixed(4)} {homeCurrency} · Stand:{" "}
            {new Date(rate.fetchedAt).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
