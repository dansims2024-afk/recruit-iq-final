"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, Download, Zap, Shield, HelpCircle, Sparkles, Star, FileText, Lock } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate.
- Lead the migration from legacy structures to modern gRPC architecture.
- Optimize C++ and Go-based trading engines for sub-millisecond latency.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}${userEmail ? `&prefilled_email=${encodeURIComponent(userEmail)}` : ''}` 
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      if (isSignedIn && !isPro) {
        await user?.reload();
        if (user?.publicMetadata?.isPro === true) {
          showToast("Elite Status Activated!", "success");
        }
      }
    };
    if (isLoaded) checkStatus();
  }, [isSignedIn, isPro, isLoaded, user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = (e: any) => {
    e.preventDefault();
    window.location.href = `mailto:hello@corecreativityai.com?subject=Support&body=${encodeURIComponent(supportMessage)}`;
    setShowSupportModal(false);
    setSupportMessage('');
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
      showToast("Document Loaded!");
    } catch (err) { showToast("Use .docx for uploads", "error"); }
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    setLoading(true);
    // AI Screening logic would be here
    setLoading(false);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-black uppercase tracking-tighter hidden md:block">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border flex items-center gap-2 ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal">
                    <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                        Log In
                    </button>
                </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume</button>
            </div>
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">
                Upload Docx
                <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Value Samples</button>
            </div>
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} placeholder="Paste text here..." />
            <button onClick={handleScreen} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-2xl hover:bg-indigo-500 transition-all">Execute Elite AI Screen →</button>
        </div>

        <div className="h-[750px] overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                 {/* Results Rendered Here */}
              </div>
            ) : (
              <div className="h-full bg-[#111827] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto">
                 <div className="mb-8 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-black uppercase tracking-tighter">Quick Start Guide</h3>
                 </div>
                 <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-700 shrink-0">01</div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Input Job Data</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">Paste your Job Description into the first tab or upload a docx file.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-700 shrink-0">02</div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Provide Resume</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">Switch tabs to paste the candidate profile or upload for parsing.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-700 shrink-0">03</div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Run Elite Screen</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">Execute the AI to uncover gaps, strengths, and interview guides.</p>
                        </div>
                    </div>
                 </div>
              </div>
            )}
        </div>
      </div>

      <footer className="mt-12 border-t border-slate-800/50 pt-10 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400 transition-colors">Support</button>
            <p>&copy; {new Date().getFullYear()} Recruit-IQ. Built by Core Creativity AI.</p>
        </div>
      </footer>

      {/* HARD-WALL SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in duration-500">
          <div className="relative w-full max-w-4xl animate-in zoom-in-95 duration-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] blur-3xl opacity-40 animate-pulse"></div>
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-12 md:w-3/5 flex flex-col justify-center text-center md:text-left">
                 <h2 className="text-5xl font-black text-white mb-4 leading-tight tracking-tighter">Hire Smarter. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 italic text-6xl">Finish First.</span></h2>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Recruit-IQ Elite is the unfair advantage for high-performance teams. Stop reading; start screening.</p>
                 <a href={finalStripeUrl} className="group block w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-center text-white font-black rounded-2xl uppercase tracking-wider text-xs shadow-2xl shadow-blue-500/40 hover:scale-[1.02] transition-all">
                    <span className="flex items-center justify-center gap-2"><Sparkles className="w-4 h-4 fill-white" /> Start 3-Day Free Trial</span>
                 </a>
                 <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-500 hover:text-white uppercase font-black w-full mt-6">Dismiss</button>
              </div>
              <div className="md:w-2/5 bg-[#111827]/80 border-l border-slate-800 p-12 flex flex-col justify-center gap-8 relative text-center">
                    <Zap className="w-12 h-12 text-indigo-400 mx-auto" />
                    <h3 className="font-black text-white uppercase text-xl">Elite Access</h3>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">Unlimited Scans • Deep Gaps Analysis • Strategic Guides</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl text-center text-white">
            <h2 className="text-2xl font-black mb-6 uppercase">Support</h2>
            <textarea required className="w-full h-40 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 text-[12px] text-white outline-none resize-none mb-6 focus:border-indigo-500 transition-colors" placeholder="How can we help?" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={handleSupportSubmit} className="flex-1 py-4 bg-indigo-600 rounded-xl font-black uppercase text-[10px]">Send Email</button>
              <button onClick={() => setShowSupportModal(false)} className="px-8 py-4 bg-slate-800 rounded-xl font-black uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
