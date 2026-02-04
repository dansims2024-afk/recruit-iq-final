import Dashboard from "@/components/Dashboard";

// Tells Vercel to skip pre-rendering and build successfully
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <Dashboard />;
}
