import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Wordmark size="sm" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ShotStudio. App Store screenshots, one set at a time.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <a href="mailto:hello@shotstudio.app" className="hover:text-foreground">
            hello@shotstudio.app
          </a>
        </nav>
      </div>
    </footer>
  );
}
