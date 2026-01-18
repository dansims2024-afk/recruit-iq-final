import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { has, userId } = await auth();

  // Redirect if not logged in
  if (!userId) {
    redirect("/sign-in");
  }

  // Use 'permission' to check your 'pro_access' Billing feature
  const isElite = has({ permission: "pro_access" });

  if (!isElite) {
    // If they aren't authorized, send them to the upgrade page
    redirect("/upgrade");
  }

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Elite Dashboard Unlocked! 🚀</h1>
      <p style={{ marginTop: "20px" }}>Welcome to Recruit IQ Elite. Your subscription is verified.</p>
    </div>
  );
}
