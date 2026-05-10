import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";

interface CreditsPurchasedEmailProps {
  firstName?: string | null;
  packageName: string;
  creditsAdded: number;
  newBalance: number;
  amountFormatted: string;
  receiptUrl?: string | null;
  appUrl: string;
}

export default function CreditsPurchasedEmail({
  firstName,
  packageName,
  creditsAdded,
  newBalance,
  amountFormatted,
  receiptUrl,
  appUrl,
}: CreditsPurchasedEmailProps) {
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hey,";
  const setsWord = creditsAdded === 1 ? "set" : "sets";

  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                ink: "#0A0A0A",
                muted: "#5A5A5A",
                line: "#E5E5E5",
                brand: "#111111",
                surface: "#F7F7F7",
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-white font-sans text-ink">
          <Preview>
            {`Payment confirmed — ${creditsAdded} ${setsWord} added (balance: ${newBalance}).`}
          </Preview>
          <Container className="max-w-[560px] mx-auto px-6 py-10">
            <Section>
              <Text className="text-base font-bold tracking-tight m-0">
                <span style={{ color: "#fb923c" }}>Shot</span>Studio
              </Text>
            </Section>

            <Section className="mt-8">
              <Heading className="text-2xl font-semibold tracking-tight m-0">
                Payment confirmed
              </Heading>
              <Text className="text-base leading-6 text-ink mt-4 mb-0">
                {greeting}
              </Text>
              <Text className="text-base leading-6 text-ink mt-3 mb-0">
                Thanks for buying credits. Your balance is updated and ready to use.
              </Text>
            </Section>

            <Section className="mt-8 bg-surface rounded-lg px-5 py-4 border border-solid border-line">
              <Row>
                <Column>
                  <Text className="text-xs uppercase tracking-wide text-muted m-0">
                    Package
                  </Text>
                  <Text className="text-sm font-medium text-ink mt-1 mb-0">
                    {packageName}
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="text-xs uppercase tracking-wide text-muted m-0">
                    Amount
                  </Text>
                  <Text className="text-sm font-medium text-ink mt-1 mb-0">
                    {amountFormatted}
                  </Text>
                </Column>
              </Row>

              <Hr className="border-line border-solid my-4" />

              <Row>
                <Column>
                  <Text className="text-xs uppercase tracking-wide text-muted m-0">
                    Credits added
                  </Text>
                  <Text className="text-sm font-medium text-ink mt-1 mb-0">
                    {`${creditsAdded} ${setsWord}`}
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="text-xs uppercase tracking-wide text-muted m-0">
                    New balance
                  </Text>
                  <Text className="text-sm font-medium text-ink mt-1 mb-0">
                    {`${newBalance} ${newBalance === 1 ? "set" : "sets"}`}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="mt-8">
              <Button
                href={`${appUrl}/home`}
                className="bg-brand text-white px-5 py-3 rounded-md text-sm font-medium no-underline box-border"
              >
                Generate a screenshot set
              </Button>
            </Section>

            {receiptUrl ? (
              <Section className="mt-6">
                <Text className="text-sm leading-6 text-muted m-0">
                  Need an invoice or receipt?{" "}
                  <Link href={receiptUrl} className="text-ink underline">
                    View your receipt
                  </Link>
                  .
                </Text>
              </Section>
            ) : null}

            <Hr className="border-line border-solid my-8" />

            <Section>
              <Text className="text-xs leading-5 text-muted m-0">
                All sales are final per our Terms of Service. Disputes are handled directly through Stripe.
              </Text>
              <Text className="text-xs leading-5 text-muted mt-2 mb-0">
                Questions? Just reply to this email.
              </Text>
              <Text className="text-xs leading-5 text-muted mt-2 mb-0">
                <Link href={appUrl} className="text-muted underline">
                  shotstudio.app
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

CreditsPurchasedEmail.PreviewProps = {
  firstName: "Alex",
  packageName: "Growth — 5 sets",
  creditsAdded: 5,
  newBalance: 5,
  amountFormatted: "$17.00",
  receiptUrl: "https://pay.stripe.com/receipts/example",
  appUrl: "https://shotstudio.app",
} satisfies CreditsPurchasedEmailProps;

export { CreditsPurchasedEmail };
