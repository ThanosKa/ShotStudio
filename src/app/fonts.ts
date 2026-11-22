import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const htmlClassName = cn(
  "h-full",
  "antialiased",
  geistSans.variable,
  geistMono.variable,
  "font-sans",
  inter.variable,
);
