import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // This line automatically sends non-logged-in users to Clerk's hosted login
  const { has } = await auth.protect();

  // Check for the Elite permission
  const isElite = has({ permission: "pro_access" });

  if (!isElite) {
    redirect("/upgrade");
  }

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1>Elite Dashboard Unlocked! 🚀</h1>
      <p>Welcome back! Your AI Search tools are ready.</p>
    </div>
  );
}
