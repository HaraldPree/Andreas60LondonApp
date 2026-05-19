"use client";

import { useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Image as ImageIcon,
  FolderOpen,
  Camera,
  ChevronDown,
} from "lucide-react";

interface PhotoUploadProps {
  onFiles: (files: FileList | File[]) => void;
  uploadProgress: { current: number; total: number } | null;
  label?: string;
}

/**
 * Three separate file inputs so the user can pick the route that
 * works on THEIR device.
 *
 * Background: On Android the intent system maps the input's `accept`
 * attribute to system apps. Different OEMs route this very differently:
 *
 *  - Samsung A52 / Android 14 / Samsung Internet: with accept="image/*"
 *    the system shows only "Files / Documents", NOT the Gallery app.
 *    Removing accept entirely makes the Gallery option appear.
 *  - OnePlus / Android 16: similar — accept="image/*" sometimes hides
 *    the Gallery picker.
 *  - Chrome on most Android: works fine either way.
 *  - iOS Safari: shows the modern Photo Picker either way.
 *
 * Solution: give the user three explicit choices. Whichever path
 * works on their phone, they can use.
 */
export function PhotoUpload({
  onFiles,
  uploadProgress,
  label = "Fotos hinzufügen",
}: PhotoUploadProps) {
  // Three separate refs so each input has its own `accept` / `capture`
  // attribute matrix.
  const galleryRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(e.target.files);
      e.target.value = ""; // reset so same file can be re-picked
      setMenuOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Three hidden inputs — one for each picker variant */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={filesRef}
        type="file"
        multiple
        // No `accept` — Samsung A52 / OnePlus quirk fallback. With
        // no MIME hint, Android's full file picker shows up which
        // routes to gallery on these devices.
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        disabled={!!uploadProgress}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-navy text-cream font-semibold text-sm hover:bg-navy-600 transition disabled:opacity-60"
      >
        {uploadProgress ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Verarbeite {uploadProgress.current} / {uploadProgress.total}
          </>
        ) : (
          <>
            <ImagePlus size={16} />
            {label}
            <ChevronDown
              size={14}
              className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {menuOpen && !uploadProgress && (
        <div className="absolute left-0 right-0 mt-1.5 z-30 rounded-xl bg-white shadow-elevated border border-cream-200 overflow-hidden">
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream-50 transition text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center flex-shrink-0">
              <ImageIcon size={18} className="text-gold-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy">Aus Galerie</p>
              <p className="text-[11px] text-ink-mid">
                Funktioniert auf iPhone, Pixel, vielen Androids
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => filesRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream-50 transition text-left border-t border-cream-200"
          >
            <div className="w-9 h-9 rounded-lg bg-info/15 flex items-center justify-center flex-shrink-0">
              <FolderOpen size={18} className="text-info" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy">Datei wählen</p>
              <p className="text-[11px] text-ink-mid">
                Falls Galerie oben nicht erscheint (Samsung, OnePlus)
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream-50 transition text-left border-t border-cream-200"
          >
            <div className="w-9 h-9 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
              <Camera size={18} className="text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy">Foto aufnehmen</p>
              <p className="text-[11px] text-ink-mid">Kamera direkt öffnen</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
