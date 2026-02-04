import dynamic from 'next/dynamic';

// This forces the dashboard to ONLY load in the browser, 
// which hides the Clerk logic from the Vercel build worker.
const Dashboard = dynamic(() => import('@/components/Dashboard'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="text-indigo-400 font-black tracking-widest animate-pulse uppercase">
        Initializing Recruit-IQ...
      </div>
    </div>
  )
});

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <Dashboard />;
}
