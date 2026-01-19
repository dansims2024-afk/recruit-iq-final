"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, FileText, User, Download, Zap, Shield, HelpCircle, Mail, Sparkles, Star, Lock } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- THE VALUE-DRIVEN SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate.
- Lead the migration from legacy monolithic structures to modern gRPC architecture.
- Optimize C++ and Go-based trading engines for sub-millisecond latency.
- Establish CI/CD best practices and mentor a global team of 15+ senior engineers.

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech or Capital Markets.
- Deep expertise in AWS Cloud Architecture.
- Proven track record with Kubernetes, Docker, Kafka, and Terraform.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | 2018 - Present
- Architected serverless data pipelines handling 5TB of daily market data.
- Reduced infrastructure costs by 35% through AWS Graviton migration.
- Led team of 15 engineers in re-writing core risk engine, improving speed by 400%.

InnovaTrade | Senior Staff Engineer | 2014 - 2018
- Built core execution engine in Go, achieving 50% reduction in order latency.
- Implemented automated failover protocols preventing over $10M in slippage.`;

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
  
  // Appends both email and User ID to Stripe for easier mapping later
  const finalStripeUrl = userEmail 
    ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}&client_reference_id=${user?.id}` 
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  // INSTANT UNLOCK LOGIC
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

  // FIXED: UPLOAD DOCX LOGIC
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
      showToast("Document loaded successfully!");
    } catch (err) {
      showToast("Error reading file. Try copy/pasting.", "error");
    }
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    if (jdText.length < 50 || resumeText.length < 50) {
      showToast("Please provide more text for analysis.", "error");
      return;
    }
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Return JSON only: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);
      setAnalysis(result);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
    } catch (err) { showToast("AI Engine Error.", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl bg-indigo-600 shadow-2xl border border-indigo-400">
          <p className="text-xs font-bold uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <div className="hidden md:block">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Elite Candidate Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border flex items-center gap-2 ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro && <Zap className="w-3 h-3 fill-current" />}
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume</button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700">
                Upload Docx / PDF
                <input type="file" accept=".docx,.pdf" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Premium samples loaded!");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Value Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed focus:border-indigo-500 transition-colors"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste text here or upload document above..."
            />
            
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
              {loading ? "Analyzing..." : "Execute Elite AI Screen →"}
            </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="h-[750px] overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4 shadow-xl">{analysis.score}%</div>
                  <h3 className="uppercase text-[9px] font-bold tracking-widest text-slate-500 mb-1">Match Score</h3>
                  <div className="text-white font-bold text-xl mb-6">{analysis.candidate_name}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-emerald-400 font-bold uppercase mb-4 text-[9px] flex items-center gap-2"><Check className="w-3 h-3" /> Strengths</h4>
                    <div className="space-y-3">{analysis.strengths.map((s: string, i: number) => <p key={i} className="text-slate-200">• {s}</p>)}</div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-rose-400 font-bold uppercase mb-4 text-[9px] flex items-center gap-2"><Shield className="w-3 h-3" /> Gaps</h4>
                    <div className="space-y-3">{analysis.gaps.map((g: string, i: number) => <p key={i} className="text-slate-200">• {g}</p>)}</div>
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-8 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[9px] mb-6 flex items-center gap-2"><HelpCircle className="w-3 h-3" /> Strategic Interview Guide</h4>
                  <div className="space-y-4">{analysis.questions.map((q: string, i: number) => <div key={i} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 text-[11px] leading-relaxed text-slate-300">"{q}"</div>)}</div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase gap-6 text-center p-12">
                <Zap className="w-8 h-8 opacity-20" />
                <p>Waiting for Candidate Data...</p>
              </div>
            )}
        </div>
      </div>

      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center text-[10px] uppercase font-bold text-slate-500">
        <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400 transition-colors">Support</button>
        <p className="mt-4 tracking-widest">&copy; {new Date().getFullYear()} Recruit-IQ. Built for Elite Recruiters.</p>
      </footer>

      {/* --- PREMIER SALES MODAL (High Conversion) --- */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in duration-500">
          <div className="relative w-full max-w-4xl animate-in zoom-in-95 duration-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] blur-3xl opacity-40 animate-pulse"></div>
            
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-12 md:w-3/5 flex flex-col justify-center">
                 <div className="mb-8"><img src="/logo.png" alt="Logo" className="h-10 w-auto" /></div>
                 <h2 className="text-5xl font-black text-white mb-4 leading-[1.05] tracking-tighter">
                   Hire Smarter. <br/> 
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 italic">
                    Finish First.
                   </span>
                 </h2>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                   Recruit-IQ Elite is the unfair advantage for high-performance teams. Stop reading resumes; start seeing talent.
                 </p>
                 
                 <div className="space-y-4">
                    <a href={finalStripeUrl} className="group block w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-center text-white font-black rounded-2xl uppercase tracking-wider text-xs shadow-2xl shadow-blue-500/40 hover:scale-[1.02] transition-all">
                        <span className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 fill-white" /> Start 3-Day Free Trial
                        </span>
                    </a>
                    <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-500 hover:text-white uppercase font-black w-full tracking-[0.2em] transition-colors py-2">
                        Dismiss
                    </button>
                 </div>
              </div>
              
              <div className="md:w-2/5 bg-[#111827]/80 border-l border-slate-800 p-12 flex flex-col justify-center relative">
                 <div className="space-y-8 relative z-10">
                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                            <Zap className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-1">Elite Speed</h4>
                            <p className="text-slate-400 text-[10px] leading-relaxed">Analyze 50 resumes in the time it takes to read one.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-500/10">
                            <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-1">Precision Screening</h4>
                            <p className="text-slate-400 text-[10px] leading-relaxed">Match niche skillsets to complex JDs with 99% accuracy.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                            <Star className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-1">Elite Access</h4>
                            <p className="text-slate-400 text-[10px] leading-relaxed">Unlimited scans. Unlimited intelligence reports.</p>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl text-center">
            <h2 className="text-2xl font-black mb-6 uppercase text-white">Direct Support</h2>
            <textarea required className="w-full h-40 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 text-[12px] text-white outline-none resize-none mb-6 focus:border-indigo-500 transition-colors" placeholder="Briefly describe your issue..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={handleSupportSubmit} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black uppercase text-[10px] text-white transition-all shadow-xl shadow-indigo-600/30">Send Email</button>
              <button onClick={() => setShowSupportModal(false)} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-black uppercase text-[10px] text-white transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
