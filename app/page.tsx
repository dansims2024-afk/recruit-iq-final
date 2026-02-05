"use client";

import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('../components/MainBoard'), { 
  ssr: false,
});

export default function Home() {
  return <Dashboard />;
}
