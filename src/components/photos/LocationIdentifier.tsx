"use client";

import { useRef, useState } from "react";
import {
  Search,
  Camera,
  ChevronDown,
  Loader2,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { compressForStorage, resizeImage } from "@/lib/photoProcessing";
import { mapsUrl } from "@/lib/formatters";
import { TransportButtons } from "@/components/ui/TransportButtons";
import { DayPickerModal } from "@/components/photos/DayPickerModal";
import type { LocationResult } from "@/app/api/identify-location/route";
import type { IdentifiedLocation } from "@/types/identifiedLocation";
import { useIdentificationHistory } from "@/hooks/useIdentificationHistory";
import { useUserPlaces } from "@/hooks/useUserPlaces";
import { useAiConsent } from "@/hooks/useAiConsent";
import { AiConsentModal } from "@/components/ai/AiConsentModal";
import { classNames } from "@/lib/formatters";
import type { Trip } from "@/types/trip";

interface LocationIdentifierProps {
  trip: Trip;
}

export function LocationIdentifier({ trip }: LocationIdentifierProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<LocationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickingForResult, setPickingForResult] = useState<LocationResult | null>(
    null,
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { history, add: addToHistory, remove: removeFromHistory, clear: clearHistory } =
    useIdentificationHistory(trip.slug);
  const { add: addUserPlace } = useUserPlaces(trip.slug);
  const consent = useAiConsent("photo-vision");

  const handlePick = () => inputRef.current?.click();

  const requestUpload = (file: File) => {
    if (consent.persistent) {
      void handleFile(file);
    } else {
      setPendingFile(file);
    }
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setCurrentResult(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const { full } = await compressForStorage(file);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(full);
      });
      const base64 = dataUrl.split(",")[1];

      // Tiny thumbnail (200px) for history visual reference
      const thumb = await resizeImage(file, 200, 0.7);
      const thumbDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(thumb);
      });

      const res = await fetch("/api/identify-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripSlug: trip.slug,
          imageBase64: base64,
          mediaType: "image/jpeg",
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = (await res.json()) as LocationResult;
      setCurrentResult(data);
      if (data.identified || data.name || data.description) {
        addToHistory(data, thumbDataUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const dismissCurrent = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCurrentResult(null);
    setError(null);
  };

  const addToTrip = (
    result: LocationResult,
    params: { dayIndex: number; time?: string },
  ) => {
    addUserPlace({
      dayIndex: params.dayIndex,
      time: params.time,
      name: result.name ?? "Neuer Ort",
      description: result.description,
      category: result.category,
      coordinates: result.coordinates,
      address: result.address,
      notes: result.notes,
      transitOptions: result.transitOptions,
    });
    setPickingForResult(null);
  };

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-info/10 to-cream-50 border border-info/30 shadow-card overflow-hidden">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              requestUpload(e.target.files[0]);
              e.target.value = "";
            }
          }}
        />

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full px-4 py-3 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center flex-shrink-0">
            <Search size={18} className="text-info" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h3 className="font-display text-base font-semibold text-navy">
              Wo ist das? Foto-Location erkennen
            </h3>
            <p className="text-[11px] text-ink-mid">
              {history.length > 0
                ? `${history.length} gemerkte Erkennung${history.length > 1 ? "en" : ""}`
                : "KI identifiziert Sehenswürdigkeiten aus Fotos"}
            </p>
          </div>
          <ChevronDown
            size={18}
            className={classNames(
              "text-ink-light transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-info/20 pt-3">
                {/* Upload area – always available */}
                <button
                  type="button"
                  onClick={handlePick}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-info text-white text-sm font-semibold hover:bg-info/90 transition disabled:opacity-50"
                >
                  <Camera size={16} />
                  {loading
                    ? "Analysiere…"
                    : currentResult || history.length > 0
                      ? "Weiteres Foto erkennen"
                      : "Foto auswählen"}
                </button>
                {!currentResult && !loading && history.length === 0 && (
                  <p className="text-[10px] text-ink-light italic text-center">
                    Komprimiert + einmalig an Claude Vision gesendet. Original
                    wird nicht gespeichert.
                  </p>
                )}

                {/* Preview while loading */}
                {previewUrl && loading && (
                  <div className="rounded-xl overflow-hidden bg-cream-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Hochgeladenes Foto"
                      className="w-full max-h-48 object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={28} className="animate-spin text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 flex items-start gap-2">
                    <AlertCircle
                      size={14}
                      className="text-warning flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-warning">{error}</p>
                  </div>
                )}

                {/* Current (just identified) result */}
                {currentResult && !loading && (
                  <div className="rounded-2xl bg-white border border-gold/40 p-3 shadow-card">
                    <p className="text-[10px] uppercase tracking-wider text-gold-600 font-bold mb-2 inline-flex items-center gap-1">
                      <Sparkles size={10} /> Gerade erkannt
                    </p>
                    <LocationResultBody
                      result={currentResult}
                      onAddToTrip={() => setPickingForResult(currentResult)}
                      onClear={dismissCurrent}
                      clearLabel="Schließen"
                    />
                  </div>
                )}

                {/* History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[10px] uppercase tracking-wider text-ink-light font-semibold inline-flex items-center gap-1">
                        <History size={10} /> Letzte Erkennungen
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Alle Erkennungen löschen?")) clearHistory();
                        }}
                        className="text-[10px] text-ink-light hover:text-warning"
                      >
                        Alle löschen
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {history.map((h) => (
                        <HistoryRow
                          key={h.id}
                          entry={h}
                          onAddToTrip={() => setPickingForResult(h.result)}
                          onDelete={() => removeFromHistory(h.id)}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DayPickerModal
        open={!!pickingForResult}
        trip={trip}
        onClose={() => setPickingForResult(null)}
        onConfirm={(params) => {
          if (pickingForResult) addToTrip(pickingForResult, params);
        }}
        title={`"${pickingForResult?.name ?? "Ort"}" zuordnen`}
        hint="An welchem Reisetag möchtest du diesen Ort einplanen?"
      />

      <AiConsentModal
        open={!!pendingFile}
        title="Foto-Location erkennen"
        actionDescription="Dein Foto wird komprimiert (max 1500px) und einmalig an Claude Vision gesendet, um den Ort zu identifizieren."
        dataSent={["Komprimiertes Foto", "Apartment-Standort als Kontext"]}
        onDecide={(choice) => {
          const file = pendingFile;
          setPendingFile(null);
          if (!file) return;
          if (choice === "never") return;
          consent.grant(choice);
          void handleFile(file);
        }}
      />
    </>
  );
}

function HistoryRow({
  entry,
  onAddToTrip,
  onDelete,
}: {
  entry: IdentifiedLocation;
  onAddToTrip: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { result } = entry;

  return (
    <li className="rounded-xl bg-white border border-cream-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-2.5 flex items-center gap-2.5 text-left hover:bg-cream-50 transition"
      >
        {entry.thumbnailDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.thumbnailDataUrl}
            alt={result.name ?? "Erkannter Ort"}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-dark leading-tight">
            {result.name ?? "Nicht erkannt"}
          </p>
          <p className="text-[10px] text-ink-light">
            {result.category ?? "Unklar"} ·{" "}
            {new Date(entry.identifiedAt).toLocaleString("de-DE", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={classNames(
            "text-ink-light flex-shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-cream-50"
          >
            <div className="p-3">
              <LocationResultBody
                result={result}
                onAddToTrip={onAddToTrip}
                onClear={onDelete}
                clearLabel="Aus Liste entfernen"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function LocationResultBody({
  result,
  onAddToTrip,
  onClear,
  clearLabel = "Schließen",
}: {
  result: LocationResult;
  onAddToTrip: () => void;
  onClear: () => void;
  clearLabel?: string;
}) {
  const confidenceColor =
    result.confidence === "high"
      ? "bg-success/15 text-success border-success/30"
      : result.confidence === "medium"
        ? "bg-gold/15 text-gold-600 border-gold/30"
        : "bg-warning/15 text-warning border-warning/30";

  return (
    <div className="space-y-3">
      <div>
        {result.identified ? (
          <>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {result.category && (
                <span className="text-[9px] uppercase tracking-wider bg-navy/10 text-navy font-bold px-1.5 py-0.5 rounded">
                  {result.category}
                </span>
              )}
              <span
                className={classNames(
                  "text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1",
                  confidenceColor,
                )}
              >
                <Sparkles size={9} /> {confidenceLabel(result.confidence)}
              </span>
            </div>
            <h4 className="font-display text-lg font-semibold text-navy leading-tight">
              {result.name}
            </h4>
            {result.alternativeName && (
              <p className="text-[11px] text-ink-light italic">
                auch bekannt als {result.alternativeName}
              </p>
            )}
          </>
        ) : (
          <h4 className="font-display text-sm font-semibold text-navy leading-tight">
            Konnte nicht eindeutig identifiziert werden
          </h4>
        )}
      </div>

      {result.description && (
        <p className="text-sm text-ink-dark leading-relaxed">
          {result.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {result.distanceFromApartment && (
          <div className="rounded-lg bg-cream-50 border border-cream-200 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wider text-ink-light font-semibold">
              Entfernung
            </p>
            <p className="text-xs font-semibold text-ink-dark">
              {result.distanceFromApartment}
            </p>
          </div>
        )}
        {result.estimatedVisitMinutes && (
          <div className="rounded-lg bg-cream-50 border border-cream-200 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wider text-ink-light font-semibold inline-flex items-center gap-1">
              <Clock size={9} /> Besuchsdauer
            </p>
            <p className="text-xs font-semibold text-ink-dark">
              ~{result.estimatedVisitMinutes} Min
            </p>
          </div>
        )}
        {result.bestTime && (
          <div className="col-span-2 rounded-lg bg-gold/5 border border-gold/20 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wider text-gold-600 font-semibold">
              Beste Zeit
            </p>
            <p className="text-xs font-semibold text-ink-dark">{result.bestTime}</p>
          </div>
        )}
      </div>

      {result.address && (
        <p className="text-xs text-ink-mid italic">📍 {result.address}</p>
      )}

      {result.transitOptions && result.transitOptions.length > 0 && (
        <div className="rounded-xl bg-navy/5 border border-navy/15 p-3">
          <p className="text-[10px] uppercase tracking-wider text-navy font-semibold mb-1.5 inline-flex items-center gap-1">
            <MapPin size={10} /> Anfahrt vom Apartment
          </p>
          <ul className="space-y-1">
            {result.transitOptions.map((opt, i) => (
              <li
                key={i}
                className="text-[11px] text-ink-dark leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-navy"
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.notes && (
        <p className="text-[11px] text-ink-mid leading-relaxed bg-cream-50 border border-cream-200 rounded-lg p-2.5">
          💡 {result.notes}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {result.identified && (result.coordinates || result.name) && (
          <button
            type="button"
            onClick={onAddToTrip}
            className="text-xs px-3 py-2 rounded-lg bg-gold text-navy font-bold inline-flex items-center gap-1.5 hover:bg-gold-400 transition"
          >
            <Plus size={12} /> Zum Reiseablauf
          </button>
        )}
        {result.coordinates && (
          <>
            <a
              href={mapsUrl(
                result.coordinates.lat,
                result.coordinates.lng,
                result.name,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-2 rounded-lg bg-navy text-cream font-semibold inline-flex items-center gap-1.5 hover:bg-navy-600 transition"
            >
              <MapPin size={12} /> Auf Karte
            </a>
            <TransportButtons
              coordinates={result.coordinates}
              label={result.name}
            />
          </>
        )}
        {result.name && !result.coordinates && (
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(result.name + " London")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-2 rounded-lg bg-navy text-cream font-semibold inline-flex items-center gap-1.5 hover:bg-navy-600 transition"
          >
            <ExternalLink size={12} /> Google Maps
          </a>
        )}
        <button
          type="button"
          onClick={onClear}
          className="text-xs px-3 py-2 rounded-lg bg-cream-200 text-ink-mid font-semibold hover:bg-cream-300 transition ml-auto inline-flex items-center gap-1"
        >
          <Trash2 size={11} /> {clearLabel}
        </button>
      </div>
    </div>
  );
}

function confidenceLabel(c: LocationResult["confidence"]): string {
  if (c === "high") return "Sicher";
  if (c === "medium") return "Vermutlich";
  return "Unsicher";
}
