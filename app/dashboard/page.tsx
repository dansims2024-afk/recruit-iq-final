import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
// FIXED: Direct relative path to resolve module errors
import Dashboard from "../../components/Dashboard";

export default async function DashboardPage() {
  const { userId } = auth();

  // Redirect to login if unauthenticated
  if (!userId) {
    redirect("/sign-in");
  }

  return <Dashboard />;
}
