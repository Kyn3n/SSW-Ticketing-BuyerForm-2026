"use client";

import Image from "next/image";
import { Button, FieldStatus, Skeleton, Spinner, Stack, Text } from "@astryxdesign/core";
import { usePaymentQr } from "@/hooks/use-payment-qr";

/**
 * The bank's payment QR code. Backed by a signed URL that expires every few
 * minutes; `usePaymentQr` caches it and only calls the endpoint again once
 * that URL is expired (or about to be), so this just renders whatever state
 * the hook is in.
 */
export function PaymentQr() {
  const { imageUrl, isLoading, error, retry } = usePaymentQr();

  return (
    <Stack direction="vertical" gap={2} hAlign="center">
      <div className="ssw-payment-qr" data-empty={!imageUrl || undefined}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Payment QR code"
            width={160}
            height={160}
            className="ssw-payment-qr__image"
          />
        ) : isLoading ? (
          <Stack direction="vertical" gap={2} hAlign="center">
            <Skeleton width={160} height={160} radius={2} />
            <Spinner size="sm" label="Loading QR code…" />
          </Stack>
        ) : null}
      </div>

      {error && (
        <Stack direction="vertical" gap={2} hAlign="center">
          <FieldStatus type="error" message={error} variant="detached" />
          <Button label="" variant="secondary" size="sm" onClick={retry}>
            Try again
          </Button>
        </Stack>
      )}

      {imageUrl && (
        <Text type="supporting" justify="center">
          Scan to pay via your banking app
        </Text>
      )}
    </Stack>
  );
}
