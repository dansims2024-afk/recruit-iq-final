"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
// FIXED: Loader2 is now imported to resolve the build crash
import { Check, CheckCircle, Upload, Zap, Shield, Sparkles, Star, ArrowRight, Info, Target, ListChecks, Loader2, FileText } from "lucide-react";

// REAL STRIPE LINK
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const isPro = user?.publicMetadata?.isPro === true;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  // URL Construction using real User ID
  const getStripeUrl = () => {
    if (!user?.id) return STRIPE_URL;
    const url = new URL(STRIPE_URL);
    url.searchParams.set("client_reference_id", user.id);
    if (userEmail) {
        url.searchParams.set("prefilled_email", userEmail);
    }
    return url.toString();
  };

  const jdReady = jdText.length > 50;
  const resumeReady = resumeText.length > 50;

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro) {
        const hasTrigger = window.location.search.includes('signup=true') || sessionStorage.getItem('pending_stripe') === 'true';
        if (hasTrigger) {
            sessionStorage.removeItem('pending_stripe');
            window.location.href = getStripeUrl();
        }
    }
  }, [isLoaded, isSignedIn, isPro]);

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
            {!isSignedIn ? (
                <SignInButton mode="modal">
                    <button className="bg-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">Sign In</button>
                </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <button onClick={() => setShowLimitModal(true)} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />} Start Free Trial
            </button>
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-700 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div className="p-12 md:w-3/5">
                {!isSignedIn ? (
                    <SignUpButton mode="modal" forceRedirectUrl="/?signup=true">
                        <button onClick={() => sessionStorage.setItem('pending_stripe', 'true')} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs shadow-2xl hover:bg-indigo-500 transition-all">Create Account to Start Trial</button>
                    </SignUpButton>
                ) : (
                    <a href={getStripeUrl()} className="block w-full py-5 bg-indigo-600 text-center text-white font-black rounded-2xl uppercase text-xs shadow-2xl hover:bg-indigo-500 transition-all">Start 3-Day Free Trial</a>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
