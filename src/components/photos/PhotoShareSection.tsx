"use client";

import { useEffect, useState } from "react";
import { Share2, Loader2, CheckCircle2, Lock, AlertCircle } from "lucide-react";
import type { PhotoMeta } from "@/types/photo";
import type { SharedPhotoVisibility } from "@/types/sharedPhoto";
import { getFullBlob, getThumbnailBlob } from "@/lib/photoStorage";
import { hasFullConsent, readConsent } from "@/lib/consentStorage";
import { useSharedPhotos } from "@/hooks/useSharedPhotos";
import { VisibilitySelector } from "./VisibilitySelector";
import { SharingConsentModal } from "./SharingConsentModal";

interface Props {
  photo: PhotoMeta;
  tripSlug: string;
  currentUserName: string | null;
  celebrantName?: string | null;
}

/**
 * Sharing-Sektion innerhalb von PhotoDetail.
 *
 * Flow:
 *  1. Wenn `currentUserName` fehlt → "wähle Avatar"-Hinweis
 *  2. Wenn AGB+DSGVO noch nicht akzeptiert → ConsentModal
 *  3. Wenn akzeptiert → 3-Stufen-VisibilitySelector + "Jetzt teilen" Button
 *  4. Nach erfolgreichem Upload → "✓ geteilt"-Status, Option zum
 *     Zurückziehen oder Stufe ändern
 *
 * Sharing-State (ob das Foto bereits im Backend ist + welche Stufe)
 * wird über useSharedPhotos-Refresh ermittelt.
 */
export function PhotoShareSection({
  photo,
  tripSlug,
  currentUserName,
  celebrantName,
}: Props) {
  const [pendingVisibility, setPendingVisibility] =
    useState<SharedPhotoVisibility>("private");
  const [consentOpen, setConsentOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    photos: sharedPhotos,
    serviceConfigured,
    share,
    changeVisibility,
    withdraw,
  } = useSharedPhotos({
    tripSlug,
    viewerName: currentUserName,
  });

  // Status dieses Fotos im Backend (falls schon geteilt)
  const existing = sharedPhotos.find((p) => p.id === photo.id);
  const currentVisibility: SharedPhotoVisibility = existing
    ? existing.visibility
    : "private";

  // Wenn Backend-Status anders als pending: pending an Backend angleichen
  useEffect(() => {
    if (existing) setPendingVisibility(existing.visibility);
  }, [existing]);

  if (!currentUserName) {
    return (
      <SectionShell>
        <p className="text-xs text-ink-mid italic">
          Wähle erst deinen Avatar oben rechts, um Fotos teilen zu können.
        </p>
      </SectionShell>
    );
  }

  if (serviceConfigured === false) {
    return (
      <SectionShell>
        <div className="flex items-start gap-2">
          <AlertCircle size={14} className="text-info flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-ink-mid leading-relaxed">
            Foto-Sharing-Service wird gerade eingerichtet. Solange das
            Foto nur auf deinem Handy.
          </p>
        </div>
      </SectionShell>
    );
  }

  const consentGiven = hasFullConsent(
    readConsent(tripSlug, currentUserName),
  );

  const handleShareClick = async () => {
    if (pendingVisibility === "private") {
      // User möchte zurückstellen — wenn schon online, withdraw
      if (existing) {
        try {
          await withdraw(photo.id);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Widerruf fehlgeschlagen");
        }
      }
      return;
    }

    // Sharing-Aktion → Consent prüfen
    if (!consentGiven) {
      setConsentOpen(true);
      return;
    }
    await performShare();
  };

  const performShare = async () => {
    setUploading(true);
    setError(null);
    try {
      // Wenn schon online, nur Sichtbarkeit ändern
      if (existing) {
        await changeVisibility(photo.id, pendingVisibility);
      } else {
        const fullBlob = await getFullBlob(photo.id);
        const thumbBlob = await getThumbnailBlob(photo.id);
        if (!fullBlob || !thumbBlob) {
          throw new Error(
            "Foto-Daten lokal nicht (mehr) verfügbar — Galerie neu laden",
          );
        }
        await share({
          photoId: photo.id,
          visibility: pendingVisibility as Exclude<
            SharedPhotoVisibility,
            "private"
          >,
          fullBlob,
          thumbBlob,
          fileName: photo.fileName,
          caption: photo.caption,
          takenAt: photo.takenAt,
          assignedDay: photo.assignedDay,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const buttonLabel =
    pendingVisibility === "private"
      ? existing
        ? "Foto zurückziehen"
        : "Bleibt privat"
      : existing
        ? "Sichtbarkeit aktualisieren"
        : "Jetzt teilen";

  const buttonDisabled =
    uploading ||
    (pendingVisibility === "private" && !existing) ||
    pendingVisibility === currentVisibility;

  return (
    <>
      <SectionShell>
        <div className="flex items-center gap-2 mb-2">
          <Share2 size={14} className="text-gold-600" />
          <p className="text-[10px] uppercase tracking-wider text-gold-600 font-bold">
            Mit anderen teilen
          </p>
          {existing && (
            <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/15 text-success text-[9px] font-bold">
              <CheckCircle2 size={10} />
              online
            </span>
          )}
        </div>

        <VisibilitySelector
          value={pendingVisibility}
          onChange={setPendingVisibility}
          celebrantName={celebrantName}
          hideCelebrant={!celebrantName}
          compact
        />

        {error && (
          <p className="text-[11px] text-warning mt-2 leading-relaxed">
            ⚠️ {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleShareClick}
          disabled={buttonDisabled}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-navy text-cream text-xs font-semibold hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {uploading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              wird hochgeladen…
            </>
          ) : pendingVisibility === "private" && !existing ? (
            <>
              <Lock size={12} /> {buttonLabel}
            </>
          ) : (
            <>
              <Share2 size={12} /> {buttonLabel}
            </>
          )}
        </button>

        {!consentGiven && pendingVisibility !== "private" && (
          <p className="text-[10px] text-ink-light italic text-center mt-1.5 leading-relaxed">
            Beim Klick auf „Jetzt teilen" wirst du einmalig nach
            AGB/Datenschutz-Einwilligung gefragt.
          </p>
        )}
      </SectionShell>

      <SharingConsentModal
        open={consentOpen}
        tripSlug={tripSlug}
        userName={currentUserName}
        onAccept={() => {
          setConsentOpen(false);
          void performShare();
        }}
        onCancel={() => setConsentOpen(false)}
      />
    </>
  );
}

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-cream-50 border border-cream-200 p-3 mt-3">
      {children}
    </div>
  );
}
