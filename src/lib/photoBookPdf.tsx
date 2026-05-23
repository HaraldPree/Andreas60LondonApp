/* eslint-disable jsx-a11y/alt-text */
/**
 * PDF photo-book renderer.
 *
 * Builds a multi-page A4-landscape PDF from trip photos using
 * @react-pdf/renderer. Layout:
 *
 *   1. Cover page      — hero image + title + participants
 *   2. (per day)
 *       a. Day separator page — gold divider + day title + summary
 *       b. Photo pages       — 2 photos side-by-side with captions
 *   3. Closing page    — birthday message + "Erstellt mit ♥"
 *
 * Photos are passed in as pre-loaded data URLs (the caller resolves
 * blobs to base64 because @react-pdf can't reach IndexedDB directly).
 *
 * Fonts: Playfair Display (serif, headlines) + DM Sans (sans, body),
 * both fetched from Google Fonts CDN once and embedded.
 */

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";

// ----------------------------------------------------------------------
// Fonts — using @react-pdf's built-in PostScript Type 1 fonts:
//   Helvetica   → sans-serif (body, captions)
//   Times-Roman → serif (headlines)
//   Both are embedded by react-pdf with no network dependency.
//
// Why not Playfair Display + DM Sans like the rest of the app?
// We tried fetching them from Google Fonts (fonts.gstatic.com) but
// Google rotates their hashed CDN paths between font versions, so
// the URLs went 404 between deploys. The PDF generator can't crash
// just because a CDN hash changed — built-in fonts are bulletproof.
// Future improvement: bundle TTFs locally under /public/fonts/.
// ----------------------------------------------------------------------
const FONT_SERIF = "Times-Roman";
const FONT_SERIF_BOLD = "Times-Bold";
const FONT_SANS = "Helvetica";
const FONT_SANS_BOLD = "Helvetica-Bold";

// ----------------------------------------------------------------------
// Colours — mirror the Tailwind CI palette so the PDF looks like the app.
// ----------------------------------------------------------------------
const COLORS = {
  navy: "#003366",
  gold: "#E5A00D",
  cream: "#F8F6F1",
  inkDark: "#1a1a2e",
  inkMid: "#52525B",
  inkLight: "#A1A1AA",
  white: "#FFFFFF",
} as const;

// ----------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.cream,
    fontFamily: FONT_SANS,
    fontSize: 10,
    color: COLORS.inkDark,
    padding: 0,
  },
  // Cover
  coverContainer: {
    flex: 1,
    position: "relative",
  },
  coverImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  coverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 20, 41, 0.45)",
  },
  coverInner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  coverEyebrow: {
    fontFamily: FONT_SERIF_BOLD,
    fontSize: 11,
    color: COLORS.gold,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  coverGoldDivider: {
    width: 60,
    height: 1.5,
    backgroundColor: COLORS.gold,
    marginVertical: 16,
  },
  coverTitle: {
    fontFamily: FONT_SERIF_BOLD,
    fontSize: 56,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 12,
  },
  coverSubtitle: {
    fontFamily: FONT_SERIF,
    fontSize: 20,
    color: COLORS.cream,
    textAlign: "center",
  },
  coverDates: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    color: COLORS.cream,
    marginTop: 24,
    letterSpacing: 1,
  },
  coverParticipants: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  coverParticipantChip: {
    fontSize: 9,
    color: COLORS.cream,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Day separator
  separatorPage: {
    backgroundColor: COLORS.cream,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  separatorColorStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  separatorEyebrow: {
    fontFamily: FONT_SANS_BOLD,
    fontSize: 10,
    color: COLORS.inkMid,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  separatorTitle: {
    fontFamily: FONT_SERIF_BOLD,
    fontSize: 42,
    color: COLORS.navy,
    textAlign: "center",
    marginVertical: 16,
  },
  separatorDate: {
    fontFamily: FONT_SERIF,
    fontSize: 14,
    color: COLORS.gold,
    textAlign: "center",
    // (italic dropped — built-in fonts don't have italic variants
    // by default; the gold color already provides emphasis)
  },
  separatorSummary: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    color: COLORS.inkMid,
    textAlign: "center",
    maxWidth: 480,
    lineHeight: 1.6,
    marginTop: 20,
  },
  separatorGoldDivider: {
    width: 80,
    height: 1.5,
    backgroundColor: COLORS.gold,
    marginVertical: 20,
  },
  // Photo page (2 photos side by side)
  photoPageContainer: {
    flex: 1,
    padding: 30,
    display: "flex",
    flexDirection: "column",
  },
  photoPageHeader: {
    fontFamily: FONT_SANS,
    fontSize: 9,
    color: COLORS.inkLight,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 16,
  },
  photoRow: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
  },
  photoCell: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  photoImageWrap: {
    flex: 1,
    backgroundColor: COLORS.inkLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  photoCaption: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    color: COLORS.inkDark,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 1.4,
  },
  photoCaptionMeta: {
    fontFamily: FONT_SANS,
    fontSize: 8,
    color: COLORS.inkLight,
    marginTop: 2,
    textAlign: "center",
    // Light grey + small size already reads as "secondary" — no italic needed
  },
  // Single photo page (full)
  singlePhotoWrap: {
    flex: 1,
    backgroundColor: COLORS.inkLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  // Closing page
  closingPage: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  closingEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  closingTitle: {
    fontFamily: FONT_SERIF_BOLD,
    fontSize: 38,
    color: COLORS.navy,
    textAlign: "center",
    marginBottom: 12,
  },
  closingSubtitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    color: COLORS.inkMid,
    textAlign: "center",
    marginBottom: 32,
  },
  closingFooter: {
    fontFamily: FONT_SERIF,
    fontSize: 10,
    color: COLORS.inkLight,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 24,
  },
  // Page number
  pageNumber: {
    position: "absolute",
    bottom: 12,
    right: 20,
    fontSize: 8,
    color: COLORS.inkLight,
    fontFamily: FONT_SANS,
  },
});

