import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { pluralize } from "@/lib/utils";

export function Navbar({ credits }: { credits: number }) {
  return (
    <header className="sticky top-0 z-[60] border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/home" className="text-lg font-semibold tracking-tight">
          ShotStudio
        </Link>
        <div className="flex items-center gap-4">
          <span className="rounded-full border px-3 py-1 text-sm">
            {credits} {pluralize(credits, "credit")}
          </span>
          <UserButton appearance={dark} />
        </div>
      </div>
    </header>
  );
}
