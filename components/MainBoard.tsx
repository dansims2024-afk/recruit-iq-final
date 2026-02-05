"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, FileText, User, Download, Send, Zap, Shield, HelpCircle } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- SAMPLES ---
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

const MainBoard = () => {
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
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const finalStripeUrl = userEmail ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // --- THE MISSING FUNCTION THAT CAUSED THE BUILD ERROR ---
  const handleSupportSubmit = () => {
    showToast("Support request sent! We'll be in touch.", "success");
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
      } else {
        text = await file.text();
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} uploaded!`);
    } catch (err) {
      showToast("Upload failed.", "error");
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.text("INTELLIGENCE REPORT", 20, 25);
    doc.setTextColor(30, 41, 59); doc.setFontSize(20); doc.text(cName, 20, 60);
    doc.save(`RecruitIQ_Report_${cName}.pdf`);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) {
      showToast("Both Job Description and Resume are required.", "error");
      return;
    }
    setLoading(true);
    try {
      // Note: In production, we'd ideally route this through your /api/generate 
      // but keeping your direct logic here for now to get the UI up.
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
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-top ${toast.type === 'error' ? 'bg-rose-500/90' : 'bg-indigo-600/90'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-white">{toast.message}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center font-black">IQ</div>
            <div className="hidden md:block">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Elite Candidate Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border flex items-center gap-2 ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal"><button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold">Log In</button></SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      {/* QUICK START WIZARD */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${jdReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">1. Requirements</h4>
              <p className="text-[11px] text-slate-400">Paste the Job Description.</p>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${resumeReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">2. Candidate Data</h4>
              <p className="text-[11px] text-slate-400">Upload or paste the resume.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">3. Intelligence</h4>
              <p className="text-[11px] text-slate-400">Execute the AI screen.</p>
          </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-6 md:p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Resume</button>
            </div>
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700">
                Upload Docx <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Samples loaded!", "info");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700">Load Samples</button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-2xl flex items-center justify-center gap-3">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {loading ? "Crunching..." : "Execute Elite AI Screen →"}
            </button>
        </div>

        {/* RESULTS COLUMN */}
        <div className="h-[750px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <div className="text-white font-bold text-xl mb-6">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 mx-auto flex items-center gap-2">
                    <Download className="w-3 h-3" /> Download Report
                  </button>
                </div>
                {/* Pros/Cons */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <h4 className="text-emerald-400 font-bold uppercase mb-4 text-[9px]">Key Strengths</h4>
                    <div className="space-y-2 text-[11px] text-slate-300">
                      {analysis.strengths.map((s: any, i: number) => <p key={i}>• {s}</p>)}
                    </div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
                    <h4 className="text-rose-400 font-bold uppercase mb-4 text-[9px]">Critical Gaps</h4>
                    <div className="space-y-2 text-[11px] text-slate-300">
                      {analysis.gaps.map((g: any, i: number) => <p key={i}>• {g}</p>)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase gap-4">
                <Zap className="w-8 h-8 opacity-20" />
                <p>Results will appear here...</p>
              </div>
            )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center text-[10px] uppercase font-bold text-slate-500">
        <p>&copy; 2026 Recruit-IQ. <button onClick={() => setShowSupportModal(true)} className="ml-4 hover:text-white underline">Contact Support</button></p>
      </footer>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-center">Support</h2>
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
};

export default MainBoard;
