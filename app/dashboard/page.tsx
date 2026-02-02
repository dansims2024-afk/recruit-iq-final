import { auth } from "@clerk/nextjs/server";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  auth().protect();
  return <Dashboard />;
}
