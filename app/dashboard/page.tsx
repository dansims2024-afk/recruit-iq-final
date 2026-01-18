import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { has, userId } = await auth();

  if (!userId) redirect("/sign-in");

  // This check relies on the Clerk Billing 'pro_access' feature slug
  const isElite = has({ feature: "pro_access" });

  if (!isElite) {
    redirect("/upgrade");
  }

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1>Elite Dashboard Unlocked! 🚀</h1>
      <p>Welcome to Recruit IQ Elite. Your subscription is verified.</p>
    </div>
  );
}
