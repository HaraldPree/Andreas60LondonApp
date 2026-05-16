"use client";

import { useEffect, useState } from "react";

export type BlobUrlState =
  | { status: "loading"; url: null }
  | { status: "ready"; url: string }
  | { status: "missing"; url: null }
  | { status: "error"; url: null; error: Error };

/**
 * Loads a blob (lazily, via async getter) and returns an object URL
 * that is automatically revoked on unmount or when the id changes.
 *
 * Exposes a status so consumers can distinguish "still loading" from
 * "blob is missing in storage" from "fetch threw" — the original
 * single-string return left callers stuck in a perpetual loading
 * state when the blob never resolved.
 */
export function useBlobUrlState(
  id: string | null,
  getBlob: (id: string) => Promise<Blob | null>,
): BlobUrlState {
  const [state, setState] = useState<BlobUrlState>({
    status: "loading",
    url: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ status: "missing", url: null });
      return;
    }
    let cancelled = false;
    let currentUrl: string | null = null;
    setState({ status: "loading", url: null });

    (async () => {
      try {
        const blob = await getBlob(id);
        if (cancelled) return;
        if (!blob) {
          setState({ status: "missing", url: null });
          return;
        }
        currentUrl = URL.createObjectURL(blob);
        setState({ status: "ready", url: currentUrl });
      } catch (e) {
        if (cancelled) return;
        setState({
          status: "error",
          url: null,
          error: e instanceof Error ? e : new Error(String(e)),
        });
      }
    })();

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [id, getBlob]);

  return state;
}

/**
 * Backwards-compat string-only API used by older callers.
 */
export function useBlobUrl(
  id: string | null,
  getBlob: (id: string) => Promise<Blob | null>,
): string | null {
  return useBlobUrlState(id, getBlob).url;
}
