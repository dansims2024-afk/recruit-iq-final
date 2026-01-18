import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { has, userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Use 'permission' instead of 'feature' to fix the TypeScript error
  const isElite = has({ permission: "pro_access" });

  if (!isElite) {
    redirect("/upgrade");
  }

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1>Elite Dashboard Unlocked! 🚀</h1>
      <p>Your subscription is active. Welcome back.</p>
    </div>
  );
}
