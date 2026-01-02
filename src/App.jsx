import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white font-sans">
      {/* Universal Header */}
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
           </div>
           <span className="font-black text-xl tracking-tighter">Recruit-IQ</span>
        </div>
        <div>
          {/* Guest Mode: Show Sign In | User Mode: Show Profile */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white transition border border-slate-700">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      {/* Main Content: ALWAYS SHOW DASHBOARD */}
      <main className="flex-grow">
        <Dashboard />
      </main>

      <footer className="p-8 text-center text-[10px] text-slate-600 uppercase tracking-widest border-t border-slate-900">
        © Core Creativity AI 2026
      </footer>
    </div>
  );
}