// ----------------------------------------------------------------------
// Photo prepared for PDF — meta + already-loaded data URL.
// ----------------------------------------------------------------------
export interface PdfPhotoEntry {
  id: string;
  fileName: string;
  takenAt: string;
  caption?: string;
  aiNarrative?: string;
  /** Data URL ("data:image/jpeg;base64,..."). Caller resolves blob → base64. */
  dataUrl: string;
  /** Day index (or null for unsorted) */
  dayIndex: number | null;
}

interface PdfPhotoBookProps {
  trip: Trip;
  photosByDay: Map<number | "unsorted", PdfPhotoEntry[]>;
  /** Hero image data URL (preferably the trip's heroImage, base64-encoded). */
  heroDataUrl?: string;
  /** Optional override for the cover title. Defaults to trip.destination. */
  coverTitleOverride?: string;
}

// ----------------------------------------------------------------------
// Chunk an array into groups of N (used for 2-photos-per-page layout).
// ----------------------------------------------------------------------
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * Strips characters that built-in PostScript fonts (Times-Roman,
 * Helvetica) can't render — emojis, fancy hearts, arrows, CJK, etc.
 * Without this, those glyphs come out as garbage characters like ">"
 * or break line-wrapping (because the font has no width info for the
 * unknown glyph).
 *
 * Keeps: ASCII + Latin-1 supplement (covers German umlauts, ß,
 * basic punctuation, currency, ©®°). Drops everything else, then
 * collapses doubled whitespace from the removed glyphs.
 */
