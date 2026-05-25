"use client";

/**
 * v1.11.2 — Per-Foto-Auswahl für Export (PDF / ZIP).
 *
 * Apple-Way Bottom-Sheet: User sieht alle Fotos (eigene + geteilte) als
 * Grid, kann pro Foto toggeln, filtern nach Quelle (Eigene/Geteilt) oder
 * Tag. Bei "Übernehmen": Set<string> der ausgewählten IDs zurück.
 *
 * Convention: wenn nichts ausgewählt → Hint, ansonsten der "alle"-State
 * = null (effizienter als komplettes Set durchreichen).
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CheckSquare, Square } from "lucide-react";
import type { ExportPhoto } from "@/types/photo";
import { getThumbnailBlob } from "@/lib/photoStorage";
import { useBlobUrlState } from "@/hooks/useBlobUrl";
import { useDismissOnBack } from "@/hooks/useDismissOnBack";
import { classNames } from "@/lib/formatters";

interface Props {
  open: boolean;
  photos: ExportPhoto[];
  /** Aktuelle Auswahl oder null = "alle ausgewählt". */
  currentSelection: Set<string> | null;
  /**
   * Wird mit der neuen Auswahl aufgerufen.
   * null = alle ausgewählt (effizienter Spezialfall).
   * Set = explizite Liste.
   */
  onConfirm: (next: Set<string> | null) => void;
  onClose: () => void;
  /** Display-Kontext: "PDF" oder "ZIP" für Header-Label. */
  exportLabel: string;
}

type FilterKey = "all" | "own" | "shared" | number;

