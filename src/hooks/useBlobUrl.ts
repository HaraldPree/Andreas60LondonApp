"use client";

import { useEffect, useState } from "react";

/**
 * Loads a blob (lazily, via async getter) and returns an object URL
 * that is automatically revoked on unmount or when the id changes.
 */
export function useBlobUrl(
  id: string | null,
  getBlob: (id: string) => Promise<Blob | null>,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    let currentUrl: string | null = null;

    (async () => {
      const blob = await getBlob(id);
      if (cancelled || !blob) return;
      currentUrl = URL.createObjectURL(blob);
      setUrl(currentUrl);
    })();

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [id, getBlob]);

  return url;
}
