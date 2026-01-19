import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
// FIXED: Relative path resolution for your Dashboard component
import Dashboard from "../../components/Dashboard";

export default async function DashboardPage() {
  const { userId } = auth();

  // Redirect to login if unauthenticated
  if (!userId) {
    redirect("/sign-in");
  }

  return <Dashboard />;
}
