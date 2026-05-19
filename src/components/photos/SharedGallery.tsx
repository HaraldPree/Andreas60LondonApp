"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Heart,
  Lock,
  Trash2,
  ExternalLink,
  AlertCircle,
  Loader2,
  ImageOff,
  Cake,
} from "lucide-react";
import type { Trip } from "@/types/trip";
import type {
  SharedPhotoView,
  SharedPhotoVisibility,
} from "@/types/sharedPhoto";
import { useSharedPhotos } from "@/hooks/useSharedPhotos";
import { classNames } from "@/lib/formatters";

interface Props {
  trip: Trip;
  currentUserName: string | null;
}

/**
 * Gemeinsame Galerie — zeigt alle Fotos die für den/die aktuelle:n
 * Reisende:n sichtbar sind.
 *
 * Sichtbarkeit wird serverseitig gefiltert (canViewSharedPhoto):
 *   - Gruppe-Fotos sehen alle
 *   - Geburtstagskind sieht zusätzlich die 🎂-Fotos
 *   - Eigene Fotos sieht der Uploader immer (egal welche Stufe)
 *
 * Für die Geburtstags-Person gibt es einen optionalen Tab "Nur für mich
 * geteilt" der die 🎂-Fotos isoliert anzeigt — schön um die Beiträge
 * der Reisenden für das Geschenk-Foto-Buch zu sehen.
 */
