"use client";

import dynamic from 'next/dynamic';

// We import the NEW filename 'MainBoard' to break the cache
const Dashboard = dynamic(() => import('../components/MainBoard'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="text-indigo-500 font-black tracking-widest animate-pulse uppercase">
        Recruit-IQ Loading...
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
