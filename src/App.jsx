import { SignedIn, SignedOut } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      {/* Persistent Footer */}
      <footer className="mt-auto border-t p-6 text-center text-xs text-slate-500">
        © Core Creativity AI 2026 | Privacy | Terms | Support
      </footer>
    </div>
  );
}
