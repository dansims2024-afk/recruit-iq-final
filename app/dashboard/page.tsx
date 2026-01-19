import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Dashboard from "../../components/Dashboard"; // FIXED: Correct relative path

export default async function DashboardPage() {
  const { userId } = auth();

  // Redirect to login if unauthenticated
  if (!userId) {
    redirect("/sign-in");
  }

  return <Dashboard />;
}
