export function jsonError(status: number, error: string, init?: ResponseInit) {
  return Response.json({ error }, { status, ...init });
}

export function parseApiError(
  status: number,
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
  return `${fallback} (${status})`;
}
