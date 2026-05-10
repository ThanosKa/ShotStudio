import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { BuyCreditsPanel } from "@/components/buy-credits-panel";
import { Wizard } from "@/components/wizard";
import { getEmailAndEnsureUser, getUserCredits } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await getEmailAndEnsureUser(userId);

  const credits = await getUserCredits(userId);

  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <Navbar credits={credits} />
      <main className="flex-1 px-6 py-10">
        {credits > 0 ? <Wizard /> : <BuyCreditsPanel />}
      </main>
    </div>
  );
}
