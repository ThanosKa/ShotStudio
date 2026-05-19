import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="ShotStudio home">
          <Wordmark size="md" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link href="/screenshots-for" className="hover:text-foreground">
            By app type
          </Link>
          <Link href="/alternatives" className="hover:text-foreground">
            Alternatives
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Show
            when="signed-in"
            fallback={
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Get started</Button>
                </SignUpButton>
              </>
            }
          >
            <Button asChild size="sm">
              <Link href="/home">Go to app</Link>
            </Button>
          </Show>
        </div>
      </div>
    </header>
  );
}
