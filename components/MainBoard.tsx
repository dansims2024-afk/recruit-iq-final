"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, Check, FileText, User, Download, 
  Zap, Shield, HelpCircle, CheckCircle2, Trash2, 
  Mail, ArrowRight, Sparkles, FileUp, Star, 
  ExternalLink, Lock, AlertCircle, TrendingUp
} from "lucide-react";

// --- CONFIGURATION ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

const SAMPLE_JD = `JOB TITLE: Lead Innovation Manager
SALARY: $185,000 - $210,000 + Equity
LOCATION: East Windsor, NJ (Hybrid)

Vertex Solutions is seeking a dynamic Lead Innovation Manager to spearhead our Digital Transformation unit. 

RESPONSIBILITIES:
- Drive cross-functional teams to deliver AI-driven SaaS products.
- Manage a portfolio of projects valued at $5M+.
- Bridge the gap between technical engineering teams and C-suite stakeholders.

REQUIREMENTS:
- 8+ years in Project Management or Product Development.
- Expert-level understanding of Agile methodologies.
- Proven experience with AI implementation in business workflows.`;

const SAMPLE_RESUME = `ALEXANDER J. STERLING
Innovative Solutions Architect | a.sterling@example.com

EXECUTIVE SUMMARY:
High-impact leader with a 10-year track record of driving digital evolution in Fortune 500 environments. Expert in leveraging emerging AI tech to optimize operational efficiency.

PROFESSIONAL EXPERIENCE:
Nexus Tech Industries | Senior Project Lead | 2019 - Present
- Orchestrated the rollout of a global AI-chat interface, saving 14,000 manual hours annually.
- Led a diverse team of 12 developers to launch a proprietary CRM platform.

FuturePath Consulting | Strategy Consultant | 2015 - 2019
- Specialized in digital transformation for healthcare clients.
- Improved client project delivery speed by 30% using custom automation tools.

EDUCATION & SKILLS:
- MBA, Stanford University
- Skills: AI Implementation, Agile/Scrum, Python, Stakeholder Management.`;

