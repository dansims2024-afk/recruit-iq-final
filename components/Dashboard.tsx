"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Briefcase } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL EXTENDED SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com | (555) 123-4567

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const finalStripeUrl = userEmail 
    ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` 
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  // AUTO-UNLOCK & REDIRECT LOGIC
  useEffect(() => {
    const handleReturnFlow = async () => {
      if (!isLoaded || !isSignedIn) return;

      if (sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
        return;
      }

      if (!isPro) {
        await user?.reload();
        if (user?.publicMetadata?.isPro === true) {
          setToast({ show: true, message: "Elite Status Activated!", type: 'success' });
          setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
        }
      }
    };

    handleReturnFlow();
  }, [isSignedIn, isPro, isLoaded, user, finalStripeUrl]);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
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
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}... Return JSON.`;
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);
      setAnalysis(result);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
    } catch (err) { console.error("AI Error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <div className="hidden md:block">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Elite Candidate Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn && (
                <SignInButton mode="modal">
                    <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase">Log In</button>
                </SignInButton>
            )}
            <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border ${activeTab === 'jd' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border ${activeTab === 'resume' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>2. Resume</button>
            </div>
            <div className="flex gap-3 mb-4">
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold text-slate-400 border border-slate-700 hover:text-white">Load Full Samples</button>
            </div>
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} placeholder="Paste content here..." />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-xl hover:bg-indigo-500 transition-all">{loading ? "Analyzing..." : "Execute AI Screen →"}</button>
        </div>
        <div className="h-[750px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase gap-4 text-center p-10">Waiting for Candidate Data...</div>
            )}
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="p-10 md:w-3/5">
               <div className="mb-6"><img src="/logo.png" alt="Logo" className="h-10 w-auto" /></div>
               <h2 className="text-4xl font-black text-white mb-3">Hire In Seconds.</h2>
               {!isSignedIn ? (
                  <SignUpButton mode="modal" forceRedirectUrl={STRIPE_URL}>
                      <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="block w-full py-5 bg-indigo-600 text-white font-black rounded-xl uppercase text-xs">Start 3-Day Free Trial</button>
                  </SignUpButton>
               ) : (
                  <a href={finalStripeUrl} className="block w-full py-5 bg-indigo-600 text-center text-white font-black rounded-xl uppercase text-xs">Start 3-Day Free Trial</a>
               )}
               <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-500 mt-5 uppercase font-bold w-full">No thanks, I'll screen manually</button>
            </div>
            <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 flex-col items-center justify-center p-8"><span className="text-5xl">💎</span><h3 className="font-black text-white text-xl uppercase mt-4">Elite Access</h3></div>
          </div>
        </div>
      )}
    </div>
  );
}