export function PhotoSelectionSheet({
  open,
  photos,
  currentSelection,
  onConfirm,
  onClose,
  exportLabel,
}: Props) {
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterKey>("all");

  useDismissOnBack(open, onClose);

  // Reset / hydrate beim Öffnen
  useEffect(() => {
    if (!open) return;
    if (currentSelection) {
      setSelection(new Set(currentSelection));
    } else {
      // null = alle
      setSelection(new Set(photos.map((p) => p.id)));
    }
    setFilter("all");
  }, [open, currentSelection, photos]);

  const ownCount = useMemo(
    () => photos.filter((p) => !p.remoteUrl).length,
    [photos],
  );
  const sharedCount = useMemo(
    () => photos.filter((p) => !!p.remoteUrl).length,
    [photos],
  );
  const days = useMemo(() => {
    const set = new Set<number>();
    photos.forEach((p) => {
      if (typeof p.assignedDay === "number") set.add(p.assignedDay);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [photos]);

  const filtered = useMemo(() => {
    return photos.filter((p) => {
      if (filter === "all") return true;
      if (filter === "own") return !p.remoteUrl;
      if (filter === "shared") return !!p.remoteUrl;
      if (typeof filter === "number") return p.assignedDay === filter;
      return true;
    });
  }, [photos, filter]);

  const toggle = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInFilter = () => {
    setSelection((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const deselectAllInFilter = () => {
    setSelection((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.delete(p.id));
      return next;
    });
  };

  const handleConfirm = () => {
    // Wenn alle ausgewählt: null (Default-Pfad effizienter)
    if (selection.size === photos.length) {
      onConfirm(null);
    } else {
      onConfirm(new Set(selection));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Fotos für Export auswählen"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-app bg-cream-50 rounded-t-2xl shadow-elevated max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-cream-200">
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-base font-semibold text-navy">
                  Fotos für {exportLabel}-Export
                </h2>
                <p className="text-[11px] text-ink-mid mt-0.5">
                  {selection.size} von {photos.length} ausgewählt
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-mid flex-shrink-0"
                aria-label="Schließen"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter-Pills */}
            <div className="px-4 py-2.5 border-b border-cream-100">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                <FilterPill
                  label={`Alle (${photos.length})`}
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                />
                {ownCount > 0 && (
                  <FilterPill
                    label={`Eigene (${ownCount})`}
                    active={filter === "own"}
                    onClick={() => setFilter("own")}
                  />
                )}
                {sharedCount > 0 && (
                  <FilterPill
                    label={`Geteilt (${sharedCount})`}
                    active={filter === "shared"}
                    onClick={() => setFilter("shared")}
                  />
                )}
                {days.map((d) => {
                  const c = photos.filter((p) => p.assignedDay === d).length;
                  return (
                    <FilterPill
                      key={d}
                      label={`Tag ${d + 1} (${c})`}
                      active={filter === d}
                      onClick={() => setFilter(d)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Quick-Actions im aktuellen Filter */}
            <div className="px-4 py-2 border-b border-cream-100 flex items-center gap-3">
              <button
                type="button"
                onClick={selectAllInFilter}
                className="text-[11px] font-semibold text-navy hover:text-gold-600 transition inline-flex items-center gap-1"
              >
                <CheckSquare size={11} /> Alle im Filter
              </button>
              <button
                type="button"
                onClick={deselectAllInFilter}
                className="text-[11px] font-semibold text-ink-mid hover:text-warning transition inline-flex items-center gap-1"
              >
                <Square size={11} /> Filter abwählen
              </button>
              <span className="text-[10px] text-ink-light ml-auto">
                {filtered.length} im Filter
              </span>
            </div>

            {/* Photo Grid */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-ink-mid py-8">
                  Keine Fotos in diesem Filter
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {filtered.map((p) => (
                    <SelectableThumb
                      key={p.id}
                      photo={p}
                      selected={selection.has(p.id)}
                      onClick={() => toggle(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cream-200 space-y-2 bg-cream-50">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selection.size === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-navy text-cream text-sm font-semibold hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Check size={16} />
                {selection.size === photos.length
                  ? "Alle übernehmen"
                  : selection.size === 0
                    ? "Keine Auswahl"
                    : `${selection.size} ${selection.size === 1 ? "Foto" : "Fotos"} übernehmen`}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-xs text-ink-mid hover:text-navy transition py-1"
              >
                Abbrechen
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition whitespace-nowrap",
        active
          ? "bg-navy text-cream"
          : "bg-cream-200 text-ink-mid hover:bg-cream-300",
      )}
    >
      {label}
    </button>
  );
}

function SelectableThumb({
  photo,
  selected,
  onClick,
}: {
  photo: ExportPhoto;
  selected: boolean;
  onClick: () => void;
}) {
  // Eigene Fotos: Thumbnail aus IndexedDB.
  // Geteilte Fotos: direkt remoteThumbUrl (Vercel Blob).
  const isShared = !!photo.remoteUrl;
  const ownThumb = useBlobUrlState(
    isShared ? null : photo.id,
    getThumbnailBlob,
  );

  const thumbUrl = isShared
    ? photo.remoteThumbUrl
    : ownThumb.status === "ready"
      ? ownThumb.url
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "relative block w-full aspect-square rounded-lg overflow-hidden bg-cream-200 transition",
        selected
          ? "ring-2 ring-navy ring-offset-2 ring-offset-cream-50"
          : "ring-0",
      )}
      aria-label={`${photo.fileName}${selected ? " (ausgewählt)" : ""}`}
      aria-pressed={selected}
    >
      {thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbUrl}
          alt={photo.caption ?? photo.fileName}
          className={classNames(
            "absolute inset-0 w-full h-full object-cover transition",
            selected ? "scale-95 brightness-90" : "",
          )}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-cream-200">
          <div className="text-[9px] text-ink-light animate-pulse">Lade…</div>
        </div>
      )}

      {/* Source-Badge: zeigt Initiale des Uploaders bei geteilten */}
      {photo.uploaderName && (
        <span
          className="absolute top-1 left-1 text-[8px] uppercase tracking-wider bg-gold/90 text-white px-1.5 py-0.5 rounded font-bold shadow-sm"
          title={`Geteilt von ${photo.uploaderName}`}
        >
          {photo.uploaderName.slice(0, 4)}
        </span>
      )}

      {/* Selection-Check (iOS-Photos-Style) */}
      <div
        className={classNames(
          "absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center shadow transition",
          selected
            ? "bg-navy text-white"
            : "bg-white/85 text-transparent border border-ink-light/40",
        )}
      >
        <Check size={14} strokeWidth={3} />
      </div>
    </button>
  );
}
