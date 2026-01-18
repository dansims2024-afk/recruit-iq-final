// OLD (Broken):
// import Dashboard from '@/components/Dashboard';

// NEW (Fixed):
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
