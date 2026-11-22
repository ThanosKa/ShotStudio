import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { CloudflareWebAnalytics } from "@/components/cloudflare-web-analytics";
import { APP_URL } from "@/lib/utils";
import { htmlClassName } from "./fonts";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "ShotStudio — App Store screenshots in under a minute",
    template: "%s — ShotStudio",
  },
  description:
    "Drop in three raw mobile screenshots. Get a polished three-shot App Store set back in under a minute. One-time pay.",
  applicationName: "ShotStudio",
  keywords: [
    "App Store screenshots",
    "App Store screenshot generator",
    "App Store Connect",
    "iOS screenshots",
    "App Store Optimization",
    "ASO",
    "indie iOS",
  ],
  authors: [{ name: "ShotStudio" }],
  creator: "ShotStudio",
  publisher: "ShotStudio",
  openGraph: {
    type: "website",
    siteName: "ShotStudio",
    title: "ShotStudio — App Store screenshots in under a minute",
    description:
      "Three raw screenshots in, three polished App Store shots out. One-time pay, never stored.",
    url: APP_URL,
    locale: "en_US",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "ShotStudio — App Store screenshots in under a minute",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShotStudio — App Store screenshots in under a minute",
    description:
      "Three raw screenshots in, three polished App Store shots out. One-time pay, never stored.",
    images: ["/og-default.png"],
  },
  robots: {
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "6AGPR-3tc3oNACKAU0pyo1QAX17RhOJjSrKiPT0SQYg",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={htmlClassName}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider appearance={{ theme: dark }}>{children}</ClerkProvider>
        <CloudflareWebAnalytics />
      </body>
    </html>
  );
}
