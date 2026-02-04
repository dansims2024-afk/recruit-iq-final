"use client";

import dynamic from 'next/dynamic';

// 1. We use "use client" at the top so 'ssr: false' is allowed.
// 2. We import './Dashboard' assuming you renamed the file to Capital D.
const Dashboard = dynamic(() => import('../components/Dashboard'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="text-indigo-500 font-black tracking-widest animate-pulse uppercase">
        Loading Recruit-IQ...
      </div>
    </div>
  )
});

export default function HomePage() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
