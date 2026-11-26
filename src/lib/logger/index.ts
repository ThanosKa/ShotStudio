import { captureException } from "@sentry/core";
import pino from "pino";
import { isWorkersRuntime } from "@/lib/runtime";
import { writeLineToConsole } from "./console-line";

const isDevelopment = process.env.NODE_ENV === "development";
const isWorkers = isWorkersRuntime();
const ERROR_LEVEL = 50;

function captureLoggedError(args: unknown[]) {
  const [context, message] = args;
  if (typeof context !== "object" || context === null || !("err" in context)) return;
  if (!(context.err instanceof Error)) return;
  captureException(context.err, { tags: { log: typeof message === "string" ? message : undefined } });
}

export function getLoggerConfig() {
  return {
    level: process.env.LOG_LEVEL ?? "info",
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      service: "shotstudio",
      env: process.env.NODE_ENV,
    },
    hooks: {
      logMethod(args, method, level) {
        if (level >= ERROR_LEVEL) captureLoggedError(args);
        method.apply(this, args);
      },
    },
    serializers: {
      err: pino.stdSerializers.err,
    },
    redact: {
      paths: [
        "password",
        "*.password",
        "token",
        "accessToken",
        "refreshToken",
        "*.token",
        "authorization",
        "cookie",
        "headers.authorization",
        "headers.cookie",
        "headers['stripe-signature']",
        "headers['svix-signature']",
        "headers['svix-id']",
        "body.password",
        "apiKey",
        "*.apiKey",
        "stripe_signature",
        "svix_signature",
        "email",
        "*.email",
        "customer_email",
        "*.customer_email",
        "*.emailAddress",
        "*.email_address",
        "*.email_addresses",
        "customer_details.email",
        "*.customer_details.email",
      ],
      censor: "[REDACTED]",
    },
    transport: isDevelopment && !isWorkers
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
          },
        }
      : undefined,
  } satisfies pino.LoggerOptions;
}

export const logger = isWorkers
  ? pino(getLoggerConfig(), { write: writeLineToConsole })
  : pino(getLoggerConfig());
