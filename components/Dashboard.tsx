"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, Check, FileText, Download, 
  Zap, Shield, HelpCircle, CheckCircle2, XCircle, Mail,
  ChevronRight, Sparkles, Target, BarChart3, MessageSquare, 
  FileSearch, UserCheck, Briefcase, Info, ExternalLink,
  ShieldCheck, ZapOff, TrendingUp, Search, Award
} from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- PROFESSIONAL RECRUITMENT SAMPLE DATA ---
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
- Deep expertise in AWS Cloud Architecture (VPC, IAM, Transit Gateway).
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
- Cloud: AWS (EKS, Lambda, Aurora), Terraform, Docker, Kubernetes.
- Languages: Go, C++, Python, Rust.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [verifying, setVerifying] = useState(false);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type: type as any });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // --- FILE PROCESSING ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} Uploaded Successfully`);
    } catch (err) { showToast("Error reading file.", "error"); } finally { setLoading(false); }
  };

  // --- THE PDF GENERATOR ---
  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();
    
    // Header Styling
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 60, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(28); doc.setFont("helvetica", "bold");
    doc.text("RECRUIT-IQ", 15, 30);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("STRATEGIC CANDIDATE ANALYSIS REPORT", 15, 40);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 155, 40);
    
    // Score & Name
    doc.setTextColor(30, 41, 59); doc.setFontSize(24); doc.text(cName, 15, 80);
    doc.setDrawColor(226, 232, 240); doc.line(15, 85, 195, 85);
    doc.setFillColor(79, 70, 229); doc.roundedRect(160, 65, 35, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.text(`${analysis.score}%`, 170, 78);

    // Summary
    doc.setFillColor(248, 250, 252); doc.rect(15, 95, 180, 50, 'F');
    doc.setTextColor(79, 70, 229); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", 20, 105);
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 115);

    // Strengths
    doc.setTextColor(16, 185, 129); doc.setFont("helvetica", "bold"); doc.text("TOP STRENGTHS", 15, 160);
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    analysis.strengths.forEach((s: string, i: number) => doc.text(`• ${s}`, 15, 170 + (i * 7)));

    // Gaps
    doc.setTextColor(244, 63, 94); doc.setFont("helvetica", "bold"); doc.text("CRITICAL GAPS", 15, 210);
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    analysis.gaps.forEach((g: string, i: number) => doc.text(`• ${g}`, 15, 220 + (i * 7)));

    doc.save(`RecruitIQ_Report_${cName}.pdf`);
  };

  // --- AI SCREENING ENGINE ---
  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro && scanCount >= 3)) {
      setShowLimitModal(true); return;
    }
    if (!jdReady || !resumeReady) { showToast("Upload JD and Resume first", "error"); return; }
    setLoading(true);
    try {
      const prompt = `Perform a high-level executive recruitment screen.
      Job: [${jdText}]
      Resume: [${resumeText}]
      Return ONLY JSON with these keys: 
      "candidate_name", "score", "summary", "strengths" (array), "gaps" (array), "questions" (array), "outreach_email" (string)`;

      const response = await fetch('/api/generate', { 
        method: "POST", 
        body: JSON.stringify({ prompt }) 
      });
      
      const cleanJson = await response.json();
      setAnalysis(cleanJson);
      
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Extraction Complete");
    } catch (err) { showToast("AI Engine Error", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="relative p-4 md:p-10 max-w-[1600px] mx-auto space-y-12 text-white bg-[#020617] min-h-screen pt-24 font-sans">
      
      {/* TOAST SYSTEM */}
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl bg-indigo-600 shadow-2xl border border-indigo-400">
          <p className="text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* ELITE NAV */}
      <nav className="fixed top-0 left-0 w-full z-[100] backdrop-blur-xl border-b border-slate-800/50 bg-[#020617]/80">
        <div className="max-w-7xl mx-auto px-10 h-20 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Zap className="w-6 h-6 text-indigo-500 fill-current" />
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ <span className="text-indigo-500 italic">Elite</span></h1>
            </div>
            
            <div className="flex items-center gap-8">
                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isPro ? 'border-emerald-500/30 text-emerald-400' : 'border-indigo-500/30 text-indigo-400'}`}>
                    {isPro ? "ELITE LICENSE" : `${3 - scanCount} FREE SCANS LEFT`}
                </div>
                {!isSignedIn ? (
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-50 transition-all">Log In</button>
                    </SignInButton>
                ) : <UserButton afterSignOutUrl="/"/>}
            </div>
        </div>
      </nav>

      {/* MAIN INTERFACE */}
      <div className="grid lg:grid-cols-2 gap-12 pt-6">
        {/* INPUT PANEL */}
        <div className="bg-[#0f172a] p-10 rounded-[3.5rem] border border-slate-800/80 shadow-2xl">
            <div className="flex gap-4 mb-10 p-1.5 bg-slate-950 rounded-[2rem] border border-slate-800">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest ${activeTab === 'jd' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Job Criteria</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest ${activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Resume Data</button>
            </div>
            
            <div className="flex gap-4 mb-8">
              <label className="flex-1 cursor-pointer bg-slate-900/40 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-indigo-400 border border-slate-800/50 flex items-center justify-center gap-3 transition-all">
                <FileText className="w-4 h-4" /> Import Document
                <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Professional Sample Loaded");}} className="flex-1 bg-slate-900/40 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-500 border border-slate-800/50 hover:text-indigo-400 transition-all">Load Example</button>
            </div>

            <textarea 
              className="w-full h-[550px] bg-[#020617] resize-none outline-none text-slate-300 p-10 border border-slate-800 rounded-[3rem] text-sm leading-relaxed"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={`Paste the ${activeTab === 'jd' ? 'Job Description' : 'Resume'} here...`}
            />
            
            <button onClick={handleScreen} disabled={loading} className="w-full mt-10 py-10 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] bg-indigo-600 hover:bg-indigo-500 shadow-3xl flex items-center justify-center gap-5 transition-all">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 fill-white" />}
              {loading ? "PROFILING CANDIDATE..." : "EXECUTE STRATEGIC SCREEN"}
            </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="space-y-12 h-full">
            {analysis ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-right duration-700">
                {/* Score Card */}
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[4rem] text-center shadow-3xl">
                  <div className="text-6xl font-black text-indigo-500 mb-4 italic">{analysis.score}%</div>
                  <div className="text-3xl font-black uppercase tracking-tighter text-white mb-6">{analysis.candidate_name}</div>
                  <p className="text-sm text-slate-400 italic mb-10 leading-loose border-t border-slate-800/50 pt-8">"{analysis.summary}"</p>
                  <button onClick={downloadPDF} className="w-full py-7 bg-slate-900 hover:bg-slate-800 rounded-[2rem] text-[10px] font-black uppercase border border-slate-800 flex items-center justify-center gap-4 shadow-xl">
                    <Download className="w-5 h-5" /> Export Strategic Report (PDF)
                  </button>
                </div>

                {/* SWOT GRID */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[3rem]">
                    <h4 className="text-emerald-400 font-black uppercase text-[10px] mb-8 tracking-widest flex items-center gap-3"><TrendingUp className="w-4 h-4" /> Key Strengths</h4>
                    <div className="space-y-4 text-xs">{analysis.strengths.map((s: string, i: number) => <div key={i} className="flex gap-3 text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {s}</div>)}</div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/10 p-10 rounded-[3rem]">
                    <h4 className="text-rose-400 font-black uppercase text-[10px] mb-8 tracking-widest flex items-center gap-3"><ZapOff className="w-4 h-4" /> Risk Areas</h4>
                    <div className="space-y-4 text-xs">{analysis.gaps.map((g: string, i: number) => <div key={i} className="flex gap-3 text-slate-300"><XCircle className="w-4 h-4 text-rose-500 shrink-0" /> {g}</div>)}</div>
                  </div>
                </div>

                {/* INTERVIEW GRID */}
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[3.5rem]">
                  <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-8 tracking-widest">Targeted Interview Questions</h4>
                  <div className="space-y-4">
                      {analysis.questions.map((q: string, i: number) => (
                          <div key={i} className="p-6 bg-slate-950/80 rounded-[2.5rem] border border-slate-800/40 text-xs italic leading-relaxed">"{q}"</div>
                      ))}
                  </div>
                </div>

                {/* EMAIL GEN */}
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[3.5rem] text-center">
                    <h4 className="text-blue-400 font-black uppercase text-[10px] mb-8 tracking-widest flex items-center justify-center gap-3"><Mail className="w-4 h-4" /> Personalized Outreach</h4>
                    <div className="bg-slate-950/80 rounded-[2.5rem] p-10 mb-10 text-left border border-slate-800/60 max-h-60 overflow-y-auto">
                        <p className="text-xs text-slate-400 whitespace-pre-wrap leading-loose font-mono">{analysis.outreach_email}</p>
                    </div>
                    <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Outreach Email Copied");}} className="w-full py-8 bg-indigo-600 hover:bg-indigo-500 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-5 transition-all shadow-2xl">
                        <Copy className="w-5 h-5" /> Copy Email Template
                    </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-8 border-2 border-dashed border-slate-800/50 rounded-[5rem] bg-slate-900/10">
                  <Search className="w-16 h-16 text-slate-800" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Awaiting Intelligence Input</p>
              </div>
            )}
        </div>
      </div>

      {/* ELITE UPGRADE MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-950/98">
          <div className="bg-[#0F172A] border border-slate-800 rounded-[5rem] p-24 max-w-5xl w-full text-center relative overflow-hidden">
              <h2 className="text-8xl font-black text-white mb-8 tracking-tighter uppercase italic">GO <span className="text-indigo-500">ELITE.</span></h2>
              <p className="text-slate-400 mb-16 font-black uppercase text-[10px] tracking-[0.4em] leading-loose max-w-2xl mx-auto">You've reached the free trial limit. Upgrade for unlimited Deep-Match processing and full strategic PDF reporting.</p>
              
              {!isSignedIn ? (
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <button className="block w-full py-12 bg-indigo-600 text-white font-black rounded-[3rem] uppercase tracking-widest text-sm shadow-3xl hover:scale-[1.03] transition-all">Join the Elite Platform</button>
                </SignUpButton>
              ) : (
                <a href={finalStripeUrl} className="block w-full py-12 bg-indigo-600 text-white font-black rounded-[3rem] uppercase tracking-widest text-sm shadow-3xl hover:scale-[1.03] transition-all">Unlock Elite License Now</a>
              )}
              
              <button onClick={() => setShowLimitModal(false)} className="mt-14 text-[10px] text-slate-600 font-black uppercase tracking-widest hover:text-white transition-all underline">Continue as Guest</button>
          </div>
        </div>
      )}
    </div>
  );
}
