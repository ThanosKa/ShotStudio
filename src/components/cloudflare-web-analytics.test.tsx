import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CloudflareWebAnalytics } from "./cloudflare-web-analytics";

describe("CloudflareWebAnalytics", () => {
  it("renders the beacon script with this site's token", () => {
    const html = renderToStaticMarkup(<CloudflareWebAnalytics />);
    expect(html).toContain('src="https://static.cloudflareinsights.com/beacon.min.js"');
    expect(html).toContain("01ecb7c3c7b24e0894f01d3835594ed2");
  });
});
