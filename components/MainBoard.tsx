"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, 
  Copy, 
  Check, 
  FileText, 
  User, 
  Download, 
  Send, 
  Zap, 
  Shield, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Mail
} from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- ELITE SAMPLES ---
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
- Proven track record with Kubernetes, Docker, Kafka, and Terraform.
- Strong proficiency in Go (Golang), C++, and Python.`;

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
- Implemented automated failover protocols preventing over $10M in slippage.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, Rust.
- Cloud: AWS (EKS, Lambda, Aurora), Terraform, Docker, Kubernetes.`;

export default function MainBoard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
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
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const finalStripeUrl = userEmail 
    ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` 
    : STRIPE_URL;

  // --- PERSISTENCE & AUTO-REDIRECT ---
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  useEffect(() => {
    const handleReturnFlow = async () => {
      if (!isLoaded) return;

      // Intercept logic: If user just logged in after clicking Upgrade
      if (isSignedIn && sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
        return;
      }

      if (isSignedIn && !isPro) {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        showToast("PDF parsing requires Elite Access. Use .docx or paste text.", "info");
        return;
      } else {
        text = await file.text();
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} integrated!`);
    } catch (err) {
      showToast("System failed to read file.", "error");
    }
  };

  // --- ELITE PDF GENERATION ---
  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();

    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26); doc.setFont("helvetica", "bold");
    doc.text("INTELLIGENCE REPORT", 20, 30);
    doc.setFontSize(10); doc.text("RECRUIT-IQ • ELITE ALGORITHM V2.0", 20, 40);

    doc.setFillColor(30, 41, 59); doc.roundedRect(15, 60, 180, 40, 5, 5, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22);
    doc.text(cName, 25, 85);
    doc.setTextColor(129, 140, 248); doc.setFontSize(30);
    doc.text(`${analysis.score}%`, 160, 88);

    doc.setTextColor(148, 163, 184); doc.setFontSize(10); doc.text("EXECUTIVE SUMMARY", 20, 115);
    doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 125);

    let currentY = 125 + (summaryLines.length * 7) + 20;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 211, 153); doc.text("MATCH STRENGTHS", 20, currentY);
    doc.setTextColor(251, 113, 133); doc.text("IDENTIFIED GAPS", 110, currentY);

    doc.setFont("helvetica", "normal"); doc.setTextColor(203, 213, 225);
    const strengths = analysis.strengths || [];
    const gaps = analysis.gaps || [];
    for (let i = 0; i < 3; i++) {
        if (strengths[i]) doc.text(`+ ${strengths[i]}`, 20, currentY + 10 + (i * 8), {maxWidth: 80});
        if (gaps[i]) doc.text(`- ${gaps[i]}`, 110, currentY + 10 + (i * 8), {maxWidth: 80});
    }

    doc.save(`RecruitIQ_${cName}_Report.pdf`);
  };

  const handleScreen = async () => {
    if ((!isPro && scanCount >= 3)) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) {
      showToast("Load JD and Resume to execute.", "error");
      return;
    }
    
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    try {
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
      showToast("Elite Intelligence Captured!");
    } catch (err) {
      showToast("API Sync Error. Verify Vercel Variables.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center flex-col gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px]">Booting Recruit-IQ Systems</p>
    </div>
  );

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* TOAST SYSTEM */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[500] px-8 py-4 rounded-full shadow-2xl border backdrop-blur-md animate-in slide-in-from-top duration-500 ${toast.type === 'error' ? 'bg-rose-500/80 border-rose-400' : 'bg-indigo-600/80 border-indigo-400'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
            <Zap className="w-3 h-3 fill-white" /> {toast.message}
          </p>
        </div>
      )}

      {/* NAVIGATION HEADER */}
      <div className="flex justify-between items-center mb-12 border-b border-slate-800/50 pb-8">
        <div className="flex items-center gap-5">
            <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <div className="hidden md:block">
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Enterprise Grade Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className={`px-5 py-2.5 rounded-full text-[10px] font-black border flex items-center gap-3 transition-all ${isPro ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-indigo-500 text-indigo-400 bg-indigo-500/5'}`}>
                {isPro ? <Shield className="w-3 h-3 fill-current" /> : <TrendingUp className="w-3 h-3" />}
                {isPro ? "ELITE UNLOCKED" : `TRIAL SCANS: ${3 - scanCount} REMAINING`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal">
                    <button className="bg-white text-black hover:bg-indigo-50 px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl">
                        Agent Login
                    </button>
                </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      {/* THE WIZARD TRACKER */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`group p-8 rounded-[2rem] border cursor-pointer transition-all hover:scale-[1.02] ${jdReady ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border ${jdReady ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>01</div>
                {jdReady && <Check className="w-5 h-5 text-emerald-500" />}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-[0.2em] mb-2 text-slate-300">Phase One</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Requirements Ingest</p>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`group p-8 rounded-[2rem] border cursor-pointer transition-all hover:scale-[1.02] ${resumeReady ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border ${resumeReady ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>02</div>
                {resumeReady && <Check className="w-5 h-5 text-emerald-500" />}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-[0.2em] mb-2 text-slate-300">Phase Two</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Candidate Blueprint</p>
          </div>
          <div className={`p-8 rounded-[2rem] border transition-all ${analysis ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800 opacity-50'}`}>
              <div className="flex justify-between items-center mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border ${analysis ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>03</div>
                {analysis && <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-[0.2em] mb-2 text-slate-300">Phase Three</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">AI Synthesis</p>
          </div>
      </div>

      {/* CORE WORKSPACE */}
      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* INPUT HUB */}
        <div className="bg-[#111827] p-8 md:p-10 rounded-[3rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative">
            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-900/50' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-white'}`}>
                  <FileText className="w-4 h-4" /> Requirements
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-900/50' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-white'}`}>
                  <User className="w-4 h-4" /> Candidate
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <label className="text-center cursor-pointer bg-slate-800/30 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-800 transition-all border border-dashed border-slate-700">
                Upload .Docx
                <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Mock data injected.", "info");}} className="bg-slate-800/30 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400 border border-dashed border-slate-700 hover:bg-slate-800 transition-all">Mock Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-8 border border-slate-800 rounded-[2rem] text-xs font-mono leading-loose focus:border-indigo-500/50 transition-all custom-scrollbar"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Awaiting Job Description parameters..." : "Awaiting Candidate data stream..."}
            />
            
            <button 
              onClick={handleScreen} 
              disabled={loading} 
              className="mt-8 py-6 rounded-[2rem] font-black uppercase text-xs bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-900/40 flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white" />}
              {loading ? "Synthesizing Data..." : "Engage AI Intelligence Engine"}
            </button>
        </div>

        {/* OUTPUT HUB */}
        <div className="h-[850px] overflow-y-auto space-y-8 pr-4 custom-scrollbar pb-20">
            {analysis ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                
                {/* HERO MATCH CARD */}
                <div className="bg-[#111827] border border-slate-800 p-12 rounded-[3.5rem] text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                  <div className="w-32 h-32 mx-auto rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-5xl font-black mb-6 shadow-2xl shadow-indigo-900/60 rotate-3 group-hover:rotate-0 transition-transform">
                    {analysis.score}%
                  </div>
                  <h3 className="uppercase text-[10px] font-black tracking-[0.4em] text-slate-500 mb-2">Algorithm Rating</h3>
                  <div className="text-white font-black text-2xl mb-8 tracking-tighter uppercase">{analysis.candidate_name}</div>
                  
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase border border-slate-700 transition-all flex items-center gap-3 mx-auto shadow-xl">
                    <Download className="w-4 h-4" /> Export Intelligence PDF
                  </button>
                </div>

                {/* SWOT GRID */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2.5rem] text-[11px]">
                    <h4 className="text-emerald-400 font-black uppercase mb-6 text-[10px] tracking-widest flex items-center gap-3">
                        <Check className="w-4 h-4" /> Core Strengths
                    </h4>
                    <div className="space-y-4">
                        {analysis.strengths.map((s: string, i: number) => (
                          <div key={i} className="flex gap-3 text-slate-200 leading-relaxed font-medium">
                            <span className="text-emerald-500 font-black">•</span> {s}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-[2.5rem] text-[11px]">
                    <h4 className="text-rose-400 font-black uppercase mb-6 text-[10px] tracking-widest flex items-center gap-3">
                        <Shield className="w-4 h-4" /> Execution Gaps
                    </h4>
                    <div className="space-y-4">
                        {analysis.gaps.map((g: string, i: number) => (
                          <div key={i} className="flex gap-3 text-slate-200 leading-relaxed font-medium">
                            <span className="text-rose-500 font-black">•</span> {g}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* INTERVIEW BLUEPRINT */}
                <div className="bg-[#111827] border border-slate-800 p-10 rounded-[2.5rem]">
                  <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-8 tracking-[0.3em] flex items-center gap-3">
                    <HelpCircle className="w-4 h-4" /> Strategic Interview Guide
                  </h4>
                  <div className="space-y-4">
                    {analysis.questions.map((q: string, i: number) => (
                        <div key={i} className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 text-[11px] leading-relaxed text-slate-300 font-medium italic">
                            "{q}"
                        </div>
                    ))}
                  </div>
                </div>

                {/* AI EMAIL GENERATOR */}
                <div className="bg-[#111827] border border-slate-800 p-10 rounded-[2.5rem] text-center">
                    <h4 className="text-blue-400 font-black uppercase text-[10px] mb-6 tracking-[0.3em] flex items-center justify-center gap-3">
                      <Mail className="w-4 h-4" /> Outreach Blueprint
                    </h4>
                    <div className="bg-slate-900/80 rounded-3xl p-8 mb-8 text-left border border-slate-800 shadow-inner">
                        <p className="text-[12px] text-slate-300 whitespace-pre-wrap leading-loose font-mono">{analysis.outreach_email}</p>
                    </div>
                    <button 
                      onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Blueprint Copied!");}} 
                      className="w-full py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                    >
                      <Copy className="w-4 h-4" /> Copy Agent Script
                    </button>
                </div>

              </div>
            ) : (
              <div className="h-full border-4 border-dashed border-slate-800/50 rounded-[4rem] flex flex-col items-center justify-center text-slate-700 font-black text-[10px] uppercase tracking-[0.5em] gap-8 text-center p-16">
                <div className="w-24 h-24 rounded-full bg-slate-800/10 flex items-center justify-center animate-pulse">
                    <Zap className="w-10 h-10 opacity-20" />
                </div>
                <div>
                    <p className="mb-2">Awaiting Intelligence Stream</p>
                    <p className="text-[8px] opacity-40 normal-case tracking-widest">Connect requirements and candidate data to visualize match metrics</p>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* GLOBAL FOOTER */}
      <footer className="mt-20 border-t border-slate-800/50 pt-10 pb-20 text-center">
        <div className="flex justify-center gap-10 mb-6 text-[10px] uppercase font-black tracking-widest text-slate-600">
          <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400 transition-colors">Direct Support</button>
          <span className="text-slate-800">|</span>
          <span className="text-slate-500">Recruit-IQ Elite v2.0</span>
          <span className="text-slate-800">|</span>
          <span className="text-slate-500">&copy; 2026 Core Creativity</span>
        </div>
      </footer>

      {/* ELITE UPGRADE OVERLAY (THE CLERK-FIRST FIX) */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/95 animate-in fade-in duration-500">
          <div className="relative w-full max-w-4xl">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[4rem] blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-12 md:w-3/5 flex flex-col justify-center">
                 <div className="h-10 w-10 bg-indigo-600 rounded-xl mb-10 flex items-center justify-center font-black">IQ</div>
                 <h2 className="text-5xl font-black text-white mb-6 leading-[0.9] tracking-tighter italic">UNLOCK THE <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">EDGE.</span></h2>
                 <p className="text-slate-400 text-sm mb-10 leading-relaxed font-bold uppercase tracking-wide">Unlimited enterprise scans, deep SWOT analysis, and strategic scripts.</p>
                 
                 {!isSignedIn ? (
                   <SignInButton mode="modal">
                     <button 
                       onClick={() => sessionStorage.setItem('trigger_stripe', 'true')}
                       className="block w-full py-6 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all text-xs shadow-2xl"
                     >
                       Sign In to Upgrade
                     </button>
                   </SignInButton>
                 ) : (
                   <a 
                     href={finalStripeUrl} 
                     className="block w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-2xl uppercase tracking-[0.2em] hover:scale-[1.02] transition-all text-xs shadow-2xl shadow-blue-500/20"
                   >
                     Initialize Elite Access
                   </a>
                 )}

                 <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-600 mt-8 hover:text-white underline decoration-slate-800 w-full uppercase font-black tracking-widest">Return to Base</button>
              </div>
              
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 flex-col items-center justify-center p-16 text-center">
                 <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-10 border border-indigo-500/30 shadow-[0_0_60px_rgba(79,70,229,0.3)]">
                    <Shield className="w-10 h-10 text-indigo-400 fill-indigo-400" />
                 </div>
                 <ul className="text-[10px] text-slate-400 space-y-5 font-black uppercase tracking-[0.2em]">
                    <li className="flex items-center gap-3">✓ Unlimited Scans</li>
                    <li className="flex items-center gap-3 text-indigo-400">✓ SWOT Metrics</li>
                    <li className="flex items-center gap-3">✓ Strategic Guides</li>
                    <li className="flex items-center gap-3 text-indigo-400">✓ Agent Scripts</li>
                 </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT HUB */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-12 rounded-[3.5rem] max-w-lg w-full shadow-2xl text-center">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Support Hub</h2>
            <textarea 
              className="w-full h-48 bg-[#0B1120] border border-slate-800 rounded-[2rem] p-8 text-[12px] text-white outline-none resize-none mb-8 focus:border-indigo-500 transition-colors" 
              placeholder="What is your mission objective?" 
              value={supportMessage} 
              onChange={(e) => setSupportMessage(e.target.value)} 
            />
            <div className="flex gap-4">
              <button 
                onClick={() => {showToast("Signal Transmitted."); setShowSupportModal(false);}} 
                className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Transmit
              </button>
              <button onClick={() => setShowSupportModal(false)} className="px-10 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Abort</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
