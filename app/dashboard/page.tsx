import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Dashboard from "../../components/Dashboard";

export default async function DashboardPage() {
  const { userId } = auth();

  // Standard redirect if the user is not signed in
  if (!userId) {
    redirect("/sign-in");
  }

  return <Dashboard />;
}
