// FIXED: Renamed import to avoid conflict with 'export const dynamic'
import dynamicImport from 'next/dynamic';

const Dashboard = dynamicImport(() => import('@/components/Dashboard'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="text-indigo-500 font-black tracking-widest animate-pulse uppercase">
        Recruit-IQ Loading...
      </div>
    </div>
  )
});

// This forces the route to be dynamic without crashing the build
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
