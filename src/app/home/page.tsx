import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { BuyCreditsPanel } from "@/components/buy-credits-panel";
import { Wizard } from "@/components/wizard";
import { ensureUser, getUserCredits } from "@/lib/db/queries";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (email) await ensureUser(userId, email);

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
