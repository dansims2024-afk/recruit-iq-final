"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, FileText, Download, 
  Zap, Shield, CheckCircle2, XCircle, Mail,
  Sparkles, TrendingUp, Search, Award,
  Cpu, Briefcase, Target,
  MessageSquare, LayoutDashboard, 
  ShieldCheck, Clock, ListChecks,
  ZapOff
} from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- PROFESSIONAL RECRUITMENT SAMPLE DATA ---
const SAMPLE_JD = `JOB TITLE: Lead Skilled Trades Supervisor (HVAC/Electrical)
LOCATION: Mid-Atlantic Region (Philadelphia/NJ)
SALARY: $110,000 - $135,000 + Company Vehicle + Bonus

OVERVIEW:
Join a premier industrial services firm. We are looking for a Lead Supervisor to oversee multi-site mechanical installations and manage a team of 20+ technicians.

REQUIREMENTS:
- 10+ years in Skilled Trades management.
- Master Electrician or Master Plumber license preferred.
- Expert knowledge of OSHA safety protocols and blueprint reading.
- Experience with project scheduling software and budget management.`;

const SAMPLE_RESUME = `ROBERT 'BOB' MILLER
Senior Trades Project Manager | Cherry Hill, NJ

SUMMARY:
Results-driven Trades Leader with 15 years of experience overseeing large-scale mechanical projects. Proven track record of finishing 15% under budget while maintaining 100% safety compliance.

EXPERIENCE:
Mid-Atlantic Industrial | Project Lead | 2018 - Present
- Managed $5M+ electrical infrastructure projects for pharmaceutical plants.
- Supervised a crew of 25 union and non-union technicians.
- Reduced project turnaround time by 20% through better resource allocation.

SKILLS:
- OSHA 30 Certified.
- Industrial HVAC, Electrical Systems, PLC Logic.
- Microsoft Project, Procore, Bluebeam.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [currentStep, setCurrentStep] = useState(1); // Tracker state

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message, type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
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
      setCurrentStep(2);
      showToast("File Processed Successfully");
    } catch (err) { showToast("Error reading file"); } finally { setLoading(false); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const name = (analysis.candidate_name || "Candidate").toUpperCase();
    
    // Modern Header
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 60, 'F');
    doc.setTextColor(255, 255, 255); 
    doc.setFontSize(26); doc.setFont("helvetica", "bold");
    doc.text("RECRUIT-IQ", 15, 30);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("ELITE STRATEGIC CANDIDATE ANALYSIS", 15, 40);
    
    // Score Badge
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(160, 20, 35, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); doc.text(`${analysis.score}%`, 168, 37);

    // Body
    doc.setTextColor(30, 41, 59); doc.setFontSize(22); doc.text(name, 15, 80);
    doc.setDrawColor(226, 232, 240); doc.line(15, 85, 195, 85);

    doc.setTextColor(51, 65, 85); doc.setFontSize(11); doc.setFont("helvetica", "italic");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 175);
    doc.text(summaryLines, 15, 95);

    // Strengths
    doc.setTextColor(16, 185, 129); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("TOP STRATEGIC STRENGTHS", 15, 130);
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    analysis.strengths.forEach((s: string, i: number) => doc.text(`• ${s}`, 15, 140 + (i * 8)));

    // Gaps
    doc.setTextColor(244, 63, 94); doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("IDENTIFIED RISK AREAS", 15, 180);
    doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    analysis.gaps.forEach((g: string, i: number) => doc.text(`• ${g}`, 15, 190 + (i * 8)));

    doc.save(`RecruitIQ_Report_${name.replace(/\s/g, '_')}.pdf`);
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (!jdText || !resumeText) { showToast("Missing Data"); return; }
    setLoading(true);
    setCurrentStep(3);
    try {
      const prompt = `Perform a high-level executive recruitment screen for a Skilled Trades Lead.
      Analyze this Job: [${jdText}] 
      Against this Resume: [${resumeText}]
      Return valid JSON only: {
        "candidate_name": "string",
        "score": number,
        "summary": "string",
        "strengths": ["array of 4"],
        "gaps": ["array of 4"],
        "questions": ["array of 3"],
        "outreach_email": "string"
      }`;

      const res = await fetch('/api/generate', { method: "POST", body: JSON.stringify({ prompt }) });
      const data = await res.json();
      setAnalysis(data);
      setCurrentStep(4);
      if (!isPro) {
        const nc = scanCount + 1;
        setScanCount(nc);
        localStorage.setItem('recruit_iq_scans', nc.toString());
      }
    } catch (e) { showToast("AI Engine Error"); setCurrentStep(1); } finally { setLoading(false); }
  };

  if (!isLoaded) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Initializing Elite Engine...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-20">
      
      {/* ELITE NAVIGATION */}
      <nav className="h-20 border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/40">
                <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Recruit-IQ <span className="text-indigo-500 italic">Elite</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 mr-8">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Division</span>
                <span className="text-xs font-bold text-white">Skilled Trades (Mid-Atlantic)</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${isPro ? 'border-emerald-500/30 text-emerald-400' : 'border-indigo-500/30 text-indigo-400'}`}>
              {isPro ? "ELITE LICENSE" : `${3 - scanCount} SCANS REMAINING`}
            </div>
            {!isSignedIn ? (
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="bg-white text-black px-8 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-indigo-50 transition-all">Login</button>
              </SignInButton>
            ) : <UserButton />}
          </div>
        </div>
      </nav>

      {/* DASHBOARD BODY */}
      <main className="max-w-[1500px] mx-auto px-6 pt-12">
        
        {/* STEP PROGRESS TRACKER */}
        <div className="grid grid-cols-4 gap-4 mb-12">
            {[
                { id: 1, label: "Input", icon: FileText },
                { id: 2, label: "Review", icon: ListChecks },
                { id: 3, label: "Profile", icon: Cpu },
                { id: 4, label: "Report", icon: Award }
            ].map((step) => (
                <div key={step.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentStep >= step.id ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className={`p-2 rounded-lg ${currentStep >= step.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        <step.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= step.id ? 'text-white' : 'text-slate-600'}`}>{step.label}</span>
                </div>
            ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* PANEL: DATA INGESTION (LEFT) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 p-10 shadow-3xl">
              <div className="flex gap-3 p-1.5 bg-slate-950 rounded-2xl mb-8">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'jd' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Job Criteria</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Candidate Data</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <label className="bg-slate-900/60 border border-slate-800 py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:border-indigo-500 transition-all group">
                  <FileText className="w-4 h-4 group-hover:text-indigo-500" /> Import DOC/PDF
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); setCurrentStep(2); showToast("Trades Sample Loaded");}} className="bg-slate-900/60 border border-slate-800 py-5 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-indigo-500 transition-all flex items-center justify-center gap-3 group">
                   <Briefcase className="w-4 h-4 group-hover:text-indigo-500" /> Use Trades Demo
                </button>
              </div>

              <div className="relative group">
                <textarea 
                  className="w-full h-[500px] bg-[#020617] border border-slate-800 rounded-3xl p-8 text-sm leading-loose text-slate-300 outline-none focus:border-indigo-500/50 transition-all scrollbar-hide"
                  value={activeTab === 'jd' ? jdText : resumeText}
                  onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
                  placeholder={`Paste the official ${activeTab === 'jd' ? 'Job Description' : 'Candidate Resume'} text here for analysis...`}
                />
                <div className="absolute bottom-6 right-6 opacity-20 group-focus-within:opacity-5">
                    <Target className="w-12 h-12" />
                </div>
              </div>

              <button onClick={handleScreen} disabled={loading} className="w-full mt-8 py-10 bg-indigo-600 hover:bg-indigo-500 rounded-[2rem] flex items-center justify-center gap-5 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-500/20 active:scale-[0.98]">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 fill-white" />}
                {loading ? "EXTRACTING INTELLIGENCE..." : "EXECUTE STRATEGIC ANALYSIS"}
              </button>
            </div>
          </div>

          {/* PANEL: STRATEGIC OUTPUT (RIGHT) */}
          <div className="lg:col-span-7 h-full">
            {analysis ? (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-10">
                
                {/* CANDIDATE SCORECARD */}
                <div className="bg-[#0f172a] rounded-[3rem] border border-slate-800 p-12 flex flex-col md:flex-row items-center justify-between shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">{analysis.candidate_name}</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">Primary Match Found</span>
                        <span className="text-slate-600 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> Updated Today</span>
                    </div>
                  </div>
                  <div className="mt-8 md:mt-0 relative">
                    <div className="text-7xl font-black text-indigo-500 italic drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">{analysis.score}%</div>
                    <div className="text-[9px] font-black uppercase text-center tracking-[0.3em] text-slate-500 mt-2">Overall Match</div>
                  </div>
                </div>

                {/* EXECUTIVE SUMMARY */}
                <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"></div>
                    <div className="bg-indigo-500/5 p-10 rounded-[2.5rem] italic text-slate-300 text-sm leading-relaxed border border-indigo-500/10">
                    "{analysis.summary}"
                    </div>
                </div>

                {/* SWOT ANALYSIS GRID */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[2.5rem] shadow-xl">
                    <h4 className="text-emerald-400 text-[10px] font-black uppercase mb-8 tracking-widest flex items-center gap-3">
                        <TrendingUp className="w-4 h-4" /> Strategic Strengths
                    </h4>
                    <ul className="space-y-5">
                      {analysis.strengths.map((s: any, i: number) => (
                        <li key={i} className="flex gap-4 text-xs text-slate-300 items-start">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> 
                            <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/10 p-10 rounded-[2.5rem] shadow-xl">
                    <h4 className="text-rose-400 text-[10px] font-black uppercase mb-8 tracking-widest flex items-center gap-3">
                        <ZapOff className="w-4 h-4" /> Identified Risk Areas
                    </h4>
                    <ul className="space-y-5">
                      {analysis.gaps.map((g: any, i: number) => (
                        <li key={i} className="flex gap-4 text-xs text-slate-300 items-start">
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /> 
                            <span className="leading-relaxed">{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* INTERVIEW BLUEPRINT */}
                <div className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 p-12">
                  <div className="flex justify-between items-center mb-10">
                    <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                        <MessageSquare className="w-4 h-4" /> Targeted Interview Questions
                    </h4>
                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 py-1 border border-slate-800 rounded-lg">High Difficulty</div>
                  </div>
                  <div className="space-y-4">
                    {analysis.questions.map((q: any, i: number) => (
                      <div key={i} className="group bg-slate-950/50 p-6 rounded-2xl border border-slate-800/60 text-xs italic text-slate-400 hover:border-indigo-500/40 transition-all flex gap-4">
                        <span className="text-indigo-600 font-black not-italic">0{i+1}</span>
                        <span className="leading-loose">"{q}"</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid md:grid-cols-2 gap-6">
                  <button onClick={downloadPDF} className="group bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                    <Download className="w-5 h-5 group-hover:animate-bounce" /> Strategic Report (PDF)
                  </button>
                  <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Email Profiled & Copied");}} className="bg-indigo-600 p-8 rounded-3xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 active:scale-[0.98]">
                    <Mail className="w-5 h-5" /> Copy Personalized Outreach
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[800px] border-2 border-dashed border-slate-800/40 rounded-[4rem] flex flex-col items-center justify-center text-slate-700 space-y-8 bg-slate-900/10">
                <div className="relative">
                    <LayoutDashboard className="w-24 h-24 opacity-20" />
                    <Search className="w-8 h-8 absolute -bottom-2 -right-2 text-indigo-500/40 animate-pulse" />
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting Analysis Subject</p>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-3 opacity-40">Load Demo Data or Import Document to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ELITE UPGRADE MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-[4rem] p-20 max-w-2xl w-full text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
                <Award className="w-64 h-64" />
            </div>
            <Award className="w-20 h-20 text-indigo-500 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <h3 className="text-6xl font-black uppercase tracking-tighter italic mb-4">Go <span className="text-indigo-500">Elite</span></h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-12 leading-loose">The free trial has concluded. Upgrade to Elite for unlimited Skilled Trades screenings and full strategic reporting.</p>
            
            <div className="space-y-4">
                <a href={finalStripeUrl} className="block w-full py-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[2rem] uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/30 transition-all active:scale-[0.98]">Unlock Elite Platform</a>
                <button onClick={() => setShowLimitModal(false)} className="mt-8 text-[10px] text-slate-600 font-black uppercase tracking-widest hover:text-white transition-all underline">Continue as Guest</button>
            </div>
          </div>
        </div>
      )}

      {/* RECRUIT-IQ TOAST SYSTEM */}
      {toast.show && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-indigo-600 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] z-[200] shadow-[0_20px_50px_rgba(99,102,241,0.4)] animate-in slide-in-from-bottom-10 flex items-center gap-3">
          <Sparkles className="w-4 h-4" /> {toast.message}
        </div>
      )}
    </div>
  );
}
