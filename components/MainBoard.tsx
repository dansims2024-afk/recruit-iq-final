"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, Check, FileText, User, Download, 
  Zap, Shield, HelpCircle, CheckCircle2, 
  Mail, ArrowRight, Sparkles, FileUp, Star, 
  Lock, AlertCircle, TrendingUp, X, CheckCircle, MessageSquare
} from "lucide-react";

// --- CONFIGURATION ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";
const SUPPORT_EMAIL = "hello@corecreativityai.com";

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
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  useEffect(() => {
    const handleSync = async () => {
      if (!isLoaded || !isSignedIn) return;
      if (sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
        return;
      }
      if (!isPro) {
        await user?.reload();
        if (user?.publicMetadata?.isPro === true) {
          showToast("Elite Access Verified!", "success");
        }
      }
    };
    handleSync();
  }, [isSignedIn, isLoaded, user, isPro, finalStripeUrl]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleSupportSubmit = () => {
    if(!supportMessage) return;
    showToast(`Feedback sent to ${SUPPORT_EMAIL}`, "success");
    setSupportMessage("");
    setShowSupportModal(false);
  };

  const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
    try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return "";
    }
  };

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
        showToast("PDF parsed successfully!");
      } 
      else {
        const text = await file.text();
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
        showToast("Text file loaded!");
      }
    } catch (err) {
      showToast("Format mismatch. Use PDF or Word.", "error");
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
      showToast("Please provide both Job Description and Resume.", "error");
      return;
    }

    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const prompt = `Act as an Elite Executive Recruiter. Analyze this Job Description: ${jdText} vs this Resume: ${resumeText}.
      Generate a deep JSON report including:
      1. Candidate Name
      2. Score (0-100)
      3. 1-sentence Executive Summary
      4. 3 specific Strengths aligned to JD
      5. 3 Critical Gaps/Risks
      6. 5 Advanced Interview Questions
      7. High-conversion Outreach Email
      JSON FORMAT ONLY: {"name": "", "score": 0, "summary": "", "strengths": [], "gaps": [], "questions": [], "outreach": ""}`;

      const response = await fetch(url, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) 
      });

      const data = await response.json();
      const rawResponse = data.candidates[0].content.parts[0].text;
      let cleanJson = JSON.parse(rawResponse.match(/\{[\s\S]*\}/)[0]);
      
      // --- DATA SANITIZATION (Fix for React Error #31) ---
      const sanitizeList = (list: any[]) => {
        if (!Array.isArray(list)) return [];
        return list.map(item => {
          if (typeof item === 'string') return item;
          // If AI returns an object like {strength: "...", alignment: "..."}, extract the main text
          return item.strength || item.gap || item.question || JSON.stringify(item);
        });
      };

      cleanJson.strengths = sanitizeList(cleanJson.strengths);
      cleanJson.gaps = sanitizeList(cleanJson.gaps);
      cleanJson.questions = sanitizeList(cleanJson.questions);
      
      if (typeof cleanJson.outreach === 'object' && cleanJson.outreach !== null) {
         const subj = cleanJson.outreach.subject || "Interview Invitation";
         const body = cleanJson.outreach.body || "";
         cleanJson.outreach = `Subject: ${subj}\n\n${body}`;
      }

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

  const generateReport = async () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 45, 'F');
    const logoBase64 = await getBase64ImageFromUrl('/logo.png');
    if (logoBase64) doc.addImage(logoBase64, 'PNG', 10, 8, 25, 25);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("CONFIDENTIAL ASSESSMENT", 40, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("RECRUIT-IQ TALENT INTELLIGENCE", 40, 28);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(10, 55, pageWidth - 20, 25, 3, 3, 'FD');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(analysis.name.toUpperCase(), 15, 71);
    const scoreColor = analysis.score >= 80 ? [22, 163, 74] : [234, 88, 12];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`MATCH SCORE: ${analysis.score}%`, 130, 71);
    let yPos = 95;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", 10, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(analysis.summary, pageWidth - 20);
    doc.text(summaryLines, 10, yPos);
    yPos += (summaryLines.length * 5) + 10;
    const colWidth = (pageWidth - 30) / 2;
    const startY = yPos;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text("KEY STRENGTHS", 10, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    analysis.strengths.forEach((s: string) => {
        const lines = doc.splitTextToSize(`• ${s}`, colWidth);
        doc.text(lines, 10, yPos);
        yPos += lines.length * 5;
    });
    let rightY = startY;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text("CRITICAL GAPS", 10 + colWidth + 10, rightY);
    rightY += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    analysis.gaps.forEach((g: string) => {
        const lines = doc.splitTextToSize(`• ${g}`, colWidth);
        doc.text(lines, 10 + colWidth + 10, rightY);
        rightY += lines.length * 5;
    });
    yPos = Math.max(yPos, rightY) + 15;
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFillColor(248, 250, 252);
    doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("STRATEGIC INTERVIEW GUIDE", 12, yPos);
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    analysis.questions.forEach((q: string, i: number) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        const lines = doc.splitTextToSize(`${i + 1}. ${q}`, pageWidth - 25);
        doc.text(lines, 12, yPos);
        yPos += (lines.length * 5) + 4;
    });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated by Recruit-IQ • ${new Date().toLocaleDateString()}`, 10, 285);
    doc.save(`RecruitIQ_${analysis.name.replace(/\s+/g, '_')}.pdf`);
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

      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-top duration-500 ${toast.type === 'error' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">{toast.message}</p>
        </div>
      )}

      <header className="flex justify-between items-end border-b border-slate-800/60 pb-10">
        <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <img src="/logo.png" alt="IQ" className="relative w-14 h-14 object-contain" />
            </div>
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">Recruit-IQ</h1>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">By Core Creativity AI</span>
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
                <button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]">Log in</button>
              </SignInButton>
            ) : <UserButton appearance={{ elements: { userButtonAvatarBox: "w-11 h-11 ring-2 ring-indigo-500/20" } }} />}
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
          <div onClick={() => setActiveTab('jd')} className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${jdReady ? 'bg-indigo-500/5 border-indigo-500/40 shadow-2xl' : 'bg-slate-900/20 border-slate-800'}`}>
              <div className="absolute top-0 right-0 p-6">{jdReady && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in" />}</div>
              <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black mb-6 shadow-lg shadow-indigo-900/40">1</div>
              <h4 className="text-sm font-black uppercase mb-3 tracking-tight text-white group-hover:text-indigo-400 transition-colors">Job Description</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Paste the full JD text or upload a PDF/Word file to set the benchmark.</p>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${resumeReady ? 'bg-blue-500/5 border-blue-500/40 shadow-2xl' : 'bg-slate-900/20 border-slate-800'}`}>
              <div className="absolute top-0 right-0 p-6">{resumeReady && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in" />}</div>
              <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black mb-6 shadow-lg shadow-blue-900/40">2</div>
              <h4 className="text-sm font-black uppercase mb-3 tracking-tight text-white group-hover:text-blue-400 transition-colors">Resume</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Upload the candidate's PDF/Word resume or paste their data here.</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${analysis ? 'bg-purple-500/5 border-purple-500/40 shadow-2xl' : 'bg-slate-900/20 border-slate-800'}`}>
              <div className="absolute top-0 right-0 p-6">{analysis && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in" />}</div>
              <div className="bg-purple-600 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black mb-6 shadow-lg shadow-purple-900/40">3</div>
              <h4 className="text-sm font-black uppercase mb-3 tracking-tight text-white group-hover:text-purple-400 transition-colors">Intelligence</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Execute the screen to generate your Elite Assessment Report.</p>
          </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-slate-900/40 p-8 md:p-12 rounded-[3.5rem] border border-slate-800 shadow-3xl flex flex-col h-[800px] relative">
            <div className="flex gap-4 mb-10">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all duration-300 ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-900/60' : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:bg-slate-800'}`}>
                  <FileText className="w-4 h-4" /> Job Description {jdReady && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border transition-all duration-300 ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-900/60' : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:bg-slate-800'}`}>
                  <User className="w-4 h-4" /> Resume {resumeReady && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
            </div>
            <div className="flex gap-4 mb-6">
              <label className="flex-1 flex items-center justify-center gap-3 cursor-pointer bg-slate-800/30 py-4.5 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white border border-slate-800 hover:border-indigo-500/50 transition-all">
                <FileUp className="w-4 h-4" /> Upload PDF/Word
                <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Elite Sample Profile Loaded", "info");}} className="flex-1 bg-slate-800/30 py-4.5 rounded-2xl text-[10px] font-black uppercase text-slate-400 border border-slate-800 hover:text-white transition-all">Elite Sample</button>
            </div>
            <textarea 
              className="flex-1 bg-[#020617]/60 resize-none outline-none text-slate-300 p-8 border border-slate-800 rounded-[2.5rem] text-[13px] font-mono leading-[1.8] focus:border-indigo-500/50 transition-all custom-scrollbar shadow-inner placeholder:text-slate-700"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={`Paste or upload your ${activeTab === 'jd' ? 'Job Description' : 'Resume'} text...`}
            />
            <div className="mt-10">
              <button onClick={handleScreen} disabled={loading} className="w-full py-6 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-4 disabled:opacity-40 shadow-2xl shadow-indigo-900/40 group active:scale-[0.98]">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white group-hover:animate-pulse" />}
                {loading ? "Sweeping Data..." : "Execute Intelligence Screen"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
        </div>

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
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-10">Match Probability</p>
                  <div className="flex justify-center">
                    <button 
                      onClick={generateReport} 
                      className="bg-indigo-600 hover:bg-indigo-500 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-400/30 flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(79,70,229,0.3)]"
                    >
                      <Download className="w-4 h-4 animate-pulse" /> 
                      Generate Boardroom Report
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[2.5rem]">
                    <h4 className="text-emerald-400 font-black uppercase mb-6 text-[9px] tracking-widest flex items-center gap-3">
                      <TrendingUp className="w-4 h-4"/> Key Strengths
                    </h4>
                    {analysis.strengths.map((s:any, i:number) => <p key={i} className="mb-4 text-xs text-slate-300 font-medium">• {s}</p>)}
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-10 rounded-[2.5rem]">
                    <h4 className="text-rose-400 font-black uppercase mb-6 text-[9px] tracking-widest flex items-center gap-3">
                      <Shield className="w-4 h-4"/> Critical Gaps
                    </h4>
                    {analysis.gaps.map((g:any, i:number) => <p key={i} className="mb-4 text-xs text-slate-300 font-medium">• {g}</p>)}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-[3rem]">
                  <h4 className="text-indigo-400 font-black uppercase text-[10px] mb-8 tracking-[0.3em] flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-indigo-500"/> Interview Guide
                  </h4>
                  <div className="space-y-5">
                    {analysis.questions.map((q:any, i:number) => (
                      <div key={i} className="p-7 bg-slate-950/50 rounded-[1.5rem] text-xs text-slate-300 border border-slate-800/80 italic">
                        <span className="text-indigo-500 font-black not-italic mr-3">Q{i+1}</span> "{q}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[4.5rem] flex flex-col items-center justify-center text-slate-600 text-[11px] font-black uppercase tracking-[0.4em] gap-10 p-16 text-center">
                <Zap className="w-20 h-20 opacity-5" />
                <p>Awaiting IQ Signal</p>
              </div>
            )}
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-[30px] bg-slate-950/95 animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#020617] border border-slate-800 p-14 rounded-[3.5rem] shadow-3xl text-center">
                 <img src="/logo.png" alt="IQ" className="w-16 h-16 mx-auto mb-8 object-contain" />
                 <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Elite Intelligence.</span></h2>
                 <div className="grid grid-cols-2 gap-4 text-left mb-10 max-w-md mx-auto">
                    <div className="flex items-center gap-3 text-slate-300 text-xs font-bold"><CheckCircle className="w-4 h-4 text-emerald-400" /> Unlimited AI Analysis</div>
                    <div className="flex items-center gap-3 text-slate-300 text-xs font-bold"><CheckCircle className="w-4 h-4 text-emerald-400" /> Bulk PDF Parsing</div>
                    <div className="flex items-center gap-3 text-slate-300 text-xs font-bold"><CheckCircle className="w-4 h-4 text-emerald-400" /> Deep Match Scoring</div>
                    <div className="flex items-center gap-3 text-slate-300 text-xs font-bold"><CheckCircle className="w-4 h-4 text-emerald-400" /> Priority Support</div>
                 </div>
                 <div className="inline-flex items-center gap-4 mb-10 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                    <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-emerald-500/20">3 Days Free</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pr-4">Then $29 / Month</span>
                 </div>
                 {!isSignedIn ? (
                   <SignInButton mode="modal">
                     <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="block w-full py-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-xs">Sign In to Start Free Trial</button>
                   </SignInButton>
                 ) : (
                   <a href={finalStripeUrl} className="block w-full py-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-xs">Activate 3-Day Free Trial</a>
                 )}
                 <button onClick={() => setShowLimitModal(false)} className="mt-8 text-[9px] text-slate-600 hover:text-white uppercase font-black tracking-widest flex items-center justify-center gap-2 mx-auto"><X className="w-3 h-3" /> No thanks</button>
          </div>
        </div>
      )}

      {showSupportModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-[20px] bg-slate-950/90 animate-in fade-in">
          <div className="bg-[#020617] border border-slate-800 p-12 rounded-[3.5rem] shadow-3xl text-center max-w-lg w-full relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-t-[3.5rem] pointer-events-none" />
            <MessageSquare className="w-12 h-12 text-indigo-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-white">Share Your Feedback</h2>
            <p className="text-[10px] text-slate-500 mb-8 font-black uppercase tracking-widest">To: {SUPPORT_EMAIL}</p>
            <textarea className="w-full h-40 bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 text-[12px] text-white outline-none resize-none mb-8 focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-medium" placeholder="How can we improve Recruit-IQ for you?" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={handleSupportSubmit} className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all text-white shadow-lg shadow-indigo-900/20">Send Feedback</button>
              <button onClick={() => setShowSupportModal(false)} className="px-8 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all text-slate-400 hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-32 border-t border-slate-800/40 pt-16 pb-24 text-center">
        <div className="flex justify-center gap-12 mb-8">
          <a href="https://www.corecreativityai.com/blank" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors">Privacy Policy</a>
          <a href="https://www.corecreativityai.com/blank-2" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors">Terms of Service</a>
          <button onClick={() => setShowSupportModal(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors">Support</button>
        </div>
        <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-slate-700 hover:text-slate-500 transition-colors cursor-default">&copy; 2026 Core Creativity AI</p>
      </footer>
    </div>
  );
}
