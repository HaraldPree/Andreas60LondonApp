/**
 * GET /api/photos/list/[tripSlug]?viewerName=Andrea
 *
 * Liefert die für `viewerName` sichtbaren geteilten Fotos der Reise.
 * Wendet die Sichtbarkeits-Logik aus `canViewSharedPhoto()` an:
 *   - Eigene Fotos: alle (auch wenn der Uploader die Sichtbarkeit
 *     später runtergestuft hat, sieht er selber sie noch)
 *   - "group": alle Mitglieder sehen es
 *   - "celebrant": nur das Geburtstagskind sieht es
 *   - "private": niemals sichtbar (sollte ohnehin nicht im KV liegen)
 *
 * Die Antwort ist auf das SharedPhotoView-Schema reduziert — keine
 * Felder die der Client nicht brauchen sollte (z.B. `withdrawnAt`).
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  isStorageConfigured,
  listSharedPhotos,
} from "@/lib/sharedPhotoStore";
import {
  canViewSharedPhoto,
  type SharedPhotoView,
} from "@/types/sharedPhoto";
import { trips } from "@/data/trips";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { tripSlug: string } },
) {
  const { tripSlug } = params;
  const viewerName = req.nextUrl.searchParams.get("viewerName");

  // Find the trip + check if viewer is celebrant
  const trip = trips.find((t) => t.slug === tripSlug);
  if (!trip) {
    return NextResponse.json({ error: "Trip unbekannt" }, { status: 404 });
  }

  const viewerParticipant = viewerName
    ? trip.participants?.find((p) => p.name === viewerName)
    : null;
  const viewerIsCelebrant = viewerParticipant?.role === "celebrant";

  if (!isStorageConfigured()) {
    // Soft 200 mit leerer Liste — Client zeigt "Service nicht aktiviert"
    return NextResponse.json({
      ok: true,
      configured: false,
      photos: [],
    });
  }

  const all = await listSharedPhotos(tripSlug);

  const visible: SharedPhotoView[] = all
    .filter((p) => canViewSharedPhoto(p, viewerName, !!viewerIsCelebrant))
    .map((p) => ({
      id: p.id,
      uploaderName: p.uploaderName,
      visibility: p.visibility,
      blobUrl: p.blobUrl,
      thumbBlobUrl: p.thumbBlobUrl,
      fileName: p.fileName,
      takenAt: p.takenAt,
      caption: p.caption,
      assignedDay: p.assignedDay,
      uploadedAt: p.uploadedAt,
      canWithdraw: p.uploaderName === viewerName,
    }));

  return NextResponse.json({
    ok: true,
    configured: true,
    photos: visible,
    viewerIsCelebrant,
  });
}
