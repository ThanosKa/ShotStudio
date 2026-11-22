const BEACON_TOKEN = "01ecb7c3c7b24e0894f01d3835594ed2";

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
