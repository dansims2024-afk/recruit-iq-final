"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, Check, FileText, User, Download, 
  Zap, Shield, HelpCircle, CheckCircle2, Trash2, 
  Mail, ArrowRight, Sparkles, FileUp
} from "lucide-react";

// --- CONFIGURATION & CONSTANTS ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

const SAMPLE_JD = `JOB TITLE: Lead Innovation Manager
LOCATION: Remote / Hybrid
SALARY: $185,000 - $210,000 + Equity

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
Innovative Solutions Architect | San Francisco, CA | a.sterling@example.com

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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Status Helpers
  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  // Persistence
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  // UI Utilities
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleClear = () => {
    setJdText('');
    setResumeText('');
    setAnalysis(null);
    showToast("Workspace Reset", "info");
  };

  // --- BROWSER-BASED PARSING (NO TERMINAL REQUIRED) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        activeTab === 'jd' ? setJdText(result.value) : setResumeText(result.value);
        showToast("Word Document parsed!");
      } 
      else if (file.name.endsWith('.pdf')) {
        // Dynamic loading for PDF.js to bypass terminal install dependencies
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + " ";
        }
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
        showToast("PDF parsed successfully!");
      } 
      else {
        const text = await file.text();
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
        showToast("Text file loaded!");
      }
    } catch (err) {
      console.error(err);
      showToast("Parsing failed. Please paste text directly.", "error");
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
      showToast("Job Description and Resume are both required.", "error");
      return;
    }

    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const prompt = `Analyze this JD: ${jdText} against this Resume: ${resumeText}. 
      Generate: 
      1. Candidate Name
      2. Match Score (0-100)
      3. Executive Summary
      4. 3 Key Strengths
      5. 3 Critical Gaps
      6. 5 High-level Interview Questions
      7. A short, professional outreach email.
      Return JSON ONLY in this format: 
      {"candidate_name": "", "score": 0, "summary": "", "strengths": [], "gaps": [], "questions": [], "outreach_email": ""}`;

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
      showToast("Intelligence Report Ready!");
    } catch (err) {
      showToast("AI Engine Error. Check API connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RECRUIT-IQ ELITE INTELLIGENCE", 20, 25);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.text(`Candidate: ${analysis.candidate_name}`, 20, 55);
    doc.text(`Match Score: ${analysis.score}%`, 130, 55);
    doc.setFontSize(10);
    doc.text("Generated by Recruit-IQ Elite Screening Engine", 20, 280);
    doc.save(`Report_${analysis.candidate_name}.pdf`);
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* --- TOAST SYSTEM --- */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[500] px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top duration-300 ${toast.type === 'error' ? 'bg-rose-500/95 border-rose-400' : 'bg-indigo-600/95 border-indigo-400'}`}>
          <Sparkles className="w-4 h-4 text-white" />
          <p className="text-xs font-black uppercase tracking-widest text-white">{toast.message}</p>
        </div>
      )}

      {/* --- NAVIGATION HEADER --- */}
      <div className="flex justify-between items-center border-b border-slate-800/50 pb-8">
        <div className="flex items-center gap-5">
            <img src="/logo.png" alt="Recruit-IQ" className="w-12 h-12 object-contain" />
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-2">Elite Talent Screening Platform</p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className={`hidden lg:flex px-5 py-2.5 rounded-full text-[10px] font-black border items-center gap-3 ${isPro ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-indigo-500/50 text-indigo-400 bg-indigo-500/5'}`}>
                {isPro ? <Zap className="w-3 h-3 fill-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                {isPro ? "ELITE ACCESS ACTIVE" : `FREE SCANS: ${Math.max(0, 3 - scanCount)} REMAINING`}
            </div>
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">Login</button>
              </SignInButton>
            ) : <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-indigo-500" } }} />}
        </div>
      </div>

      {/* --- QUICK START WIZARD --- */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`p-8 rounded-[2rem] border transition-all cursor-pointer group ${jdReady ? 'bg-emerald-500/5 border-emerald-500' : 'bg-slate-900/40 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-900/40">1</div>
                {jdReady && <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] tracking-widest uppercase bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20"><CheckCircle2 className="w-3 h-3"/> READY</div>}
              </div>
              <h4 className="text-sm font-black uppercase mb-3 tracking-tight">Step 1: Define Role</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Paste the Job Description or upload a **PDF/Word** file. Our AI identifies the core requirements and soft skills needed.</p>
          </div>

          <div onClick={() => setActiveTab('resume')} className={`p-8 rounded-[2rem] border transition-all cursor-pointer group ${resumeReady ? 'bg-emerald-500/5 border-emerald-500' : 'bg-slate-900/40 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-blue-900/40">2</div>
                {resumeReady && <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] tracking-widest uppercase bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20"><CheckCircle2 className="w-3 h-3"/> READY</div>}
              </div>
              <h4 className="text-sm font-black uppercase mb-3 tracking-tight">Step 2: Input Candidate</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Upload the candidate's **PDF/Word** resume or paste their text. We support all modern document formats.</p>
          </div>

          <div className={`p-8 rounded-[2rem] border transition-all ${analysis ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-900/20' : 'bg-slate-900/40 border-slate-800'}`}>
              <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-6 shadow-lg shadow-purple-900/40">3</div>
              <h4 className="text-sm font-black uppercase mb-3 tracking-tight">Step 3: Generate Intelligence</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Execute the Elite Screen to receive a Match Score, custom Interview Guide, and personalized outreach template.</p>
          </div>
      </div>

      {/* --- CORE WORKSPACE --- */}
      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* INPUT COLUMN */}
        <div className="bg-[#111827] p-8 md:p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col h-[750px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-24 h-24 text-indigo-500" />
            </div>

            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/50' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                  <FileText className="w-4 h-4" /> 1. Requirements {jdReady && <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />}
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/50' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                  <User className="w-4 h-4" /> 2. Candidate {resumeReady && <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />}
                </button>
            </div>
            
            <div className="flex gap-4 mb-6">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/30 py-4 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white border border-slate-700/50 hover:border-indigo-500 transition-all flex items-center justify-center gap-2">
                <FileUp className="w-3 h-3" /> Upload PDF / DOCX
                <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Elite Sample Loaded", "info");}} className="flex-1 bg-slate-800/30 py-4 rounded-xl text-[10px] font-black uppercase text-slate-400 border border-slate-700/50 hover:text-white transition-all">Load Elite Sample</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-8 border border-slate-800 rounded-[2rem] text-xs font-mono leading-loose focus:border-indigo-500 transition-all custom-scrollbar shadow-inner"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={`Paste or upload your ${activeTab === 'jd' ? 'Job Description' : 'Resume'} text here to begin...`}
            />
            
            <div className="flex gap-4 mt-8">
              <button onClick={handleClear} className="p-5 rounded-2xl bg-slate-800 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all border border-slate-700 group">
                <Trash2 className="w-6 h-6 text-slate-400 group-hover:text-rose-500" />
              </button>
              <button 
                onClick={handleScreen} 
                disabled={loading} 
                className="flex-1 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group shadow-2xl shadow-indigo-900/30"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white group-hover:animate-pulse" />}
                {loading ? "Analyzing Data..." : "Execute Elite AI Screen"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
        </div>

        {/* RESULTS COLUMN */}
        <div className="h-[750px] overflow-y-auto pr-3 custom-scrollbar space-y-8">
            {analysis ? (
              <div className="animate-in slide-in-from-right duration-700 space-y-8 pb-20">
                {/* Score Card */}
                <div className="bg-[#111827] border border-slate-800 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-6 shadow-2xl shadow-indigo-900/50 ring-4 ring-indigo-500/20">{analysis.score}%</div>
                  <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-2">{analysis.candidate_name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8">AI Match Probability Score</p>
                  
                  <div className="flex justify-center gap-4">
                    <button onClick={generateReport} className="bg-slate-800 hover:bg-slate-700 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase border border-slate-700 flex items-center gap-3 transition-all">
                      <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Email Copied!");}} className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase border border-indigo-500/30 flex items-center gap-3 transition-all">
                      <Mail className="w-4 h-4" /> Copy Outreach
                    </button>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2rem]">
                   <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-4 tracking-[0.2em] flex items-center gap-2">
                     <Sparkles className="w-4 h-4" /> Executive Summary
                   </h4>
                   <p className="text-xs text-slate-300 leading-relaxed font-medium">{analysis.summary}</p>
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] text-xs leading-relaxed">
                    <h4 className="text-emerald-400 font-black uppercase mb-5 text-[9px] tracking-widest flex items-center gap-3">
                      <div className="p-1 bg-emerald-500/10 rounded-lg"><Check className="w-4 h-4"/></div> Top Strengths
                    </h4>
                    {analysis.strengths.map((s:any, i:number) => <p key={i} className="mb-3 text-slate-300">• {s}</p>)}
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-[2rem] text-xs leading-relaxed">
                    <h4 className="text-rose-400 font-black uppercase mb-5 text-[9px] tracking-widest flex items-center gap-3">
                      <div className="p-1 bg-rose-500/10 rounded-lg"><Shield className="w-4 h-4"/></div> Critical Gaps
                    </h4>
                    {analysis.gaps.map((g:any, i:number) => <p key={i} className="mb-3 text-slate-300">• {g}</p>)}
                  </div>
                </div>

                {/* Questions */}
                <div className="bg-[#111827] border border-slate-800 p-10 rounded-[2.5rem]">
                  <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-6 tracking-widest flex items-center gap-3">
                    <HelpCircle className="w-5 h-5"/> Strategic Interview Guide
                  </h4>
                  <div className="space-y-4">
                    {analysis.questions.map((q:any, i:number) => (
                      <div key={i} className="p-5 bg-slate-800/30 rounded-2xl text-[11px] text-slate-300 border border-slate-800 leading-relaxed italic">
                        "{q}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[4rem] flex flex-col items-center justify-center text-slate-600 text-[11px] font-black uppercase tracking-[0.3em] gap-8 p-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                  <div className="relative p-10 bg-slate-800/20 rounded-full animate-pulse border border-slate-700/50">
                    <Zap className="w-16 h-16 opacity-10" />
                  </div>
                </div>
                <div>
                  <p className="mb-2">Awaiting Data Streams</p>
                  <p className="text-[9px] text-slate-700 normal-case tracking-normal font-medium">Please complete the role definition and candidate profile steps.</p>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* --- ELITE UPGRADE MODAL --- */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/90 animate-in fade-in duration-500">
          <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-[3rem] blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-[#0F172A] border border-slate-800 p-12 rounded-[2.5rem] shadow-2xl text-center">
                 <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/30">
                    <Zap className="w-10 h-10 text-indigo-400 fill-indigo-400" />
                 </div>
                 <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Trial Limit Reached</h2>
                 <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">You've unlocked the potential of Recruit-IQ. Upgrade to **Elite** for unlimited scans, advanced file parsing, and custom report branding.</p>
                 
                 <a href={STRIPE_URL} className="block w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-center text-white font-black rounded-2xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-2xl shadow-indigo-500/40">
                    Upgrade to Elite Now — $49/mo
                 </a>

                 <button onClick={() => setShowLimitModal(false)} className="mt-8 text-[10px] text-slate-500 hover:text-white uppercase font-black tracking-widest transition-colors">Continue with Free Tier</button>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="mt-20 border-t border-slate-800 pt-10 pb-20 text-center text-[10px] uppercase font-black tracking-[0.2em] text-slate-600">
        <p className="mb-4">&copy; {new Date().getFullYear()} Recruit-IQ Elite Talent Screening</p>
        <div className="flex justify-center gap-8">
          <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">API Status</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
