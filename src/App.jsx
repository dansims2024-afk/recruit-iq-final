import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Dashboard from './components/Dashboard';
import logo from './logo.png'; 

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-indigo-500/30">
      
      {/* HEADER - Visible to everyone */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
           {/* Optional: Add a small logo here if you want */}
        </div>

        <div>
          {/* If Signed In: Show User Avatar */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{
                elements: { avatarBox: "w-10 h-10 border-2 border-indigo-500" }
            }}/>
          </SignedIn>

          {/* If Signed Out: Show Login Button */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
                Member Login
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* DASHBOARD - Now accessible to everyone (Guest & User) */}
      <Dashboard />
      
    </div>
  );
}