export default function MainBoard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Status & Logic Helpers
  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleClear = () => {
    setJdText('');
    setResumeText('');
    setAnalysis(null);
    showToast("Workspace Reset", "info");
  };

  const handleCopyOutreach = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast("Outreach Email Copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- THE FIX: We use a variable for the URL to trick the Webpack compiler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        activeTab === 'jd' ? setJdText(result.value) : setResumeText(result.value);
        showToast(`${file.name} successfully parsed.`);
      } 
      else if (file.name.endsWith('.pdf')) {
        // Hiding the URL in a string constant prevents Webpack from trying to process it during build
        const PDF_LIB_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/+esm";
        const WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
        
        // @ts-ignore
        const pdfjs = await import(/* webpackIgnore: true */ PDF_LIB_URL);
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;
        
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // @ts-ignore
          text += content.items.map((item) => item.str).join(" ") + " ";
        }
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
        showToast("Elite PDF Insight generated.");
      } 
      else {
        const text = await file.text();
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
        showToast("Text data imported.");
      }
    } catch (err) {
      console.error(err);
      showToast("Format mismatch. Please use PDF or Word.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro && scanCount >= 3)) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) {
      showToast("Data required for intelligence sweep.", "error");
      return;
    }

    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const prompt = `Act as an Elite Executive Recruiter. Analyze this JD: ${jdText} vs Resume: ${resumeText}.
      Generate a deep JSON report including:
      {"name": "", "score": 0, "summary": "", "strengths": [], "gaps": [], "questions": [], "outreach": ""}`;

      const response = await fetch(url, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) 
      });

      const data = await response.json();
      const rawResponse = data.candidates[0].content.parts[0].text;
      const cleanJson = JSON.parse(rawResponse.match(/\{[\s\S]*\}/)[0]);
      
      setAnalysis(cleanJson);
      
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Sweep Complete!");
    } catch (err) {
      showToast("AI Engine Timeout.", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(99, 102, 241); doc.setFontSize(26); doc.text("RECRUIT-IQ ELITE", 20, 30);
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.text(`CANDIDATE: ${analysis.name.toUpperCase()}`, 20, 50);
    doc.text(`SCORE: ${analysis.score}%`, 20, 60);
    doc.save(`RecruitIQ_Report_${analysis.name}.pdf`);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#020617] min-h-screen pt-20 selection:bg-indigo-500/30">
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>

      {/* --- ELITE TOAST --- */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-top duration-500 ${toast.type === 'error' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">{toast.message}</p>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="flex justify-between items-end border-b border-slate-800/60 pb-10">
        <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <img src="/logo.png" alt="IQ" className="relative w-14 h-14 object-contain" />
            </div>
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">Recruit-IQ</h1>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">Talent Intelligence</span>
                  <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                  <span className="text-[10px] text-slate-500 font-medium">v2.0 Elite</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-6 mb-1">
            <div className={`hidden lg:flex px-5 py-2.5 rounded-full text-[10px] font-black border items-center gap-3 transition-all ${isPro ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-slate-800 text-slate-500'}`}>
                {isPro ? <Star className="w-3 h-3 fill-emerald-400" /> : <Lock className="w-3 h-3" />}
                {isPro ? "ELITE STATUS" : `SCANS REMAINING: ${Math.max(0, 3 - scanCount)}`}
            </div>
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]">Access Suite</button>
              </SignInButton>
            ) : <UserButton appearance={{ elements: { userButtonAvatarBox: "w-11 h-11 ring-2 ring-indigo-500/20" } }} />}
        </div>
      </header>

      {/* --- WORKFLOW --- */}
      <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: 1, title: "Benchmark", desc: "Define ideal requirements via PDF, Word, or text.", ready: jdReady, color: "indigo" },
            { step: 2, title: "Data Stream", desc: "Import candidate experience for analysis.", ready: resumeReady, color: "blue" },
            { step: 3, title: "Intelligence", desc: "Execute screen to uncover risks and gaps.", ready: !!analysis, color: "purple" }
          ].map((item, idx) => (
            <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${item.ready ? 'bg-indigo-500/5 border-indigo-500/40 shadow-2xl shadow-indigo-900/10' : 'bg-slate-900/20 border-slate-800 hover:border-slate-700'}`}>
                {item.ready && <div className="absolute top-0 right-0 p-4"><CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in" /></div>}
                <div className={`bg-indigo-600 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black mb-6 shadow-lg shadow-indigo-900/40 group-hover:scale-110 transition-transform`}>{item.step}</div>
                <h4 className="text-sm font-black uppercase mb-3 tracking-tight group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
      </div>

      {/* --- CONTROL CENTER --- */}
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-slate-900/40 p-8 md:p-12 rounded-[3.5rem] border border-slate-800 shadow-3xl flex flex-col h-[800px] relative">
            <div className="flex gap-4 mb-10">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all duration-300 ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-900/60' : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:bg-slate-800'}`}>
                  <FileText className="w-4 h-4" /> Requirements {jdReady && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all duration-300 ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-900/60' : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:bg-slate-800'}`}>
                  <User className="w-4 h-4" /> Candidate {resumeReady && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
            </div>
            
            <div className="flex gap-4 mb-6">
              <label className="flex-1 flex items-center justify-center gap-3 cursor-pointer bg-slate-800/30 py-4.5 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white border border-slate-800 hover:border-indigo-500/50 transition-all">
                <FileUp className="w-4 h-4" /> Import Source
                <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Alexander Sterling Profile Loaded", "info");}} className="flex-1 bg-slate-800/30 py-4.5 rounded-2xl text-[10px] font-black uppercase text-slate-400 border border-slate-800 hover:text-white transition-all">Elite Sample</button>
            </div>

            <textarea 
              className="flex-1 bg-[#020617]/60 resize-none outline-none text-slate-300 p-8 border border-slate-800 rounded-[2.5rem] text-[13px] font-mono leading-[1.8] focus:border-indigo-500/50 transition-all custom-scrollbar shadow-inner placeholder:text-slate-700"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={`Upload or paste ${activeTab === 'jd' ? 'Job Description' : 'Candidate Resume'} text to initiate sweep...`}
            />
            
            <div className="flex gap-5 mt-10">
              <button onClick={handleClear} className="p-5.5 rounded-2xl bg-slate-800/40 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all border border-slate-800 group">
                <Trash2 className="w-6 h-6 text-slate-500 group-hover:text-rose-500" />
              </button>
              <button onClick={handleScreen} disabled={loading} className="flex-1 py-5.5 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-4 disabled:opacity-40 shadow-2xl shadow-indigo-900/40 group active:scale-[0.98]">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white group-hover:animate-pulse" />}
                {loading ? "Sweeping Data..." : "Execute Intelligence Screen"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="h-[800px] overflow-y-auto pr-4 custom-scrollbar space-y-10">
            {analysis ? (
              <div className="animate-in fade-in slide-in-from-right duration-1000 space-y-10 pb-24">
                <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-[3.5rem] text-center shadow-3xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-80"></div>
                  <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="relative w-28 h-28 mx-auto rounded-full bg-slate-950 border-4 border-indigo-600/30 flex items-center justify-center text-4xl font-black shadow-2xl">{analysis.score}%</div>
                  </div>
                  <h3 className="text-white font-black text-3xl uppercase tracking-tighter mb-3">{analysis.name}</h3>
                  <div className="flex justify-center gap-5 mt-10">
                    <button onClick={generateReport} className="bg-slate-800/50 hover:bg-slate-800 px-10 py-4 rounded-2xl text-[10px] font-black uppercase border border-slate-700 flex items-center gap-3 transition-all">
                      <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => handleCopyOutreach(analysis.outreach)} className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase border border-indigo-500/30 flex items-center gap-3 transition-all">
                      <Mail className="w-4 h-4" /> {isCopied ? "Copied" : "Outreach"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[2.5rem]">
                    <h4 className="text-emerald-400 font-black uppercase mb-6 text-[9px] tracking-widest flex items-center gap-3"><TrendingUp className="w-4 h-4"/> Key Strengths</h4>
                    {analysis.strengths.map((s:any, i:number) => <p key={i} className="mb-4 text-xs text-slate-300 leading-relaxed font-medium">• {s}</p>)}
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-10 rounded-[2.5rem]">
                    <h4 className="text-rose-400 font-black uppercase mb-6 text-[9px] tracking-widest flex items-center gap-3"><Shield className="w-4 h-4"/> Critical Gaps</h4>
                    {analysis.gaps.map((g:any, i:number) => <p key={i} className="mb-4 text-xs text-slate-300 leading-relaxed font-medium">• {g}</p>)}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-[3rem]">
                  <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-8 tracking-[0.3em] flex items-center gap-3"><HelpCircle className="w-5 h-5 text-indigo-500"/> Interview Guide</h4>
                  <div className="space-y-5">
                    {analysis.questions.map((q:any, i:number) => (
                      <div key={i} className="p-7 bg-slate-950/50 rounded-[1.5rem] text-xs text-slate-300 border border-slate-800/80 leading-relaxed italic group hover:border-indigo-500/30 transition-all">
                        <span className="text-indigo-500 font-black not-italic mr-3">Q{i+1}</span> "{q}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[4.5rem] flex flex-col items-center justify-center text-slate-600 text-[11px] font-black uppercase tracking-[0.4em] gap-10 p-16 text-center group">
                <div className="p-12 bg-slate-800/20 rounded-full animate-pulse border border-slate-800/50">
                  <Zap className="w-20 h-20 opacity-5" />
                </div>
                <p>Awaiting IQ Signal</p>
              </div>
            )}
        </div>
      </div>

      {/* --- UPGRADE MODAL --- */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-[20px] bg-slate-950/90 animate-in fade-in duration-700">
          <div className="relative bg-[#020617] border border-slate-800 p-16 rounded-[3.5rem] shadow-3xl text-center max-w-2xl w-full">
                 <div className="w-24 h-24 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 rotate-3"><Zap className="w-12 h-12 text-indigo-400 fill-indigo-400" /></div>
                 <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">Elite Limit Reached</h2>
                 <p className="text-slate-400 text-sm mb-12 leading-[1.8] font-medium px-8">Upgrade to **Recruit-IQ Elite** for unlimited document parsing, premium AI models, and custom recruitment reports.</p>
                 <a href={STRIPE_URL} className="block w-full py-6 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all text-xs shadow-2xl hover:scale-[1.02] active:scale-[0.98]">Unlock Elite Access — $49/mo</a>
                 <button onClick={() => setShowLimitModal(false)} className="mt-10 text-[10px] text-slate-600 hover:text-slate-400 uppercase font-black tracking-widest">Continue with Limited Access</button>
            </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="mt-32 border-t border-slate-800/40 pt-16 pb-24 text-center">
        <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-slate-700">&copy; {new Date().getFullYear()} Recruit-IQ Elite Talent Systems.</p>
      </footer>
    </div>
  );
}
