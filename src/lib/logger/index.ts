import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

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
    transport: isDevelopment
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

export const logger = pino(getLoggerConfig());
