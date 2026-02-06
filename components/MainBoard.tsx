"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, FileText, User, Download, Zap, Shield, HelpCircle } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect\nLOCATION: New York, NY (Hybrid)\nSALARY: $240,000 - $285,000\n\nREQUIREMENTS:\n- 12+ years of engineering.\n- Expertise in AWS, Kubernetes, and Go.`;
const SAMPLE_RESUME = `MARCUS VANDELAY\nPrincipal Software Architect\n\nEXPERIENCE:\n- Global Quant Solutions: Architected data pipelines handling 5TB daily.\n- Reduced costs by 35% using AWS Graviton.`;

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

  // Elite Status Check
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

  // Auth & Stripe Sync Logic
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
          showToast("Elite Membership Activated!", "success");
        }
      }
    };
    handleReturnFlow();
  }, [isSignedIn, isPro, isLoaded, user, finalStripeUrl]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = () => {
    showToast("Support message sent! We'll be in touch.", "success");
    setSupportMessage('');
    setShowSupportModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else {
        text = await file.text();
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} uploaded successfully!`);
    } catch (err) {
      showToast("Upload failed.", "error");
    }
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro && scanCount >= 3)) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) {
      showToast("Both Job Description and Resume are required.", "error");
      return;
    }
    
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, summary, 3 strengths, 3 gaps, 5 deep-dive interview questions, and a short outreach email. Return ONLY JSON: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`;
      
      const response = await fetch(url, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) 
      });
      
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
    } catch (err) {
      showToast("AI Engine Error.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-top duration-300 ${toast.type === 'error' ? 'bg-rose-500/90 border-rose-400' : 'bg-indigo-600/90 border-indigo-400'}`}>
          <p className="text-xs font-bold uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 fill-white" />
            </div>
            <div className="hidden md:block">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Elite Candidate Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border flex items-center gap-2 ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro && <Zap className="w-3 h-3 fill-current" />}
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${Math.max(0, 3 - scanCount)} LEFT`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal">
                    <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                        Log In
                    </button>
                </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      {/* QUICK START WIZARD */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`p-6 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${jdReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                {jdReady && <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">Ready</span>}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Requirements</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Paste the Job Description.</p>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-6 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${resumeReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                {resumeReady && <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">Ready</span>}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Candidate Data</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Upload or paste resume.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Intelligence</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Generate AI screening report.</p>
          </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-6 md:p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  <FileText className="w-3 h-3" /> 1. Job Description
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  <User className="w-3 h-3" /> 2. Resume
                </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700 transition-all">
                Upload Docx
                <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Samples loaded!");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white">Load Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed focus:border-indigo-500 transition-colors"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste JD here..." : "Paste Resume here..."}
            />
            
            <button 
              onClick={handleScreen} 
              disabled={loading} 
              className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
              {loading ? "Crunching Data..." : "Execute Elite AI Screen →"}
            </button>
        </div>

        {/* RESULTS */}
        <div className="h-[700px] overflow-y-auto space-y-6 pr-2">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4 shadow-xl shadow-indigo-900/40">{analysis.score}%</div>
                  <div className="text-white font-bold text-xl mb-6">{analysis.candidate_name}</div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{analysis.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-emerald-400 font-bold uppercase mb-4 text-[9px] flex items-center gap-2"><Check className="w-3 h-3" /> Strengths</h4>
                    {analysis.strengths.map((s: any, i: number) => <p key={i} className="mb-2">• {s}</p>)}
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-rose-400 font-bold uppercase mb-4 text-[9px] flex items-center gap-2"><Shield className="w-3 h-3" /> Gaps</h4>
                    {analysis.gaps.map((g: any, i: number) => <p key={i} className="mb-2">• {g}</p>)}
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-8 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[9px] mb-6 flex items-center gap-2"><HelpCircle className="w-3 h-3" /> Interview Guide</h4>
                  {analysis.questions.map((q: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 text-[11px] mb-3">"{q}"</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest gap-6">
                <Zap className="w-8 h-8 opacity-20" />
                <p>Waiting for Intelligence</p>
              </div>
            )}
        </div>
      </div>

      {/* SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="relative w-full max-w-4xl bg-[#0F172A] border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-10 md:w-3/5">
                 <h2 className="text-5xl font-black text-white mb-4 leading-none tracking-tighter">Hire Your Next Star <br/> <span className="text-indigo-400">In Seconds.</span></h2>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed">Unlock unlimited resume screening and AI email outreach generator.</p>
                 
                 {!isSignedIn ? (
                    <SignUpButton mode="modal" forceRedirectUrl={STRIPE_URL}>
                        <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="block w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs shadow-2xl">Start 3-Day Free Trial</button>
                    </SignUpButton>
                 ) : (
                    <a href={finalStripeUrl} className="block w-full py-5 bg-indigo-600 text-center text-white font-black rounded-2xl uppercase text-xs shadow-2xl">Start 3-Day Free Trial</a>
                 )}

                 <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-500 mt-6 hover:text-white underline w-full uppercase font-bold">No thanks, I'll screen manually</button>
              </div>
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 flex-col items-center justify-center p-12 text-center text-xs text-slate-400 space-y-4">
                 <Zap className="w-10 h-10 text-indigo-400 mb-4" />
                 <p>✓ Unlimited Scans</p>
                 <p>✓ Elite Candidate Reports</p>
                 <p>✓ Priority Support</p>
              </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full text-center">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Support</h2>
            <textarea 
              className="w-full h-40 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 text-[12px] text-white outline-none mb-6" 
              placeholder="How can we help?" 
              value={supportMessage} 
              onChange={(e) => setSupportMessage(e.target.value)} 
            />
            <div className="flex gap-4">
              <button onClick={handleSupportSubmit} className="flex-1 py-4 bg-indigo-600 rounded-xl font-black uppercase text-[10px]">Send</button>
              <button onClick={() => setShowSupportModal(false)} className="px-8 py-4 bg-slate-800 rounded-xl font-black uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
