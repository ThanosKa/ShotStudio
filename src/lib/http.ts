export function jsonError(status: number, error: string, init?: ResponseInit) {
  return Response.json({ error }, { status, ...init });
}

/**
 * Returns a user-facing error message from an API response. If the body
 * carries a string `error`, surface that. Otherwise, return the fallback.
 *
 * The HTTP status code is intentionally NOT included in the user-facing
 * string — see .doc/ux-writing.md (no internal jargon, no codes).
 */
export function parseApiError(
  _status: number,
  data: unknown,
  fallback: string,
): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return fallback;
}
