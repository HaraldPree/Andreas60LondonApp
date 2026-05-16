"use client";

import { useCallback, useEffect, useState } from "react";
import type { Expense } from "@/types/expense";

function storageKey(tripSlug: string) {
  return `rcmk:expenses:${tripSlug}`;
}

function loadFromStorage(tripSlug: string): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(tripSlug));
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(tripSlug: string, expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(tripSlug),
      JSON.stringify(expenses),
    );
  } catch {
    // ignore
  }
}

export function useExpenses(tripSlug: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setExpenses(loadFromStorage(tripSlug));
    setHydrated(true);
  }, [tripSlug]);

  const add = useCallback(
    (expense: Omit<Expense, "id" | "createdAt">) => {
      setExpenses((prev) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `e_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const next: Expense[] = [
          ...prev,
          { ...expense, id, createdAt: new Date().toISOString() },
        ];
        saveToStorage(tripSlug, next);
        return next;
      });
    },
    [tripSlug],
  );

  const remove = useCallback(
    (id: string) => {
      setExpenses((prev) => {
        const next = prev.filter((e) => e.id !== id);
        saveToStorage(tripSlug, next);
        return next;
      });
    },
    [tripSlug],
  );

  const clearAll = useCallback(() => {
    setExpenses([]);
    saveToStorage(tripSlug, []);
  }, [tripSlug]);

  return { expenses, hydrated, add, remove, clearAll };
}
