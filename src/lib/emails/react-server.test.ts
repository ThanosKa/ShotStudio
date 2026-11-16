import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const run = promisify(execFile);
const here = import.meta.dirname;

// On the Worker, route handlers run under the `react-server` condition, where
// `react-dom/server` is a stub that throws. Node resolves with the same
// condition here, so this runs the real send path as the Worker does. Resend's
// HTTP call is replaced: nothing leaves the machine.
const script = `
const sent = [];
globalThis.fetch = async (url, init) => {
  sent.push({
    body: JSON.parse(init.body),
    idempotencyKey: new Headers(init.headers).get("Idempotency-Key"),
  });
  return new Response(JSON.stringify({ id: "email_1" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
const { sendWelcomeEmail } = await import(${JSON.stringify(path.join(here, "welcome.ts"))});
const { sendCreditsPurchasedEmail } = await import(${JSON.stringify(path.join(here, "credits-purchased.ts"))});
const results = [
  await sendWelcomeEmail({ to: "a@example.com", userId: "user_1", firstName: "Alex" }),
  await sendCreditsPurchasedEmail({
    to: "b@example.com",
    stripeEventId: "evt_1",
    firstName: null,
    packageName: "Starter",
    creditsAdded: 1,
    newBalance: 1,
    amountFormatted: "$0.00",
  }),
];
process.stdout.write(JSON.stringify({ results, sent }));
`;

async function sendUnderReactServer() {
  const stdout = await run(
    process.execPath,
    ["--conditions=react-server", "--import", "tsx", "--input-type=module", "-e", script],
    {
      env: {
        ...process.env,
        RESEND_API_KEY: "re_test_placeholder",
        RESEND_FROM_EMAIL: "hello@shotstudio.dev",
        NEXT_PUBLIC_APP_URL: "https://shotstudio.dev",
      },
    },
  ).then(
    (r) => r.stdout,
    (err: { stderr?: string }) => {
      // Rethrow only the child's error line: its raw stack carries inline
      // source maps that Vitest cannot parse.
      const line = err.stderr?.split("\n").find((l) => /^\w*Error\b/.test(l));
      throw new Error(line ?? "the send script failed");
    },
  );
  return JSON.parse(stdout) as {
    results: { data: { id: string } | null; error: unknown }[];
    sent: {
      body: { from: string; to: string; subject: string; html: string; text: string };
      idempotencyKey: string;
    }[];
  };
}

describe("transactional email under the react-server condition (the Worker)", () => {
  it("sends the welcome and purchase emails with HTML and text", async () => {
    const { results, sent } = await sendUnderReactServer();

    expect(results).toEqual([
      { data: { id: "email_1" }, error: null, headers: expect.anything() },
      { data: { id: "email_1" }, error: null, headers: expect.anything() },
    ]);
    expect(sent).toHaveLength(2);

    const [welcome, purchase] = sent;
    expect(welcome.idempotencyKey).toBe("welcome-email/user_1");
    expect(welcome.body).toMatchObject({
      from: "hello@shotstudio.dev",
      to: "a@example.com",
      subject: "Welcome to ShotStudio",
    });
    expect(welcome.body.html).toContain("Hi Alex,");
    expect(welcome.body.text).toContain("Open ShotStudio https://shotstudio.dev/home");

    expect(purchase.idempotencyKey).toBe("credits-purchased/evt_1");
    expect(purchase.body).toMatchObject({
      from: "hello@shotstudio.dev",
      to: "b@example.com",
      subject: "Payment confirmed — 1 set added",
    });
    expect(purchase.body.html).toContain("Payment confirmed — 1 set added (balance: 1).");
    expect(purchase.body.text).toContain("Credits added\n\n1 set");
  }, 30_000);
});
