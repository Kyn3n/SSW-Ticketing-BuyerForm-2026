"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPackagePrices } from "@/services/api";
import type { PackagePrice, SeatsRemaining } from "@/types/order";

// Before the first successful fetch (or after one fails), availability is
// unknown — default to "unrestricted" rather than 0 so rows don't flash a
// false "sold out" while the real count is still loading.
const UNKNOWN_SEATS_REMAINING: SeatsRemaining = {
  normal: Number.POSITIVE_INFINITY,
  vip: Number.POSITIVE_INFINITY,
};

type PackagesState = {
  prices: PackagePrice[];
  seatsRemaining: SeatsRemaining;
};

/**
 * Module-scoped so every consumer of the hook shares one cache and one
 * in-flight request, instead of each mounted instance re-fetching the prices.
 */
let cachedPackages: PackagesState | null = null;
let inFlightRequest: Promise<PackagesState> | null = null;

/** Fetches once, sharing the same request across concurrent callers. */
function fetchPackages(): Promise<PackagesState> {
  if (!inFlightRequest) {
    inFlightRequest = getPackagePrices()
      .then(({ packages, seatsRemaining }) => ({ prices: packages, seatsRemaining }))
      .finally(() => {
        inFlightRequest = null;
      });
  }
  return inFlightRequest;
}

type UsePackagePricesResult = {
  prices: PackagePrice[] | null;
  seatsRemaining: SeatsRemaining;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  /** Forces a fresh fetch, bypassing the cache, and resolves with the latest data. */
  refresh: () => Promise<PackagesState>;
};

/** Fetches package prices once per session and shares them across every consumer. */
export function usePackagePrices(): UsePackagePricesResult {
  // Reading the module-scoped cache only inside an effect keeps the first
  // client render identical to the server-rendered HTML and avoids a
  // Keep the initial client render aligned with the server during hydration.
  const [packages, setPackages] = useState<PackagesState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const isMountedRef = useRef(true);
  const isLoading = packages === null && error === null;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  const refresh = useCallback(async () => {
    cachedPackages = null;
    setError(null);

    const fresh = await fetchPackages();
    if (isMountedRef.current) {
      cachedPackages = fresh;
      setPackages(fresh);
    }
    return fresh;
  }, []);

  useEffect(() => {
    if (cachedPackages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPackages(cachedPackages);
      return;
    }

    fetchPackages()
      .then((fresh) => {
        if (!isMountedRef.current) return;
        cachedPackages = fresh;
        setPackages(fresh);
      })
      .catch((err: unknown) => {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : "Unable to load ticket prices.");
      });
  }, [attempt]);

  return {
    prices: packages?.prices ?? null,
    seatsRemaining: packages?.seatsRemaining ?? UNKNOWN_SEATS_REMAINING,
    isLoading,
    error,
    retry,
    refresh,
  };
}
