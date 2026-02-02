"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, Check, FileText, Download, 
  Zap, Shield, HelpCircle, CheckCircle2, XCircle, Info, Mail,
  ChevronRight, Sparkles, Target, BarChart3, MessageSquare, 
  FileSearch, UserCheck, Briefcase
} from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL EXTENDED ELITE SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate.
- Lead the migration from legacy monolithic structures to modern gRPC architecture.
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
  
  // UI State
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
  const [verifying, setVerifying] = useState(false);

  // Computed
  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  // Persist Scan Count for Free Users
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  // Handle Stripe Success Flow
  useEffect(() => {
    const handleReturnFlow = async () => {
      if (!isLoaded || !isSignedIn) return;

      if (sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment_success') === 'true' && !isPro) {
        showToast("Finalizing Elite Access...", "info");
        await handleVerifySubscription();
      }
    };
    handleReturnFlow();
  }, [isSignedIn, isPro, isLoaded, user, finalStripeUrl]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type: type as any });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleVerifySubscription = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/manual-check', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        await user?.reload(); 
        if (user?.publicMetadata?.isPro) {
          setShowLimitModal(false);
          showToast("Elite Status Activated!", "success");
          window.history.replaceState({}, '', '/');
        }
      }
    } catch (err) { 
        showToast("Verification error. Contact support.", "error"); 
    } finally { 
        setVerifying(false); 
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        // Fallback for simple PDF text parsing if library is loaded
        // Note: For full production, use a robust worker-based pdf-parse
        text = "PDF Content Extracted (Requires Client-Side PDF.js Integration)";
      } else { 
        text = await file.text(); 
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} Uploaded Successfully!`);
    } catch (err) { 
        showToast("Upload failed. Try plain text.", "error"); 
    } finally { 
        setLoading(false); 
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();
    const score = analysis.score;

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * lineHeight;
    };

    // --- PAGE 1: EXECUTIVE SUMMARY ---
    doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(26); doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC SCREEN REPORT", 15, 30);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 15, 40);
    doc.text("RECRUIT-IQ ELITE INTELLIGENCE", 150, 40);

    doc.setFillColor(255, 255, 255); doc.setDrawColor(79, 70, 229); doc.setLineWidth(2);
    doc.circle(185, 25, 12, 'S');
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.text(`${score}%`, 180, 27);

    doc.setTextColor(30, 41, 59); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text(cName, 15, 70);
    doc.setDrawColor(226, 232, 240); doc.line(15, 75, 195, 75);

    doc.setFillColor(248, 250, 252); doc.rect(15, 85, 180, 45, 'F');
    doc.setTextColor(79, 70, 229); doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", 20, 95);
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    addWrappedText(analysis.summary || "No summary provided.", 20, 103, 170, 6);

    let yBase = 145;
    doc.setTextColor(16, 185, 129); doc.setFont("helvetica", "bold"); doc.text("STRENGTHS & ASSETS", 15, yBase);
    doc.setTextColor(244, 63, 94); doc.text("IDENTIFIED GAPS", 110, yBase);
    
    doc.setFontSize(9); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
    let yL = yBase + 10;
    (analysis.strengths || []).forEach((s: string) => {
        doc.text("• " + s, 15, yL, { maxWidth: 85 });
        yL += 12;
    });

    let yR = yBase + 10;
    (analysis.gaps || []).forEach((g: string) => {
        doc.text("• " + g, 110, yR, { maxWidth: 85 });
        yR += 12;
    });

    // --- PAGE 2: INTERVIEW GUIDE ---
    doc.addPage();
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.text("TECHNICAL INTERVIEW & VETTING GUIDE", 15, 16);
    
    let qY = 40;
    (analysis.questions || []).forEach((q: string, i: number) => {
        doc.setFillColor(248, 250, 252); doc.rect(15, qY, 180, 30, 'F');
        doc.setDrawColor(226, 232, 240); doc.rect(15, qY, 180, 30, 'S');
        doc.setTextColor(79, 70, 229); doc.setFont("helvetica", "bold"); doc.text(`PROMPT 0${i+1}`, 22, qY + 10);
        doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "italic"); doc.setFontSize(10);
        addWrappedText(q, 22, qY + 18, 165, 5);
        qY += 40;
    });

    doc.save(`Elite_Screen_${cName}.pdf`);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true); return;
    }
    if (!jdReady || !resumeReady) { 
        showToast("Both JD and Resume are required.", "error"); 
        return; 
    }
    setLoading(true);
    try {
      const prompt = `Act as a Head of Talent. Analyze the following:
      JD: ${jdText}
      RESUME: ${resumeText}
      
      Return a JSON object exactly like this:
      {
        "candidate_name": "Full Name",
        "score": 85,
        "summary": "2-3 sentences on cultural and technical fit.",
        "strengths": ["string", "string", "string"],
        "gaps": ["string", "string", "string"],
        "questions": ["Deep technical question 1", "Question 2", "Question 3"],
        "outreach_email": "A professional email template inviting them to interview."
      }`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, { 
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) 
      });
      
      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const cleanedJson = JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]);
      
      setAnalysis(cleanedJson);
      
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Elite Analysis Complete!");
    } catch (err) { 
        showToast("AI Engine timeout. Try smaller text.", "error"); 
    } finally { 
        setLoading(false); 
    }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.5em]">Initializing Secure Environment</p>
    </div>
  );

  return (
    <div className="relative p-4 md:p-10 max-w-[1600px] mx-auto space-y-12 text-white bg-[#020617] min-h-screen pt-24 font-sans selection:bg-indigo-500/30">
      
      {/* --- ELITE NAVIGATION BAR --- */}
      <nav className="fixed top-0 left-0 w-full z-[100] backdrop-blur-xl border-b border-slate-800/50 bg-[#020617]/80">
        <div className="max-w-7xl mx-auto px-10 h-20 flex justify-between items-center">
            <div className="flex items-center gap-4 group">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-white fill-current" />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ <span className="text-indigo-500">Elite</span></h1>
            </div>
            
            <div className="flex items-center gap-8">
                <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400">Support</button>
                    <div className={`px-4 py-1.5 rounded-full border ${isPro ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5'}`}>
                        {isPro ? "PRO LICENSE ACTIVE" : `${3 - scanCount} SCANS REMAINING`}
                    </div>
                </div>
                {!isSignedIn ? (
                    <SignInButton mode="modal" afterSignInUrl="/">
                        <button className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">Client Login</button>
                    </SignInButton>
                ) : (
                    <div className="flex items-center gap-4">
                        <UserButton afterSignOutUrl="/"/>
                    </div>
                )}
            </div>
        </div>
      </nav>

      {/* --- HERO / WIZARD HEADER --- */}
      <div className="grid md:grid-cols-3 gap-8 pt-10">
          <div onClick={() => setActiveTab('jd')} className={`p-10 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group relative overflow-hidden ${jdReady ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-indigo-400 border border-slate-700">01</div>
                {jdReady && <CheckCircle2 className="text-emerald-500 w-6 h-6" />}
              </div>
              <h4 className="uppercase text-xs font-black tracking-widest mb-2">The Benchmark</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Define the core success criteria for this role.</p>
              <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Briefcase className="w-24 h-24 text-white" />
              </div>
          </div>

          <div onClick={() => setActiveTab('resume')} className={`p-10 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group relative overflow-hidden ${resumeReady ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-indigo-400 border border-slate-700">02</div>
                {resumeReady && <CheckCircle2 className="text-emerald-500 w-6 h-6" />}
              </div>
              <h4 className="uppercase text-xs font-black tracking-widest mb-2">The Candidate</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Map the applicant's experience against your JD.</p>
              <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <UserCheck className="w-24 h-24 text-white" />
              </div>
          </div>

          <div className={`p-10 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${analysis ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-indigo-400 border border-slate-700">03</div>
                {analysis && <Sparkles className="text-amber-400 w-6 h-6" />}
              </div>
              <h4 className="uppercase text-xs font-black tracking-widest mb-2">The Intelligence</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Review generated score, gaps, and guide.</p>
              <div className="absolute -bottom-4 -right-4 opacity-10">
                <Target className="w-24 h-24 text-white" />
              </div>
          </div>
      </div>

      {/* --- CORE WORKSPACE --- */}
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        
        {/* INPUT SECTION */}
        <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800/80 shadow-2xl relative">
            <div className="flex gap-4 mb-10 p-1.5 bg-slate-950 rounded-[1.8rem] border border-slate-800">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${activeTab === 'jd' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                   <Briefcase className="w-4 h-4" /> Position
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                   <UserCheck className="w-4 h-4" /> Resume
                </button>
            </div>
            
            <div className="flex gap-4 mb-8">
              <label className="flex-1 cursor-pointer bg-slate-900/50 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white border border-slate-800 transition-all flex items-center justify-center gap-3">
                <Download className="w-4 h-4" /> Upload Doc
                <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Elite Dataset Loaded");}} className="flex-1 bg-slate-900/50 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-400 border border-slate-800 hover:text-white transition-all flex items-center justify-center gap-3">
                <Sparkles className="w-4 h-4" /> Sample Data
              </button>
            </div>

            <textarea 
              className="w-full h-[450px] bg-[#020617] resize-none outline-none text-slate-300 p-10 border border-slate-800 rounded-[2.5rem] text-sm leading-loose focus:border-indigo-600/50 transition-all custom-scrollbar font-medium"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste the Job Description here..." : "Paste the Candidate Resume here..."}
            />
            
            <button onClick={handleScreen} disabled={loading} className="w-full mt-10 py-10 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] bg-indigo-600 hover:bg-indigo-500 transition-all shadow-2xl flex items-center justify-center gap-4 group">
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  ANALYZING CORE...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  EXECUTE SCREEN
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
        </div>

        {/* OUTPUT SECTION */}
        <div className="space-y-12">
            {analysis ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-1000">
                
                {/* MATCH CARD */}
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[4rem] text-center shadow-3xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500"></div>
                  
                  <div className="flex justify-center items-center gap-12 mb-10">
                    <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-900" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                strokeDasharray={364.4}
                                strokeDashoffset={364.4 - (364.4 * analysis.score) / 100}
                                className="text-indigo-500 transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-3xl italic">{analysis.score}%</div>
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-2">Identity Confirmed</div>
                        <div className="text-3xl font-black uppercase italic tracking-tighter text-white">{analysis.candidate_name}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950/50 rounded-[2.5rem] p-10 text-left border border-slate-800/50 shadow-inner mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Executive Insight</h4>
                    </div>
                    <p className="text-sm text-slate-300 leading-loose font-medium italic">"{analysis.summary}"</p>
                  </div>

                  <button onClick={downloadPDF} className="w-full py-6 bg-slate-900 hover:bg-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-800 transition-all flex items-center justify-center gap-4 shadow-xl">
                    <Download className="w-4 h-4" /> Export Elite Report (PDF)
                  </button>
                </div>

                {/* STRENGTHS / GAPS */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[3rem]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-emerald-500/10 p-2 rounded-xl"><Target className="w-5 h-5 text-emerald-400" /></div>
                        <h4 className="text-emerald-400 font-black uppercase text-[10px] tracking-widest">Key Assets</h4>
                    </div>
                    <div className="space-y-4">
                        {analysis.strengths.map((s: string, i: number) => (
                            <div key={i} className="flex gap-4 text-sm text-slate-300 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {s}
                            </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-rose-500/5 border border-rose-500/10 p-10 rounded-[3rem]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-rose-500/10 p-2 rounded-xl"><Shield className="w-5 h-5 text-rose-400" /></div>
                        <h4 className="text-rose-400 font-black uppercase text-[10px] tracking-widest">Growth Gaps</h4>
                    </div>
                    <div className="space-y-4">
                        {analysis.gaps.map((g: string, i: number) => (
                            <div key={i} className="flex gap-4 text-sm text-slate-300 font-medium">
                                <XCircle className="w-5 h-5 text-rose-500 shrink-0" /> {g}
                            </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* INTERVIEW GUIDE */}
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[3.5rem] relative">
                  <div className="flex items-center gap-5 mb-10">
                      <div className="bg-indigo-600/10 p-3 rounded-2xl"><MessageSquare className="w-6 h-6 text-indigo-400" /></div>
                      <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em]">Vetting Guide</h4>
                  </div>
                  <div className="space-y-6">
                      {analysis.questions.map((q: string, i: number) => (
                          <div key={i} className="group p-8 bg-slate-950/50 rounded-[2.5rem] border border-slate-800/50 text-sm text-slate-200 font-medium italic transition-all hover:border-indigo-500/30">
                              <span className="text-indigo-500 font-black mr-4 not-italic uppercase text-[10px]">Q{i+1}</span>
                              "{q}"
                          </div>
                      ))}
                  </div>
                </div>

                {/* EMAIL TEMPLATE */}
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[3.5rem] text-center">
                    <div className="flex items-center justify-center gap-4 mb-10">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <h4 className="text-blue-400 font-black uppercase text-[10px] tracking-[0.3em]">Outreach Workflow</h4>
                    </div>
                    <div className="bg-slate-950/50 rounded-[2.5rem] p-10 mb-10 text-left border border-slate-800 shadow-inner max-h-80 overflow-y-auto custom-scrollbar">
                        <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed font-medium font-mono">{analysis.outreach_email}</p>
                    </div>
                    <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Email Copied!");}} className="w-full py-7 bg-indigo-600 hover:bg-indigo-500 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-5 transition-all shadow-xl">
                        <Copy className="w-5 h-5" /> Copy Template
                    </button>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-12">
                  <div className="relative">
                      <div className="w-48 h-48 rounded-full bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center animate-pulse">
                        <FileSearch className="w-16 h-16 text-slate-800" />
                      </div>
                  </div>
                  <div className="text-center space-y-4">
                      <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.6em]">System Standby</p>
                      <p className="text-xs text-slate-600 max-w-xs font-medium">Please upload a Job Description and Resume to generate your first match analysis.</p>
                  </div>
              </div>
            )}
        </div>
      </div>

      {/* --- ELITE UPGRADE MODAL --- */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/95">
          <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[4rem] p-16 md:p-24 max-w-5xl w-full shadow-4xl flex flex-col md:flex-row gap-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
              
              <div className="relative p-6 md:w-3/5">
                 <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-12 shadow-xl shadow-indigo-500/30">
                    <Zap className="w-6 h-6 text-white fill-current" />
                 </div>
                 <h2 className="text-8xl font-black text-white mb-8 leading-none tracking-tighter uppercase italic">GO <span className="text-indigo-500">ELITE.</span></h2>
                 <p className="text-slate-400 mb-16 font-black uppercase text-[10px] tracking-[0.3em] leading-loose max-w-sm">Access the full potential of Recruit-IQ with unlimited processing and deep vetting analytics.</p>
                 
                 {!isSignedIn ? (
                    <SignUpButton mode="modal">
                        <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="block w-full py-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em] text-xs shadow-3xl shadow-blue-500/40 hover:scale-[1.02] transition-all">Enable Full Access</button>
                    </SignUpButton>
                 ) : (
                    <a href={finalStripeUrl} className="block w-full py-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em] text-xs shadow-3xl shadow-blue-500/40 hover:scale-[1.02] transition-all">Complete License Upgrade</a>
                 )}
                 
                 <button onClick={() => setShowLimitModal(false)} className="mt-12 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] hover:text-white underline decoration-slate-800 transition-all w-full text-center">Return to Lite Mode</button>
              </div>

              <div className="hidden md:flex md:w-2/5 bg-slate-900/40 border border-slate-800 rounded-[3rem] flex-col items-center justify-center p-16 text-center shadow-inner relative z-10">
                 <Shield className="w-16 h-16 text-indigo-400 mb-10 animate-pulse" />
                 <h3 className="font-black text-white text-4xl uppercase tracking-tighter mb-8 italic">Elite Benefits</h3>
                 <ul className="text-[10px] text-slate-500 space-y-6 font-black uppercase tracking-[0.2em] text-left">
                    <li className="flex items-center gap-4"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Volume</li>
                    <li className="flex items-center gap-4"><Check className="w-4 h-4 text-emerald-500" /> Report Exporting</li>
                    <li className="flex items-center gap-4"><Check className="w-4 h-4 text-emerald-500" /> Strategic Interviewer</li>
                    <li className="flex items-center gap-4"><Check className="w-4 h-4 text-emerald-500" /> Vetting AI Engine</li>
                 </ul>
              </div>
          </div>
        </div>
      )}

      {/* --- SUPPORT / HELP MODAL --- */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/95">
          <div className="bg-[#0F172A] border border-slate-700/50 p-16 rounded-[4rem] max-w-xl w-full shadow-4xl text-center">
            <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter italic">Technical Support</h2>
            <textarea className="w-full h-56 bg-[#020617] border border-slate-800 rounded-[2.5rem] p-10 text-sm text-white outline-none resize-none mb-10 focus:border-indigo-600 transition-all leading-loose shadow-inner" placeholder="Describe your technical inquiry..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-6">
                <button onClick={() => {showToast("Ticket Created!"); setShowSupportModal(false);}} className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-500 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all">Submit Inquiry</button>
                <button onClick={() => setShowSupportModal(false)} className="px-10 py-6 bg-slate-800 hover:bg-slate-700 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="mt-28 border-t border-slate-800/50 pt-16 pb-28">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-indigo-500 fill-current" />
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">Recruit-IQ Platform</span>
            </div>
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-700">&copy; {new Date().getFullYear()} Core Creativity AI. All Rights Reserved.</p>
            <div className="flex gap-10 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">
                <a href="https://www.corecreativityai.com/blank-2" target="_blank" className="hover:text-indigo-400">Terms</a>
                <a href="https://www.corecreativityai.com/blank" target="_blank" className="hover:text-indigo-400">Privacy</a>
            </div>
        </div>
      </footer>
    </div>
  );
}
