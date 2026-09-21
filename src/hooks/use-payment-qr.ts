"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPaymentQr } from "@/services/api";
import { msUntilSignedUrlExpiry } from "@/lib/signed-url";

/** Module-scoped only to dedupe concurrent requests, never to cache the result. */
let inFlightRequest: Promise<string> | null = null;

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
 * Fetches a fresh payment QR on every mount, and again just before its signed
 * URL expires, so a buyer who leaves the screen open still sees a scannable
 * QR.
 */
export function usePaymentQr(): UsePaymentQrResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const isMountedRef = useRef(true);
  // No image yet and nothing has failed yet means a fetch is in flight.
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
    fetchPaymentQr()
      .then((freshUrl) => {
        if (!isMountedRef.current) return;
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