export function SharedGallery({ trip, currentUserName }: Props) {
  const {
    photos,
    loading,
    error,
    serviceConfigured,
    viewerIsCelebrant,
    withdraw,
    changeVisibility,
  } = useSharedPhotos({
    tripSlug: trip.slug,
    viewerName: currentUserName,
  });

  const celebrant = trip.participants?.find((p) => p.role === "celebrant");

  // Tab-Auswahl (nur für Geburtstagskind)
  const [tab, setTab] = useState<"all" | "celebrant-only">("all");

  const visiblePhotos = useMemo(() => {
    if (!viewerIsCelebrant || tab === "all") return photos;
    return photos.filter((p) => p.visibility === "celebrant");
  }, [photos, viewerIsCelebrant, tab]);

  // Wenn der User noch keinen Namen gewählt hat
  if (!currentUserName) {
    return (
      <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-6 text-center">
        <Users size={32} className="mx-auto text-ink-light mb-2" />
        <p className="text-sm text-ink-dark font-semibold">
          Wähle erst deinen Avatar
        </p>
        <p className="text-xs text-ink-mid mt-1">
          Damit wir wissen welche Fotos für dich freigegeben wurden.
        </p>
      </div>
    );
  }

  // Service nicht aktiviert
  if (serviceConfigured === false) {
    return (
      <div className="rounded-2xl bg-info/5 border border-info/30 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-info">
              Foto-Sharing bald aktiv
            </p>
            <p className="text-xs text-ink-mid mt-1 leading-relaxed">
              Der gemeinsame Foto-Speicher wird gerade eingerichtet
              (Vercel Blob + KV). Sobald aktiviert, erscheinen hier
              Fotos die andere Mitreisende mit dir / der Gruppe geteilt
              haben.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && photos.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-4 flex items-center gap-2">
        <Loader2 size={14} className="text-ink-light animate-spin" />
        <p className="text-xs text-ink-mid">Lade geteilte Fotos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4">
        <p className="text-xs text-warning font-semibold">
          ⚠️ Fehler beim Laden
        </p>
        <p className="text-[11px] text-ink-mid mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tab-Wahl nur für Geburtstagskind */}
      {viewerIsCelebrant && (
        <div className="flex gap-1.5">
          <TabButton
            active={tab === "all"}
            onClick={() => setTab("all")}
            icon={<Users size={12} />}
            label="Alle für mich sichtbaren"
            count={photos.length}
          />
          <TabButton
            active={tab === "celebrant-only"}
            onClick={() => setTab("celebrant-only")}
            icon={<Cake size={12} />}
            label="Nur für mich"
            count={photos.filter((p) => p.visibility === "celebrant").length}
          />
        </div>
      )}

      {visiblePhotos.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-card border border-cream-200/50 p-6 text-center">
          <ImageOff size={28} className="mx-auto text-ink-light mb-2" />
          <p className="text-sm text-ink-dark font-semibold">
            {viewerIsCelebrant && tab === "celebrant-only"
              ? "Noch keine Foto-Geschenke 🎁"
              : "Noch keine geteilten Fotos"}
          </p>
          <p className="text-xs text-ink-mid mt-1 leading-relaxed max-w-[280px] mx-auto">
            {viewerIsCelebrant && tab === "celebrant-only"
              ? `Wenn jemand ein Foto „${
                  celebrant?.name ?? "für mich"
                }" markiert, erscheint es hier.`
              : "Sobald jemand ein Foto mit der Gruppe (oder dir persönlich) teilt, taucht es hier auf."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {visiblePhotos.map((photo) => (
            <SharedPhotoTile
              key={photo.id}
              photo={photo}
              currentUserName={currentUserName}
              onWithdraw={() => {
                if (confirm("Foto wirklich aus dem Pool entfernen?")) {
                  withdraw(photo.id).catch(console.error);
                }
              }}
              onChangeVisibility={(next) =>
                changeVisibility(photo.id, next).catch(console.error)
              }
            />
          ))}
        </div>
      )}

      <p className="text-[10px] text-center text-ink-light italic leading-relaxed">
        💡 Geteilte Fotos liegen verschlüsselt auf Vercel Blob (EU).
        Du kannst eigene Fotos jederzeit zurückziehen.
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-semibold transition",
        active
          ? "bg-navy text-cream"
          : "bg-cream-200 text-ink-mid hover:bg-cream-300",
      )}
    >
      {icon}
      {label}
      <span
        className={classNames(
          "ml-0.5 px-1.5 rounded-full text-[9px] font-bold",
          active ? "bg-cream/20 text-cream" : "bg-white text-navy",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SharedPhotoTile({
  photo,
  currentUserName,
  onWithdraw,
  onChangeVisibility,
}: {
  photo: SharedPhotoView;
  currentUserName: string;
  onWithdraw: () => void;
  onChangeVisibility: (next: SharedPhotoVisibility) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMine = photo.uploaderName === currentUserName;

  return (
    <div className="relative group">
      <a
        href={photo.blobUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-square rounded-lg overflow-hidden bg-cream-200"
        aria-label={`Foto von ${photo.uploaderName} — ${photo.caption ?? photo.fileName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.thumbBlobUrl}
          alt={photo.caption ?? photo.fileName}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </a>

      {/* Uploader-Badge unten links */}
      <span
        className={classNames(
          "absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold backdrop-blur-sm",
          isMine
            ? "bg-gold/90 text-navy"
            : "bg-navy/70 text-cream",
        )}
        title={`Hochgeladen von ${photo.uploaderName}`}
      >
        {isMine ? "★ " : ""}
        {photo.uploaderName}
      </span>

      {/* Visibility-Badge oben rechts */}
      <span
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center"
        title={
          photo.visibility === "group"
            ? "Ganze Gruppe sieht dieses Foto"
            : photo.visibility === "celebrant"
              ? "Nur Geburtstagskind + Uploader sehen dieses Foto"
              : "Privat (nur Uploader)"
        }
      >
        {photo.visibility === "group" ? (
          <Users size={9} className="text-info" />
        ) : photo.visibility === "celebrant" ? (
          <Heart size={9} className="text-warning" />
        ) : (
          <Lock size={9} className="text-ink-mid" />
        )}
      </span>

      {/* Withdraw/Visibility-Menu für eigene Fotos */}
      {photo.canWithdraw && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen((v) => !v);
            }}
            className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-navy text-[10px] font-bold hover:bg-white"
            aria-label="Sichtbarkeit ändern oder zurückziehen"
          >
            ⋯
          </button>
          {menuOpen && (
            <div
              className="absolute top-7 left-1 z-20 rounded-lg bg-white shadow-elevated border border-cream-200 overflow-hidden text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {photo.visibility !== "group" && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeVisibility("group");
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-cream-50 w-full text-left"
                >
                  <Users size={11} /> Gruppe sehen lassen
                </button>
              )}
              {photo.visibility !== "celebrant" && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeVisibility("celebrant");
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-cream-50 w-full text-left border-t border-cream-200"
                >
                  <Heart size={11} /> Nur Geburtstagskind
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onWithdraw();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-warning/10 text-warning w-full text-left border-t border-cream-200"
              >
                <Trash2 size={11} /> Zurückziehen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
