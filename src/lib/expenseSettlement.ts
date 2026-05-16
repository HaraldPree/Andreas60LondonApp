import type {
  BalanceEntry,
  Expense,
  PersonalSummary,
} from "@/types/expense";

/**
 * Compute net pairwise balances in a SINGLE currency.
 * (Mixed-currency expenses should be converted to one base currency before calling this.)
 */
export function computeBalances(
  expenses: Expense[],
  currency: string,
): BalanceEntry[] {
  // owed[A][B] = how much A is owed by B
  const owed: Record<string, Record<string, number>> = {};

  const add = (creditor: string, debtor: string, amount: number) => {
    if (creditor === debtor) return;
    owed[creditor] ??= {};
    owed[creditor][debtor] = (owed[creditor][debtor] ?? 0) + amount;
  };

  for (const exp of expenses) {
    if (exp.currency !== currency) continue; // skip mixed-currency for safety
    if (exp.splitAmong.length === 0) continue;
    const share = exp.amount / exp.splitAmong.length;
    for (const person of exp.splitAmong) {
      if (person === exp.paidBy) continue;
      add(exp.paidBy, person, share);
    }
  }

  // Net out (if A owes B 10 and B owes A 4, A owes B 6).
  const settled: BalanceEntry[] = [];
  const seen = new Set<string>();
  const persons = Object.keys(owed);
  for (const a of persons) {
    for (const b of Object.keys(owed[a] ?? {})) {
      const key = [a, b].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const aOwesB = owed[b]?.[a] ?? 0; // a owes b
      const bOwesA = owed[a]?.[b] ?? 0; // b owes a
      const net = aOwesB - bOwesA;
      if (Math.abs(net) < 0.005) continue;
      if (net > 0) {
        settled.push({ from: a, to: b, amount: round2(net), currency });
      } else {
        settled.push({ from: b, to: a, amount: round2(-net), currency });
      }
    }
  }
  return settled;
}

/**
 * Summary of one person's involvement across all expenses (single currency).
 */
export function computePersonalSummary(
  expenses: Expense[],
  person: string,
  currency: string,
): PersonalSummary {
  let paid = 0;
  let share = 0;
  for (const exp of expenses) {
    if (exp.currency !== currency) continue;
    if (exp.paidBy === person) paid += exp.amount;
    if (exp.splitAmong.includes(person)) {
      share += exp.amount / exp.splitAmong.length;
    }
  }
  const balances = computeBalances(expenses, currency);
  const owes = balances.filter((b) => b.from === person);
  const owedBy = balances.filter((b) => b.to === person);
  return {
    person,
    paid: round2(paid),
    share: round2(share),
    net: round2(paid - share),
    owes,
    owedBy,
  };
}

export function totalByCurrency(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const exp of expenses) {
    totals[exp.currency] = round2((totals[exp.currency] ?? 0) + exp.amount);
  }
  return totals;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
