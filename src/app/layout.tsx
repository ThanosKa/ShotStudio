import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { APP_URL, cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  alternates: {
    canonical: "/",
  },
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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider appearance={{ theme: dark }}>{children}</ClerkProvider>
      </body>
    </html>
  );
}
