import Dashboard from "@/components/Dashboard";

// This is the most important line for Next.js 15 builds
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
