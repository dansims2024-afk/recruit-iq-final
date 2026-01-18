import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { has, userId } = await auth();

  // Redirect if not logged in
  if (!userId) redirect("/sign-in");

  // This checks the Clerk Billing feature we set up
  const isElite = has({ feature: "pro_access" });

  if (!isElite) {
    // Sends unpaid users to the pricing page
    redirect("/upgrade");
  }

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Elite Dashboard Unlocked! 🚀</h1>
      <p style={{ marginTop: "20px" }}>Welcome back. Your AI tools are ready for use.</p>
    </div>
  );
}
