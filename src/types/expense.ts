export type ExpenseCategory =
  | "food"
  | "transport"
  | "tickets"
  | "shopping"
  | "accommodation"
  | "other";

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: ExpenseCategory;
  /** Participant name who paid */
  paidBy: string;
  /** Participant names this expense is split among (incl. payer if applicable) */
  splitAmong: string[];
  /** YYYY-MM-DD */
  date: string;
  createdAt: string;
}

export interface CategoryMeta {
  key: ExpenseCategory;
  label: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { key: "food", label: "Essen", icon: "🍽️", color: "#E5A00D" },
  { key: "transport", label: "Transport", icon: "🚇", color: "#2980B9" },
  { key: "tickets", label: "Tickets", icon: "🎫", color: "#9B0056" },
  { key: "shopping", label: "Shopping", icon: "🛍️", color: "#2D8F5E" },
  { key: "accommodation", label: "Unterkunft", icon: "🏨", color: "#003366" },
  { key: "other", label: "Sonstiges", icon: "✨", color: "#7A7A8A" },
];

/**
 * Net balance per (debtor → creditor) pair.
 * balanceMatrix[A][B] = how much A owes B (always positive; 0 if A is owed instead).
 */
export interface BalanceEntry {
  from: string; // debtor
  to: string;   // creditor
  amount: number;
  currency: string;
}

/** Per-person summary view */
export interface PersonalSummary {
  person: string;
  paid: number;       // total this person paid
  share: number;      // total this person's share of all expenses
  net: number;        // paid - share (positive = is owed, negative = owes)
  owes: BalanceEntry[];
  owedBy: BalanceEntry[];
}
