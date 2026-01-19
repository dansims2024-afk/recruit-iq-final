"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
// Loader2 is now correctly imported to fix the build crash
import { Check, CheckCircle, Upload, Zap, Shield, Sparkles, Star, ArrowRight, Info, Target, ListChecks, Loader2 } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL PAGE VALUE SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect... (12+ years experience required)`;
const SAMPLE_RESUME = `MARCUS VANDELAY: Principal Software Architect... (14 years leadership)`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [analysis, setAnalysis] = useState<any>(null);

  const isPro = user?.publicMetadata?.isPro === true;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  // FIXED URL CONSTRUCTION: This prevents the {USER_ID} literal text error
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}${userEmail ? `&prefilled_email=${encodeURIComponent(userEmail)}` : ''}` 
    : STRIPE_URL;

  const jdReady = jdText.length > 100;
  const resumeReady = resumeText.length > 100;

  // AUTO-REDIRECT: If they just signed up, send them to Stripe immediately
  useEffect(() => {
    if (isSignedIn && !isPro && window.location.search.includes('signup=true')) {
        window.location.href = finalStripeUrl;
    }
  }, [isSignedIn, isPro, finalStripeUrl]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

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
      showToast("Document loaded!");
    } catch (err) { showToast("Upload failed", "error"); }
  };

  const handleScreen = async () => {
    if (!isSignedIn || !isPro) {
      setShowLimitModal(true);
      return;
    }
    setLoading(true);
    // AI fetch logic...
    setLoading(false);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* FIXED HEADER WITH SIGN IN BUTTON */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
            {!isSignedIn ? (
                <SignInButton mode="modal">
                    <button className="bg-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
                        Sign In
                    </button>
                </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      {/* DETAILED QUICK START BAR */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${jdReady ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-4">
                {jdReady ? <CheckCircle className="text-emerald-500 w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">1</div>}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Step 1: The Role</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-6 font-medium">Paste the full job description. AI analyzes the stack and seniority benchmarks.</p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-emerald-500 transition-all duration-700 ${jdReady ? 'w-full' : 'w-0'}`}></div>
            </div>
        </div>

        <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${resumeReady ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-4">
                {resumeReady ? <CheckCircle className="text-emerald-500 w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">2</div>}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Step 2: The Talent</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-6 font-medium">Input the resume. AI parses experience directly against the benchmarks from Step 1.</p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-emerald-500 transition-all duration-700 ${resumeReady ? 'w-full' : 'w-0'}`}></div>
            </div>
        </div>

        <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${jdReady && resumeReady ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-4">
                <Zap className={jdReady && resumeReady ? "text-indigo-500 w-6 h-6" : "text-slate-700 w-6 h-6"} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Step 3: Intelligence</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-6 font-medium">Execute to generate match scores, red flags, and customized strategic guides.</p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-500 transition-all duration-700 ${jdReady && resumeReady ? 'w-full' : 'w-0'}`}></div>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume</button>
            </div>
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-8 border border-slate-800 rounded-2xl text-[11px] font-mono leading-relaxed" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                Execute Elite AI Screen
            </button>
        </div>
        <div className="h-[750px] bg-[#111827] border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase text-center p-20 leading-loose tracking-widest">
            {analysis ? "Results Loaded" : "Complete Steps 1 & 2 to unlock Elite Analysis"}
        </div>
      </div>

      {/* SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90">
          <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-700 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div className="p-12 md:w-3/5">
                <h2 className="text-5xl font-black mb-6 leading-tight">Hire Smarter. <br/><span className="text-indigo-400 italic">Finish First.</span></h2>
                <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">Recruit-IQ Elite is the unfair advantage for high-performance teams. Automate your screening and save 20+ hours every week.</p>
                {!isSignedIn ? (
                    <SignUpButton mode="modal" forceRedirectUrl="/?signup=true">
                        <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs shadow-2xl hover:bg-indigo-500 transition-all">Create Account to Start Trial</button>
                    </SignUpButton>
                ) : (
                    <a href={finalStripeUrl} className="block w-full py-5 bg-indigo-600 text-center text-white font-black rounded-2xl uppercase text-xs shadow-2xl hover:bg-indigo-500 transition-all">Start 3-Day Free Trial</a>
                )}
                <button onClick={() => setShowLimitModal(false)} className="w-full mt-6 text-[10px] text-slate-600 uppercase font-black tracking-widest">Dismiss</button>
            </div>
            <div className="md:w-2/5 bg-[#111827] border-l border-slate-800 p-12 flex flex-col justify-center gap-10 text-center">
                <Zap className="w-12 h-12 text-indigo-400 mx-auto" /><h3 className="font-black text-white uppercase text-xl">Elite Access</h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">Unlimited Scans • Deep Gaps Analysis • Strategic Guides</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
