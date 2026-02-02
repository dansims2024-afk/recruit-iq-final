"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, Check, FileText, Download, 
  Zap, Shield, HelpCircle, CheckCircle2, XCircle, Info, Mail
} from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL EXTENDED ELITE SAMPLES (Recruitment Specific) ---
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

  // Readability and Spacing Constants
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

  // --- STRIPE & AUTH REDIRECT FLOW ---
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

    // Header Design
    doc.setFillColor(67, 56, 202); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(26); doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC SCREEN", 15, 25);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 15, 35);
    doc.text("POWERED BY RECRUIT-IQ ELITE", 160, 35);

    // Score Circle
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(1);
    doc.circle(185, 22, 12, 'S');
    doc.setFontSize(14); doc.text(`${score}%`, 180, 24);

    // Candidate Details
    doc.setTextColor(30, 41, 59); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text(cName, 15, 65);

    // Summary Section
    doc.setFillColor(243, 244, 246); doc.rect(15, 75, 180, 40, 'F');
    doc.setTextColor(71, 85, 105); doc.setFontSize(10); doc.text("EXECUTIVE ANALYSIS", 20, 85);
    doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "normal");
    addWrappedText(analysis.summary || "", 20, 92, 170, 6);

    // Two Column Strengths/Gaps
    let yBase = 135;
    doc.setTextColor(16, 185, 129); doc.setFont("helvetica", "bold"); doc.text("KEY STRENGTHS", 15, yBase);
    doc.setTextColor(244, 63, 94); doc.text("CRITICAL GAPS", 110, yBase);
    
    doc.setFontSize(9); doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    let yL = yBase + 10;
    (analysis.strengths || []).forEach((s: string) => {
        doc.text("- " + s, 15, yL, { maxWidth: 85 });
        yL += 12;
    });

    let yR = yBase + 10;
    (analysis.gaps || []).forEach((g: string) => {
        doc.text("- " + g, 110, yR, { maxWidth: 85 });
        yR += 12;
    });

    // Interview Questions Page
    doc.addPage();
    doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.text("STRATEGIC INTERVIEW GUIDE", 15, 20);
    
    let qY = 50;
    (analysis.questions || []).forEach((q: string, i: number) => {
        doc.setFillColor(248, 250, 252); doc.rect(15, qY, 180, 25, 'F');
        doc.setDrawColor(226, 232, 240); doc.rect(15, qY, 180, 25, 'S');
        doc.setTextColor(99, 102, 241); doc.setFont("helvetica", "bold"); doc.text(`Q${i+1}`, 20, qY + 10);
        doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "italic");
        addWrappedText(q, 30, qY + 10, 155, 6);
        qY += 35;
    });

    doc.save(`RecruitIQ_${cName}_Report.pdf`);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true); return;
    }
    if (!jdReady || !resumeReady) { showToast("Inputs Required.", "error"); return; }
    setLoading(true);
    try {
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, summary, strengths, gaps, questions, and outreach email. Return JSON.`;
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
      showToast("Elite Intelligence Generated!");
    } catch (err) { showToast("AI Engine Error.", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-indigo-500" /></div>;

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-12 text-white bg-[#0B1120] min-h-screen pt-20 font-sans tracking-tight">
      
      {/* ELITE TOAST SYSTEM */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-5 rounded-3xl shadow-2xl border animate-in slide-in-from-top duration-500 ${toast.type === 'error' ? 'bg-rose-500/95 border-rose-400' : 'bg-indigo-600/95 border-indigo-400'}`}>
          <p className="text-xs font-black uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-800/50 pb-10">
        <div className="flex items-center gap-5">
            <div className="bg-indigo-600 p-2 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Zap className="w-7 h-7 text-white fill-current" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-6">
            <div className={`px-6 py-2.5 rounded-full text-[10px] font-black border flex items-center gap-2 tracking-widest ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACCESS" : `TRIAL SCANS: ${3 - scanCount}`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal" afterSignInUrl="/">
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl hover:scale-105 active:scale-95">Log In</button>
                </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      {/* THREE-STEP WIZARD */}
      <div className="grid md:grid-cols-3 gap-10">
          <div onClick={() => setActiveTab('jd')} className={`p-12 rounded-[3rem] border transition-all duration-500 cursor-pointer hover:scale-[1.02] ${jdReady ? 'bg-indigo-900/10 border-emerald-500/50' : 'bg-slate-800/20 border-slate-800'}`}>
              <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black mb-8 shadow-lg">1</div>
              <h4 className="uppercase text-xs font-black tracking-widest mb-4">The Benchmark</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Paste your JD or upload the file to set the AI's success criteria.</p>
              {jdReady && <div className="mt-6 text-emerald-400 text-[10px] font-black tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> READY</div>}
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-12 rounded-[3rem] border transition-all duration-500 cursor-pointer hover:scale-[1.02] ${resumeReady ? 'bg-indigo-900/10 border-emerald-500/50' : 'bg-slate-800/20 border-slate-800'}`}>
              <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black mb-8 shadow-lg">2</div>
              <h4 className="uppercase text-xs font-black tracking-widest mb-4">The Candidate</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Upload the resume. Our engine will map it against your benchmarks.</p>
              {resumeReady && <div className="mt-6 text-emerald-400 text-[10px] font-black tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> READY</div>}
          </div>
          <div className={`p-12 rounded-[3rem] border transition-all duration-500 ${analysis ? 'bg-indigo-900/10 border-indigo-500' : 'bg-slate-800/20 border-slate-800'}`}>
              <div className="bg-purple-600 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black mb-8 shadow-lg">3</div>
              <h4 className="uppercase text-xs font-black tracking-widest mb-4">The Result</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Generate scores, gaps analysis, and high-impact interview guides.</p>
          </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-[#111827] p-12 rounded-[3.5rem] border border-slate-800 flex flex-col h-[850px] shadow-3xl">
            <div className="flex gap-5 mb-10">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-900/40' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
                   1. Job Description
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-900/40' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
                   2. Resume
                </button>
            </div>
            
            <div className="flex gap-5 mb-8">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/30 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white border border-slate-800 transition-all">Upload Document<input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" /></label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Elite Samples Loaded!");}} className="flex-1 bg-slate-800/30 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-400 border border-slate-800 hover:text-white transition-all">Load Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-200 p-12 border border-slate-800/50 rounded-[2.5rem] text-base leading-loose focus:border-indigo-600/50 transition-all custom-scrollbar font-sans"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste text or upload file above..."
            />
            
            <button onClick={handleScreen} disabled={loading} className="mt-12 py-8 rounded-[2rem] font-black uppercase text-xs bg-indigo-600 shadow-3xl flex items-center justify-center gap-5 hover:bg-indigo-500 transition-all tracking-[0.2em] group">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white group-hover:animate-pulse" />}
              {loading ? "PROCESSING..." : "EXECUTE ELITE SCREEN →"}
            </button>
        </div>

        {/* OUTPUT PANEL */}
        <div className="h-[850px] overflow-y-auto space-y-12 pr-6 custom-scrollbar pb-12">
            {analysis ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="bg-[#111827] border border-slate-800 p-14 rounded-[4rem] text-center shadow-3xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500"></div>
                  <div className="w-40 h-40 mx-auto rounded-full bg-slate-900 border-8 border-indigo-600/20 flex items-center justify-center text-7xl font-black mb-8 shadow-inner">{analysis.score}%</div>
                  <div className="text-white font-black text-4xl mb-12 tracking-tighter uppercase italic">{analysis.candidate_name}</div>
                  
                  <div className="bg-slate-950/50 rounded-[2.5rem] p-12 mb-12 text-left border border-slate-800/50 shadow-inner">
                    <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-4"><FileText className="w-4 h-4" /> Executive Analysis</h4>
                    <p className="text-base text-slate-300 leading-loose font-medium italic">"{analysis.summary}"</p>
                  </div>

                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-12 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center gap-4 mx-auto shadow-2xl">
                    <Download className="w-5 h-5" /> Download Professional Report
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-12 rounded-[3rem]">
                    <h4 className="text-emerald-400 font-black uppercase mb-8 text-[10px] tracking-widest flex items-center gap-4"><Check className="w-5 h-5" /> Strengths</h4>
                    <div className="space-y-6">{analysis.strengths.map((s: string, i: number) => <div key={i} className="text-sm text-slate-200 leading-relaxed font-bold flex gap-3"><span className="text-emerald-500">•</span> {s}</div>)}</div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/10 p-12 rounded-[3rem]">
                    <h4 className="text-rose-400 font-black uppercase mb-8 text-[10px] tracking-widest flex items-center gap-4"><Shield className="w-5 h-5" /> Critical Gaps</h4>
                    <div className="space-y-6">{analysis.gaps.map((g: string, i: number) => <div key={i} className="text-sm text-slate-200 leading-relaxed font-bold flex gap-3"><span className="text-rose-500">•</span> {g}</div>)}</div>
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-14 rounded-[3.5rem] leading-loose">
                  <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-12 tracking-[0.3em] flex items-center gap-5"><HelpCircle className="w-5 h-5" /> Strategic Interview Guide</h4>
                  <div className="space-y-8">{analysis.questions.map((q: string, i: number) => <div key={i} className="p-10 bg-slate-950/50 rounded-[2.5rem] border border-slate-800/50 text-sm text-slate-200 font-bold italic shadow-inner">"{q}"</div>)}</div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-14 rounded-[3.5rem] text-center">
                    <h4 className="text-blue-400 font-black uppercase text-[10px] mb-10 tracking-[0.3em] flex items-center justify-center gap-4"><Mail className="w-4 h-4" /> Outreach Automation</h4>
                    <div className="bg-slate-950/50 rounded-[2.5rem] p-12 mb-12 text-left border border-slate-800 shadow-inner">
                        <p className="text-sm text-slate-400 whitespace-pre-wrap leading-loose font-medium">{analysis.outreach_email}</p>
                    </div>
                    <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Copied to Clipboard!");}} className="w-full py-7 bg-slate-800 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-5 border border-slate-700 shadow-xl"><Copy className="w-5 h-5" /> Copy Email Template</button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800/50 rounded-[4rem] flex flex-col items-center justify-center text-slate-700 font-black text-[10px] uppercase tracking-[0.5em] gap-12">
                <Zap className="w-16 h-16 opacity-10 animate-pulse" />
                <p>Awaiting Intelligence Execution</p>
              </div>
            )}
        </div>
      </div>

      {/* SALES / UPGRADE MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-950/95">
          <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[4rem] p-20 max-w-5xl w-full shadow-4xl flex flex-col md:flex-row overflow-hidden">
              <div className="relative p-6 md:w-3/5">
                 <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-12 shadow-xl"><Zap className="w-6 h-6 text-white fill-current" /></div>
                 <h2 className="text-8xl font-black text-white mb-10 leading-none tracking-tighter uppercase italic">GO <span className="text-indigo-500">ELITE.</span></h2>
                 <p className="text-slate-400 mb-14 font-black uppercase text-[10px] tracking-[0.3em] leading-loose">Unlimited high-fidelity scans and deep match analytics for senior hiring.</p>
                 {!isSignedIn ? (
                    <SignUpButton mode="modal">
                        <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="block w-full py-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em] text-xs shadow-3xl shadow-blue-500/30 transition-all hover:scale-[1.02]">Unlock Full Platform</button>
                    </SignUpButton>
                 ) : <a href={finalStripeUrl} className="block w-full py-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em] text-xs shadow-3xl shadow-blue-500/30">Continue to Payment</a>}
                 <button onClick={() => setShowLimitModal(false)} className="mt-12 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] hover:text-white underline decoration-slate-800 transition-all w-full text-center">Maybe Later</button>
              </div>
              <div className="hidden md:flex md:w-2/5 bg-slate-900/40 flex-col items-center justify-center p-20 text-center shadow-inner">
                 <Shield className="w-20 h-20 text-indigo-400 mb-14 animate-pulse" />
                 <h3 className="font-black text-white text-5xl uppercase tracking-tighter mb-10 italic">Elite Status</h3>
                 <ul className="text-[10px] text-slate-500 space-y-8 font-black uppercase tracking-[0.2em] text-left">
                    <li className="flex items-center gap-4"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Scans</li>
                    <li className="flex items-center gap-4"><Check className="w-4 h-4 text-emerald-500" /> PDF Report Export</li>
                    <li className="flex items-center gap-4"><Check className="w-4 h-4 text-emerald-500" /> Strategic Interview Guide</li>
                    <li className="flex items-center gap-4"><Check className="w-4 h-4 text-emerald-500" /> Outreach Automation</li>
                 </ul>
              </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-28 border-t border-slate-800/50 pt-14 pb-28 text-center text-[10px] uppercase font-black tracking-[0.4em] text-slate-600">
        <p className="mb-8">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-14">
          <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400 transition-all">Support</button>
          <a href="https://www.corecreativityai.com/blank-2" target="_blank" className="hover:text-indigo-400 transition-all">Terms</a>
          <a href="https://www.corecreativityai.com/blank" target="_blank" className="hover:text-indigo-400 transition-all">Privacy</a>
        </div>
      </footer>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/95">
          <div className="bg-[#0F172A] border border-slate-700/50 p-16 rounded-[4rem] max-w-xl w-full shadow-4xl text-center">
            <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter italic">Elite Support</h2>
            <textarea className="w-full h-56 bg-[#0B1120] border border-slate-800 rounded-[2.5rem] p-10 text-sm text-white outline-none resize-none mb-12 focus:border-indigo-600 transition-all leading-loose shadow-inner" placeholder="How can we assist your workflow?" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-8"><button onClick={() => {showToast("Request Sent!"); setShowSupportModal(false);}} className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-500 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl">Send Request</button><button onClick={() => setShowSupportModal(false)} className="px-12 py-6 bg-slate-800 hover:bg-slate-700 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all">Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
