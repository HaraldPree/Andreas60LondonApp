"use client";

import { useState } from "react";
import {
  Backpack,
  Check,
  ChevronDown,
  CloudRain,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { PackingCategory, PackingItem } from "@/lib/packingDefaults";
import { PACKING_CATEGORIES } from "@/lib/packingDefaults";
import { usePackingList } from "@/hooks/usePackingList";
import { useWeather } from "@/hooks/useWeather";
import { classNames } from "@/lib/formatters";
import type { Trip } from "@/types/trip";

interface PackingListProps {
  trip: Trip;
  currentUserName?: string | null;
}

export function PackingList({ trip, currentUserName }: PackingListProps) {
  const { data: weather } = useWeather(
    trip.weatherLocation.lat,
    trip.weatherLocation.lng,
    trip.weatherLocation.timezone,
  );

  const {
    byCategory,
    checked,
    stats,
    hydrated,
    toggle,
    addItem,
    removeItem,
    resetAll,
  } = usePackingList({
    tripSlug: trip.slug,
    userName: currentUserName,
    forecast: weather?.daily,
  });

  const [expanded, setExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
          <Backpack size={18} className="text-gold-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-semibold text-navy">
            Packliste
          </h3>
          <p className="text-[11px] text-ink-mid">
            {currentUserName ? `Für ${currentUserName}` : "Deine persönliche Liste"}
            {hydrated && stats.total > 0 && (
              <span className="ml-1">
                · {stats.done}/{stats.total} gepackt ({stats.percent}%)
              </span>
            )}
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

      {/* Progress bar */}
      {hydrated && stats.total > 0 && (
        <div className="h-1 bg-cream-200">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-success transition-all"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <div className="h-px bg-cream-200" />

              {/* Categories */}
              {PACKING_CATEGORIES.map((cat) => {
                const items = byCategory.get(cat);
                if (!items || items.length === 0) return null;
                return (
                  <CategoryBlock
                    key={cat}
                    category={cat}
                    items={items}
                    checked={checked}
                    onToggle={toggle}
                    onRemove={removeItem}
                  />
                );
              })}

              {/* Add item */}
              {addOpen ? (
                <AddItemForm
                  onAdd={(label, category) => {
                    addItem(label, category);
                    setAddOpen(false);
                  }}
                  onCancel={() => setAddOpen(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-navy/5 text-navy text-sm font-semibold hover:bg-navy/10 transition"
                >
                  <Plus size={14} /> Eigenes Item hinzufügen
                </button>
              )}

              {/* Reset */}
              {stats.done > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Alle Häkchen zurücksetzen?")) resetAll();
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] text-ink-light hover:text-warning py-1"
                >
                  <RotateCcw size={11} /> Alle Häkchen zurücksetzen
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryBlock({
  category,
  items,
  checked,
  onToggle,
  onRemove,
}: {
  category: PackingCategory;
  items: PackingItem[];
  checked: Set<string>;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const doneCount = items.filter((i) => checked.has(i.id)).length;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold mb-1.5 flex items-center justify-between">
        <span>{category}</span>
        <span className="font-normal">
          {doneCount}/{items.length}
        </span>
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            checked={checked.has(item.id)}
            onToggle={() => onToggle(item.id)}
            onRemove={item.custom ? () => onRemove(item.id) : undefined}
          />
        ))}
      </ul>
    </div>
  );
}

function ItemRow({
  item,
  checked,
  onToggle,
  onRemove,
}: {
  item: PackingItem;
  checked: boolean;
  onToggle: () => void;
  onRemove?: () => void;
}) {
  const isWeather = !!item.weatherRule;
  return (
    <li>
      <div
        className={classNames(
          "flex items-start gap-2.5 p-2 rounded-lg transition",
          checked
            ? "bg-success/5 border border-success/20"
            : isWeather
              ? "bg-info/5 border border-info/20"
              : "bg-cream-50 border border-cream-200",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className={classNames(
            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition mt-0.5",
            checked
              ? "bg-success border-success text-white"
              : "border-ink-light/40 bg-white hover:border-navy",
          )}
          aria-label={checked ? "Abhaken aufheben" : "Abhaken"}
        >
          {checked && <Check size={12} strokeWidth={3} />}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <p
              className={classNames(
                "text-sm leading-tight",
                checked ? "text-ink-light line-through" : "text-ink-dark",
              )}
            >
              {item.label}
            </p>
            {item.essential && (
              <Star size={10} className="text-gold-600 fill-gold-600 flex-shrink-0" />
            )}
            {isWeather && (
              <CloudRain size={10} className="text-info flex-shrink-0" />
            )}
          </div>
          {item.hint && (
            <p className="text-[10px] text-info mt-0.5 italic">{item.hint}</p>
          )}
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-ink-light hover:text-warning flex-shrink-0 p-1"
            aria-label="Entfernen"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </li>
  );
}

function AddItemForm({
  onAdd,
  onCancel,
}: {
  onAdd: (label: string, category: PackingCategory) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<PackingCategory>("Sonstiges");

  return (
    <div className="bg-cream-50 border border-cream-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-navy">Neues Item</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-ink-light hover:text-warning"
          aria-label="Abbrechen"
        >
          <X size={14} />
        </button>
      </div>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="z.B. Kindle, Brillenputztuch …"
        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-cream-300 bg-white focus:border-gold focus:outline-none"
        autoFocus
      />
      <div className="flex flex-wrap gap-1">
        {PACKING_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={classNames(
              "px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold transition",
              category === c
                ? "bg-navy text-cream"
                : "bg-white text-ink-mid border border-cream-300",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          if (label.trim()) onAdd(label.trim(), category);
        }}
        disabled={!label.trim()}
        className="w-full px-3 py-1.5 rounded-md bg-navy text-cream text-xs font-semibold disabled:opacity-50"
      >
        Hinzufügen
      </button>
    </div>
  );
}
