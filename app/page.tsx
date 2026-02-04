// 1. Rename the import to avoid conflict
import dynamicImport from 'next/dynamic'; 

// 2. Use the renamed import here
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

// 3. Now this export is valid and won't crash the build
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
