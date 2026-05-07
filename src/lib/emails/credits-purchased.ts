import { render } from "react-email";
import CreditsPurchasedEmail from "../../../emails/credits-purchased";
import { FROM_EMAIL, resend } from "../resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://shotstudio.app";

export async function sendCreditsPurchasedEmail(params: {
  to: string;
  stripeEventId: string;
  firstName?: string | null;
  packageName: string;
  creditsAdded: number;
  newBalance: number;
  amountFormatted: string;
  receiptUrl?: string | null;
}) {
  const {
    to,
    stripeEventId,
    firstName,
    packageName,
    creditsAdded,
    newBalance,
    amountFormatted,
    receiptUrl,
  } = params;

  const element = CreditsPurchasedEmail({
    firstName,
    packageName,
    creditsAdded,
    newBalance,
    amountFormatted,
    receiptUrl,
    appUrl: APP_URL,
  });
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);

  return resend.emails.send(
    {
      from: FROM_EMAIL,
      to,
      subject: `Payment confirmed — ${creditsAdded} credit${creditsAdded === 1 ? "" : "s"} added`,
      html,
      text,
    },
    { idempotencyKey: `credits-purchased/${stripeEventId}` },
  );
}