function safeText(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .replace(/[^ -ÿ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * v1.10.2 — Truncate auf maxLen mit "…" Suffix. Verhindert dass lange
 * Summary-Texte den DaySeparatorPage-Layout sprengen.
 */
function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1).trimEnd() + "…";
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("de-AT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// ----------------------------------------------------------------------
// Page components
// ----------------------------------------------------------------------
function CoverPage({
  trip,
  heroDataUrl,
  coverTitleOverride,
}: {
  trip: Trip;
  heroDataUrl?: string;
  coverTitleOverride?: string;
}) {
  const title = coverTitleOverride ?? trip.destination;
  const participants = trip.participants ?? [];
  return (
    // v1.10.2 — wrap={false} verhindert dass react-pdf bei minimalem
    // Overflow zweite PDF-Seiten als Phantom erzeugt (Harald-Bug).
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      <View style={styles.coverContainer}>
        {heroDataUrl && <Image src={heroDataUrl} style={styles.coverImage} />}
        <View style={styles.coverOverlay} />
        <View style={styles.coverInner}>
          <Text style={styles.coverEyebrow}>TRAVEL COMPANION</Text>
          <View style={styles.coverGoldDivider} />
          <Text style={styles.coverTitle}>{safeText(title)}</Text>
          {trip.subtitle && (
            <Text style={styles.coverSubtitle}>{safeText(trip.subtitle)}</Text>
          )}
          {trip.occasionDetails?.title && (
            <Text style={styles.coverDates}>
              {safeText(trip.occasionDetails.title)}
            </Text>
          )}
        </View>
        {participants.length > 0 && (
          <View style={styles.coverParticipants}>
            {participants.map((p) => (
              <Text key={p.name} style={styles.coverParticipantChip}>
                {/* Asterisk instead of birthday-cake emoji because the
                    built-in PostScript fonts can't render emojis. */}
                {p.role === "celebrant" ? "* " : ""}
                {safeText(p.name)}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Page>
  );
}

function DaySeparatorPage({
  trip,
  dayIndex,
}: {
  trip: Trip;
  dayIndex: number;
}) {
  const day = trip.days[dayIndex];
  if (!day) return null;
  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      <View
        style={[
          styles.separatorColorStripe,
          { backgroundColor: day.color || COLORS.gold },
        ]}
      />
      <View style={styles.separatorPage}>
        <Text style={styles.separatorEyebrow}>Tag {dayIndex + 1}</Text>
        <View style={styles.separatorGoldDivider} />
        <Text style={styles.separatorTitle}>{safeText(day.title)}</Text>
        <Text style={styles.separatorDate}>{safeText(day.date)}</Text>
        {day.summary && (
          // v1.10.2 — Hartes Truncating auf 320 Zeichen, sonst sprengt
          // langer Summary die vertikal-zentrierte Layout-Höhe und react-pdf
          // wrapped trotz wrap={false} zu Layout-Issues.
          <Text style={styles.separatorSummary}>
            {truncate(safeText(day.summary), 320)}
          </Text>
        )}
        <View style={styles.separatorGoldDivider} />
      </View>
    </Page>
  );
}

function UnsortedSeparatorPage() {
  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      <View style={styles.separatorPage}>
        <Text style={styles.separatorEyebrow}>Unsortiert</Text>
        <View style={styles.separatorGoldDivider} />
        <Text style={styles.separatorTitle}>Weitere Momente</Text>
        <Text style={styles.separatorSummary}>
          Fotos ohne klare Tageszuordnung
        </Text>
        <View style={styles.separatorGoldDivider} />
      </View>
    </Page>
  );
}

function PhotoPairPage({
  photos,
  dayLabel,
}: {
  photos: PdfPhotoEntry[];
  dayLabel: string;
}) {
  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      <View style={styles.photoPageContainer}>
        <Text style={styles.photoPageHeader}>{dayLabel}</Text>
        <View style={styles.photoRow}>
          {photos.map((p) => (
            <View key={p.id} style={styles.photoCell}>
              <View style={styles.photoImageWrap}>
                <Image src={p.dataUrl} style={styles.photoImage} />
              </View>
              {p.caption && (
                <Text style={styles.photoCaption}>
                  {safeText(p.caption)}
                </Text>
              )}
              <Text style={styles.photoCaptionMeta}>
                {formatTime(p.takenAt)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
}

function SinglePhotoPage({
  photo,
  dayLabel,
}: {
  photo: PdfPhotoEntry;
  dayLabel: string;
}) {
  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      <View style={styles.photoPageContainer}>
        <Text style={styles.photoPageHeader}>{dayLabel}</Text>
        <View style={styles.singlePhotoWrap}>
          <Image src={photo.dataUrl} style={styles.photoImage} />
        </View>
        {photo.caption && (
          <Text style={[styles.photoCaption, { fontSize: 12, marginTop: 12 }]}>
            {safeText(photo.caption)}
          </Text>
        )}
        <Text style={styles.photoCaptionMeta}>{formatTime(photo.takenAt)}</Text>
      </View>
    </Page>
  );
}

function ClosingPage({ trip }: { trip: Trip }) {
  const celebrant = trip.participants?.find((p) => p.role === "celebrant");
  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      <View style={styles.closingPage}>
        {/* No emoji at top — built-in fonts can't render them.
            Use a small uppercase label as decoration instead. */}
        <Text style={styles.coverEyebrow}>ALLES LIEBE</Text>
        <View style={styles.coverGoldDivider} />
        <Text style={styles.closingTitle}>
          {celebrant
            ? `Für ${safeText(celebrant.name)}`
            : "Eine unvergessliche Reise"}
        </Text>
        {celebrant && (
          <Text style={styles.closingSubtitle}>
            {safeText(trip.occasionDetails?.title) || "Happy Birthday"}
          </Text>
        )}
        <View style={styles.coverGoldDivider} />
        <Text style={styles.closingFooter}>
          Erstellt unterwegs in {safeText(trip.destination)}
        </Text>
      </View>
    </Page>
  );
}

// ----------------------------------------------------------------------
// Main document
// ----------------------------------------------------------------------
export function PhotoBookDocument({
  trip,
  photosByDay,
  heroDataUrl,
  coverTitleOverride,
}: PdfPhotoBookProps) {
  // Build ordered list of day indices that actually have photos
  const daysWithPhotos: number[] = [];
  for (let i = 0; i < trip.days.length; i++) {
    if ((photosByDay.get(i)?.length ?? 0) > 0) {
      daysWithPhotos.push(i);
    }
  }
  const unsorted = photosByDay.get("unsorted") ?? [];

  return (
    <Document
      title={`Foto-Buch · ${trip.destination}`}
      author="Travel Companion"
      subject={trip.subtitle ?? "Reise-Foto-Buch"}
      keywords="Reise, Foto-Buch, Travel Companion"
    >
      <CoverPage
        trip={trip}
        heroDataUrl={heroDataUrl}
        coverTitleOverride={coverTitleOverride}
      />

      {/* v1.10.2 — FLAT Array statt nested .map()-returns.
          Vorher: jeder map-Return war ein Array → React-PDF erhielt
          Array<Array<Page>> und erzeugte Phantompages (leere Seiten
          nach jedem Tag). Jetzt baue ich eine flache Liste vorab und
          übergebe sie einmal — keine Verschachtelung mehr. */}
      {(() => {
        const allPages: React.ReactNode[] = [];
        for (const dayIdx of daysWithPhotos) {
          const day = trip.days[dayIdx];
          const photos = photosByDay.get(dayIdx) ?? [];
          const dayLabel = `Tag ${dayIdx + 1} · ${day?.date ?? ""}`;

          allPages.push(
            <DaySeparatorPage
              key={`sep-${dayIdx}`}
              trip={trip}
              dayIndex={dayIdx}
            />,
          );

          if (photos.length === 1) {
            allPages.push(
              <SinglePhotoPage
                key={`day-${dayIdx}-single`}
                photo={photos[0]}
                dayLabel={dayLabel}
              />,
            );
          } else {
            const pairs = chunk(photos, 2);
            pairs.forEach((pair, i) => {
              allPages.push(
                pair.length === 2 ? (
                  <PhotoPairPage
                    key={`day-${dayIdx}-pair-${i}`}
                    photos={pair}
                    dayLabel={dayLabel}
                  />
                ) : (
                  <SinglePhotoPage
                    key={`day-${dayIdx}-single-${i}`}
                    photo={pair[0]}
                    dayLabel={dayLabel}
                  />
                ),
              );
            });
          }
        }

        if (unsorted.length > 0) {
          allPages.push(<UnsortedSeparatorPage key="uns-sep" />);
          chunk(unsorted, 2).forEach((pair, i) => {
            allPages.push(
              pair.length === 2 ? (
                <PhotoPairPage
                  key={`uns-pair-${i}`}
                  photos={pair}
                  dayLabel="Unsortiert"
                />
              ) : (
                <SinglePhotoPage
                  key={`uns-single-${i}`}
                  photo={pair[0]}
                  dayLabel="Unsortiert"
                />
              ),
            );
          });
        }

        return allPages;
      })()}

      <ClosingPage trip={trip} />
    </Document>
  );
}
