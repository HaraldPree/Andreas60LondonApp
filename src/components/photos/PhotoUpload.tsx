"use client";

import { useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  onFiles: (files: FileList | File[]) => void;
  uploadProgress: { current: number; total: number } | null;
  label?: string;
}

export function PhotoUpload({
  onFiles,
  uploadProgress,
  label = "Fotos hinzufügen",
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = () => inputRef.current?.click();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        // NB: capture="environment" was here originally. Some mobile
        // browsers (notably Firefox Android, also Samsung Internet)
        // interpret this strictly and force-open the camera with no
        // gallery option — which broke "Fotos aus Galerie hinzufügen"
        // for half the travelers. Removing the attribute gives the
        // user the normal picker (Galerie / Kamera / Dateien).
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFiles(e.target.files);
            e.target.value = ""; // reset so same file can be re-picked
          }
        }}
      />
      <button
        type="button"
        onClick={handlePick}
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
          </>
        )}
      </button>
    </>
  );
}
