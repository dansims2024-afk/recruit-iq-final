import dynamic from 'next/dynamic';

// 1. This tells Next.js: "Only load this component in the browser."
// 2. 'ssr: false' is the magic key that prevents the Vercel build crash.
const Dashboard = dynamic(() => import('@/components/Dashboard'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="text-indigo-500 font-black tracking-widest animate-pulse uppercase">
        Recruit-IQ Loading...
      </div>
    </div>
  )
});

// 3. Force the route to be dynamic
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
