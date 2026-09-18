"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPaymentQr } from "@/services/api";
import { isSignedUrlExpired, msUntilSignedUrlExpiry } from "@/lib/signed-url";

const STORAGE_KEY = "ssw:payment-qr-url";

/**
 * Module-scoped so every consumer of the hook shares one cache and one
 * in-flight request, instead of each mounted instance re-fetching the QR.
 */
let cachedImageUrl: string | null = null;
let inFlightRequest: Promise<string> | null = null;

function readCache(): string | null {
  if (cachedImageUrl && !isSignedUrlExpired(cachedImageUrl)) return cachedImageUrl;

  if (typeof window !== "undefined") {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored && !isSignedUrlExpired(stored)) {
      cachedImageUrl = stored;
      return stored;
    }
  }

  return null;
}

function writeCache(imageUrl: string) {
  cachedImageUrl = imageUrl;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, imageUrl);
  } catch {
    // Private browsing / storage quota — the in-memory cache still works.
  }
}

/** Fetches once, sharing the same request across concurrent callers. */
function fetchPaymentQr(): Promise<string> {
  if (!inFlightRequest) {
    inFlightRequest = getPaymentQr().finally(() => {
      inFlightRequest = null;
    });
  }
  return inFlightRequest;
}

type UsePaymentQrResult = {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

/**
 * Serves the payment QR from cache while its signed URL is still valid, and
 * only calls the endpoint again once it has expired (or is about to).
 */
export function usePaymentQr(): UsePaymentQrResult {
  // `sessionStorage` doesn't exist on the server, so the cache can only be
  // read client-side, inside an effect — starting from `null` here keeps the
  // first client render identical to the server-rendered HTML and avoids a
  // hydration mismatch.
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const isMountedRef = useRef(true);
  // No cached image and nothing has failed yet means a fetch is in flight.
  const isLoading = imageUrl === null && error === null;

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
    const cached = readCache();
    if (cached) {
      // Syncing from a browser-only external store (sessionStorage) on
      // mount, which can only happen after hydration — there is no
      // render-time equivalent that would keep SSR output in sync.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImageUrl(cached);
      return;
    }

    fetchPaymentQr()
      .then((freshUrl) => {
        if (!isMountedRef.current) return;
        writeCache(freshUrl);
        setImageUrl(freshUrl);
      })
      .catch((err: unknown) => {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : "Unable to load the payment QR code.");
      });
  }, [attempt]);

  // Re-fetch on its own, right as the current URL is about to expire, so a
  // buyer who leaves this screen open still sees a scannable QR.
  useEffect(() => {
    if (!imageUrl) return;
    const delay = msUntilSignedUrlExpiry(imageUrl);
    const timer = setTimeout(retry, delay);
    return () => clearTimeout(timer);
  }, [imageUrl, retry]);

  return { imageUrl, isLoading, error, retry };
}
