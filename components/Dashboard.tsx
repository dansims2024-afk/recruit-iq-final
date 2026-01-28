"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, Check, FileText, User, Download, Send, 
  Zap, Shield, HelpCircle, CheckCircle2, XCircle, Info 
} from "lucide-react";

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
  const [verifying, setVerifying] = useState(false);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

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
          showToast("Elite Status Confirmed!", "success");
          window.history.replaceState({}, '', '/');
        }
      }
    } catch (err) { showToast("Connection error.", "error"); } finally { setVerifying(false); }
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
        // @ts-ignore
        const pdfJS = window.pdfjsLib;
        const pdf = await pdfJS.getDocument(URL.createObjectURL(file)).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ') + "\n";
        }
        text = fullText;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} Uploaded Successfully!`);
    } catch (err) { showToast("Upload failed.", "error"); } finally { setLoading(false); }
  };

  // --- THE GEMMY SPECIAL PDF GENERATOR 💎 ---
  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();
    const score = analysis.score;

    // --- PAGE 1: EXECUTIVE SUMMARY ---
    
    // 1. Professional Header Background (Indigo)
    doc.setFillColor(67, 56, 202); // Indigo 700
    doc.rect(0, 0, 210, 40, 'F');
    
    // 2. Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26); 
    doc.setFont("helvetica", "bold");
    doc.text("CONFIDENTIAL REPORT", 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("GENERATED BY RECRUIT-IQ AI", 15, 30);
    
    doc.setFontSize(14);
    doc.text(`${new Date().toLocaleDateString()}`, 170, 28);

    // 3. Candidate Name & Score
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(cName, 15, 55);

    // Score Badge
    doc.setDrawColor(67, 56, 202);
    doc.setFillColor(243, 244, 246); // Light Grey
    doc.circle(180, 52, 12, 'FD');
    doc.setTextColor(67, 56, 202);
    doc.setFontSize(16);
    doc.text(`${score}%`, 174, 54);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("MATCH", 175, 60);

    // 4. Executive Summary Box
    doc.setFillColor(248, 250, 252); // Very Light Slate
    doc.rect(15, 65, 180, 40, 'F'); // Grey Box
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 65, 180, 40, 'S'); // Border

    doc.setTextColor(71, 85, 105); // Slate 600
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", 20, 72);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 79);

    // 5. Strengths & Gaps (Colorful Columns)
    let yPos = 115;
    
    // Strengths Header
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("KEY STRENGTHS", 15, yPos);
    
    // Gaps Header
    doc.setTextColor(244, 63, 94); // Rose 500
    doc.text("CRITICAL GAPS", 110, yPos);

    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    const strengths = analysis.strengths || [];
    const gaps = analysis.gaps || [];
    const maxItems = Math.max(strengths.length, gaps.length);

    for (let i = 0; i < maxItems; i++) {
        if (strengths[i]) {
            doc.setFillColor(209, 250, 229); // Light Green Dot
            doc.circle(18, yPos + (i * 8) - 1, 1.5, 'F');
            doc.text(strengths[i], 23, yPos + (i * 8));
        }
        if (gaps[i]) {
            doc.setFillColor(254, 226, 226); // Light Red Dot
            doc.circle(113, yPos + (i * 8) - 1, 1.5, 'F');
            doc.text(gaps[i], 118, yPos + (i * 8));
        }
    }

    // --- PAGE 2: STRATEGIC INTERVIEW GUIDE ---
    doc.addPage();
    
    // Header
    doc.setFillColor(30, 41, 59); // Dark Slate
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC INTERVIEW GUIDE", 15, 18);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    
    let qY = 45;
    (analysis.questions || []).forEach((q: string, i: number) => {
        // Question Box
        doc.setFillColor(241, 245, 249); // Slate 100
        doc.rect(15, qY, 180, 20, 'F');
        
        // Accent Bar
        doc.setFillColor(99, 102, 241); // Indigo 500
        doc.rect(15, qY, 2, 20, 'F');

        doc.setFont("helvetica", "bold");
        doc.text(`QUESTION ${i + 1}`, 20, qY + 6);
        
        doc.setFont("helvetica", "italic");
        const qLines = doc.splitTextToSize(q, 170);
        doc.text(qLines, 20, qY + 12);
        
        qY += 28;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Powered by Recruit-IQ AI  |  Confidential Hiring Document", 70, 280);

    doc.save(`RecruitIQ_Report_${cName}.pdf`);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true); return;
    }
    if (!jdReady || !resumeReady) { showToast("Input Required.", "error"); return; }
    setLoading(true);
    try {
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, summary, 3 strengths, 3 gaps, 5 deep-dive interview questions, and a short outreach email. Return JSON: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, { 
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) 
      });
      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      setAnalysis(JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]));
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Generated Successfully!");
    } catch (err) { showToast("AI Engine Error.", "error"); } finally { setLoading(false); }
  };

  const handleSupportSubmit = () => {
      showToast("Message sent! We'll reply shortly.");
      setShowSupportModal(false);
      setSupportMessage("");
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-top ${toast.type === 'error' ? 'bg-rose-500/90 border-rose-400' : 'bg-indigo-600/90 border-indigo-400'}`}>
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
                    <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all shadow-lg">Log In</button>
                </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      {/* QUICK START WIZARD (Detailed) */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all hover:scale-[1.02] ${jdReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black tracking-widest">1</span>
                {jdReady && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in" />}
              </div>
              <h4 className="uppercase text-[11px] font-black tracking-widest mb-2">Define Requirements</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Paste the full Job Description to set the hiring benchmark.</p>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all hover:scale-[1.02] ${resumeReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black tracking-widest">2</span>
                {resumeReady && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in" />}
              </div>
              <h4 className="uppercase text-[11px] font-black tracking-widest mb-2">Upload Candidate</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Upload a PDF/Word resume or paste candidate data.</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-4"><span className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black tracking-widest">3</span></div>
              <h4 className="uppercase text-[11px] font-black tracking-widest mb-2">Generate Intelligence</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Unlock Match Scores, Interview Guides, and Outreach.</p>
          </div>
      </div>

      {/* WORKSPACE AREA */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl relative">
            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {jdReady && <Check className="w-4 h-4 text-emerald-400" />} 1. Job Description
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {resumeReady && <Check className="w-4 h-4 text-emerald-400" />} 2. Resume
                </button>
            </div>
            
            <div className="flex gap-4 mb-6">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-4 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700 transition-all">
                Upload PDF / Word
                <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Full Samples Loaded!", "info");}} className="flex-1 bg-slate-800/50 py-4 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Elite Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-8 border border-slate-800 rounded-3xl text-[11px] font-mono leading-relaxed focus:border-indigo-500 transition-colors custom-scrollbar"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste target Job Description..." : "Paste Candidate Resume..."}
            />
            
            <button onClick={handleScreen} disabled={loading} className="mt-8 py-6 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-2xl flex items-center justify-center gap-4 hover:bg-indigo-500 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white animate-pulse" />}
              {loading ? "Crunching..." : "Execute Elite AI Screen →"}
            </button>
        </div>

        {/* RESULTS AREA */}
        <div className="h-[750px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="bg-[#111827] border border-slate-800 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                  <div className="w-28 h-28 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-5xl font-black mb-6 shadow-xl shadow-indigo-900/40">{analysis.score}%</div>
                  <div className="text-white font-black text-2xl mb-8 uppercase tracking-tighter">{analysis.candidate_name}</div>
                  
                  <div className="grid grid-cols-2 gap-4 text-left text-[11px]">
                     <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20">
                        <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest flex items-center gap-2"><Check className="w-4 h-4" /> Strengths</h4>
                        {analysis.strengths.map((s: any, i: any) => <p key={i} className="mb-2 opacity-80">• {s}</p>)}
                     </div>
                     <div className="bg-rose-500/5 p-6 rounded-3xl border border-rose-500/20">
                        <h4 className="text-rose-400 font-black mb-4 uppercase tracking-widest flex items-center gap-2"><Shield className="w-4 h-4" /> Gaps</h4>
                        {analysis.gaps.map((g: any, i: any) => <p key={i} className="mb-2 opacity-80">• {g}</p>)}
                     </div>
                  </div>

                  <div className="mt-10 p-6 bg-slate-900/50 rounded-3xl border border-slate-800 text-left">
                     <h4 className="text-blue-400 font-black mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2"><Send className="w-4 h-4" /> High-Impact Outreach</h4>
                     <p className="text-[11px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">{analysis.outreach_email}</p>
                     <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Email Copied!");}} className="mt-6 w-full py-4 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-slate-700">
                        <Copy className="w-3 h-3" /> Copy Outreach Template
                     </button>
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-10 rounded-3xl">
                  <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-8 tracking-widest flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Strategic Interview Guide</h4>
                  <div className="space-y-5">
                    {analysis.questions.map((q: any, i: any) => (
                        <div key={i} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 text-[11px] leading-relaxed text-slate-300 font-bold italic shadow-inner">"{q}"</div>
                    ))}
                  </div>
                </div>
                
                {/* PDF DOWNLOAD BUTTON */}
                <button onClick={downloadPDF} className="w-full py-5 bg-slate-800 hover:bg-slate-700 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-slate-700 flex items-center justify-center gap-2 transition-all">
                    <Download className="w-4 h-4" /> Download Elite PDF Report
                </button>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-700 font-black text-[11px] uppercase tracking-[0.3em] gap-8">
                <div className="w-24 h-24 rounded-full bg-slate-800/30 flex items-center justify-center animate-pulse border-2 border-slate-800/20 shadow-2xl shadow-indigo-900/10">
                    <Zap className="w-10 h-10 opacity-20" />
                </div>
                <p>Waiting for Intelligence</p>
              </div>
            )}
        </div>
      </div>

      {/* SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in duration-300">
          <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[3.5rem] p-12 max-w-4xl w-full shadow-2xl flex flex-col md:flex-row overflow-hidden">
              <div className="md:w-3/5 relative z-10">
                 <div className="mb-8"><img src="/logo.png" alt="Logo" className="h-10 w-auto" /></div>
                 <h2 className="text-6xl font-black text-white mb-6 leading-none tracking-tighter uppercase italic">Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Elite.</span></h2>
                 <p className="text-slate-400 mb-10 font-black uppercase text-[10px] tracking-[0.2em] leading-relaxed">Unlimited scans, Deep AI metrics, and Strategic interview engineering.</p>
                 {!isSignedIn ? (
                    <SignUpButton mode="modal" afterSignUpUrl="/">
                        <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="block w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-3xl uppercase tracking-widest hover:scale-[1.02] transition-all text-xs shadow-2xl shadow-blue-500/40">Start 3-Day Free Trial</button>
                    </SignUpButton>
                 ) : (
                    <div className="space-y-4">
                        <a href={finalStripeUrl} className="block w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-3xl uppercase tracking-widest hover:scale-[1.02] transition-all text-xs shadow-2xl shadow-blue-500/40">Unlock Elite Access</a>
                        <button onClick={handleVerifySubscription} disabled={verifying} className="block w-full py-4 bg-slate-800 text-slate-400 font-black rounded-2xl uppercase tracking-widest hover:text-white transition-all text-[10px] border border-slate-700 shadow-xl">{verifying ? "VERIFYING..." : "I'VE PAID (SYNC ACCOUNT)"}</button>
                    </div>
                 )}
                 <button onClick={() => setShowLimitModal(false)} className="mt-8 text-[11px] text-slate-600 font-black uppercase tracking-widest hover:text-white underline decoration-slate-800 transition-all w-full">No thanks, I'll screen manually</button>
              </div>
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800/50 flex-col items-center justify-center p-16 text-center border-l border-slate-800 shadow-inner">
                 <Zap className="w-14 h-14 text-indigo-400 mb-10 drop-shadow-2xl animate-pulse" />
                 <h3 className="font-black text-white uppercase text-2xl tracking-tighter mb-4">Elite Status</h3>
                 <ul className="text-[10px] text-slate-500 space-y-5 font-black uppercase tracking-widest text-left">
                    <li>✓ Unlimited Resume Scans</li>
                    <li>✓ Advanced Match Analytics</li>
                    <li>✓ Strategic Interview Guides</li>
                    <li>✓ AI Email Outreach Generator</li>
                 </ul>
              </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <p className="mb-4">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-6">
          <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400 transition-colors">Contact Support</button>
          <a href="https://www.corecreativityai.com/blank-2" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">Terms</a>
          <a href="https://www.corecreativityai.com/blank" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">Privacy</a>
        </div>
      </footer>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl text-center">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Support</h2>
            <textarea required className="w-full h-40 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 text-[12px] text-white outline-none resize-none mb-6 focus:border-indigo-500 transition-colors" placeholder="How can we help your hiring process?" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-4"><button onClick={handleSupportSubmit} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Send Message</button><button onClick={() => setShowSupportModal(false)} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
