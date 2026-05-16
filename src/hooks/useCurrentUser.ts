"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "rcmk:current-user:";
/** Sentinel value stored when user explicitly skips the picker. */
const SKIPPED = "__SKIPPED__";

function key(tripSlug: string) {
  return `${STORAGE_PREFIX}${tripSlug}`;
}

interface UseCurrentUserResult {
  currentUserName: string | null;
  /** True after localStorage has been read. Avoids SSR/CSR hydration mismatch. */
  hydrated: boolean;
  /** True if user has been asked but skipped. */
  skipped: boolean;
  setUser: (name: string) => void;
  skip: () => void;
  clear: () => void;
}

export function useCurrentUser(tripSlug: string): UseCurrentUserResult {
  const [stored, setStored] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(key(tripSlug));
      setStored(v);
    } catch {
      setStored(null);
    }
    setHydrated(true);
  }, [tripSlug]);

  const setUser = useCallback(
    (name: string) => {
      try {
        window.localStorage.setItem(key(tripSlug), name);
      } catch {
        // ignore
      }
      setStored(name);
    },
    [tripSlug],
  );

  const skip = useCallback(() => {
    try {
      window.localStorage.setItem(key(tripSlug), SKIPPED);
    } catch {
      // ignore
    }
    setStored(SKIPPED);
  }, [tripSlug]);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key(tripSlug));
    } catch {
      // ignore
    }
    setStored(null);
  }, [tripSlug]);

  return {
    currentUserName: stored && stored !== SKIPPED ? stored : null,
    skipped: stored === SKIPPED,
    hydrated,
    setUser,
    skip,
    clear,
  };
}
