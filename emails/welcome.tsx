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
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";

interface WelcomeEmailProps {
  firstName?: string | null;
  appUrl: string;
}

export default function WelcomeEmail({ firstName, appUrl }: WelcomeEmailProps) {
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hey,";

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
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-white font-sans text-ink">
          <Preview>Welcome to ShotStudio — App Store screenshots in a minute.</Preview>
          <Container className="max-w-[560px] mx-auto px-6 py-10">
            <Section>
              <Text className="text-base font-bold tracking-tight m-0">
                <span style={{ color: "#fb923c" }}>Shot</span>Studio
              </Text>
            </Section>

            <Section className="mt-8">
              <Heading className="text-2xl font-semibold tracking-tight m-0">
                Welcome to ShotStudio
              </Heading>
              <Text className="text-base leading-6 text-ink mt-4 mb-0">
                {greeting}
              </Text>
              <Text className="text-base leading-6 text-ink mt-3 mb-0">
                Upload three mobile screenshots, give us your app name and tagline,
                and you&apos;ll have three polished App Store shots in under a minute.
                No subscriptions, no design tools.
              </Text>
            </Section>

            <Section className="mt-8">
              <Button
                href={`${appUrl}/home`}
                className="bg-brand text-white px-5 py-3 rounded-md text-sm font-medium no-underline box-border"
              >
                Open ShotStudio
              </Button>
            </Section>

            <Section className="mt-8">
              <Text className="text-sm leading-6 text-muted m-0">
                You start with 0 credits. Buy a pack whenever you&apos;re ready to ship —
                Starter ($7), Growth ($17), or Studio ($37). Pay once, no recurring billing.
              </Text>
            </Section>

            <Hr className="border-line border-solid my-8" />

            <Section>
              <Text className="text-xs leading-5 text-muted m-0">
                Questions? Just reply to this email.
              </Text>
              <Text className="text-xs leading-5 text-muted mt-2 mb-0">
                <Link href={appUrl} className="text-muted underline">
                  shotstudio.dev
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  firstName: "Alex",
  appUrl: "https://shotstudio.dev",
} satisfies WelcomeEmailProps;

export { WelcomeEmail };
