import type { Breadcrumb, ErrorEvent, Options } from "@sentry/core";
import { z } from "zod";

export const ERROR_TRACKING_DSN =
  "https://g59LB1tJvKV7KBGbQg87VxZe@s2852093.us-west-2a.betterstackdata.com/2852093";

const environmentSchema = z.enum(["production", "development"]);

const REDACTIONS: [RegExp, string][] = [
  [/data:[\w.+-]+\/[\w.+-]+;base64,[A-Za-z0-9+/=]+/g, "data:[redacted]"],
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email]"],
  [/\b(Bearer|Basic)\s+[\w.~+/=-]+/gi, "$1 [token]"],
  [/\beyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[jwt]"],
  [/\b(sk|pk|rk|whsec|re|user|sess|cs|pi|cus)_[A-Za-z0-9_]{8,}/g, "[token]"],
];

type ErrorTrackingOptions = Pick<
  Options,
  | "dsn"
  | "environment"
  | "release"
  | "tracesSampleRate"
  | "dataCollection"
  | "beforeBreadcrumb"
  | "beforeSend"
>;

type ErrorTrackingSettings = { enabled: false } | ({ enabled: true } & ErrorTrackingOptions);

/** Replaces image data URLs, emails, bearer tokens, JWTs and API keys in a string. */
export function redact(text: string): string {
  return REDACTIONS.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), text);
}

function stripQuery(url: string): string {
  return redact(url.split(/[?#]/, 1)[0] ?? "");
}

/** Drops request breadcrumbs for `data:` URLs and strips query strings and secrets from the rest. */
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  const url: unknown = breadcrumb.data?.url;
  if (typeof url === "string" && url.startsWith("data:")) return null;
  return {
    ...breadcrumb,
    ...(breadcrumb.message !== undefined && { message: redact(breadcrumb.message) }),
    ...(typeof url === "string" && { data: { ...breadcrumb.data, url: stripQuery(url) } }),
  };
}

/** Keeps only the error, its stack and the request path: no user, cookies, headers, bodies or query strings. */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const { request } = event;
  return {
    ...event,
    user: undefined,
    request: undefined,
    ...(request && {
      request: {
        ...(request.method !== undefined && { method: request.method }),
        ...(request.url !== undefined && { url: stripQuery(request.url) }),
      },
    }),
    ...(event.message !== undefined && { message: redact(event.message) }),
    ...(event.exception?.values && {
      exception: {
        ...event.exception,
        values: event.exception.values.map((value) => ({
          ...value,
          ...(value.value !== undefined && { value: redact(value.value) }),
        })),
      },
    }),
    ...(event.breadcrumbs && {
      breadcrumbs: event.breadcrumbs.flatMap((crumb) => scrubBreadcrumb(crumb) ?? []),
    }),
  };
}

/**
 * Reads the build's error tracking env. Off unless `environment` is "production" or "development".
 * SDK v11 replaced `sendDefaultPii` with `dataCollection`, whose defaults collect personal data.
 */
export function errorTrackingSettings({
  environment,
  release,
}: {
  environment: string | undefined;
  release: string | undefined;
}): ErrorTrackingSettings {
  const parsed = environmentSchema.safeParse(environment);
  if (!parsed.success) return { enabled: false };
  return {
    enabled: true,
    dsn: ERROR_TRACKING_DSN,
    environment: parsed.data,
    release: release || undefined,
    tracesSampleRate: 0,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      mcp: { inputs: false, outputs: false },
      databaseQueryData: false,
      stackFrameVariables: false,
    },
    beforeBreadcrumb: scrubBreadcrumb,
    beforeSend: scrubEvent,
  };
}

export const ERROR_TRACKING = errorTrackingSettings({
  environment: process.env.NEXT_PUBLIC_ERROR_TRACKING_ENV,
  release: process.env.NEXT_PUBLIC_ERROR_TRACKING_RELEASE,
});
