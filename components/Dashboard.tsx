"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Loader2, Zap, Shield, Sparkles, Star, Check, Upload, Mail, Copy, ArrowRight } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- ELITE VALUE SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`;
const SAMPLE_RESUME = `MARCUS VANDELAY | Principal Software Architect...`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  
  const getStripeUrl = () => {
    if (!user?.id) return STRIPE_URL;
    const url = new URL(STRIPE_URL);
    url.searchParams.set("client_reference_id", user.id);
    if (user?.primaryEmailAddress?.emailAddress) url.searchParams.set("prefilled_email", user.primaryEmailAddress.emailAddress);
    return url.toString();
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro && (window.location.search.includes('signup=true') || sessionStorage.getItem('pending_stripe') === 'true')) {
        sessionStorage.removeItem('pending_stripe');
        window.location.href = getStripeUrl();
    }
  }, [isLoaded, isSignedIn, isPro]);

  useEffect(() => {
    setScanCount(parseInt(localStorage.getItem('recruit_iq_scans') || '0'));
  }, []);

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    setLoading(true);
    // AI logic...
    setLoading(false);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* HEADER: LOGO LEFT, BUTTONS RIGHT */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Recruit-IQ" className="w-10 h-10 object-contain" />
            <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
            {!isPro && (
                <button onClick={() => setShowLimitModal(true)} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-current" /> Upgrade
                </button>
            )}
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Sign In</button>
              </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px] shadow-2xl">
            <div className="flex gap-3 mb-6">
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Elite Samples</button>
            </div>
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono mb-6" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <button onClick={handleScreen} className="py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-500 transition-all">
              <Zap className="w-5 h-5 fill-white" /> Execute Elite AI Screen
            </button>
        </div>
        <div className="h-[700px] flex items-center justify-center opacity-20"><Sparkles className="w-12 h-12" /></div>
      </div>

      {/* VALUE-DRIVEN UPGRADE MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-[#0F172A] border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-12 md:w-3/5 flex flex-col justify-center text-left">
                 <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tighter">Hire Smarter. <br/><span className="text-indigo-400 italic">Finish First.</span></h2>
                 <p className="text-slate-400 mb-10 text-sm">Join top recruiters using Recruit-IQ Elite to screen candidates 10x faster with AI precision.</p>
                 
                 {!isSignedIn ? (
                    <SignUpButton mode="modal">
                        <button onClick={() => sessionStorage.setItem('pending_stripe', 'true')} className="inline-flex items-center gap-3 bg-indigo-600 px-12 py-5 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-2xl hover:bg-indigo-500 transition-all">
                          Start 3-Day Free Trial <ArrowRight className="w-4 h-4" />
                        </button>
                    </SignUpButton>
                 ) : (
                    <a href={getStripeUrl()} className="inline-flex items-center gap-3 bg-indigo-600 px-12 py-5 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-2xl hover:bg-indigo-500 transition-all">
                      Upgrade to Elite Now <ArrowRight className="w-4 h-4" />
                    </a>
                 )}
                 <button onClick={() => setShowLimitModal(false)} className="text-[10px] text-slate-500 hover:text-white uppercase font-black mt-8 text-left transition-colors uppercase tracking-widest">Dismiss</button>
              </div>
              <div className="md:w-2/5 bg-slate-900/50 p-12 border-l border-slate-800 flex flex-col justify-center gap-8">
                 <div className="flex gap-4 items-start">
                   <Zap className="text-indigo-400 w-6 h-6 shrink-0" /> 
                   <div><h4 className="text-white font-bold text-[10px] uppercase">Elite Speed</h4><p className="text-slate-500 text-[10px]">Analyze 50 resumes in the time it takes to read one.</p></div>
                 </div>
                 <div className="flex gap-4 items-start">
                   <Shield className="text-purple-400 w-6 h-6 shrink-0" /> 
                   <div><h4 className="text-white font-bold text-[10px] uppercase">Precision Match</h4><p className="text-slate-500 text-[10px]">Identify niche skill gaps before the first interview.</p></div>
                 </div>
                 <div className="flex gap-4 items-start">
                   <Star className="text-emerald-400 w-6 h-6 shrink-0" /> 
                   <div><h4 className="text-white font-bold text-[10px] uppercase">Unlimited Reports</h4><p className="text-slate-500 text-[10px]">Strategic interview guides for every candidate.</p></div>
                 </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
