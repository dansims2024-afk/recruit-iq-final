"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Check, CheckCircle, Upload, Zap, Info, Target, Loader2, FileText } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
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
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        {!isSignedIn ? <SignInButton mode="modal" /> : <UserButton afterSignOutUrl="/"/>}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className={`p-8 rounded-[2rem] border ${jdText.length > 50 ? 'border-emerald-500 bg-emerald-500/10 shadow-lg' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest">1. Job Specs</span>
            </div>
        </div>
        <div className={`p-8 rounded-[2rem] border ${resumeText.length > 50 ? 'border-emerald-500 bg-emerald-500/10 shadow-lg' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest">2. Talent Data</span>
            </div>
        </div>
        <div className={`p-8 rounded-[2rem] border ${isPro ? 'border-indigo-500 bg-indigo-500/10 shadow-lg' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-3">
                <Zap className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">3. Elite Report</span>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[600px] shadow-2xl">
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-8 border border-slate-800 rounded-2xl text-[11px] font-mono leading-relaxed" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <button onClick={() => setShowLimitModal(true)} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-3 shadow-xl">
                <Zap className="w-4 h-4 fill-current" /> {isPro ? "Execute Elite AI Screen" : "Unlock to Execute"}
            </button>
        </div>
      </div>

      {showLimitModal && !isPro && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center backdrop-blur-3xl bg-slate-950/90 p-4">
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center max-w-lg shadow-2xl">
                <h2 className="text-4xl font-black mb-6 uppercase">Unlock Elite</h2>
                <a href={getStripeUrl()} className="inline-block w-full bg-indigo-600 px-10 py-5 rounded-xl font-black uppercase shadow-2xl">Start 3-Day Free Trial</a>
                <button onClick={() => setShowLimitModal(false)} className="mt-6 block text-[10px] w-full text-slate-500 uppercase font-black">Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
}
