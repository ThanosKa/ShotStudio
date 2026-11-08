// The beacon token is public: it ships in every page's HTML by design.
const BEACON_TOKEN = "01ecb7c3c7b24e0894f01d3835594ed2";

/** Cloudflare Web Analytics beacon, in production builds only. It sets no cookies. */
export function CloudflareWebAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: BEACON_TOKEN })}
    />
  );
}
