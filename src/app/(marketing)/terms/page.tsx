import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — ShotStudio",
  description: "The terms governing your use of ShotStudio.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="May 2026">
      <p>
        These Terms govern your use of ShotStudio. By creating an account or
        purchasing credits you agree to them. If you don&apos;t agree, please
        don&apos;t use the service.
      </p>

      <h2>The service</h2>
      <p>
        ShotStudio generates a four-image App Store screenshot set from
        screenshots and context you provide. We use AI (currently OpenAI&apos;s
        gpt-image-2 via OpenRouter) to produce the output. AI output quality
        varies; we make no guarantee that any specific generation will meet
        your visual or commercial expectations.
      </p>

      <h2>Credits</h2>
      <ul>
        <li>
          Credits are sold in packs (Starter, Growth, Studio) at the prices
          shown on our pricing page. Prices are exclusive of taxes; applicable
          VAT/sales tax is added at checkout via Stripe Tax.
        </li>
        <li>
          One credit covers one full generation set (four images). Regenerating
          an individual shot in an existing set is free.
        </li>
        <li>
          Credits do not expire while your account is active. Credits have no
          cash value and cannot be transferred between accounts.
        </li>
        <li>
          If a generation fails after our automatic retry, the credit is
          refunded to your balance automatically.
        </li>
      </ul>

      <h2>All sales final</h2>
      <p>
        Credit purchases are non-refundable except where required by law or as
        explicitly described above (automatic refund on failed generation).
        Disputes are handled directly through Stripe&apos;s dispute mechanism.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to use ShotStudio to:</p>
      <ul>
        <li>
          Upload screenshots or content you don&apos;t have the right to use;
        </li>
        <li>Generate content that is illegal, defamatory, or infringes others&apos; rights;</li>
        <li>
          Attempt to circumvent rate limits, fair-use caps, or our credit
          accounting;
        </li>
        <li>
          Resell, sublicense, or repackage ShotStudio output as a competing
          screenshot-generation service.
        </li>
      </ul>
      <p>
        We may suspend or terminate accounts that violate these terms or that
        we reasonably suspect of abuse.
      </p>

      <h2>Ownership of output</h2>
      <p>
        Subject to your compliance with these Terms and to applicable law, you
        own the four images returned by a successful generation and may use
        them for any purpose, including commercial App Store and Play Store
        listings. You are responsible for ensuring the inputs you provide
        (screenshots, logos, taglines) are yours to use.
      </p>

      <h2>Privacy</h2>
      <p>
        Our handling of your data is described in the{" "}
        <a href="/privacy">Privacy Policy</a>, which is part of these Terms.
        Notably, we do not store uploaded screenshots or generated images.
      </p>

      <h2>Disclaimers</h2>
      <p>
        ShotStudio is provided &quot;as is.&quot; We disclaim all warranties to
        the maximum extent permitted by law, including warranties of
        merchantability, fitness for a particular purpose, and
        non-infringement. We do not warrant that the service will be
        uninterrupted, error-free, or that any specific output will meet your
        requirements.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, ShotStudio&apos;s aggregate
        liability for any claim arising out of or relating to the service is
        limited to the greater of (a) the amount you paid us in the twelve
        months preceding the claim or (b) USD 50. We are not liable for
        indirect, incidental, special, or consequential damages.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms. Material changes will be communicated by
        email; continued use after changes take effect is acceptance of the
        updated Terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the operator&apos;s
        jurisdiction. Disputes will be resolved in the operator&apos;s home
        courts unless local consumer-protection law requires otherwise.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms: email{" "}
        <a href="mailto:hello@shotstudio.app">hello@shotstudio.app</a>.
      </p>
    </LegalPage>
  );
}
