import { describe, expect, it } from "vitest";
import type { ErrorEvent } from "@sentry/core";
import { errorTrackingSettings, redact, scrubBreadcrumb, scrubEvent } from "./error-tracking";

describe("errorTrackingSettings", () => {
  it("sends production errors without personal data or traces", () => {
    expect(errorTrackingSettings({ environment: "production", release: "abc123" })).toMatchObject({
      enabled: true,
      environment: "production",
      release: "abc123",
      tracesSampleRate: 0,
      dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
    });
  });

  it("sends nothing unless the build names an environment", () => {
    expect(errorTrackingSettings({ environment: undefined, release: "abc123" })).toEqual({ enabled: false });
    expect(errorTrackingSettings({ environment: "staging", release: undefined })).toEqual({ enabled: false });
    expect(errorTrackingSettings({ environment: "development", release: "" })).toMatchObject({
      enabled: true,
      environment: "development",
      release: undefined,
    });
  });
});

describe("redact", () => {
  it("replaces emails, tokens and image data", () => {
    expect(
      redact("a@b.co Bearer abc.def sk_live_12345678 eyJa.eyJb.c data:image/png;base64,iVBORw0KGgo="),
    ).toBe("[email] Bearer [token] [token] [jwt] data:[redacted]");
  });
});

describe("scrubEvent", () => {
  it("keeps the error and request path but drops user, cookies, headers, body and query", () => {
    const event: ErrorEvent = {
      type: undefined,
      user: { id: "user_1", email: "a@b.co", ip_address: "1.2.3.4" },
      request: {
        method: "POST",
        url: "https://shotstudio.dev/api/checkout?email=a@b.co#x",
        cookies: { __session: "secret" },
        headers: { authorization: "Bearer secret" },
        data: "{\"email\":\"a@b.co\"}",
        query_string: "email=a@b.co",
      },
      exception: { values: [{ type: "Error", value: "no user a@b.co" }] },
      breadcrumbs: [
        { category: "fetch", data: { url: "data:image/png;base64,AAAA" } },
        { category: "fetch", data: { url: "https://api.example.test/x?token=1" } },
      ],
    };

    expect(scrubEvent(event)).toMatchObject({
      user: undefined,
      request: { method: "POST", url: "https://shotstudio.dev/api/checkout" },
      exception: { values: [{ type: "Error", value: "no user [email]" }] },
      breadcrumbs: [{ category: "fetch", data: { url: "https://api.example.test/x" } }],
    });
    expect(scrubEvent(event).request).toEqual({ method: "POST", url: "https://shotstudio.dev/api/checkout" });
  });
});

describe("scrubBreadcrumb", () => {
  it("drops data URL requests and redacts messages", () => {
    expect(scrubBreadcrumb({ data: { url: "data:image/png;base64,AAAA" } })).toBeNull();
    expect(scrubBreadcrumb({ message: "signed in as a@b.co" })).toEqual({ message: "signed in as [email]" });
  });
});
