/**
 * A GCS V4 signed URL carries its own validity window in its query string:
 * `X-Goog-Date` (when it was signed, `YYYYMMDDTHHMMSSZ`) and
 * `X-Goog-Expires` (seconds valid for). Reading those back lets callers know
 * whether a cached URL is still good without ever calling the server.
 */
function getSignedUrlExpiryMs(url: string): number | null {
  let params: URLSearchParams;
  try {
    params = new URL(url).searchParams;
  } catch {
    return null;
  }

  const signedAt = params.get("X-Goog-Date");
  const expiresInSeconds = Number(params.get("X-Goog-Expires"));
  if (!signedAt || !Number.isFinite(expiresInSeconds)) return null;

  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(signedAt);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;

  const signedAtMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  return signedAtMs + expiresInSeconds * 1000;
}

/** Milliseconds until a signed URL should be refreshed, floored at 0. */
export function msUntilSignedUrlExpiry(url: string, safetyMarginMs = 5_000): number {
  const expiresAtMs = getSignedUrlExpiryMs(url);
  if (expiresAtMs === null) return 0;
  return Math.max(0, expiresAtMs - safetyMarginMs - Date.now());
}
