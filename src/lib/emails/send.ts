import { FROM_EMAIL, resend } from "../resend";
import type { RenderedEmail } from "./templates";

export async function sendTransactional(params: {
  email: RenderedEmail;
  to: string;
  subject: string;
  idempotencyKey: string;
}) {
  return resend.emails.send(
    {
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.email.html,
      text: params.email.text,
    },
    { idempotencyKey: params.idempotencyKey },
  );
}
