"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Check, CheckCircle, Upload, Zap, Info, Target, Loader2, FileText, Sparkles, Shield, Star, ArrowRight } from "lucide-react";

// YOUR CONFIRMED STRIPE LINK
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const isPro = user?.publicMetadata?.isPro === true;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  const getStripeUrl = () => {
    if (!user?.id) return STRIPE_URL;
    const url = new URL(STRIPE_URL);
    url.searchParams.set("client_reference_id", user.id); 
    if (userEmail) url.searchParams.set("prefilled_email", userEmail);
    return url.toString();
  };

  const jdReady = jdText.length > 50;
  const resumeReady = resumeText.length > 50;

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro && window.location.search.includes('signup=true')) {
        window.location.href = getStripeUrl();
    }
  }, [isLoaded, isSignedIn, isPro]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { 
        text = await file.text(); 
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } catch (err) { 
        console.error("Upload failed"); 
    } finally {
        setLoading(false);
    }
  };

  const executeScreen = async () => {
    if (!isPro) {
        setShowLimitModal(true);
        return;
    }
    setLoading(true);
    // This is where your @google/generative-ai logic connects
    setTimeout(() => {
        setAnalysisResult("AI Analysis Complete: Candidate matches 85% of core requirements. Key strengths in React and System Design observed.");
        setLoading(false);
    }, 2500);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
            {isPro && <span className="bg-indigo-500/20 text-indigo-400 text-[8px] px-2 py-1 rounded-full font-bold uppercase tracking-widest border border-indigo-500/30">Elite Access</span>}
        </div>
        {!isSignedIn ? <SignInButton mode="modal" /> : <UserButton afterSignOutUrl="/"/>}
      </div>

      {/* STEP PROGRESS TRACKER */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${jdReady ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-3">
                {jdReady ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <Info className="text-indigo-400 w-5 h-5" />}
                <span className="text-[10px] font-black uppercase tracking-widest">1. Job Specs</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full bg-emerald-500 transition-all duration-500 ${jdReady ? 'w-full' : 'w-0'}`}></div></div>
        </div>
        <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${resumeReady ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-3">
                {resumeReady ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <Target className="text-indigo-400 w-5 h-5" />}
                <span className="text-[10px] font-black uppercase tracking-widest">2. Talent Data</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full bg-emerald-500 transition-all duration-500 ${resumeReady ? 'w-full' : 'w-0'}`}></div></div>
        </div>
        <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${jdReady && resumeReady ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-4 mb-3">
                <Zap className={jdReady && resumeReady ? "text-indigo-500 w-5 h-5 fill-current" : "text-slate-600 w-5 h-5"} />
                <span className="text-[10px] font-black uppercase tracking-widest">3. Elite Report</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full bg-indigo-500 transition-all duration-500 ${jdReady && resumeReady ? 'w-full' : 'w-0'}`}></div></div>
        </div>
      </div>

      {/* MAIN INPUT AREA */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[650px] shadow-2xl relative overflow-hidden">
            <div className="flex gap-3 mb-6 relative z-10">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white hover:border-slate-600'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white hover:border-slate-600'}`}>2. Resume</button>
            </div>
            
            <div className="flex-1 relative mb-6 group">
                <textarea 
                    className="w-full h-full bg-[#0B1120] resize-none outline-none text-slate-300 p-8 border border-slate-800 rounded-2xl text-[11px] font-mono leading-relaxed transition-all focus:border-indigo-500/50" 
                    placeholder={activeTab === 'jd' ? "Paste the Job Description here..." : "Paste the Resume text or upload a .docx file..."}
                    value={activeTab === 'jd' ? jdText : resumeText} 
                    onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} 
                />
                <label className="absolute bottom-4 right-4 cursor-pointer bg-slate-800 p-3 rounded-xl hover:bg-indigo-600 transition-all shadow-xl">
                    <Upload className="w-4 h-4 text-white" />
                    <input type="file" className="hidden" accept=".docx,.txt" onChange={handleFileUpload} />
                </label>
            </div>

            <button 
                onClick={executeScreen} 
                disabled={loading || !jdReady || !resumeReady}
                className={`py-5 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-3 shadow-xl ${jdReady && resumeReady ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                {isPro ? "Execute Elite AI Screen" : "Unlock to Execute"}
            </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="h-[650px] bg-[#111827] border border-slate-800 rounded-[2.5rem] flex flex-col p-8 relative overflow-hidden shadow-2xl">
            {!isPro ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <Shield className="w-16 h-16 text-slate-800 mb-6" />
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Elite Intelligence Locked</h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-xs mb-8">Access advanced candidate scoring, key skill extraction, and automated screening reports.</p>
                    <button onClick={() => setShowLimitModal(true)} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700">View Upgrade Options</button>
                </div>
            ) : analysisResult ? (
                <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                    <div className="flex items-center gap-3 mb-8">
                        <Sparkles className="text-indigo-400 w-5 h-5" />
                        <h3 className="font-black uppercase text-xs tracking-widest">Elite Screening Report</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="p-6 bg-[#0B1120] rounded-2xl border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-300">
                            {analysisResult}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
                    <Star className="w-12 h-12 text-slate-700 mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Waiting for Execution...</span>
                </div>
            )}
        </div>
      </div>

      {/* UPGRADE MODAL */}
      {showLimitModal && !isPro && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center backdrop-blur-3xl bg-slate-950/90 p-4 animate-in fade-in zoom-in duration-300">
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-[3rem] text-center max-w-xl shadow-[0_0_100px_rgba(79,70,229,0.2)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                <Zap className="w-16 h-16 text-indigo-500 fill-current mx-auto mb-8 drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Unlock the <span className="text-indigo-500 italic">Elite</span> Tier</h2>
                <p className="text-slate-400 mb-10 text-sm leading-relaxed">Join top recruiters using Recruit-IQ to screen candidates 10x faster with AI-driven intelligence and deep reporting.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-10 text-left">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-300 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                        <Check className="text-emerald-500 w-4 h-4" /> AI Document Parsing
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-300 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                        <Check className="text-emerald-500 w-4 h-4" /> Unlimited Screens
                    </div>
                </div>

                <a href={getStripeUrl()} className="inline-flex items-center gap-3 bg-indigo-600 px-12 py-5 rounded-2xl font-black uppercase text-xs shadow-2xl hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-95 group">
                    Start 3-Day Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <button onClick={() => setShowLimitModal(false)} className="mt-8 block text-[10px] w-full text-slate-500 uppercase font-black tracking-widest hover:text-white transition-colors">Maybe Later</button>
            </div>
        </div>
      )}
    </div>
  );
}
