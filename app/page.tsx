"use client";

import dynamic from 'next/dynamic';

// We use dynamic import to prevent SSR issues with the dashboard
const Dashboard = dynamic(() => import('../components/MainBoard'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
       <div className="text-white text-xl animate-pulse">Loading Recruit-IQ...</div>
    </div>
  ),
});

export default function Home() {
  return <Dashboard />;
}
