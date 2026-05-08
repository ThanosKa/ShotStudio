import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <SignIn appearance={dark} />
    </main>
  );
}
