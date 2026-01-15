import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Dashboard from './components/Dashboard';

// This file simply loads the Dashboard. 
// All logo/UI logic is handled inside Dashboard.jsx now.

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <Dashboard />
    </div>
  );
}
