import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CloudflareWebAnalytics } from "./cloudflare-web-analytics";

describe("CloudflareWebAnalytics", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders the beacon script with this site's token in a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    const html = renderToStaticMarkup(<CloudflareWebAnalytics />);
    expect(html).toContain('src="https://static.cloudflareinsights.com/beacon.min.js"');
    expect(html).toContain("01ecb7c3c7b24e0894f01d3835594ed2");
  });

  it("renders nothing in development, so the owner's own visits are not counted", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(renderToStaticMarkup(<CloudflareWebAnalytics />)).toBe("");
  });
});
