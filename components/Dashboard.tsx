"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Download, Zap, Shield, HelpCircle, Sparkles, Star, Check, Info, Target, Upload, Mail, Copy } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  
  // SECURE REDIRECT LOGIC: Links the new user ID to the Stripe transaction
  const getStripeUrl = () => {
    if (!user?.id) return STRIPE_URL;
    const url = new URL(STRIPE_URL);
    url.searchParams.set("client_reference_id", user.id);
    if (user?.primaryEmailAddress?.emailAddress) {
        url.searchParams.set("prefilled_email", user.primaryEmailAddress.emailAddress);
    }
    return url.toString();
  };

  // AUTO-REDIRECT AFTER SIGNUP: Sends user to Stripe once Clerk login is finished
  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro) {
        if (window.location.search.includes('signup=true') || sessionStorage.getItem('pending_stripe') === 'true') {
            sessionStorage.removeItem('pending_stripe');
            window.location.href = getStripeUrl();
        }
    }
  }, [isLoaded, isSignedIn, isPro]);

  useEffect(() => {
    setScanCount(parseInt(localStorage.getItem('recruit_iq_scans') || '0'));
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast("Document Loaded");
    } catch (err) { showToast("Error reading file."); } finally { setLoading(false); }
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (jdText.length < 50 || resumeText.length < 50) { showToast("More data required."); return; }
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Return JSON only: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      const resultText = data.candidates[0].content.parts[0].text;
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAnalysis(JSON.parse(jsonMatch[0]));
        if (!isPro) {
          const newCount = scanCount + 1;
          setScanCount(newCount);
          localStorage.setItem('recruit_iq_scans', newCount.toString());
        }
      }
    } catch (err) { showToast("AI Engine Error."); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      {/* HEADER: FIXED SIGN-IN PLACEMENT */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Sign In</button>
              </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume</button>
            </div>
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono mb-6 leading-relaxed" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <button onClick={handleScreen} className="py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-500 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />} Execute Elite Screen
            </button>
        </div>
        <div className="h-[750px] overflow-y-auto bg-slate-900/30 rounded-[2.5rem] border border-slate-800/50 p-8 flex flex-col items-center justify-center">
            {analysis ? <pre className="text-[10px] font-mono text-slate-400 whitespace-pre-wrap">{JSON.stringify(analysis, null, 2)}</pre> : <Sparkles className="w-12 h-12 opacity-10" />}
        </div>
      </div>

      {/* SALES MODAL: CORRECTED SIGN-UP FLOW */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90">
          <div className="relative w-full max-w-4xl bg-[#0F172A] border border-slate-700 rounded-[2.5rem] shadow-2xl p-12 text-center">
             <h2 className="text-5xl font-black text-white mb-6">Unlock <span className="text-indigo-400 italic">Elite</span> Tier</h2>
             <p className="text-slate-400 mb-10 max-w-lg mx-auto">To start your 3-day trial, please create your account first. You will be redirected to payment automatically after sign-up.</p>
             
             {!isSignedIn ? (
                <SignUpButton mode="modal" forceRedirectUrl="/?signup=true">
                    <button onClick={() => sessionStorage.setItem('pending_stripe', 'true')} className="inline-block bg-indigo-600 px-12 py-5 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-2xl hover:bg-indigo-500 transition-all">Create Account & Start Trial</button>
                </SignUpButton>
             ) : (
                <a href={getStripeUrl()} className="inline-block bg-indigo-600 px-12 py-5 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-2xl hover:bg-indigo-500 transition-all">Proceed to Checkout</a>
             )}
             
             <button onClick={() => setShowLimitModal(false)} className="block w-full text-[10px] text-slate-500 hover:text-white uppercase font-black mt-8">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
