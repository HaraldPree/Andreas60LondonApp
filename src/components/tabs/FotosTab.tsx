"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Pencil, Check, Trash2, X, AlertCircle } from "lucide-react";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";
import { usePhotos } from "@/hooks/usePhotos";
import { PhotoUpload } from "@/components/photos/PhotoUpload";
import { PhotoCard } from "@/components/photos/PhotoCard";
import { PhotoDetail } from "@/components/photos/PhotoDetail";
import { LocationIdentifier } from "@/components/photos/LocationIdentifier";
import { PhotoBookExportButton } from "@/components/photos/PhotoBookExportButton";
import { PdfBookExportButton } from "@/components/photos/PdfBookExportButton";
import { classNames } from "@/lib/formatters";

interface FotosTabProps {
  trip: Trip;
}

export function FotosTab({ trip }: FotosTabProps) {
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
  const [editMode, setEditMode] = useState(false);

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
      setEditMode(false);
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

      <div className="px-1 pt-2 flex items-baseline justify-between">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-gold-600 font-bold">
          Deine eigenen Fotos
        </p>
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => setEditMode((e) => !e)}
            className={classNames(
              "text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-md transition",
              editMode
                ? "bg-navy text-cream"
                : "text-ink-mid hover:text-navy",
            )}
          >
            {editMode ? <Check size={11} /> : <Pencil size={11} />}
            {editMode ? "Fertig" : "Bearbeiten"}
          </button>
        )}
      </div>

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
                editMode={editMode}
                onDelete={handleDelete}
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
                editMode={editMode}
                onDelete={handleDelete}
              />
            );
          })()}

          <PdfBookExportButton trip={trip} photos={photos} />
          <PhotoBookExportButton trip={trip} photos={photos} />

          {editMode && (
            <button
              type="button"
              onClick={handleDeleteAll}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-warning/10 text-warning text-xs font-semibold hover:bg-warning/20 transition border border-warning/30"
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

      {openPhoto && (
        <PhotoDetail
          photo={openPhoto}
          tripSlug={trip.slug}
          dayLabel={openDayLabel}
          onClose={() => setOpenId(null)}
          onDelete={(id) => remove(id)}
          onCaptionChange={(id, c) => setCaption(id, c)}
          onNarrativeChange={(id, n) => setNarrative(id, n)}
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
  editMode,
  onDelete,
}: {
  title: string;
  subtitle: string;
  color: string;
  photos: PhotoMeta[];
  onOpen: (id: string) => void;
  editMode: boolean;
  onDelete: (id: string) => void;
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
                onClick={() => onOpen(p.id)}
                // Broken photos can always be removed even without
                // entering edit mode — they're useless to the user.
                onSelfDelete={onDelete}
              />
              {editMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(p.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-warning text-white shadow-elevated flex items-center justify-center hover:scale-110 transition"
                  aria-label="Foto löschen"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              )}
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
