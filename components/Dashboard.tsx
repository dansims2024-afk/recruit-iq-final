"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Check, CheckCircle, Upload, Zap, Shield, Sparkles, Star, ArrowRight, Info, Target, ListChecks, Loader2, FileText } from "lucide-react";

// THIS IS THE CRITICAL LINE. IT MUST BE YOUR REAL LINK ID.
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
  
  // FIXED: This now injects the REAL Clerk ID, removing the {USER_ID} error
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}${userEmail ? `&prefilled_email=${encodeURIComponent(userEmail)}` : ''}` 
    : STRIPE_URL;

  const jdReady = jdText.length > 50;
  const resumeReady = resumeText.length > 50;

  // THE AUTO-BOUNCE: Sends new signups directly to your real Stripe page
  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro) {
        const hasTrigger = window.location.search.includes('signup=true') || sessionStorage.getItem('pending_stripe') === 'true';
        if (hasTrigger) {
            sessionStorage.removeItem('pending_stripe');
            window.location.href = finalStripeUrl;
        }
    }
  }, [isLoaded, isSignedIn, isPro, finalStripeUrl]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } catch (err) { console.error("Upload failed"); }
  };

  const handleScreen = async () => {
    if (!isSignedIn || !isPro) {
      setShowLimitModal(true);
      return;
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

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
                    <button className="bg-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg">
                        Sign In
                    </button>
                </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      {/* QUICK START PROGRESS BAR */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className={`p-8 rounded-[2rem] border transition-all ${jdReady ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-2">
                {jdReady ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <Info className="text-indigo-400 w-5 h-5" />}
                <span className="text-[10px] font-black uppercase tracking-widest">1. Role Specs</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-emerald-500 transition-all duration-500 ${jdReady ? 'w-full' : 'w-0'}`}></div>
            </div>
        </div>
        <div className={`p-8 rounded-[2rem] border transition-all ${resumeReady ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-2">
                {resumeReady ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <Target className="text-indigo-400 w-5 h-5" />}
                <span className="text-[10px] font-black uppercase tracking-widest">2. Talent Data</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-emerald-500 transition-all duration-500 ${resumeReady ? 'w-full' : 'w-0'}`}></div>
            </div>
        </div>
        <div className={`p-8 rounded-[2rem] border transition-all ${jdReady && resumeReady ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-2">
                <Zap className={jdReady && resumeReady ? "text-indigo-500 w-5 h-5" : "text-slate-600 w-5 h-5"} />
                <span className="text-[10px] font-black uppercase tracking-widest">3. Elite Report</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-500 transition-all duration-500 ${jdReady && resumeReady ? 'w-full' : 'w-0'}`}></div>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume</button>
            </div>
            <div className="flex gap-3 mb-4 text-[10px] font-bold uppercase">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl border border-slate-700 hover:text-white transition-all">
                <Upload className="inline w-3 h-3 mr-2" /> Upload DOCX
                <input type="file" accept=".docx, .pdf" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText("Full JD Sample Content..."); setResumeText("Full Resume Sample Content...");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl border border-slate-700 hover:text-white transition-all">
                <FileText className="inline w-3 h-3 mr-2" /> Fill Samples
              </button>
            </div>
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-8 border border-slate-800 rounded-2xl text-[11px] font-mono leading-relaxed" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />} Execute Elite AI Screen
            </button>
        </div>
        <div className="h-[750px] bg-[#111827] border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase text-center p-20 tracking-widest">
            Waiting for Data...
        </div>
      </div>

      {/* SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="p-12 md:w-3/5">
                <h2 className="text-5xl font-black mb-6 leading-tight">Hire Smarter. <br/><span className="text-indigo-400 italic">Finish First.</span></h2>
                {!isSignedIn ? (
                    <SignUpButton mode="modal" forceRedirectUrl="/?signup=true">
                        <button onClick={() => sessionStorage.setItem('pending_stripe', 'true')} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs shadow-2xl hover:bg-indigo-500 transition-all">Create Account to Start Trial</button>
                    </SignUpButton>
                ) : (
                    <a href={finalStripeUrl} className="block w-full py-5 bg-indigo-600 text-center text-white font-black rounded-2xl uppercase text-xs shadow-2xl hover:bg-indigo-500 transition-all">Start 3-Day Free Trial</a>
                )}
                <button onClick={() => setShowLimitModal(false)} className="w-full mt-6 text-[10px] text-slate-600 uppercase font-black tracking-widest">Dismiss</button>
            </div>
            <div className="md:w-2/5 bg-[#111827] border-l border-slate-800 p-12 flex flex-col justify-center gap-10 text-center">
                <Zap className="w-12 h-12 text-indigo-400 mx-auto" /><h3 className="font-black text-white uppercase text-xl">Elite Access</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
