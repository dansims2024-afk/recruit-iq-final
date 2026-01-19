"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton, UserButton } from "@clerk/nextjs";
import { Check, CheckCircle, Upload, Zap, Shield, Sparkles, Star, ArrowRight, Info, Target, ListChecks } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL PAGE VALUE SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

COMPANY OVERVIEW:
Vertex Financial Systems is a global leader in high-frequency trading technology, processing over $4B in daily transaction volume. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Rust.
- Lead the strategic migration from legacy monolithic C++ structures to modern gRPC architecture.
- Optimize trading engines for sub-millisecond latency.
- Establish CI/CD best practices and mentor a global team of 15+ senior engineers.
- Ensure security compliance with SOC2 and SEC regulations.

QUALIFICATIONS:
- 12+ years of software engineering experience in FinTech or Capital Markets.
- Deep expertise in AWS Cloud Architecture (Professional certification preferred).
- Proven track record with Kubernetes, Docker, Kafka, and Terraform.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers and budgets exceeding $5M.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | 2018 - Present
- Architected serverless data pipelines handling 5TB of daily market data.
- Reduced infrastructure costs by 35% through AWS Graviton migration.
- Led team of 15 engineers in re-writing core risk engine, improving speed by 400%.

InnovaTrade | Senior Staff Engineer | 2014 - 2018
- Built order execution engine in Go, achieving 50% reduction in latency.
- Implemented failover protocols preventing $10M in potential slippage.

SKILLS:
AWS, Kubernetes, Docker, Terraform, Go, Rust, C++, Kafka, gRPC, CI/CD.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [analysis, setAnalysis] = useState<any>(null);

  const isPro = user?.publicMetadata?.isPro === true;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}${userEmail ? `&prefilled_email=${encodeURIComponent(userEmail)}` : ''}` 
    : STRIPE_URL;

  const jdReady = jdText.length > 100;
  const resumeReady = resumeText.length > 100;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
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
        text = "[PDF Uploaded] Extracting text... For best results, please paste text directly.";
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast("Document loaded!");
    } catch (err) { showToast("Upload failed", "error"); }
  };

  const handleScreen = async () => {
    if (!isSignedIn || !isPro) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) {
        showToast("Please fill JD and Resume first", "error");
        return;
    }
    setLoading(true);
    // ACTIVATE ANALYSIS: This simulates the call to your /api/generate route
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ jd: jdText, resume: resumeText })
        });
        const data = await response.json();
        setAnalysis(data);
        showToast("Analysis Complete!");
    } catch (err) {
        showToast("AI Error. Please try again.", "error");
    } finally {
        setLoading(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        </div>
        <UserButton afterSignOutUrl="/"/>
      </div>

      {/* DETAILED QUICK START BAR */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className={`p-6 rounded-3xl border transition-all duration-500 ${jdReady ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-3 mb-3">
                {jdReady ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <Info className="text-indigo-400 w-5 h-5" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">1. Job Requirements</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Paste the full JD or upload a DOCX. AI uses this to build the ideal candidate profile.</p>
            <div className="h-1 w-full bg-slate-800 rounded-full"><div className={`h-full bg-emerald-500 transition-all ${jdReady ? 'w-full' : 'w-0'}`}></div></div>
        </div>

        <div className={`p-6 rounded-3xl border transition-all duration-500 ${resumeReady ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-3 mb-3">
                {resumeReady ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <Target className="text-indigo-400 w-5 h-5" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">2. Candidate Profile</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Provide the candidate's professional history. The more detail, the more accurate the screen.</p>
            <div className="h-1 w-full bg-slate-800 rounded-full"><div className={`h-full bg-emerald-500 transition-all ${resumeReady ? 'w-full' : 'w-0'}`}></div></div>
        </div>

        <div className={`p-6 rounded-3xl border transition-all duration-500 ${jdReady && resumeReady ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
            <div className="flex items-center gap-3 mb-3">
                <ListChecks className={jdReady && resumeReady ? "text-indigo-500 w-5 h-5" : "text-slate-600 w-5 h-5"} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">3. Deep Analysis</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Execute to generate match scores, missing skills, and custom strategic interview guides.</p>
            <div className="h-1 w-full bg-slate-800 rounded-full"><div className={`h-full bg-indigo-500 transition-all ${jdReady && resumeReady ? 'w-full' : 'w-0'}`}></div></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume</button>
            </div>
            <div className="flex gap-3 mb-4 text-[10px] font-bold uppercase">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl border border-slate-700 hover:text-white transition-all">
                Upload PDF / DOCX
                <input type="file" accept=".docx, .pdf" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Samples Loaded");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl border border-slate-700 hover:text-white transition-all">Fill Full Samples</button>
            </div>
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
                Execute Elite AI Screen
            </button>
        </div>
        <div className="h-[750px] bg-[#111827] border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase text-center p-10">
            {analysis ? "Analysis Result View Placeholder" : "Input data and execute screen to view AI Intelligence report"}
        </div>
      </div>

      <footer className="mt-20 border-t border-slate-800 pt-10 pb-16 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-500">
        <div className="flex gap-8">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
            <button className="hover:text-indigo-400 transition-colors">Support</button>
        </div>
        <p>&copy; 2026 Core Creativity AI</p>
      </footer>

      {/* SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="p-12 md:w-3/5">
                <h2 className="text-5xl font-black mb-6 leading-tight">Hire Smarter. <br/><span className="text-indigo-400 italic">Finish First.</span></h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">Recruit-IQ Elite is the unfair advantage for high-performance teams. Stop reading; start screening.</p>
                {!isSignedIn ? (
                    <SignUpButton mode="modal" forceRedirectUrl="/">
                        <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs shadow-2xl hover:bg-indigo-500">Create Account to Start Trial</button>
                    </SignUpButton>
                ) : (
                    <a href={finalStripeUrl} className="block w-full py-5 bg-indigo-600 text-center text-white font-black rounded-2xl uppercase text-xs shadow-2xl hover:bg-indigo-500">Start 3-Day Free Trial</a>
                )}
                <button onClick={() => setShowLimitModal(false)} className="w-full mt-6 text-[10px] text-slate-600 uppercase font-black">Dismiss</button>
            </div>
            <div className="md:w-2/5 bg-[#111827] border-l border-slate-800 p-12 flex flex-col justify-center gap-8 text-center">
                <Zap className="w-12 h-12 text-indigo-400 mx-auto" /><h3 className="font-black text-white uppercase text-xl">Elite Access</h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">Unlimited Scans • Deep Gaps Analysis • Strategic Guides</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
