import { APP_URL } from "../utils";
import { sendTransactional } from "./send";
import { welcomeEmail } from "./templates";

export async function sendWelcomeEmail(params: {
  to: string;
  userId: string;
  firstName?: string | null;
}) {
  return sendTransactional({
    email: welcomeEmail({ firstName: params.firstName, appUrl: APP_URL }),
    to: params.to,
    subject: "Welcome to ShotStudio",
    idempotencyKey: `welcome-email/${params.userId}`,
  });
}
