"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";
import { usePhotos } from "@/hooks/usePhotos";
import { PhotoUpload } from "@/components/photos/PhotoUpload";
import { PhotoCard } from "@/components/photos/PhotoCard";
import { PhotoDetail } from "@/components/photos/PhotoDetail";

interface FotosTabProps {
  trip: Trip;
}

export function FotosTab({ trip }: FotosTabProps) {
  const { photos, loading, uploadProgress, upload, remove, setCaption, setNarrative } =
    usePhotos({ tripSlug: trip.slug, days: trip.days });
  const [openId, setOpenId] = useState<string | null>(null);

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

  return (
    <motion.div
      key="fotos"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="px-1">
        <h2 className="font-display text-xl font-semibold text-navy">
          Fotos
        </h2>
        <p className="text-xs text-ink-mid mt-0.5">
          {photos.length === 0
            ? "Lade Fotos von deinem Handy – sie bleiben auf deinem Gerät."
            : `${photos.length} ${photos.length === 1 ? "Foto" : "Fotos"} aus dieser Reise`}
        </p>
      </div>

      <PhotoUpload onFiles={upload} uploadProgress={uploadProgress} />

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 bg-cream-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && photos.length === 0 && (
        <EmptyState />
      )}

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
              />
            );
          })()}
        </div>
      )}

      <p className="text-[11px] text-center text-ink-light italic px-4 pt-2">
        Alle Fotos werden lokal in deinem Browser gespeichert. Kein Upload zu Servern.
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
}: {
  title: string;
  subtitle: string;
  color: string;
  photos: PhotoMeta[];
  onOpen: (id: string) => void;
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
            <PhotoCard key={p.id} photo={p} onClick={() => onOpen(p.id)} />
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
        💡 Tipp: Tippe später auf ein Foto und frag die KI &quot;Erzähl mir was&quot;
      </p>
    </div>
  );
}
