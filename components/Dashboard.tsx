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

// --- RECRUITER SAMPLE DATA ---
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
  
  // CORE APP STATE
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

  // PERSISTENCE & LOCAL STORAGE
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  // AUTOMATED REDIRECT HANDLER (STRIPE -> DASHBOARD)
  useEffect(() => {
    const handleReturnFlow = async () => {
      if (!isLoaded || !isSignedIn) return;

      // Check if user was in the middle of an upgrade before signing up
      if (sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment_success') === 'true' && !isPro) {
        showToast("Verifying Elite Access...", "info");
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
    } catch (err) { showToast("Syncing records...", "info"); } finally { setVerifying(false); }
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
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} Uploaded Successfully`);
    } catch (err) { showToast("Error reading file.", "error"); } finally { setLoading(false); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();
    
    // PDF BRANDING
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 60, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(28); doc.setFont("helvetica", "bold");
    doc.text("RECRUIT-IQ", 15, 30);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("STRATEGIC CANDIDATE ANALYSIS REPORT", 15, 40);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 155, 40);
    
    doc.setTextColor(30, 41, 59); doc.setFontSize(24); doc.text(cName, 15, 80);
    doc.setDrawColor(226, 232, 240); doc.line(15, 85, 195, 85);
    
    doc.setFillColor(79, 70, 229); doc.roundedRect(160, 65, 35, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.text(`${analysis.score}%`, 170, 78);

    doc.setFillColor(248, 250, 252); doc.rect(15, 95, 180, 50, 'F');
    doc.setTextColor(79, 70, 229); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", 20, 105);
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 115);

    doc.setTextColor(16, 185, 129); doc.setFont("helvetica", "bold"); doc.text("TOP STRENGTHS", 15, 160);
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    analysis.strengths.forEach((s: string, i: number) => doc.text(`• ${s}`, 15, 170 + (i * 7)));

    doc.setTextColor(244, 63, 94); doc.setFont("helvetica", "bold"); doc.text("CRITICAL GAPS", 15, 210);
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    analysis.gaps.forEach((g: string, i: number) => doc.text(`• ${g}`, 15, 220 + (i * 7)));

    doc.save(`RecruitIQ_Report_${cName}.pdf`);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true); return;
    }
    if (!jdReady || !resumeReady) { showToast("Incomplete Data", "error"); return; }
    setLoading(true);
    try {
      const prompt = `Analyze this Job Description: [${jdText}] against this Resume: [${resumeText}]. 
      You are a world-class executive recruiter. Return a JSON object exactly like this:
      {
        "candidate_name": "Full Name",
        "score": 85,
        "summary": "One paragraph executive summary.",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "gaps": ["Gap 1", "Gap 2"],
        "questions": ["Question 1", "Question 2"],
        "outreach_email": "A personalized email to the candidate."
      }`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, { 
        method: "POST", headers: { "Content-Type": "application/json" }, 
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
      showToast("Intelligence Extraction Complete");
    } catch (err) { showToast("AI Engine Error", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest italic text-white">Authenticating Secure Session</p>
    </div>
  );

  return (
    <div className="relative p-4 md:p-10 max-w-[1600px] mx-auto space-y-12 text-white bg-[#020617] min-h-screen pt-24 font-sans selection:bg-indigo-500/30">
      
      {/* TOAST NOTIFICATIONS */}
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl bg-indigo-600 shadow-2xl border border-indigo-400 animate-in slide-in-from-top duration-300">
          <p className="text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* DYNAMIC NAVIGATION - V4 COMPATIBLE FIX */}
      <nav className="fixed top-0 left-0 w-full z-[100] backdrop-blur-xl border-b border-slate-800/50 bg-[#020617]/80">
        <div className="max-w-7xl mx-auto px-10 h-20 flex justify-between items-center">
            <div className="flex items-center gap-4 group cursor-default">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <Zap className="w-6 h-6 text-white fill-current" />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ <span className="text-indigo-500 italic">Elite</span></h1>
            </div>
            
            <div className="flex items-center gap-8">
                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isPro ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5'}`}>
                    {isPro ? "ELITE LICENSE" : `${3 - scanCount} SCANS REMAINING`}
                </div>
                {!isSignedIn ? (
                    /* THE V4 SPOOLING FIX - USING afterSignInUrl */
                    <SignInButton mode="modal" afterSignInUrl="/" afterSignUpUrl="/">
                        <button className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-indigo-50 transition-all active:scale-95">Log In</button>
                    </SignInButton>
                ) : (
                  <div className="flex items-center gap-4">
                    {isPro && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                    <UserButton afterSignOutUrl="/"/>
                  </div>
                )}
            </div>
        </div>
      </nav>

      {/* ELITE WORKSPACE GRID */}
      <div className="grid lg:grid-cols-2 gap-12 pt-6">
        
        {/* INPUT COLUMN */}
        <div className="bg-[#0f172a] p-10 rounded-[3.5rem] border border-slate-800/80 shadow-2xl relative">
            <div className="flex gap-4 mb-10 p-1.5 bg-slate-950 rounded-[2rem] border border-slate-800">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'jd' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>Job Criteria</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>Resume Data</button>
            </div>
            
            <div className="flex gap-4 mb-8">
              <label className="flex-1 cursor-pointer bg-slate-900/40 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-indigo-400 border border-slate-800/50 transition-all flex items-center justify-center gap-3">
                <FileText className="w-4 h-4" /> Import Document
                <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Global Sample Loaded");}} className="flex-1 bg-slate-900/40 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-500 border border-slate-800/50 hover:text-indigo-400 transition-all">Sample Dataset</button>
            </div>

            <textarea 
              className="w-full h-[550px] bg-[#020617] resize-none outline-none text-slate-300 p-10 border border-slate-800 rounded-[3rem] text-sm leading-relaxed focus:border-indigo-600/50 transition-all font-medium custom-scrollbar"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="System Ready. Awaiting Input Data..."
            />
            
            <button onClick={handleScreen} disabled={loading} className="w-full mt-10 py-10 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] bg-indigo-600 hover:bg-indigo-500 shadow-3xl flex items-center justify-center gap-5 transition-all group active:scale-[0.98]">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 fill-white group-hover:rotate-12 transition-transform" />}
              {loading ? "ANALYZING CANDIDATE..." : "EXECUTE STRATEGIC SCREEN"}
            </button>
        </div>

        {/* ANALYSIS COLUMN */}
        <div className="space-y-12 h-full">
            {analysis ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-1000">
                
                {/* MATCH SCORE CARD */}
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[4rem] text-center shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500"></div>
                  <div className="flex justify-center items-center gap-12 mb-10">
                    <div className="relative">
                        <svg className="w-36 h-36 transform -rotate-90">
                            <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-900" />
                            <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="10" fill="transparent" 
                                strokeDasharray={414.6}
                                strokeDashoffset={414.6 - (414.6 * analysis.score) / 100}
                                className="text-indigo-500 transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-4xl italic">{analysis.score}%</div>
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest italic">Core Match Probability</div>
                        <div className="text-3xl font-black uppercase tracking-tighter text-white mb-2">{analysis.candidate_name}</div>
                        <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase">
                          <Award className="w-4 h-4" /> Top Tier Talent
                        </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 italic mb-10 leading-loose border-t border-slate-800/50 pt-8">"{analysis.summary}"</p>
                  <button onClick={downloadPDF} className="w-full py-7 bg-slate-900 hover:bg-slate-800 rounded-[2rem] text-[10px] font-black uppercase border border-slate-800 transition-all flex items-center justify-center gap-4 shadow-xl">
                    <Download className="w-5 h-5" /> Export Elite Strategy Report
                  </button>
                </div>

                {/* SWOT GRID */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[3rem]">
                    <h4 className="text-emerald-400 font-black uppercase text-[10px] mb-8 tracking-widest flex items-center gap-3">
                      <TrendingUp className="w-4 h-4" /> Candidate Strengths
                    </h4>
                    <div className="space-y-5 text-sm">{analysis.strengths.map((s: string, i: number) => <div key={i} className="flex gap-4 text-slate-300 font-medium leading-relaxed"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {s}</div>)}</div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/10 p-10 rounded-[3rem]">
                    <h4 className="text-rose-400 font-black uppercase text-[10px] mb-8 tracking-widest flex items-center gap-3">
                      <ZapOff className="w-4 h-4" /> Technical Gaps
                    </h4>
                    <div className="space-y-5 text-sm">{analysis.gaps.map((g: string, i: number) => <div key={i} className="flex gap-4 text-slate-300 font-medium leading-relaxed"><XCircle className="w-5 h-5 text-rose-500 shrink-0" /> {g}</div>)}</div>
                  </div>
                </div>

                {/* INTERVIEW QUESTIONS */}
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[3.5rem] relative group">
                  <div className="absolute top-8 right-12 text-slate-800 font-black text-6xl opacity-20">?</div>
                  <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-10 tracking-widest">Targeted Vetting Questions</h4>
                  <div className="space-y-6">
                      {analysis.questions.map((q: string, i: number) => (
                          <div key={i} className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-slate-800/40 text-sm italic font-medium leading-relaxed hover:border-indigo-500/30 transition-all">"{q}"</div>
                      ))}
                  </div>
                </div>

                {/* OUTREACH EMAIL */}
                <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[3.5rem] text-center">
                    <h4 className="text-blue-400 font-black uppercase text-[10px] mb-8 tracking-widest flex items-center justify-center gap-3">
                      <Mail className="w-4 h-4" /> Outreach Generation
                    </h4>
                    <div className="bg-slate-950/80 rounded-[2.5rem] p-10 mb-10 text-left border border-slate-800/60 max-h-96 overflow-y-auto custom-scrollbar">
                        <p className="text-sm text-slate-400 whitespace-pre-wrap leading-loose font-mono">{analysis.outreach_email}</p>
                    </div>
                    <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Email Copied to Clipboard");}} className="w-full py-8 bg-indigo-600 hover:bg-indigo-500 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-5 transition-all shadow-2xl active:scale-95">
                        <Copy className="w-5 h-5" /> Copy Template
                    </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-8 border-2 border-dashed border-slate-800/50 rounded-[5rem] bg-slate-900/10 group">
                  <div className="p-10 bg-slate-900/40 rounded-full border border-slate-800 group-hover:scale-110 transition-transform duration-700">
                    <Search className="w-16 h-16 text-slate-800" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">System Ready for Processing</p>
              </div>
            )}
        </div>
      </div>

      {/* ELITE SUBSCRIPTION MODAL - V4 COMPATIBLE FIX */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-950/98">
          <div className="bg-[#0F172A] border border-slate-800 rounded-[5rem] p-24 max-w-5xl w-full shadow-4xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
              <h2 className="text-8xl font-black text-white mb-8 tracking-tighter uppercase italic">GO <span className="text-indigo-500">ELITE.</span></h2>
              <p className="text-slate-400 mb-16 font-black uppercase text-[10px] tracking-[0.4em] leading-loose max-w-2xl mx-auto">Access unlimited deep-match processing, strategic reporting, and priority AI threading.</p>
              
              {!isSignedIn ? (
                /* THE V4 SPOOLING FIX - USING afterSignInUrl */
                <SignUpButton mode="modal" afterSignInUrl="/" afterSignUpUrl="/">
                    <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="block w-full py-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-[3rem] uppercase tracking-widest text-sm shadow-3xl hover:scale-[1.03] transition-all">Enable Full Platform Access</button>
                </SignUpButton>
              ) : (
                <a href={finalStripeUrl} className="block w-full py-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-[3rem] uppercase tracking-widest text-sm shadow-3xl hover:scale-[1.03] transition-all flex items-center justify-center gap-4">
                  <ShieldCheck className="w-6 h-6" /> Complete Elite Licensing
                </a>
              )}
              
              <button onClick={() => setShowLimitModal(false)} className="mt-14 text-[10px] text-slate-600 font-black uppercase tracking-widest hover:text-white underline transition-all">Dismiss and Continue Limited Trial</button>
          </div>
        </div>
      )}

      {/* ELITE FOOTER */}
      <footer className="mt-32 border-t border-slate-800/50 pt-16 pb-32 text-center opacity-40">
        <div className="flex justify-center gap-12 text-[9px] uppercase font-black tracking-[0.3em] text-slate-600">
            <span>&copy; {new Date().getFullYear()} Recruit-IQ Global</span>
            <a href="https://www.corecreativityai.com/blank-2" target="_blank" className="hover:text-white transition-colors">Client Terms</a>
            <a href="https://www.corecreativityai.com/blank" target="_blank" className="hover:text-white transition-colors">Privacy Protocols</a>
        </div>
      </footer>
    </div>
  );
}
