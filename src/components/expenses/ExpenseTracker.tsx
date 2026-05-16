"use client";

import { useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  ChevronDown,
  X,
  Trash2,
  ArrowRight,
  Receipt,
  Copy,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Trip } from "@/types/trip";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import { useExpenses } from "@/hooks/useExpenses";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { convertAmount, formatCurrency } from "@/lib/exchangeRate";
import {
  computeBalances,
  computePersonalSummary,
  totalByCurrency,
} from "@/lib/expenseSettlement";
import { classNames } from "@/lib/formatters";

interface ExpenseTrackerProps {
  trip: Trip;
  currentUserName?: string | null;
  tripCurrency?: string;
  homeCurrency?: string;
}

const CATEGORY_BY_KEY = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.key, c]),
);

export function ExpenseTracker({
  trip,
  currentUserName,
  tripCurrency = "GBP",
  homeCurrency = "EUR",
}: ExpenseTrackerProps) {
  const { expenses, hydrated, add, remove, clearAll } = useExpenses(trip.slug);
  const { rate } = useExchangeRate(tripCurrency, homeCurrency);
  const [expanded, setExpanded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const participants = trip.participants ?? [];
  // Splitters = everyone except the celebrant (Geburtstagskind ist
  // eingeladen) — used for the header hint so it doesn't say "Split
  // unter den 5" when really only 4 people split the bill.
  const hasCelebrant = participants.some((p) => p.role === "celebrant");
  const splitterCount = participants.filter((p) => p.role !== "celebrant")
    .length;

  // Sort newest first
  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort(
        (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
      ),
    [expenses],
  );

  // Group by date
  const groupedByDay = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of sortedExpenses) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return Array.from(map.entries());
  }, [sortedExpenses]);

  const totals = useMemo(() => totalByCurrency(expenses), [expenses]);
  const personalSummary = useMemo(
    () =>
      currentUserName
        ? computePersonalSummary(expenses, currentUserName, tripCurrency)
        : null,
    [expenses, currentUserName, tripCurrency],
  );
  const balances = useMemo(
    () => computeBalances(expenses, tripCurrency),
    [expenses, tripCurrency],
  );

  const fmtTrip = (amount: number) => formatCurrency(amount, tripCurrency);
  const fmtBoth = (amount: number) => {
    const primary = formatCurrency(amount, tripCurrency);
    if (!rate) return primary;
    const eur = convertAmount(amount, rate.rate);
    return `${primary} (~${formatCurrency(eur, homeCurrency)})`;
  };

  const exportToText = async () => {
    const lines: string[] = [];
    lines.push(`📊 Ausgaben ${trip.destination} ${trip.subtitle}`);
    lines.push("");
    for (const [date, items] of groupedByDay) {
      lines.push(`— ${formatDay(date)} —`);
      for (const e of items) {
        const cat = CATEGORY_BY_KEY[e.category];
        lines.push(
          `${cat?.icon ?? "•"} ${e.description}: ${formatCurrency(e.amount, e.currency)} (${e.paidBy})`,
        );
      }
      lines.push("");
    }
    if (balances.length > 0) {
      lines.push("💸 Wer schuldet wem:");
      for (const b of balances) {
        lines.push(`${b.from} → ${b.to}: ${formatCurrency(b.amount, b.currency)}`);
      }
    }
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("In Zwischenablage kopiert! Kannst du jetzt in WhatsApp einfügen.");
    } catch {
      alert("Kopieren fehlgeschlagen – manuell kopieren:\n\n" + text);
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 py-3 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
          <Wallet size={18} className="text-success" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-display text-base font-semibold text-navy">
            Ausgaben-Tracker
          </h3>
          <p className="text-[11px] text-ink-mid">
            {hydrated && totals[tripCurrency]
              ? `Insgesamt ${fmtBoth(totals[tripCurrency])}`
              : splitterCount > 0
                ? hasCelebrant
                  ? `Wer hat was bezahlt + Split unter den ${splitterCount} (Geburtstagskind eingeladen)`
                  : `Wer hat was bezahlt + Split unter den ${splitterCount}`
                : "Wer hat was bezahlt + Split unter den Mitreisenden"}
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
            <div className="px-4 pb-4 space-y-4 border-t border-cream-200 pt-4">
              {/* Stats card */}
              {personalSummary && (
                <PersonalStats
                  summary={personalSummary}
                  fmtBoth={fmtBoth}
                  tripCurrency={tripCurrency}
                />
              )}

              {/* Add expense */}
              {formOpen ? (
                <AddExpenseForm
                  participants={participants}
                  tripCurrency={tripCurrency}
                  currentUserName={currentUserName ?? null}
                  onAdd={(e) => {
                    add(e);
                    setFormOpen(false);
                  }}
                  onCancel={() => setFormOpen(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-600 transition"
                >
                  <Plus size={14} /> Ausgabe hinzufügen
                </button>
              )}

              {/* List */}
              {sortedExpenses.length === 0 ? (
                <p className="text-xs text-ink-mid text-center italic py-4">
                  Noch keine Ausgaben. Tippe oben auf &quot;Ausgabe
                  hinzufügen&quot;.
                </p>
              ) : (
                <div className="space-y-3">
                  {groupedByDay.map(([date, items]) => (
                    <DayGroup
                      key={date}
                      date={date}
                      items={items}
                      onRemove={remove}
                      fmtBoth={fmtBoth}
                      fmtTrip={fmtTrip}
                    />
                  ))}
                </div>
              )}

              {/* Settlement */}
              {balances.length > 0 && (
                <SettlementSummary
                  balances={balances}
                  fmtTrip={fmtTrip}
                  currentUserName={currentUserName ?? null}
                />
              )}

              {/* Actions */}
              {sortedExpenses.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-cream-200">
                  <button
                    type="button"
                    onClick={exportToText}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gold/10 text-gold-600 text-xs font-semibold hover:bg-gold/20 transition"
                  >
                    <Copy size={12} /> Als Text exportieren
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          "Alle Ausgaben für diese Reise löschen? Nicht rückgängig machbar.",
                        )
                      ) {
                        clearAll();
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-warning/10 text-warning text-xs font-semibold hover:bg-warning/20 transition"
                  >
                    <RotateCcw size={12} /> Alles zurücksetzen
                  </button>
                </div>
              )}

              <p className="text-[10px] text-ink-light text-center italic">
                Daten bleiben nur auf deinem Gerät. Für echtes Splitting in der
                Gruppe Splitwise oder Settle Up empfehlen.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PersonalStats({
  summary,
  fmtBoth,
  tripCurrency,
}: {
  summary: ReturnType<typeof computePersonalSummary>;
  fmtBoth: (n: number) => string;
  tripCurrency: string;
}) {
  const isOwed = summary.net > 0.005;
  const owes = summary.net < -0.005;
  return (
    <div className="rounded-xl bg-gradient-to-br from-cream-50 to-cream-100 border border-cream-200 p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
        Deine Bilanz ({summary.person})
      </p>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-light">
            Bezahlt
          </p>
          <p className="font-mono text-sm font-semibold text-navy">
            {fmtBoth(summary.paid)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-light">
            Dein Anteil
          </p>
          <p className="font-mono text-sm font-semibold text-navy">
            {fmtBoth(summary.share)}
          </p>
        </div>
      </div>
      <div
        className={classNames(
          "text-center py-2 rounded-lg text-xs font-semibold",
          isOwed
            ? "bg-success/15 text-success"
            : owes
              ? "bg-warning/15 text-warning"
              : "bg-cream-200 text-ink-mid",
        )}
      >
        {isOwed
          ? `Du bekommst ${formatCurrency(summary.net, tripCurrency)} zurück`
          : owes
            ? `Du schuldest noch ${formatCurrency(-summary.net, tripCurrency)}`
            : "Ausgeglichen ✓"}
      </div>
    </div>
  );
}

function DayGroup({
  date,
  items,
  onRemove,
  fmtBoth,
  fmtTrip,
}: {
  date: string;
  items: Expense[];
  onRemove: (id: string) => void;
  fmtBoth: (n: number) => string;
  fmtTrip: (n: number) => string;
}) {
  const dayTotal = items.reduce(
    (s, e) => s + (e.currency === items[0]?.currency ? e.amount : 0),
    0,
  );
  return (
    <div>
      <div className="flex items-baseline justify-between px-1 mb-1">
        <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
          {formatDay(date)}
        </p>
        <p className="text-[10px] text-ink-mid font-mono">
          Σ {fmtBoth(dayTotal)}
        </p>
      </div>
      <ul className="space-y-1.5">
        {items.map((e) => (
          <ExpenseRow
            key={e.id}
            expense={e}
            onRemove={() => onRemove(e.id)}
            fmtBoth={fmtBoth}
            fmtTrip={fmtTrip}
          />
        ))}
      </ul>
    </div>
  );
}

function ExpenseRow({
  expense,
  onRemove,
  fmtBoth,
}: {
  expense: Expense;
  onRemove: () => void;
  fmtBoth: (n: number) => string;
  fmtTrip: (n: number) => string;
}) {
  const cat = CATEGORY_BY_KEY[expense.category];
  return (
    <li className="rounded-lg bg-cream-50 border border-cream-200 p-2.5">
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ backgroundColor: `${cat?.color ?? "#7A7A8A"}15` }}
        >
          {cat?.icon ?? "•"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-ink-dark leading-tight">
              {expense.description}
            </p>
            <p className="text-sm font-mono font-semibold text-navy whitespace-nowrap">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
          </div>
          <p className="text-[10px] text-ink-mid mt-0.5">
            {cat?.label} · bezahlt von <strong>{expense.paidBy}</strong>
            {expense.splitAmong.length > 1 &&
              ` · geteilt unter ${expense.splitAmong.length}`}
            {expense.currency === "GBP" && (
              <> · {fmtBoth(expense.amount).split("(~")[1]?.replace(")", "")}</>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-ink-light hover:text-warning flex-shrink-0 p-1"
          aria-label="Löschen"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </li>
  );
}

function SettlementSummary({
  balances,
  fmtTrip,
  currentUserName,
}: {
  balances: ReturnType<typeof computeBalances>;
  fmtTrip: (n: number) => string;
  currentUserName: string | null;
}) {
  return (
    <div className="rounded-xl bg-gold/5 border border-gold/30 p-3">
      <p className="text-[10px] uppercase tracking-wider text-gold-600 font-bold mb-2 inline-flex items-center gap-1">
        <Receipt size={11} /> Wer schuldet wem
      </p>
      <ul className="space-y-1.5">
        {balances.map((b, i) => {
          const isCurrent = b.from === currentUserName || b.to === currentUserName;
          return (
            <li
              key={i}
              className={classNames(
                "flex items-center gap-2 text-sm",
                isCurrent ? "font-semibold text-navy" : "text-ink-dark",
              )}
            >
              <span className="flex-1 text-right">{b.from}</span>
              <ArrowRight size={12} className="text-ink-light flex-shrink-0" />
              <span className="flex-1">{b.to}</span>
              <span className="font-mono text-sm font-semibold text-gold-600">
                {fmtTrip(b.amount)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AddExpenseForm({
  participants,
  tripCurrency,
  currentUserName,
  onAdd,
  onCancel,
}: {
  participants: Trip["participants"];
  tripCurrency: string;
  currentUserName: string | null;
  onAdd: (e: Omit<Expense, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const names = participants?.map((p) => p.name) ?? [];
  // Default-Split: Geburtstagskind ausgenommen (ist eingeladen)
  const defaultSplit =
    participants?.filter((p) => p.role !== "celebrant").map((p) => p.name) ??
    names;
  const todayIso = new Date().toISOString().slice(0, 10);

  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>(tripCurrency);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [paidBy, setPaidBy] = useState<string>(currentUserName ?? names[0] ?? "");
  const [splitAmong, setSplitAmong] = useState<string[]>(defaultSplit);
  const [date, setDate] = useState<string>(todayIso);

  const toggleSplit = (n: string) =>
    setSplitAmong((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );

  const canSubmit =
    parseFloat(amount) > 0 &&
    description.trim().length > 0 &&
    paidBy &&
    splitAmong.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onAdd({
      amount: parseFloat(amount),
      currency,
      description: description.trim(),
      category,
      paidBy,
      splitAmong,
      date,
    });
  };

  return (
    <div className="rounded-xl bg-cream-50 border border-cream-300 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-navy">Neue Ausgabe</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-ink-light hover:text-warning"
          aria-label="Abbrechen"
        >
          <X size={14} />
        </button>
      </div>

      {/* Amount + currency */}
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
            Betrag
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-2.5 py-1.5 text-sm font-mono rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
            autoFocus
          />
        </label>
        <label className="w-24">
          <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
            Währung
          </span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
          >
            <option value="GBP">£ GBP</option>
            <option value="EUR">€ EUR</option>
            <option value="USD">$ USD</option>
          </select>
        </label>
      </div>

      {/* Description */}
      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
          Was wars?
        </span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="z.B. Tee bei Cedric Grolet"
          className="w-full px-2.5 py-1.5 text-sm rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
        />
      </label>

      {/* Category */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-1">
          Kategorie
        </p>
        <div className="flex flex-wrap gap-1">
          {EXPENSE_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={classNames(
                "px-2 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 transition",
                category === c.key
                  ? "bg-navy text-cream"
                  : "bg-white border border-cream-300 text-ink-mid",
              )}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paid by */}
      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
          Wer hat bezahlt
        </span>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
        >
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {/* Split among */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-1 flex items-center justify-between gap-2">
          <span>Geteilt unter</span>
          {participants?.some((p) => p.role === "celebrant") && (
            <span className="normal-case font-normal tracking-normal text-[9px] text-gold-600">
              🎂 Geburtstagskind default ausgenommen
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-1">
          {(participants ?? []).map((p) => {
            const n = p.name;
            const active = splitAmong.includes(n);
            const isCelebrant = p.role === "celebrant";
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggleSplit(n)}
                className={classNames(
                  "px-2 py-1 rounded-full text-[11px] font-semibold transition inline-flex items-center gap-1",
                  active && !isCelebrant && "bg-success text-white",
                  active && isCelebrant && "bg-gold text-navy",
                  !active && "bg-white border border-cream-300 text-ink-mid line-through",
                  !active && isCelebrant && "border-gold/40",
                )}
              >
                {isCelebrant && "🎂"}
                {n}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-ink-mid mt-1">
          {splitAmong.length > 0
            ? `Pro Person: ${
                parseFloat(amount) > 0
                  ? formatCurrency(
                      parseFloat(amount) / splitAmong.length,
                      currency,
                    )
                  : "—"
              }`
            : "Mindestens 1 Person wählen"}
        </p>
      </div>

      {/* Date */}
      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
          Datum
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
        />
      </label>

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        className="w-full px-3 py-2 rounded-md bg-navy text-cream text-sm font-semibold disabled:opacity-50"
      >
        Hinzufügen
      </button>
    </div>
  );
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return `${days[d.getDay()]} ${d.getDate()}. ${d.toLocaleDateString("de-DE", { month: "short" })}`;
}
