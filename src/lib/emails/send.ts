import type { ReactElement } from "react";
import { render } from "react-email";
import { FROM_EMAIL, resend } from "../resend";

export async function sendTransactional(params: {
  element: ReactElement;
  to: string;
  subject: string;
  idempotencyKey: string;
}) {
  const [html, text] = await Promise.all([
    render(params.element),
    render(params.element, { plainText: true }),
  ]);
  return resend.emails.send(
    {
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html,
      text,
    },
    { idempotencyKey: params.idempotencyKey },
  );
}
