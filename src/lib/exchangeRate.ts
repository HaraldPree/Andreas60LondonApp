/**
 * Live exchange rates via Frankfurter (frankfurter.app).
 * - Free, no API key needed
 * - Updates daily (EU ECB rates)
 * - Reliable, used by many production apps
 */

export interface ExchangeRate {
  base: string;
  quote: string;
  rate: number;
  fetchedAt: string;
}

const CACHE_TTL_MS = 60 * 60_000; // 1 hour – ECB updates once per workday

interface CacheEntry {
  rate: ExchangeRate;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

export async function fetchExchangeRate(
  base: string,
  quote: string,
): Promise<ExchangeRate> {
  const key = `${base}-${quote}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.rate;
  }

  const url = `https://api.frankfurter.app/latest?from=${base}&to=${quote}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Frankfurter API ${res.status}`);
  const json = (await res.json()) as {
    base: string;
    rates: Record<string, number>;
    date: string;
  };
  const rate = json.rates[quote];
  if (typeof rate !== "number") {
    throw new Error(`Kurs für ${base}→${quote} nicht in Antwort`);
  }
  const result: ExchangeRate = {
    base: json.base,
    quote,
    rate,
    fetchedAt: new Date().toISOString(),
  };
  cache.set(key, { rate: result, expires: Date.now() + CACHE_TTL_MS });
  return result;
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
