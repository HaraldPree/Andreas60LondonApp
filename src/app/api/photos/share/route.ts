/**
 * POST /api/photos/share — Foto + Sichtbarkeits-Wahl entgegennehmen,
 * an Vercel Blob + KV speichern.
 *
 * Body (multipart/form-data):
 *   - file: full-resolution photo blob
 *   - thumb: thumbnail photo blob
 *   - tripSlug: string
 *   - photoId: client-generated UUID (gleich wie IndexedDB ID)
 *   - uploaderName: string (aus localStorage Identity)
 *   - visibility: "celebrant" | "group" (private wird hier nie hochgeladen)
 *   - fileName, caption, takenAt, assignedDay: optional metadata
 *
 * Auth: PIN-Cookie wird via middleware geprüft, plus zusätzlicher
 * Check dass uploaderName ein gültiger Reisegruppen-Teilnehmer ist
 * (siehe assertParticipant unten).
 *
 * DSGVO: nur "celebrant" oder "group" landet hier — "private"
 * bleibt am Gerät und ruft diese Route nicht auf.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  isStorageConfigured,
  uploadSharedPhoto,
  withdrawSharedPhoto,
  updateSharedPhotoVisibility,
  getSharedPhoto,
} from "@/lib/sharedPhotoStore";
import type { SharedPhotoVisibility } from "@/types/sharedPhoto";
import { trips } from "@/data/trips";

export const runtime = "nodejs"; // Vercel Blob braucht Node-Runtime
export const dynamic = "force-dynamic";

const SERVICE_DISABLED_BODY = {
  error: "Storage-Service nicht konfiguriert",
  hint:
    "Vercel Dashboard → Storage → Blob + KV aktivieren, dann Env-Vars werden automatisch gesetzt. Danach Redeploy.",
};

/** Wirft 400 wenn name nicht im Trip-Mitglieder-Set steht. */
function assertParticipant(tripSlug: string, name: string): string | null {
  const trip = trips.find((t) => t.slug === tripSlug);
  if (!trip) return `Trip ${tripSlug} unbekannt`;
  if (!trip.participants?.some((p) => p.name === name)) {
    return `User ${name} ist nicht Mitglied der Reisegruppe ${tripSlug}`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!isStorageConfigured()) {
    return NextResponse.json(SERVICE_DISABLED_BODY, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Body ist keine valide multipart/form-data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const thumb = form.get("thumb");
  const tripSlug = form.get("tripSlug")?.toString();
  const photoId = form.get("photoId")?.toString();
  const uploaderName = form.get("uploaderName")?.toString();
  const visibility = form.get("visibility")?.toString() as SharedPhotoVisibility | undefined;
  const fileName = form.get("fileName")?.toString() ?? "photo.jpg";
  const caption = form.get("caption")?.toString();
  const takenAt = form.get("takenAt")?.toString();
  const assignedDayRaw = form.get("assignedDay")?.toString();
  const assignedDay =
    assignedDayRaw !== undefined && assignedDayRaw !== ""
      ? Number(assignedDayRaw)
      : undefined;

  // Validierung
  if (!(file instanceof Blob) || !(thumb instanceof Blob)) {
    return NextResponse.json(
      { error: "file und thumb müssen Blobs sein" },
      { status: 400 },
    );
  }
  if (!tripSlug || !photoId || !uploaderName || !visibility) {
    return NextResponse.json(
      {
        error:
          "Pflichtfelder fehlen: tripSlug, photoId, uploaderName, visibility",
      },
      { status: 400 },
    );
  }
  if (visibility !== "celebrant" && visibility !== "group") {
    return NextResponse.json(
      {
        error:
          "visibility muss 'celebrant' oder 'group' sein — 'private' bleibt lokal und wird nicht hochgeladen",
      },
      { status: 400 },
    );
  }
  const participantError = assertParticipant(tripSlug, uploaderName);
  if (participantError) {
    return NextResponse.json({ error: participantError }, { status: 403 });
  }

  // Größen-Limit pro Foto: 10 MB voll + 1 MB thumb (defensiv)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Foto-Datei zu groß (max 10 MB)" },
      { status: 413 },
    );
  }

  try {
    const record = await uploadSharedPhoto({
      tripSlug,
      photoId,
      uploaderName,
      visibility,
      fullBlob: file,
      thumbBlob: thumb,
      fileName,
      caption,
      takenAt,
      assignedDay: Number.isFinite(assignedDay)
        ? (assignedDay as number)
        : undefined,
    });
    return NextResponse.json({ ok: true, photo: record });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload fehlgeschlagen";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/photos/share?id=... — Sichtbarkeit ändern.
 * Body: { visibility: "celebrant" | "group" | "private" (== widerrufen) }
 */
export async function PATCH(req: NextRequest) {
  if (!isStorageConfigured()) {
    return NextResponse.json(SERVICE_DISABLED_BODY, { status: 503 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id-Parameter fehlt" }, { status: 400 });
  }

  let body: { visibility?: SharedPhotoVisibility; requesterName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    body.visibility !== "private" &&
    body.visibility !== "celebrant" &&
    body.visibility !== "group"
  ) {
    return NextResponse.json(
      { error: "visibility muss private | celebrant | group sein" },
      { status: 400 },
    );
  }

  // Nur der Uploader darf seine Sichtbarkeit ändern
  const existing = await getSharedPhoto(id);
  if (!existing) {
    return NextResponse.json({ error: "Foto nicht gefunden" }, { status: 404 });
  }
  if (existing.uploaderName !== body.requesterName) {
    return NextResponse.json(
      { error: "Nur der Uploader darf die Sichtbarkeit ändern" },
      { status: 403 },
    );
  }

  const updated = await updateSharedPhotoVisibility(id, body.visibility);
  return NextResponse.json({ ok: true, photo: updated });
}

/**
 * DELETE /api/photos/share?id=...&requesterName=...
 * Widerruft (löscht) ein geteiltes Foto. Nur der Uploader darf.
 */
export async function DELETE(req: NextRequest) {
  if (!isStorageConfigured()) {
    return NextResponse.json(SERVICE_DISABLED_BODY, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const requesterName = searchParams.get("requesterName");

  if (!id || !requesterName) {
    return NextResponse.json(
      { error: "id und requesterName Parameter erforderlich" },
      { status: 400 },
    );
  }

  const existing = await getSharedPhoto(id);
  if (!existing) {
    return NextResponse.json({ error: "Foto nicht gefunden" }, { status: 404 });
  }
  if (existing.uploaderName !== requesterName) {
    return NextResponse.json(
      { error: "Nur der Uploader darf zurückziehen" },
      { status: 403 },
    );
  }

  await withdrawSharedPhoto(id);
  return NextResponse.json({ ok: true });
}
