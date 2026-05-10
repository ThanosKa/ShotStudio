import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <SignUp appearance={dark} />
    </main>
  );
}
