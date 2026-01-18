import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Use auth() to get the 'has' helper
  const { has, userId } = await auth();

  // If they aren't even logged in, send to sign-in
  if (!userId) redirect("/sign-in");

  // This is the magic line that checks for your 'pro_access' slug
  const isElite = has({ feature: "pro_access" });

  if (!isElite) {
    // No subscription? Send them to pay
    redirect("/upgrade");
  }

  return (
    <main className="p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Elite Dashboard 🚀</h1>
      <p className="text-gray-600 mb-8">Welcome back! Your premium AI tools are unlocked.</p>
      
      {/* --- INSERT YOUR SEARCH COMPONENT OR TOOLS HERE --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
         <p>Your AI Search Engine is Ready.</p>
      </div>
    </main>
  );
}
