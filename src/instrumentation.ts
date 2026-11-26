import { captureException, flush } from "@sentry/core";
import type { Instrumentation } from "next";

/**
 * vinext answers a failing route handler, page render or server action with a
 * 500 itself, so the error never reaches the Worker entry's `withSentry`.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  captureException(error, {
    mechanism: { handled: false, type: "auto.function.on_request_error" },
    captureContext: {
      tags: {
        routePath: context.routePath,
        routeType: context.routeType,
        method: request.method,
        digest: hasDigest(error) ? error.digest : undefined,
      },
    },
  });
  await flush(2000);
};

function hasDigest(error: unknown): error is { digest: string } {
  return typeof error === "object" && error !== null && "digest" in error && typeof error.digest === "string";
}
