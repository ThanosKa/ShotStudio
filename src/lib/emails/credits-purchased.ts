import CreditsPurchasedEmail from "../../../emails/credits-purchased";
import { APP_URL, pluralize } from "../utils";
import { sendTransactional } from "./send";

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
  return sendTransactional({
    element: CreditsPurchasedEmail({
      firstName: params.firstName,
      packageName: params.packageName,
      creditsAdded: params.creditsAdded,
      newBalance: params.newBalance,
      amountFormatted: params.amountFormatted,
      receiptUrl: params.receiptUrl,
      appUrl: APP_URL,
    }),
    to: params.to,
    subject: `Payment confirmed — ${params.creditsAdded} ${pluralize(params.creditsAdded, "credit")} added`,
    idempotencyKey: `credits-purchased/${params.stripeEventId}`,
  });
}
