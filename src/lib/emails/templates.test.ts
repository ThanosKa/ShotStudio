import type { ReactElement } from "react";
import { render } from "react-email";
import { describe, expect, it } from "vitest";
import CreditsPurchasedEmail from "../../../emails/credits-purchased";
import WelcomeEmail from "../../../emails/welcome";
import { creditsPurchasedEmail, welcomeEmail } from "./templates";

async function rendered(element: ReactElement) {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { html, text };
}

const urls = ["https://shotstudio.dev", "https://staging.example.com/app?x=1&y=\"2\""];
const names = [
  "Alex",
  null,
  undefined,
  "   ",
  "  Mary   Ann\n Lee ",
  `O'Brien <b>&"co"`,
  "Zoë 李",
];

describe("welcomeEmail", () => {
  for (const appUrl of urls) {
    for (const firstName of names) {
      it(`matches the react-email render for ${JSON.stringify({ firstName, appUrl })}`, async () => {
        expect(welcomeEmail({ firstName, appUrl })).toEqual(
          await rendered(WelcomeEmail({ firstName, appUrl })),
        );
      });
    }
  }
});

describe("creditsPurchasedEmail", () => {
  const purchases = [
    { packageName: "Starter", creditsAdded: 1, newBalance: 1, amountFormatted: "$0.00" },
    { packageName: "Growth — 5 sets", creditsAdded: 5, newBalance: 6, amountFormatted: "$17.00" },
    { packageName: `Studio <"&'>`, creditsAdded: 12, newBalance: 1, amountFormatted: "€1,234.50" },
    { packageName: "Two  spaces", creditsAdded: 0, newBalance: 1000000, amountFormatted: "$0" },
  ];
  for (const appUrl of urls) {
    for (const firstName of names) {
      for (const purchase of purchases) {
        const props = { firstName, appUrl, ...purchase };
        it(`matches the react-email render for ${JSON.stringify(props)}`, async () => {
          expect(creditsPurchasedEmail(props)).toEqual(
            await rendered(CreditsPurchasedEmail(props)),
          );
        });
      }
    }
  }
});
