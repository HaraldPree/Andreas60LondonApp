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
  X,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { compressForStorage } from "@/lib/photoProcessing";
import { mapsUrl } from "@/lib/formatters";
import { TransportButtons } from "@/components/ui/TransportButtons";
import type { LocationResult } from "@/app/api/identify-location/route";
import { classNames } from "@/lib/formatters";

interface LocationIdentifierProps {
  tripSlug: string;
}

export function LocationIdentifier({ tripSlug }: LocationIdentifierProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LocationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Show preview immediately
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
      const mediaType = "image/jpeg";

      const res = await fetch("/api/identify-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripSlug,
          imageBase64: base64,
          mediaType,
        }),
      });

      if (!res.ok) {
        throw new Error(`API ${res.status}`);
      }

      const data = (await res.json()) as LocationResult;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-info/10 to-cream-50 border border-info/30 shadow-card overflow-hidden">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
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
            KI identifiziert Sehenswürdigkeiten aus Fotos + Anfahrt-Tipps
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
              {!previewUrl && !loading && !result && (
                <>
                  <p className="text-xs text-ink-mid leading-relaxed">
                    Hast du ein Foto von einem Freund bekommen und willst
                    wissen, wo das ist? Tippe unten – die KI versucht es zu
                    identifizieren und sagt dir, wie du hinkommst.
                  </p>
                  <button
                    type="button"
                    onClick={handlePick}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-info text-white text-sm font-semibold hover:bg-info/90 transition"
                  >
                    <Camera size={16} />
                    Foto auswählen
                  </button>
                  <p className="text-[10px] text-ink-light italic text-center">
                    Foto wird komprimiert (max 1500px) + einmalig an Claude
                    Vision gesendet. Keine Speicherung.
                  </p>
                </>
              )}

              {previewUrl && (
                <div className="rounded-xl overflow-hidden bg-cream-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Hochgeladenes Foto"
                    className="w-full max-h-64 object-cover"
                  />
                  {!loading && (
                    <button
                      type="button"
                      onClick={reset}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur"
                      aria-label="Anderes Foto"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-info">
                  <Loader2 size={16} className="animate-spin" />
                  KI analysiert das Foto…
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

              {result && <LocationResultCard result={result} onReset={reset} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocationResultCard({
  result,
  onReset,
}: {
  result: LocationResult;
  onReset: () => void;
}) {
  const confidenceColor =
    result.confidence === "high"
      ? "bg-success/15 text-success border-success/30"
      : result.confidence === "medium"
        ? "bg-gold/15 text-gold-600 border-gold/30"
        : "bg-warning/15 text-warning border-warning/30";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
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
      </div>

      {/* Description */}
      {result.description && (
        <p className="text-sm text-ink-dark leading-relaxed">
          {result.description}
        </p>
      )}

      {/* Meta info */}
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
            <p className="text-xs font-semibold text-ink-dark">
              {result.bestTime}
            </p>
          </div>
        )}
      </div>

      {/* Address */}
      {result.address && (
        <p className="text-xs text-ink-mid italic">📍 {result.address}</p>
      )}

      {/* Transit options */}
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

      {/* Notes */}
      {result.notes && (
        <p className="text-[11px] text-ink-mid leading-relaxed bg-cream-50 border border-cream-200 rounded-lg p-2.5">
          💡 {result.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
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
            <ExternalLink size={12} /> Auf Google Maps suchen
          </a>
        )}
        <button
          type="button"
          onClick={onReset}
          className="text-xs px-3 py-2 rounded-lg bg-cream-200 text-ink-mid font-semibold hover:bg-cream-300 transition ml-auto"
        >
          Anderes Foto
        </button>
      </div>

      {result.rawResponse && (
        <details className="text-[10px] text-ink-light">
          <summary className="cursor-pointer">Roh-Antwort der KI</summary>
          <pre className="mt-1 whitespace-pre-wrap bg-cream-100 p-2 rounded">
            {result.rawResponse}
          </pre>
        </details>
      )}
    </div>
  );
}

function confidenceLabel(c: LocationResult["confidence"]): string {
  if (c === "high") return "Sicher";
  if (c === "medium") return "Vermutlich";
  return "Unsicher";
}
