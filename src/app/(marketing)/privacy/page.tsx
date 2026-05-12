import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ShotStudio handles screenshots, generated images, and account data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="May 2026">
      <p>
        ShotStudio is built privacy-first. Your uploaded screenshots and the
        images we generate from them are not persisted on our servers — they
        live in memory only for as long as the request takes, then they are
        gone. This page describes what we do collect, why, and how to remove
        it.
      </p>

      <h2>What we don&apos;t store</h2>
      <ul>
        <li>
          Uploaded screenshots are streamed to the AI model and discarded once
          the response is received. We never write them to disk, S3, or any
          database.
        </li>
        <li>
          Generated images are returned to your browser as temporary in-memory
          URLs and are unrecoverable once your tab closes. We have no
          generation-history feature, no thumbnail cache, and no images table.
        </li>
        <li>
          We do not sell, share, or use your screenshots or generated outputs
          to train any model.
        </li>
      </ul>

      <h2>What we do store</h2>
      <ul>
        <li>
          Account data: your email, your Clerk user ID, your credit balance,
          and account creation timestamp.
        </li>
        <li>
          Transactions: a row per credit purchase, usage, or refund (Stripe
          payment ID, amount, type, timestamp).
        </li>
        <li>
          Generation metadata: a row per generation containing app name, style
          preset, category, status (pending/complete/failed), and timestamps.
          No images, no screenshots, no copies of the prompt inputs beyond what
          is listed here.
        </li>
        <li>
          Server logs: standard request metadata (timestamp, route, response
          status, anonymized error context). Logs are retained for up to 30
          days.
        </li>
      </ul>

      <h2>Sub-processors</h2>
      <p>
        We use the following vendors to operate the service. Each receives only
        what it needs to do its job:
      </p>
      <ul>
        <li>Clerk — authentication and user identity.</li>
        <li>Stripe — payments, tax calculation, and customer billing portal.</li>
        <li>Supabase (Postgres) — primary database for the data listed above.</li>
        <li>Upstash Redis — webhook idempotency and rate limiting.</li>
        <li>OpenRouter / OpenAI — image generation. Inputs and outputs pass
          through these services per their respective privacy policies.</li>
        <li>Resend — transactional email delivery.</li>
        <li>Vercel — hosting and request logs.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        ShotStudio uses cookies only as needed for authenticated sessions
        (managed by Clerk) and Stripe Checkout. We do not use third-party
        analytics or advertising cookies.
      </p>

      <h2>Your rights</h2>
      <p>
        You can update your email and payment methods through the Stripe
        Customer Portal at any time, accessible from Settings. To delete your
        account and the associated data described above, email{" "}
        <a href="mailto:kazakis.th@gmail.com">kazakis.th@gmail.com</a>. Because
        we do not store screenshots or generated images, there is nothing
        image-related to delete.
      </p>

      <h2>Children</h2>
      <p>
        ShotStudio is not directed at children under 13 and we do not knowingly
        collect data from them.
      </p>

      <h2>Changes</h2>
      <p>
        We will update this page when our practices change. Material changes
        will be communicated by email to active accounts.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy: email{" "}
        <a href="mailto:kazakis.th@gmail.com">kazakis.th@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
