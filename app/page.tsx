import Dashboard from "@/components/Dashboard";

// CRITICAL: This tells Vercel to skip static pre-rendering for the home route
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
