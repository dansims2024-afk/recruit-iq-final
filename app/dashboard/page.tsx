import { auth } from "@clerk/nextjs/server";
// FIX: Use relative path instead of alias to find the component
import Dashboard from "../../components/Dashboard";

export default function DashboardPage() {
  auth().protect();
  return <Dashboard />;
}
