"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, FileText, User, Download, Send, Zap, Shield, HelpCircle } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL EXTENDED SAMPLES ---
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

export default function Dashboard() {
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
  const [verifying, setVerifying] = useState(false); // Added for manual check button

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  // Enhanced Stripe URL with Client Reference ID for Webhook matching
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  // --- STRIPE TRAP & INSTANT UNLOCK ---
  useEffect(() => {
    const handleReturnFlow = async () => {
      if (!isLoaded || !isSignedIn) return;
      const urlParams = new URLSearchParams(window.location.search);

      // 1. Handle "Sign Up then Pay" flow
      if (sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
        return;
      }

      // 2. Handle "Returning from Payment" flow
      // This detects the ?payment_success=true tag we set in Stripe
      if (urlParams.get('payment_success') === 'true' && !isPro) {
        showToast("Syncing payment...", "info");
        await handleVerifySubscription();
      } else if (!isPro) {
        // Passive check
        await user?.reload();
        if (user?.publicMetadata?.isPro === true) {
          showToast("Elite Membership Activated!", "success");
          setShowLimitModal(false);
        }
      }
    };
    handleReturnFlow();
  }, [isSignedIn, isPro, isLoaded, user, finalStripeUrl]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type: type as any });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // --- MANUAL UNLOCK FUNCTION (Restored) ---
  const handleVerifySubscription = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/manual-check', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        await user?.reload(); 
        if (user?.publicMetadata?.isPro) {
          setShowLimitModal(false);
          showToast("Elite Status Confirmed!", "success");
          // Clean URL
          window.history.replaceState({}, '', '/');
        } else {
           // Retry once for propagation
           setTimeout(async () => {
             await user?.reload();
             if (user?.publicMetadata?.isPro) setShowLimitModal(false);
           }, 2000);
        }
      } else { 
        showToast("Payment not found yet. Try again in 10s.", "error");
      }
    } catch (err) { showToast("Connection error.", "error"); } finally { setVerifying(false); }
  };

  const handleSupportSubmit = () => {
      showToast("Message sent! We'll reply shortly.");
      setShowSupportModal(false);
      setSupportMessage("");
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        showToast("PDF parsing requires Pro. Please paste text or use .docx", "info");
        return;
      } else {
        text = await file.text();
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} uploaded successfully!`);
    } catch (err) {
      showToast("Upload failed.", "error");
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();

    // Page 1: Summary
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("INTELLIGENCE REPORT", 20, 25);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("RECRUIT-IQ | ELITE CANDIDATE SCREENING", 20, 32);

    doc.setTextColor(30, 41, 59); doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text(cName, 20, 60);
    doc.setTextColor(79, 70, 229); doc.text(`MATCH SCORE: ${analysis.score}%`, 130, 60);

    doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.text("EXECUTIVE SUMMARY", 20, 72);
    doc.setTextColor(51, 65, 85); doc.setFontSize(11); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 79);

    let y = 79 + (summaryLines.length * 6) + 15;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); doc.text("TOP STRENGTHS", 20, y);
    doc.setTextColor(244, 63, 94); doc.text("CRITICAL GAPS", 110, y);
    
    y += 8;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
    const strengths = analysis.strengths || [];
    const gaps = analysis.gaps || [];
    for (let i = 0; i < Math.max(strengths.length, gaps.length); i++) {
        if (strengths[i]) doc.text(`• ${strengths[i]}`, 20, y + (i * 6));
        if (gaps[i]) doc.text(`• ${gaps[i]}`, 110, y + (i * 6));
    }

    // Page 2: Interview Guide
    doc.addPage();
    doc.setTextColor(79, 70, 229); doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC INTERVIEW GUIDE", 20, 20);
    doc.setFontSize(10); doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    (analysis.questions || []).forEach((q: string, i: number) => {
      doc.text(`${i + 1}. ${q}`, 20, 40 + (i * 12), { maxWidth: 170 });
    });

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
      showToast("Intelligence Generated Successfully!");
    } catch (err) {
      showToast("AI Engine Error. Check your API key.", "error");
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
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <div className="hidden md:block">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Elite Candidate Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border flex items-center gap-2 ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? <Zap className="w-3 h-3 fill-current" /> : null}
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal">
                    <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">
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
              <p className="text-[11px] text-slate-400 leading-relaxed">Paste the Job Description to set the benchmark.</p>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-6 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${resumeReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                {resumeReady && <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">Ready</span>}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Candidate Data</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Upload .docx or paste the candidate's resume.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Intelligence</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Execute AI screen to uncover match scores.</p>
          </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: INPUT */}
        <div className="bg-[#111827] p-6 md:p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl relative">
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
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Full samples loaded!", "info");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed focus:border-indigo-500 transition-colors custom-scrollbar"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste the full Job Description here..." : "Paste the Candidate's Resume here..."}
            />
            
            <button 
              onClick={handleScreen} 
              disabled={loading} 
              className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all disabled:opacity-50 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white group-hover:animate-pulse" />}
              {loading ? "Crunching Data..." : "Execute Elite AI Screen →"}
            </button>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="h-[750px] overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                {/* Score Header */}
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4 shadow-xl shadow-indigo-900/40">{analysis.score}%</div>
                  <h3 className="uppercase text-[9px] font-bold tracking-widest text-slate-500 mb-1">Match Score</h3>
                  <div className="text-white font-bold text-xl mb-6 tracking-tight">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 transition-all flex items-center gap-2 mx-auto">
                    <Download className="w-3 h-3" /> Download Elite Report
                  </button>
                </div>

                {/* Pros/Cons Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-emerald-400 font-bold uppercase mb-4 text-[9px] tracking-widest flex items-center gap-2">
                        <Check className="w-3 h-3" /> Key Strengths
                    </h4>
                    <div className="space-y-3">
                        {analysis.strengths.map((s: string, i: number) => <p key={i} className="text-slate-200 leading-relaxed">• {s}</p>)}
                    </div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-rose-400 font-bold uppercase mb-4 text-[9px] tracking-widest flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Critical Gaps
                    </h4>
                    <div className="space-y-3">
                        {analysis.gaps.map((g: string, i: number) => <p key={i} className="text-slate-200 leading-relaxed">• {g}</p>)}
                    </div>
                  </div>
                </div>

                {/* Interview Questions */}
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[9px] mb-6 tracking-widest flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" /> Strategic Interview Guide
                  </h4>
                  <div className="space-y-4">
                    {analysis.questions.map((q: string, i: number) => (
                        <div key={i} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 text-[11px] leading-relaxed text-slate-300">
                            "{q}"
                        </div>
                    ))}
                  </div>
                </div>

                {/* Outreach Email */}
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-3xl text-center">
                    <h4 className="text-blue-400 font-bold uppercase text-[9px] mb-4 tracking-widest">Candidate Outreach</h4>
                    <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 text-left border border-slate-800">
                        <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">{analysis.outreach_email}</p>
                    </div>
                    <button 
                      onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Email copied to clipboard!");}} 
                      className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-3 h-3" /> Copy Outreach Email
                    </button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest gap-6 text-center p-12">
                <div className="w-20 h-20 rounded-full bg-slate-800/30 flex items-center justify-center animate-pulse">
                    <Zap className="w-8 h-8 opacity-20" />
                </div>
                <div>
                    <p className="mb-1">Waiting for Intelligence</p>
                    <p className="text-[9px] font-medium text-slate-700 normal-case tracking-normal">Complete steps 1 & 2 to generate analysis</p>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <p className="mb-4">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-6">
          <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400 transition-colors">Contact Support</button>
          <a href="#" className="hover:text-indigo-400">Terms</a>
          <a href="#" className="hover:text-indigo-400">Privacy</a>
        </div>
      </footer>

      {/* SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90 animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl animate-in zoom-in-95 duration-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-10 md:w-3/5 flex flex-col justify-center">
                 <div className="mb-8"><img src="/logo.png" alt="Logo" className="h-10 w-auto" /></div>
                 <h2 className="text-5xl font-black text-white mb-4 leading-none tracking-tighter">Hire Your Next Star <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">In Seconds.</span></h2>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Unlock unlimited resume screening, deep AI personality analysis, and strategic interview guides.</p>
                 
                 {!isSignedIn ? (
                    <SignUpButton mode="modal" afterSignUpUrl="/">
                        <button 
                            onClick={() => sessionStorage.setItem('trigger_stripe', 'true')}
                            className="block w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-2xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-2xl shadow-blue-500/40"
                        >
                            Start 3-Day Free Trial
                        </button>
                    </SignUpButton>
                 ) : (
                    <div className="space-y-3">
                        <a href={finalStripeUrl} className="block w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-2xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-2xl shadow-blue-500/40">
                            Start 3-Day Free Trial
                        </a>
                        
                        {/* THE FALLBACK BUTTON IS HERE */}
                        <button 
                            onClick={handleVerifySubscription}
                            disabled={verifying}
                            className="block w-full py-3 bg-slate-800 text-center text-slate-400 font-bold rounded-2xl uppercase tracking-widest hover:text-white transition-all text-[10px]"
                        >
                            {verifying ? "Checking..." : "I've Already Paid (Sync Account)"}
                        </button>
                    </div>
                 )}

                 <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-500 mt-6 hover:text-white underline decoration-slate-700 w-full uppercase font-bold tracking-widest">No thanks, I'll screen manually</button>
              </div>
              
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 flex-col items-center justify-center p-12 text-center">
                 <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-8 border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.3)] animate-pulse">
                    <Zap className="w-10 h-10 text-indigo-400 fill-indigo-400" />
                 </div>
                 <h3 className="font-black text-white text-2xl uppercase tracking-tighter mb-4">Elite Access</h3>
                 <ul className="text-xs text-slate-400 space-y-3 font-medium">
                    <li>✓ Unlimited Resume Scans</li>
                    <li>✓ Advanced Match Metrics</li>
                    <li>✓ Strategic Interview Guides</li>
                    <li>✓ AI Email Outreach Generator</li>
                 </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl text-center">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Support</h2>
            <textarea 
              required 
              className="w-full h-40 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 text-[12px] text-white outline-none resize-none mb-6 focus:border-indigo-500 transition-colors" 
              placeholder="How can we help your hiring process?" 
              value={supportMessage} 
              onChange={(e) => setSupportMessage(e.target.value)} 
            />
            <div className="flex gap-4">
              <button 
                onClick={handleSupportSubmit} 
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Send Message
              </button>
              <button 
                onClick={() => setShowSupportModal(false)} 
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
