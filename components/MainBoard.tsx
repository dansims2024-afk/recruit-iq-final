"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Download, Zap } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

const MainBoard = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
        showToast("Scan limit reached. Upgrade to Pro!", "info");
        return;
    }
    
    setLoading(true);
    
    // --- KEY FIX ---
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      showToast("Vercel error: API Key not found in Environment Variables.", "error");
      setLoading(false);
      return;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze JD: ${jdText} and Resume: ${resumeText}. Return ONLY JSON: {"candidate_name": "Name", "score": 85, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`
            }]
          }]
        })
      });

      if (!response.ok) throw new Error("API Rejected Key");

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const cleanJson = JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]);
      
      setAnalysis(cleanJson);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Generated!");
    } catch (err: any) {
      showToast("AI Engine Error. Check API Key in Vercel.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border ${toast.type === 'error' ? 'bg-rose-500/90' : 'bg-indigo-600/90'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-white">{toast.message}</p>
        </div>
      )}

      {/* HEADER - CLERK WARNINGS FIXED */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center font-black">IQ</div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE" : `TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal" fallbackRedirectUrl="/">
                    <button className="bg-indigo-600 px-5 py-2 rounded-lg text-xs font-bold">Log In</button>
                </SignInButton>
            ) : <UserButton fallbackRedirectUrl="/"/>}
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[600px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}>JD</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}>Resume</button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="mt-4 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-2xl flex items-center justify-center gap-3 transition-all hover:bg-indigo-500">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {loading ? "Crunching..." : "Execute Elite Screen"}
            </button>
        </div>

        {/* RESULTS */}
        <div className="h-[600px] overflow-y-auto space-y-6">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                  <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-black mb-4">{analysis.score}%</div>
                  <div className="text-white font-bold text-xl mb-4 uppercase">{analysis.candidate_name}</div>
                  <button onClick={() => {}} className="bg-slate-800 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 mx-auto flex items-center gap-2">
                    <Download className="w-3 h-3" /> Download Intelligence Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase">
                Awaiting Data Input
              </div>
            )}
        </div>
      </div>

      <footer className="text-center text-[10px] uppercase font-bold text-slate-500 pb-10">
        &copy; 2026 Recruit-IQ • <button onClick={() => setShowSupportModal(true)} className="underline hover:text-white">Contact Support</button>
      </footer>

      {showSupportModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full">
            <h2 className="text-xl font-black mb-6 uppercase text-center">System Support</h2>
            <textarea className="w-full h-32 bg-[#0B1120] border border-slate-800 rounded-xl p-4 text-xs text-white outline-none mb-4" placeholder="How can we help?" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => {showToast("Sent!"); setShowSupportModal(false);}} className="flex-1 py-4 bg-indigo-600 rounded-xl font-bold uppercase text-xs">Send</button>
              <button onClick={() => setShowSupportModal(false)} className="px-6 py-4 bg-slate-800 rounded-xl font-bold uppercase text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainBoard;
