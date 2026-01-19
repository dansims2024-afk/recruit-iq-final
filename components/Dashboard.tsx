"use client";

import React, { useState, useEffect } from 'react';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Zap, Loader2 } from "lucide-react";

// REAL STRIPE LINK
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const isPro = user?.publicMetadata?.isPro === true;
  
  const getStripeUrl = () => {
    if (!user?.id) return STRIPE_URL;
    const url = new URL(STRIPE_URL);
    url.searchParams.set("client_reference_id", user.id); // FIXED: No more {USER_ID}
    return url.toString();
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro) {
        if (window.location.search.includes('signup=true')) {
            window.location.href = getStripeUrl();
        }
    }
  }, [isLoaded, isSignedIn, isPro]);

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="relative p-6 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        {!isSignedIn ? <SignInButton mode="modal" /> : <UserButton afterSignOutUrl="/"/>}
      </div>
      <button onClick={() => setShowLimitModal(true)} className="py-5 px-10 rounded-2xl font-black uppercase bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-3">
        <Zap className="w-4 h-4 fill-current" /> {isPro ? "Access Elite Tools" : "Start Free Trial"}
      </button>

      {showLimitModal && !isPro && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center backdrop-blur-3xl bg-slate-950/90">
            <a href={getStripeUrl()} className="bg-indigo-600 px-10 py-5 rounded-xl font-bold uppercase shadow-2xl">Start 3-Day Trial</a>
            <button onClick={() => setShowLimitModal(false)} className="mt-4 text-xs block text-center w-full">Cancel</button>
        </div>
      )}
    </div>
  );
}
