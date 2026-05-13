"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SignOutButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error;
  unstable_retry: () => void;
}) {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. Try again, or head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => unstable_retry()}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
          {isSignedIn && (
            <SignOutButton redirectUrl="/">
              <Button variant="ghost">Sign out</Button>
            </SignOutButton>
          )}
        </div>
      </div>
    </main>
  );
}
