import { SignedIn, SignedOut } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex fleimport React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"; // FIXED
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white">
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
           <span className="font-black text-xl tracking-tighter">Recruit-IQ</span>
        </div>
        <div>
          <SignedOut>
            <SignInButton className="bg-blue-600 px-6 py-2 rounded-xl font-bold text-xs hover:bg-blue-500 transition shadow-lg shadow-blue-600/20" />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="flex-grow">
        <SignedOut>
          <LandingPage />
        </SignedOut>
        <SignedIn>
          <Dashboard />
        </SignedIn>
      </main>
    </div>
  );
}x-col bg-[#020617]">
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
