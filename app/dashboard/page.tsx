import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { has, userId } = await auth();

  if (!userId) redirect("/sign-in");

  // This checks your Clerk Billing plan for the 'pro_access' feature
  const isElite = has({ feature: "pro_access" });

  if (!isElite) {
    // Sends unpaid users to the pricing table
    redirect("/upgrade");
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Elite Dashboard Unlocked! 🚀</h1>
      <p className="mt-4">Welcome back! Your AI Search is ready.</p>
      {/* Insert your Search tool component here */}
    </div>
  );
}
