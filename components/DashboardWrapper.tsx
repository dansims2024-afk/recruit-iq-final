"use client";

import dynamic from "next/dynamic";

// The Bodyguard: This creates a version of Dashboard that ONLY works in the browser
const Dashboard = dynamic(() => import("./Dashboard"), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="text-indigo-500 font-black tracking-widest animate-pulse uppercase">
        Loading Recruit-IQ...
      </div>
    </div>
  )
});

export default function DashboardWrapper() {
  return <Dashboard />;
}
