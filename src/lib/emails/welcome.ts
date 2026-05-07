import { render } from "react-email";
import WelcomeEmail from "../../../emails/welcome";
import { FROM_EMAIL, resend } from "../resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://shotstudio.app";

export async function sendWelcomeEmail(params: {
  to: string;
  userId: string;
  firstName?: string | null;
}) {
  const { to, userId, firstName } = params;

  const element = WelcomeEmail({ firstName, appUrl: APP_URL });
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);

  return resend.emails.send(
    {
      from: FROM_EMAIL,
      to,
      subject: "Welcome to ShotStudio",
      html,
      text,
    },
    { idempotencyKey: `welcome-email/${userId}` },
  );
}
