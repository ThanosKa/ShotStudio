import { APP_URL, pluralize } from "../utils";
import { sendTransactional } from "./send";
import { creditsPurchasedEmail } from "./templates";

export async function sendCreditsPurchasedEmail(params: {
  to: string;
  stripeEventId: string;
  firstName?: string | null;
  packageName: string;
  creditsAdded: number;
  newBalance: number;
  amountFormatted: string;
}) {
  return sendTransactional({
    email: creditsPurchasedEmail({
      firstName: params.firstName,
      packageName: params.packageName,
      creditsAdded: params.creditsAdded,
      newBalance: params.newBalance,
      amountFormatted: params.amountFormatted,
      appUrl: APP_URL,
    }),
    to: params.to,
    subject: `Payment confirmed — ${params.creditsAdded} ${pluralize({ n: params.creditsAdded, singular: "set" })} added`,
    idempotencyKey: `credits-purchased/${params.stripeEventId}`,
  });
}
