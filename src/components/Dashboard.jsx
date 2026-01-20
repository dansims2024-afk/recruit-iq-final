"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, UserButton, useClerk, SignOutButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Download, Zap, Shield, HelpCircle, Sparkles, 
  Star, Check, Upload, Mail, Copy, ArrowRight, LogOut 
} from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect\nLOCATION: New York, NY\nSALARY: $240k - $285k\n\nWe need a visionary Architect to lead the evolution of our next-gen high-frequency trading platform using AWS EKS and gRPC.`;
const SAMPLE_RESUME = `MARCUS VANDELAY\nPrincipal Architect | New York | m.vandelay@email.com\n\nStrategic leader with 14 years building low-latency financial systems. Expert in AWS, C++, and Go.`;

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
  const [toast, setToast] = useState({ show: false, message: '' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  
  // --- UNIVERSAL ACTION HANDLER ---
  const handleUniversalAction = () => {
    if (!isSignedIn) {
        // If guest, force login
        clerk.redirectToSignIn();
    } else {
        // If signed in, go to Stripe
        if (!user?.id) window.location.href = STRIPE_URL;
        const url = new URL(STRIPE_URL);
        url.searchParams.set("client_reference_id", user.id);
        if (user?.primaryEmailAddress?.emailAddress) {
            url.searchParams.set("prefilled_email", user.primaryEmailAddress.emailAddress);
        }
        window.location.href = url.toString();
    }
  };

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

  // --- GATEKEEPER UI (If Signed In + Not Pro) ---
  if (isSignedIn && !isPro) {
    return (
        <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-6 text-white">
            <div className="max-w-md w-full bg-[#111827] border border-slate-700 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <h2 className="text-3xl font-black text-white mb-2 mt-4">Account Ready!</h2>
                <p className="text-slate-400 text-sm mb-8">One last step to unlock Elite access.</p>
                
                {/* SAFE MODE BUTTON: NO CONDITIONALS */}
                <button 
                    onClick={handleUniversalAction}
                    className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all"
                >
                    Proceed to Checkout <ArrowRight className="w-4 h-4 inline ml-2" />
                </button>

                <div className="mt-6">
                    <SignOutButton>
                        <button className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
                            <LogOut className="w-3 h-3" /> Sign Out
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* --- STATUS BAR --- */}
      <div className={`fixed top-0 left-0 w-full ${isSignedIn ? 'bg-green-600' : 'bg-yellow-600'} text-black font-bold text-center text-xs py-2 z-[9999]`}>
         STATUS: {isSignedIn ? "SIGNED IN" : "GUEST MODE"} (SAFE MODE)
      </div>

      {toast.show && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl bg-indigo-600 shadow-2xl border border-indigo-400 font-bold uppercase text-[10px]">{toast.message}</div>}

      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
            {!isPro && !isSignedIn && (
                <button onClick={() => setShowLimitModal(true)} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-current" /> Upgrade
                </button>
            )}
            {!isSignedIn ? (
                <button onClick={() => clerk.redirectToSignIn()} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700">
                    Sign In
                </button>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl relative">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume</button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700 transition-colors">
                <Upload className="w-3 h-3 inline mr-2" /> Upload .docx
                <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Samples Loaded");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Samples</button>
            </div>

            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono mb-6 leading-relaxed" placeholder={activeTab === 'jd' ? "Paste JD..." : "Paste Resume..."} value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-500 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />} Execute Elite AI Screen
            </button>
        </div>

        <div className="h-[750px] overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4 shadow-xl">{analysis.score}%</div>
                  <div className="text-white font-bold text-xl mb-4">{analysis.candidate_name}</div>
                </div>
                <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[2.5rem]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Mail className="w-3 h-3" /> Outreach Email</h4>
                    <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Copied!")}} className="p-2 hover:bg-indigo-500/20 rounded-lg"><Copy className="w-4 h-4 text-indigo-400" /></button>
                  </div>
                  <div className="bg-[#0B1120] p-6 rounded-2xl border border-slate-800 text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap">{analysis.outreach_email}</div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase gap-6 text-center p-12 opacity-50">
                <Sparkles className="w-8 h-8 opacity-20" />
                <p>Waiting for Elite AI Screen...</p>
              </div>
            )}
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-[#0F172A] border-2 border-slate-700 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row text-left">
              <div className="p-12 md:w-3/5 flex flex-col justify-center relative">
                 <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tighter italic">Hire Smarter. <br/><span className="text-indigo-400 not-italic">Finish First.</span></h2>
                 <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-sm">Join top recruiters using Recruit-IQ Elite to screen candidates 10x faster.</p>
                 
                 {/* UNIVERSAL BUTTON: ALWAYS VISIBLE */}
                 <button 
                    onClick={handleUniversalAction}
                    className="inline-flex items-center gap-3 bg-indigo-600 px-12 py-5 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-lg hover:bg-indigo-500 transition-all border border-indigo-400 hover:scale-[1.05]"
                 >
                    CONTINUE TO ACCESS <ArrowRight className="w-4 h-4" />
                 </button>
                 
                 <button onClick={() => setShowLimitModal(false)} className="text-[10px] text-slate-500 hover:text-white uppercase font-black w-fit tracking-[0.2em] mt-10 transition-colors uppercase block">Dismiss</button>
              </div>
              
              <div className="md:w-2/5 bg-slate-900/80 p-12 border-l border-slate-800 flex flex-col justify-center gap-10">
                 <div className="flex gap-4 items-start"><Zap className="text-indigo-400 w-6 h-6 shrink-0 fill-current" /><div><h4 className="text-white font-bold text-[10px] uppercase tracking-widest">Elite Speed</h4></div></div>
                 <div className="flex gap-4 items-start"><Shield className="text-purple-400 w-6 h-6 shrink-0" /><div><h4 className="text-white font-bold text-[10px] uppercase tracking-widest">Precision Match</h4></div></div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
