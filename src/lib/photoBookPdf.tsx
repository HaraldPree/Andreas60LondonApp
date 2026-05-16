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
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Trip } from "@/types/trip";
import type { PhotoMeta } from "@/types/photo";

// ----------------------------------------------------------------------
// Fonts — registered once on module load. Google's plain TTFs work
// across react-pdf without needing manual subsetting.
// ----------------------------------------------------------------------
Font.register({
  family: "Playfair",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDQ.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDU.ttf",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "DMSans",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriI5-g7vN_BL7rqg.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/dmsans/v15/rP2Cp2ywxg089UriCZ2IHTWEBlw.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/dmsans/v15/rP2Cp2ywxg089UriCZyIHTWEBlw.ttf",
      fontWeight: 700,
    },
  ],
});

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
    fontFamily: "DMSans",
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
    fontFamily: "Playfair",
    fontSize: 11,
    color: COLORS.gold,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 12,
    fontWeight: 700,
  },
  coverGoldDivider: {
    width: 60,
    height: 1.5,
    backgroundColor: COLORS.gold,
    marginVertical: 16,
  },
  coverTitle: {
    fontFamily: "Playfair",
    fontSize: 56,
    color: COLORS.white,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 12,
  },
  coverSubtitle: {
    fontFamily: "Playfair",
    fontSize: 20,
    color: COLORS.cream,
    textAlign: "center",
    fontWeight: 400,
  },
  coverDates: {
    fontFamily: "DMSans",
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
    fontFamily: "DMSans",
    fontSize: 10,
    color: COLORS.inkMid,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: 500,
  },
  separatorTitle: {
    fontFamily: "Playfair",
    fontSize: 42,
    color: COLORS.navy,
    fontWeight: 700,
    textAlign: "center",
    marginVertical: 16,
  },
  separatorDate: {
    fontFamily: "Playfair",
    fontSize: 14,
    color: COLORS.gold,
    textAlign: "center",
    fontWeight: 400,
    // (italic dropped — would require registering Playfair italic
    // variant separately; the gold color already provides emphasis)
  },
  separatorSummary: {
    fontFamily: "DMSans",
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
    fontFamily: "DMSans",
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
    fontFamily: "DMSans",
    fontSize: 10,
    color: COLORS.inkDark,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 1.4,
  },
  photoCaptionMeta: {
    fontFamily: "DMSans",
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
    fontFamily: "Playfair",
    fontSize: 38,
    color: COLORS.navy,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 12,
  },
  closingSubtitle: {
    fontFamily: "DMSans",
    fontSize: 14,
    color: COLORS.inkMid,
    textAlign: "center",
    marginBottom: 32,
  },
  closingFooter: {
    fontFamily: "Playfair",
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
    fontFamily: "DMSans",
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
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.coverContainer}>
        {heroDataUrl && <Image src={heroDataUrl} style={styles.coverImage} />}
        <View style={styles.coverOverlay} />
        <View style={styles.coverInner}>
          <Text style={styles.coverEyebrow}>Travel Companion</Text>
          <View style={styles.coverGoldDivider} />
          <Text style={styles.coverTitle}>{title}</Text>
          {trip.subtitle && (
            <Text style={styles.coverSubtitle}>{trip.subtitle}</Text>
          )}
          {trip.occasionDetails?.title && (
            <Text style={styles.coverDates}>{trip.occasionDetails.title}</Text>
          )}
        </View>
        {participants.length > 0 && (
          <View style={styles.coverParticipants}>
            {participants.map((p) => (
              <Text key={p.name} style={styles.coverParticipantChip}>
                {p.role === "celebrant" ? "🎂 " : ""}
                {p.name}
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
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View
        style={[
          styles.separatorColorStripe,
          { backgroundColor: day.color || COLORS.gold },
        ]}
      />
      <View style={styles.separatorPage}>
        <Text style={styles.separatorEyebrow}>Tag {dayIndex + 1}</Text>
        <View style={styles.separatorGoldDivider} />
        <Text style={styles.separatorTitle}>{day.title}</Text>
        <Text style={styles.separatorDate}>{day.date}</Text>
        {day.summary && (
          <Text style={styles.separatorSummary}>{day.summary}</Text>
        )}
        <View style={styles.separatorGoldDivider} />
      </View>
    </Page>
  );
}

function UnsortedSeparatorPage() {
  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
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
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.photoPageContainer}>
        <Text style={styles.photoPageHeader}>{dayLabel}</Text>
        <View style={styles.photoRow}>
          {photos.map((p) => (
            <View key={p.id} style={styles.photoCell}>
              <View style={styles.photoImageWrap}>
                <Image src={p.dataUrl} style={styles.photoImage} />
              </View>
              {p.caption && (
                <Text style={styles.photoCaption}>{p.caption}</Text>
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
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.photoPageContainer}>
        <Text style={styles.photoPageHeader}>{dayLabel}</Text>
        <View style={styles.singlePhotoWrap}>
          <Image src={photo.dataUrl} style={styles.photoImage} />
        </View>
        {photo.caption && (
          <Text style={[styles.photoCaption, { fontSize: 12, marginTop: 12 }]}>
            {photo.caption}
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
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.closingPage}>
        <Text style={styles.closingEmoji}>{trip.occasion ?? "✨"}</Text>
        <Text style={styles.closingTitle}>
          {celebrant
            ? `Für ${celebrant.name}`
            : "Eine unvergessliche Reise"}
        </Text>
        {celebrant && (
          <Text style={styles.closingSubtitle}>
            {trip.occasionDetails?.title ?? "Happy Birthday"} ♥
          </Text>
        )}
        <View style={styles.coverGoldDivider} />
        <Text style={styles.closingFooter}>
          Erstellt mit ♥ unterwegs
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

      {daysWithPhotos.map((dayIdx) => {
        const day = trip.days[dayIdx];
        const photos = photosByDay.get(dayIdx) ?? [];
        const dayLabel = `Tag ${dayIdx + 1} · ${day?.date ?? ""}`;
        // Pages: 2 photos per page if there are 2+, else 1 per page
        const pages: React.ReactNode[] = [];
        if (photos.length === 1) {
          pages.push(
            <SinglePhotoPage
              key={`day-${dayIdx}-single`}
              photo={photos[0]}
              dayLabel={dayLabel}
            />,
          );
        } else {
          const pairs = chunk(photos, 2);
          pairs.forEach((pair, i) => {
            pages.push(
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

        return [
          <DaySeparatorPage
            key={`sep-${dayIdx}`}
            trip={trip}
            dayIndex={dayIdx}
          />,
          ...pages,
        ];
      })}

      {unsorted.length > 0 && (
        <>
          <UnsortedSeparatorPage />
          {chunk(unsorted, 2).map((pair, i) =>
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
          )}
        </>
      )}

      <ClosingPage trip={trip} />
    </Document>
  );
}
