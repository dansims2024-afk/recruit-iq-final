import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { has } = await auth();

  // "pro_access" is the feature slug you set up in the Clerk Dashboard
  const isElite = has({ feature: "pro_access" });

  if (!isElite) {
    // If they aren't subscribed, send them to the pricing page
    redirect("/upgrade");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Elite Member Dashboard</h1>
      <p>Your AI Search tools are unlocked below.</p>
      {/* Your AI Search components go here */}
    </main>
  );
}
