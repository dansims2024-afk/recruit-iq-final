import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { has, userId } = await auth();

  // 1. Check if the user is even logged in
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Check if the user has the specific feature 'pro_access'
  // Clerk Billing handles this automatically once they pay via Stripe
  const isElite = has({ feature: "pro_access" });

  if (!isElite) {
    // If they aren't Elite, redirect them to the pricing page
    redirect("/upgrade");
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Elite Dashboard Unlocked 🚀</h1>
      <p className="mt-4">Welcome! Your AI tools are ready to use.</p>
      {/* Insert your Search Components here */}
    </div>
  );
}
