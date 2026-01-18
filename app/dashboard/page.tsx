import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { has, userId } = await auth();

  // 1. Force login if session is missing
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Check for the 'pro_access' entitlement
  // If 'feature' throws a type error, use 'permission' as shown below
  const isElite = has({ permission: "pro_access" });

  if (!isElite) {
    // Redirect unpaid users to the pricing table
    redirect("/upgrade");
  }

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Elite Dashboard Unlocked! 🚀</h1>
      <p style={{ marginTop: "20px" }}>Welcome back. Your subscription is verified.</p>
      {/* Insert your search tools here */}
    </div>
  );
}
