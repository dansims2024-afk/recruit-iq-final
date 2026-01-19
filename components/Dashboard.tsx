"use client";

import React, { useState, useEffect } from 'react';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Zap, Loader2 } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const isPro = user?.publicMetadata?.isPro === true;
  
  const getStripeUrl = () => {
    if (!user?.id) return STRIPE_URL;
    const url = new URL(STRIPE_URL);
    url.searchParams.set("client_reference_id", user.id); 
    return url.toString();
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro && window.location.search.includes('signup=true')) {
        window.location.href = getStripeUrl();
    }
  }, [isLoaded, isSignedIn, isPro]);

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="relative p-6 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        {!isSignedIn ? <SignInButton mode="modal" /> : <UserButton afterSignOutUrl="/"/>}
      </div>
      <button onClick={() => setShowLimitModal(true)} className="py-5 px-10 rounded-2xl font-black uppercase bg-indigo-600 hover:bg-indigo-500 flex items-center gap-3 shadow-xl">
        <Zap className="w-4 h-4 fill-current" /> {isPro ? "Access Elite Tools" : "Start Free Trial"}
      </button>

      {showLimitModal && !isPro && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center backdrop-blur-3xl bg-slate-950/90 p-4">
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center shadow-2xl">
                <h2 className="text-4xl font-black mb-6 uppercase">Unlock Elite</h2>
                <a href={getStripeUrl()} className="inline-block bg-indigo-600 px-10 py-5 rounded-xl font-black uppercase">Start 3-Day Free Trial</a>
                <button onClick={() => setShowLimitModal(false)} className="mt-6 block text-[10px] w-full text-slate-500 uppercase font-black">Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
}
