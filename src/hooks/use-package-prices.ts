"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPackagePrices } from "@/services/api";
import type { PackagePrice } from "@/types/order";

/**
 * Module-scoped so every consumer of the hook shares one cache and one
 * in-flight request, instead of each mounted instance re-fetching the prices.
 */
let cachedPrices: PackagePrice[] | null = null;
let inFlightRequest: Promise<PackagePrice[]> | null = null;

/** Fetches once, sharing the same request across concurrent callers. */
function fetchPackagePrices(): Promise<PackagePrice[]> {
  if (!inFlightRequest) {
    inFlightRequest = getPackagePrices().finally(() => {
      inFlightRequest = null;
    });
  }
  return inFlightRequest;
}

type UsePackagePricesResult = {
  prices: PackagePrice[] | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

/** Fetches package prices once per session and shares them across every consumer. */
export function usePackagePrices(): UsePackagePricesResult {
  // Reading the module-scoped cache only inside an effect keeps the first
  // client render identical to the server-rendered HTML and avoids a
  // hydration mismatch, same as `usePaymentQr`.
  const [prices, setPrices] = useState<PackagePrice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const isMountedRef = useRef(true);
  const isLoading = prices === null && error === null;

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

  useEffect(() => {
    if (cachedPrices) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrices(cachedPrices);
      return;
    }

    fetchPackagePrices()
      .then((fresh) => {
        if (!isMountedRef.current) return;
        cachedPrices = fresh;
        setPrices(fresh);
      })
      .catch((err: unknown) => {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : "Unable to load ticket prices.");
      });
  }, [attempt]);

  return { prices, isLoading, error, retry };
}
