"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, FileText, User, Briefcase } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL EXTENDED SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate to ensure 99.999% uptime.
- Lead the migration from legacy monolithic structures to a modern, event-driven architecture using Kafka and gRPC.
- Optimize C++ and Go-based trading engines for sub-millisecond latency.
- Establish CI/CD best practices and mentor a global team of 15+ senior engineers.
- Collaborate with quantitative researchers to implement complex trading algorithms.
- Ensure strict compliance with financial regulations and data security standards (SOC2, ISO 27001).

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech or Capital Markets.
- Deep expertise in AWS Cloud Architecture (AWS Certified Solutions Architect preferred).
- Proven track record with Kubernetes, Docker, Kafka, Redis, and Terraform.
- Strong proficiency in Go (Golang), C++, Python, and TypeScript.
- Experience designing low-latency, high-throughput systems.
- Bachelor’s or Master’s degree in Computer Science or related field.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com | (555) 123-4567

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers and successfully delivered multi-million dollar platform overhauls.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | New York, NY | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data using AWS Lambda and Kinesis.
- Reduced infrastructure costs by 35% through aggressive AWS Graviton migration and spot instance orchestration.
- Led a team of 15 engineers in re-writing the core risk engine, improving calculation speed by 400%.
- Implemented a zero-trust security model across the entire engineering organization.

