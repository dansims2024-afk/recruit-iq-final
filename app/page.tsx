"use client"; // <-- THIS IS THE MISSING KEY!

import dynamicImport from 'next/dynamic';

// Now that we are in a "Client Component", this 'ssr: false' line is finally allowed.
const Dashboard = dynamicImport(() => import('../components/Dashboard'), { 
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
