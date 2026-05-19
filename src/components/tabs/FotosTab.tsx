"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Check,
  Trash2,
  X,
  AlertCircle,
  Share2,
  CheckSquare,
} from "lucide-react";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";
import { usePhotos } from "@/hooks/usePhotos";
import { useSharedPhotos } from "@/hooks/useSharedPhotos";
import { PhotoUpload } from "@/components/photos/PhotoUpload";
import { PhotoCard } from "@/components/photos/PhotoCard";
import { PhotoDetail } from "@/components/photos/PhotoDetail";
import { LocationIdentifier } from "@/components/photos/LocationIdentifier";
import { PhotoBookExportButton } from "@/components/photos/PhotoBookExportButton";
import { PdfBookExportButton } from "@/components/photos/PdfBookExportButton";
import { SharedGallery } from "@/components/photos/SharedGallery";
import { BulkShareSheet } from "@/components/photos/BulkShareSheet";
import { classNames } from "@/lib/formatters";

interface FotosTabProps {
  trip: Trip;
  currentUserName?: string | null;
}

export function FotosTab({ trip, currentUserName = null }: FotosTabProps) {
  const celebrantName =
    trip.participants?.find((p) => p.role === "celebrant")?.name ?? null;
  const {
    photos,
    loading,
    uploadProgress,
    uploadErrors,
    dismissUploadErrors,
    upload,
    remove,
    removeMany,
    setCaption,
    setNarrative,
  } = usePhotos({ tripSlug: trip.slug, days: trip.days });
  const [openId, setOpenId] = useState<string | null>(null);

  // v1.5.0 — Selection-Mode (iOS-Photos pattern)
  // Eine Mode für Bulk-Teilen UND Bulk-Löschen. Ersetzt den früheren
  // X-pro-Foto „Bearbeiten"-Mode.
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkShareOpen, setBulkShareOpen] = useState(false);

  // Für Bulk-Share-Sheet brauchen wir die existierenden Shared-Photos
  // (damit Photos die schon online sind nur Visibility ändern, nicht
  // neu hochladen).
  const {
    photos: sharedPhotos,
    share: shareOne,
    changeVisibility,
  } = useSharedPhotos({
    tripSlug: trip.slug,
    viewerName: currentUserName,
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      confirm(
        `${selectedIds.size} ausgewählte ${selectedIds.size === 1 ? "Foto" : "Fotos"} löschen?`,
      )
    ) {
      await removeMany(Array.from(selectedIds));
      exitSelectionMode();
    }
  };

  const selectedPhotos = useMemo(
    () => photos.filter((p) => selectedIds.has(p.id)),
    [photos, selectedIds],
  );

  const grouped = useMemo(() => {
    const map = new Map<number | "unsorted", PhotoMeta[]>();
    for (const p of photos) {
      const key = typeof p.assignedDay === "number" ? p.assignedDay : "unsorted";
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    return map;
  }, [photos]);

  const openPhoto = photos.find((p) => p.id === openId) ?? null;
  const openDayLabel =
    openPhoto && typeof openPhoto.assignedDay === "number"
      ? `Tag ${openPhoto.assignedDay + 1} · ${trip.days[openPhoto.assignedDay]?.date ?? ""}`
      : undefined;

  const handleDelete = (id: string) => {
    if (confirm("Foto löschen?")) remove(id);
  };

  const handleDeleteAll = async () => {
    if (
      photos.length > 0 &&
      confirm(
        `Wirklich ALLE ${photos.length} Fotos dieser Reise löschen? Nicht rückgängig machbar.`,
      )
    ) {
      await removeMany(photos.map((p) => p.id));
      exitSelectionMode();
    }
  };

  return (
    <motion.div
      key="fotos"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="px-1">
        <h2 className="font-display text-xl font-semibold text-navy">Fotos</h2>
        <p className="text-xs text-ink-mid mt-0.5">
          {photos.length === 0
            ? "Lade Fotos von deinem Handy – sie bleiben auf deinem Gerät."
            : `${photos.length} ${photos.length === 1 ? "Foto" : "Fotos"} aus dieser Reise`}
        </p>
      </div>

      {/* Location-Erkennung: prominent oben für "Foto vom Freund – wo ist das?" */}
      <LocationIdentifier trip={trip} />

      {/* Gemeinsame Galerie — Fotos die andere mit dir / der Gruppe geteilt haben */}
      <div className="px-1 pt-2">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-gold-600 font-bold">
          Gemeinsame Galerie
        </p>
        <p className="text-[11px] text-ink-mid mt-0.5">
          Was andere Mitreisende geteilt haben
        </p>
      </div>
      <SharedGallery trip={trip} currentUserName={currentUserName} />

      <div className="px-1 pt-2 flex items-baseline justify-between">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-gold-600 font-bold">
          Deine eigenen Fotos
        </p>
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (selectionMode) exitSelectionMode();
              else setSelectionMode(true);
            }}
            className={classNames(
              "text-[11px] font-semibold inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-md transition",
              selectionMode
                ? "bg-navy text-cream"
                : "text-navy hover:bg-cream-200 bg-cream-100",
            )}
          >
            {selectionMode ? <Check size={12} /> : <CheckSquare size={12} />}
            {selectionMode ? "Fertig" : "Mehrere auswählen"}
          </button>
        )}
      </div>

      {/* v1.6.1 — Permanente Hilfe-Zeile damit das Multi-Share-Feature
          entdeckt wird. Vorher hat niemand verstanden was „Auswählen"
          tut. Diese Zeile macht's discoverable ohne aufdringlich zu sein. */}
      {photos.length > 0 && !selectionMode && (
        <div className="rounded-xl bg-gold/8 border border-gold/30 px-3 py-2 flex items-start gap-2">
          <span className="text-base flex-shrink-0 mt-[-1px]">💡</span>
          <p className="text-[11px] text-ink-dark leading-relaxed">
            <strong>Mehrere Fotos auf einmal teilen oder löschen?</strong>{" "}
            Tippe oben auf „Mehrere auswählen", dann die Fotos antippen
            die du teilen willst (Häkchen erscheint), unten dann „Teilen"
            oder „Löschen".
          </p>
        </div>
      )}

      {/* v1.5.0 — Sticky-Action-Bar im Selection-Mode (iOS Photos pattern)
          v1.6.1 — klarerer Hint-Text wenn 0 ausgewählt */}
      {selectionMode && (
        <div className="sticky top-[88px] z-30 -mx-4 px-4">
          <div className="rounded-2xl bg-navy text-cream shadow-elevated px-3 py-2.5 flex items-center gap-2">
            <span className="text-xs">
              {selectedIds.size === 0
                ? "👆 Fotos antippen zum Auswählen"
                : `${selectedIds.size} ausgewählt`}
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setBulkShareOpen(true)}
              disabled={selectedIds.size === 0 || !currentUserName}
              className="inline-flex items-center gap-1 px-3 min-h-[36px] rounded-lg bg-cream/15 text-cream text-xs font-semibold hover:bg-cream/25 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label={`${selectedIds.size} Fotos teilen`}
            >
              <Share2 size={13} />
              Teilen
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
              className="inline-flex items-center gap-1 px-3 min-h-[36px] rounded-lg bg-warning/80 text-white text-xs font-semibold hover:bg-warning disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label={`${selectedIds.size} Fotos löschen`}
            >
              <Trash2 size={13} />
              Löschen
            </button>
          </div>
          {selectionMode && !currentUserName && selectedIds.size > 0 && (
            <p className="text-[10px] text-warning mt-1.5 text-center italic">
              Wähle erst deinen Avatar oben rechts, um teilen zu können.
            </p>
          )}
        </div>
      )}

      <PhotoUpload onFiles={upload} uploadProgress={uploadProgress} />

      {uploadErrors.length > 0 && (
        <div className="rounded-2xl bg-warning/10 border border-warning/30 p-3 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle
                size={14}
                className="text-warning flex-shrink-0 mt-0.5"
              />
              <p className="text-xs font-semibold text-warning">
                {uploadErrors.length === 1
                  ? "1 Foto konnte nicht hochgeladen werden:"
                  : `${uploadErrors.length} Fotos konnten nicht hochgeladen werden:`}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissUploadErrors}
              className="text-warning/60 hover:text-warning"
              aria-label="Fehler ausblenden"
            >
              <X size={14} />
            </button>
          </div>
          <ul className="text-[11px] text-ink-dark space-y-1 pl-6">
            {uploadErrors.map((err, i) => (
              <li key={i}>
                <span className="font-mono text-[10px] text-ink-mid">
                  {err.fileName}
                </span>
                <br />
                <span className="text-warning">→ {err.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 bg-cream-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && photos.length === 0 && <EmptyState />}

      {!loading && photos.length > 0 && (
        <div className="space-y-5">
          {trip.days.map((day, i) => {
            const list = grouped.get(i);
            if (!list || list.length === 0) return null;
            return (
              <DaySection
                key={day.date}
                title={`Tag ${i + 1} · ${day.date}`}
                subtitle={day.title}
                color={day.color}
                photos={list}
                onOpen={setOpenId}
                onDelete={handleDelete}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            );
          })}
          {(() => {
            const unsorted = grouped.get("unsorted");
            if (!unsorted || unsorted.length === 0) return null;
            return (
              <DaySection
                title="Unsortiert"
                subtitle="Fotos ohne passendes Reisedatum"
                color="#7A7A8A"
                photos={unsorted}
                onOpen={setOpenId}
                onDelete={handleDelete}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            );
          })()}

          <PdfBookExportButton trip={trip} photos={photos} />
          <PhotoBookExportButton trip={trip} photos={photos} />

          {selectionMode && (
            <button
              type="button"
              onClick={handleDeleteAll}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl bg-warning/10 text-warning text-xs font-semibold hover:bg-warning/20 transition border border-warning/30"
            >
              <Trash2 size={12} /> Alle Fotos dieser Reise löschen
            </button>
          )}
        </div>
      )}

      <p className="text-[11px] text-center text-ink-light italic px-4 pt-2">
        Alle Fotos werden lokal in deinem Browser gespeichert. Kein Upload zu
        Servern.
      </p>

      {openPhoto && !selectionMode && (
        <PhotoDetail
          photo={openPhoto}
          tripSlug={trip.slug}
          dayLabel={openDayLabel}
          currentUserName={currentUserName}
          celebrantName={celebrantName}
          onClose={() => setOpenId(null)}
          onDelete={(id) => remove(id)}
          onCaptionChange={(id, c) => setCaption(id, c)}
          onNarrativeChange={(id, n) => setNarrative(id, n)}
        />
      )}

      {/* v1.5.0 — Bulk-Share-Sheet */}
      {currentUserName && (
        <BulkShareSheet
          open={bulkShareOpen}
          photos={selectedPhotos}
          tripSlug={trip.slug}
          currentUserName={currentUserName}
          celebrantName={celebrantName}
          alreadyShared={sharedPhotos}
          onClose={() => {
            setBulkShareOpen(false);
            // Wenn alles erfolgreich war, Selection-Mode beenden
            // (BulkShareSheet macht auto-close bei Erfolg, daher hier
            // einfach immer aufräumen)
            exitSelectionMode();
          }}
          onShareOne={shareOne}
          onChangeVisibility={changeVisibility}
        />
      )}
    </motion.div>
  );
}

function DaySection({
  title,
  subtitle,
  color,
  photos,
  onOpen,
  onDelete,
  selectionMode,
  selectedIds,
  onToggleSelect,
}: {
  title: string;
  subtitle: string;
  color: string;
  photos: PhotoMeta[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 overflow-hidden">
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      <div className="p-4">
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
            {title}
          </p>
          <p className="text-sm text-ink-dark font-medium">{subtitle}</p>
          <p className="text-[10px] text-ink-light mt-0.5">
            {photos.length} {photos.length === 1 ? "Foto" : "Fotos"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((p) => (
            <div key={p.id} className="relative">
              <PhotoCard
                photo={p}
                onClick={() => {
                  if (selectionMode) onToggleSelect(p.id);
                  else onOpen(p.id);
                }}
                selectionMode={selectionMode}
                selected={selectedIds.has(p.id)}
                // Broken photos can always be removed even without
                // entering selection mode — they're useless to the user.
                onSelfDelete={onDelete}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center">
        <Camera size={28} className="text-gold-600" />
      </div>
      <h3 className="font-display text-lg font-semibold text-navy">
        Noch keine Fotos
      </h3>
      <p className="text-xs text-ink-mid mt-2 max-w-[280px] mx-auto leading-relaxed">
        Tippe oben auf &quot;Fotos hinzufügen&quot; und wähle Bilder von deinem
        Handy aus. Fotos werden automatisch nach Reisetag sortiert.
      </p>
      <p className="text-[11px] text-ink-light mt-3 italic">
        💡 Tipp: Tippe später auf ein Foto und frag die KI &quot;Erzähl mir
        was&quot;
      </p>
    </div>
  );
}
