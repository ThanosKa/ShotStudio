/** True inside a Cloudflare Worker (workerd sets this user agent), false under Node. */
export function isWorkersRuntime(): boolean {
  return globalThis.navigator?.userAgent === "Cloudflare-Workers";
}
