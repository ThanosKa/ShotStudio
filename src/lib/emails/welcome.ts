import WelcomeEmail from "../../../emails/welcome";
import { APP_URL } from "../env";
import { sendTransactional } from "./send";

export async function sendWelcomeEmail(params: {
  to: string;
  userId: string;
  firstName?: string | null;
}) {
  return sendTransactional({
    element: WelcomeEmail({ firstName: params.firstName, appUrl: APP_URL }),
    to: params.to,
    subject: "Welcome to ShotStudio",
    idempotencyKey: `welcome-email/${params.userId}`,
  });
}
