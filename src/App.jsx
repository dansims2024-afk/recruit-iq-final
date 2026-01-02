import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white">
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <span className="font-black text-xl tracking-tighter">Recruit-IQ</span>
        </div>
        <div>
          <SignedOut>
            <SignInButton mode="modal" className="bg-blue-600 px-6 py-2 rounded-xl font-bold text-xs hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 text-white" />
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
}
