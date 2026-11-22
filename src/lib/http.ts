export function jsonError({
  status,
  error,
  init,
}: {
  status: number;
  error: string;
  init?: ResponseInit;
}) {
  return Response.json({ error }, { status, ...init });
}

/**
 * Returns a user-facing error message from an API response. If the body
 * carries a string `error`, surface that. Otherwise, return the fallback.
 */
export function parseApiError({
  data,
  fallback,
}: {
  data: unknown;
  fallback: string;
}): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }
  return fallback;
}
