"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

// This pulls in your design from the other file
const DashboardComponent = dynamic(() => import('../components/MainBoard'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
       <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  ),
});

export default function Home() {
  return <DashboardComponent />;
}
