import { SignedIn, SignedOut } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617]">
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <footer className="mt-auto border-t border-slate-800 p-8 text-center text-[10px] text-slate-500 uppercase tracking-widest">
        © Core Creativity AI 2026 | Privacy | Terms | Support
      </footer>
    </div>
  );
}
