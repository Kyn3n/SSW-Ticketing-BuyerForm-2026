import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const LOCAL_UPLOAD_SECRET = "ssw-local-mock-upload-secret";

function getSecret() {
  return process.env.MOCK_UPLOAD_SECRET ?? LOCAL_UPLOAD_SECRET;
}

function sign(referenceId: string, expires: string) {
  return createHmac("sha256", getSecret())
    .update(`${referenceId}.${expires}`)
    .digest("base64url");
}

export function createMockUploadUrl(referenceId: string) {
  const expires = String(Date.now() + 10 * 60 * 1000);
  const signature = sign(referenceId, expires);
  const search = new URLSearchParams({ expires, signature });

  return {
    uploadUrl: `/api/mock-bucket/${referenceId}?${search.toString()}`,
    expiresAt: new Date(Number(expires)).toISOString(),
  };
}

export function isValidMockUploadUrl(
  referenceId: string,
  expires: string | null,
  signature: string | null,
) {
  if (!expires || !signature || Number(expires) < Date.now()) return false;

  const expected = Buffer.from(sign(referenceId, expires));
  const received = Buffer.from(signature);

  return (
    expected.byteLength === received.byteLength &&
    timingSafeEqual(expected, received)
  );
}
