"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

// Dynamically import the dashboard to prevent build-time errors with PDF/Docx libraries
const DashboardComponent = dynamic(() => import('../components/MainBoard'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
         <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
         <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Initializing Recruit-IQ...</p>
       </div>
    </div>
  ),
});

export default function Home() {
  return <DashboardComponent />;
}