InnovaTrade | Senior Staff Engineer | Chicago, IL | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency (sub-50 microseconds).
- Implemented automated failover protocols that prevented over $10M in potential slippage during market volatility.
- Mentored junior developers and established the company's first formal code review process.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java, Rust.
- Cloud: AWS (EKS, Lambda, Aurora, SQS, DynamoDB), Terraform, Docker, Kubernetes.
- Architecture: Microservices, Event-Driven Design, Serverless, CQRS.
- Tools: GitLab CI, Prometheus, Grafana, Splunk, Jira.`;

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
  const [copied, setCopied] = useState(false);

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

  // --- NEW: THE STRIPE TRAP ---
  // If the user signed in and we have the "trigger_stripe" flag, force them to Stripe.
  useEffect(() => {
    if (isSignedIn && sessionStorage.getItem('trigger_stripe') === 'true') {
        // Clear the flag so it doesn't loop forever
        sessionStorage.removeItem('trigger_stripe');
        // Force the redirect
        window.location.href = finalStripeUrl;
    }
  }, [isSignedIn, finalStripeUrl]);

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = (e: any) => {
    e.preventDefault();
    window.location.href = `mailto:hello@corecreativityai.com?subject=Support&body=${encodeURIComponent(supportMessage)}`;
    setShowSupportModal(false);
    setSupportMessage('');
    showToast("Email client opened!", "info");
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        try {
            // @ts-ignore
            if (window.pdfjsLib) {
                // @ts-ignore
                const pdfjs = window.pdfjsLib;
                const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
                const pdf = await loadingTask.promise;
                let fullText = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  // @ts-ignore
                  fullText += textContent.items.map(item => item.str).join(' ') + "\n";
                }
                text = fullText;
            } else {
                showToast("PDF Reader not loaded. Copy/Paste text for now.", "error");
                return;
            }
        } catch (e) {
            console.error(e);
            showToast("PDF Read Error. Try pasting text.", "error");
            return;
        }
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} uploaded!`, "success");
    } catch (err) { showToast("Upload failed.", "error"); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();

    // PAGE 1: EXECUTIVE SUMMARY
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("INTELLIGENCE REPORT", 20, 25);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("RECRUIT-IQ | POWERED BY CORE CREATIVITY AI", 20, 32);

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
    const maxItems = Math.max(strengths.length, gaps.length);

    for (let i = 0; i < maxItems; i++) {
        let currentY = y;
        if (strengths[i]) {
            const sLines = doc.splitTextToSize(`• ${strengths[i]}`, 85);
            doc.text(sLines, 20, currentY);
            currentY += (sLines.length * 5);
        }
        let gapY = y;
        if (gaps[i]) {
            const gLines = doc.splitTextToSize(`• ${gaps[i]}`, 85);
            doc.text(gLines, 110, gapY);
            gapY += (gLines.length * 5);
        }
        y = Math.max(currentY, gapY) + 4;
    }

    // PAGE 2: INTERVIEW GUIDE
    doc.addPage();
    doc.setFillColor(248, 250, 252); doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(79, 70, 229); doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC INTERVIEW GUIDE", 20, 35);
    
    y = 50;
    doc.setFontSize(10); doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    (analysis.questions || []).forEach((q: string, i: number) => {
      const qLines = doc.splitTextToSize(`${i + 1}. ${q}`, 170);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, y - 5, 180, (qLines.length * 5) + 10, 2, 2, 'F');
      doc.text(qLines, 20, y + 2);
      y += (qLines.length * 5) + 16;
    });

    doc.save(`RecruitIQ_Report_${cName}.pdf`);
  };

  const handleScreen = async () => {
    // 1. LIMIT CHECK
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    // 2. VALIDATION
    if (!jdReady || !resumeReady) { showToast("Steps 1 & 2 Required.", "error"); return; }
    
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, summary, 3 strengths, 3 gaps, 5 questions, and outreach email. Return ONLY JSON: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`;
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);
      setAnalysis(result);

      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Generated", "success");
    } catch (err) { showToast("AI Engine Error.", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            {/* --- FIX 1: CODE-BASED LOGO (No broken images) --- */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Elite Candidate Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn && (
                // We add the trap here too, just in case
                <SignInButton mode="modal">
                    <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-indigo-500/20">
                        Log In
                    </button>
                </SignInButton>
            )}
            <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      {/* QUICK START */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${jdReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                {jdReady && <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">Validated</span>}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Set Expectations</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Upload or Paste the Job Description to establish requirements.</p>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${resumeReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                {resumeReady && <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">Validated</span>}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Input Candidate</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Upload a PDF/DOCX or paste the resume to compare profiles.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Generate Intelligence</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Execute AI screen to uncover match scores and guides.</p>
          </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  1. Job Description {jdReady && <span className="text-emerald-400 text-lg">✓</span>}
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  2. Resume {resumeReady && <span className="text-emerald-400 text-lg">✓</span>}
                </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700 transition-all">
                Upload pdf or doc
                <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Full Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all">
              <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[9px]">3</span>
              {loading ? "Analyzing Candidate..." : "Execute AI Screen →"}
            </button>
        </div>

        {/* RESULTS COLUMN */}
        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="uppercase text-[9px] font-bold tracking-widest text-slate-500 mb-1">Match Score</h3>
                  <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 transition-all">Download Elite Report</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl text-[11px]"><h4 className="text-emerald-400 font-bold uppercase mb-3 text-[9px] tracking-widest">Key Strengths</h4>{analysis.strengths.map((s: string, i: number) => <p key={i} className="mb-2 text-slate-200">• {s}</p>)}</div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl text-[11px]"><h4 className="text-rose-400 font-bold uppercase mb-3 text-[9px] tracking-widest">Critical Gaps</h4>{analysis.gaps.map((g: string, i: number) => <p key={i} className="mb-2 text-slate-200">• {g}</p>)}</div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[9px] mb-4 tracking-widest">Strategic Interview Questions</h4>
                  <div className="space-y-3 text-[11px] text-slate-300">
                    {analysis.questions.map((q: string, i: number) => <p key={i} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 font-medium">"{q}"</p>)}
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl text-center">
                    <h4 className="text-blue-400 font-bold uppercase text-[9px] mb-4">Outreach Email</h4>
                    <p className="text-[10px] text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">{analysis.outreach_email}</p>
                    <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Copied", "success")}} className="w-full py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest">Copy Outreach Email</button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest gap-4 text-center p-10">
                <span className="text-4xl opacity-20">📊</span>
                Waiting for Candidate Data...
              </div>
            )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <p className="mb-4 text-[9px]">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-6">
          <a href="https://www.corecreativityai.com/blank" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">Privacy Policy</a>
          <a href="https://www.corecreativityai.com/blank-2" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">Terms of Service</a>
          <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400">Contact Support</button>
        </div>
      </footer>

      {/* SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
          <div className="relative w-full max-w-3xl group animate-in zoom-in-95 duration-300">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-10 md:w-3/5 flex flex-col justify-center relative z-10">
                 {/* --- FIX 1B: LOGO ICON IN MODAL (Replaced broken image) --- */}
                 <div className="mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
                 </div>
                 
                 <h2 className="text-4xl font-black text-white mb-3 leading-none">Hire Your Next Star <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">In Seconds.</span></h2>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Stop manually screening resumes. Unlock the full power of Recruit-IQ to uncover hidden talent instantly.</p>
                 
                 <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 text-center relative shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                     <span className="absolute -top-3 -right-3 text-2xl drop-shadow-md">🎁</span>
                     <p className="text-xs font-black text-blue-300 uppercase tracking-widest">Special Offer: 3 Days Free Access</p>
                 </div>
                 
                 {!isSignedIn ? (
                    // --- FIX 2: THE SESSION TRAP ---
                    // Added onClick to set 'trigger_stripe' flag before opening modal
                    <SignUpButton mode="modal" forceRedirectUrl={STRIPE_URL}>
                        <button 
                            onClick={() => sessionStorage.setItem('trigger_stripe', 'true')}
                            className="block w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-xl shadow-blue-500/30">
                            Create Free Account
                        </button>
                    </SignUpButton>
                 ) : (
                    <a href={finalStripeUrl} className="block w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-xl shadow-blue-500/30">
                        Start 3-Day Free Trial
                    </a>
                 )}

                 <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-500 mt-5 hover:text-white underline decoration-slate-700 w-full uppercase font-bold tracking-widest">No thanks, I'll screen manually</button>
              </div>
              
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 flex-col items-center justify-center p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                 <div className="text-center relative z-10 space-y-8">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.4)] animate-pulse">
                        <span className="text-5xl">💎</span>
                    </div>
                    <div>
                        <h3 className="font-black text-white text-xl uppercase tracking-tighter">Elite Membership</h3>
                        <p className="text-xs text-slate-400 mt-2 px-2 leading-relaxed">Unlimited Scans. <br/> Advanced Interview Guides. <br/> AI Email Writer.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl text-center">
            <h2 className="text-2xl font-black mb-4 uppercase">Support</h2>
            <textarea required className="w-full h-32 bg-[#0B1120] border border-slate-800 rounded-xl p-4 text-[11px] text-white outline-none resize-none" placeholder="How can we help?" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button onClick={handleSupportSubmit} className="flex-1 py-4 bg-indigo-600 rounded-xl font-black uppercase text-[10px]">Send Email</button>
              <button onClick={() => setShowSupportModal(false)} className="px-6 py-4 bg-slate-800 rounded-xl font-black uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
