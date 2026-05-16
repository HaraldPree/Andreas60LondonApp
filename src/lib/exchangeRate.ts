/**
 * Live exchange rates with multi-provider fallback.
 *
 * Primary:    Frankfurter (frankfurter.app) — ECB rates, daily updates
 * Fallback 1: exchangerate.host                — alternative free aggregator
 * Fallback 2: open.er-api.com                  — third free option
 * Fallback 3: hardcoded last-known rates       — keeps the UI usable offline
 *
 * Each remote call has a 6-second timeout so the user doesn't wait
 * 30+ seconds when an upstream is degraded — we just move on.
 */

export interface ExchangeRate {
  base: string;
  quote: string;
  rate: number;
  fetchedAt: string;
  /** Where the value came from. "static" means we couldn't reach any API. */
  source: "frankfurter" | "exchangerate.host" | "open.er-api" | "static";
}

const CACHE_TTL_MS = 60 * 60_000; // 1 hour – ECB updates once per workday
const FETCH_TIMEOUT_MS = 6_000;

interface CacheEntry {
  rate: ExchangeRate;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Last-known rates as of mid-2026. Used only if all live APIs fail
 * (rare — usually means the user is offline). Recent enough to be
 * useful for ballpark conversions; UI shows a "Static" indicator.
 */
const STATIC_RATES: Record<string, Record<string, number>> = {
  GBP: { EUR: 1.1705, USD: 1.265, CHF: 1.135 },
  EUR: { GBP: 0.854, USD: 1.082, CHF: 0.97 },
  USD: { EUR: 0.924, GBP: 0.79, CHF: 0.897 },
  CHF: { EUR: 1.031, GBP: 0.881, USD: 1.115 },
};

async function fetchWithTimeout(
  url: string,
  ms: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function tryFrankfurter(
  base: string,
  quote: string,
): Promise<ExchangeRate> {
  const url = `https://api.frankfurter.app/latest?from=${base}&to=${quote}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
  const json = (await res.json()) as {
    base: string;
    rates: Record<string, number>;
  };
  const rate = json.rates[quote];
  if (typeof rate !== "number") {
    throw new Error(`Frankfurter: rate for ${quote} missing`);
  }
  return {
    base,
    quote,
    rate,
    fetchedAt: new Date().toISOString(),
    source: "frankfurter",
  };
}

async function tryExchangerateHost(
  base: string,
  quote: string,
): Promise<ExchangeRate> {
  const url = `https://api.exchangerate.host/latest?base=${base}&symbols=${quote}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`exchangerate.host HTTP ${res.status}`);
  const json = (await res.json()) as {
    rates?: Record<string, number>;
    success?: boolean;
  };
  const rate = json.rates?.[quote];
  if (typeof rate !== "number") {
    throw new Error(`exchangerate.host: rate for ${quote} missing`);
  }
  return {
    base,
    quote,
    rate,
    fetchedAt: new Date().toISOString(),
    source: "exchangerate.host",
  };
}

async function tryOpenErApi(
  base: string,
  quote: string,
): Promise<ExchangeRate> {
  const url = `https://open.er-api.com/v6/latest/${base}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`open.er-api HTTP ${res.status}`);
  const json = (await res.json()) as {
    result?: string;
    rates?: Record<string, number>;
  };
  if (json.result !== "success") {
    throw new Error("open.er-api: non-success response");
  }
  const rate = json.rates?.[quote];
  if (typeof rate !== "number") {
    throw new Error(`open.er-api: rate for ${quote} missing`);
  }
  return {
    base,
    quote,
    rate,
    fetchedAt: new Date().toISOString(),
    source: "open.er-api",
  };
}

function staticFallback(base: string, quote: string): ExchangeRate {
  if (base === quote) {
    return {
      base,
      quote,
      rate: 1,
      fetchedAt: new Date().toISOString(),
      source: "static",
    };
  }
  const direct = STATIC_RATES[base]?.[quote];
  if (typeof direct === "number") {
    return {
      base,
      quote,
      rate: direct,
      fetchedAt: new Date().toISOString(),
      source: "static",
    };
  }
  // Derive via EUR if possible
  const baseToEur = STATIC_RATES[base]?.EUR;
  const eurToQuote = STATIC_RATES.EUR?.[quote];
  if (typeof baseToEur === "number" && typeof eurToQuote === "number") {
    return {
      base,
      quote,
      rate: baseToEur * eurToQuote,
      fetchedAt: new Date().toISOString(),
      source: "static",
    };
  }
  // Absolute last resort
  return {
    base,
    quote,
    rate: 1,
    fetchedAt: new Date().toISOString(),
    source: "static",
  };
}

export async function fetchExchangeRate(
  base: string,
  quote: string,
): Promise<ExchangeRate> {
  const key = `${base}-${quote}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.rate;
  }

  // Try providers in order. Each one races against a 6s timeout —
  // a slow upstream doesn't block the whole chain.
  const providers: Array<() => Promise<ExchangeRate>> = [
    () => tryFrankfurter(base, quote),
    () => tryExchangerateHost(base, quote),
    () => tryOpenErApi(base, quote),
  ];

  const errors: string[] = [];
  for (const provider of providers) {
    try {
      const result = await provider();
      cache.set(key, { rate: result, expires: Date.now() + CACHE_TTL_MS });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(msg);
      console.warn(`[exchangeRate] provider failed: ${msg}`);
    }
  }

  // All live providers failed — fall back to static rates so the
  // converter is still usable. Cache shortly so we don't hammer the
  // dead APIs on every component remount.
  console.warn(
    `[exchangeRate] All providers failed for ${base}→${quote}, using static fallback. Errors:`,
    errors,
  );
  const fallback = staticFallback(base, quote);
  cache.set(key, { rate: fallback, expires: Date.now() + 5 * 60_000 });
  return fallback;
}

export function convertAmount(
  amount: number,
  rate: number,
  decimals: number = 2,
): number {
  return Math.round(amount * rate * 10 ** decimals) / 10 ** decimals;
}

/** Format currency like "£21.50" or "€24.18" */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = "de-AT",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol =
      currency === "GBP"
        ? "£"
        : currency === "EUR"
          ? "€"
          : currency === "USD"
            ? "$"
            : currency + " ";
    return `${symbol}${amount.toFixed(2)}`;
  }
}
