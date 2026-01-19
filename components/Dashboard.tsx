"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Download, Zap, Shield, HelpCircle, Sparkles, Star, Check, Info, Target, Upload, FileText, ArrowRight } from "lucide-react";

// YOUR VERIFIED STRIPE LINK
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- THE ELITE VALUE SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate.
- Lead the migration from legacy monolithic structures to modern gRPC architecture.
- Optimize C++ and Go-based trading engines for sub-millisecond latency.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}${user?.primaryEmailAddress?.emailAddress ? `&prefilled_email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}` : ''}` 
    : STRIPE_URL;

  useEffect(() => {
    setScanCount(parseInt(localStorage.getItem('recruit_iq_scans') || '0'));
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast("Elite Document Loaded");
    } catch (err) { showToast("Error reading file."); } finally { setLoading(false); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`RECRUIT-IQ ELITE REPORT: ${analysis.candidate_name}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`Match Score: ${analysis.score}%`, 10, 30);
    doc.text("Strengths:", 10, 50);
    analysis.strengths.forEach((s: string, i: number) => doc.text(`• ${s}`, 15, 60 + (i * 10)));
    doc.save(`RecruitIQ_${analysis.candidate_name}.pdf`);
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (jdText.length < 50 || resumeText.length < 50) { showToast("More data required."); return; }
    setLoading(true);
    try {
      // Uses the Gemini API Key from your Vercel Environment Variables
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Return JSON only: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": []}`;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      const resultText = data.candidates[0].content.parts[0].text;
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAnalysis(JSON.parse(jsonMatch[0]));
        if (!isPro) {
          const newCount = scanCount + 1;
          setScanCount(newCount);
          localStorage.setItem('recruit_iq_scans', newCount.toString());
        }
      }
    } catch (err) { showToast("AI Engine Error."); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl bg-indigo-600 shadow-2xl border border-indigo-400 font-bold uppercase text-[10px]">
          {toast.message}
        </div>
      )}

      {/* HEADER WITH LOGO */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg"><Zap className="w-6 h-6 fill-white" /></div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Elite Candidate Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn ? <SignInButton mode="modal" /> : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl relative">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume</button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700 transition-colors">
                <Upload className="w-3 h-3 inline mr-2" /> Upload Docx
                <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Samples Loaded");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Value Samples</button>
            </div>

            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono mb-6 leading-relaxed" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-500 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />} Execute Elite Screen
            </button>
        </div>

        <div className="h-[750px] overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4 shadow-xl">{analysis.score}%</div>
                  <h3 className="uppercase text-[9px] font-bold tracking-widest text-slate-500 mb-1">Match Score</h3>
                  <div className="text-white font-bold text-xl mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 px-6 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700 transition-all border border-slate-700"><Download className="w-4 h-4 inline mr-2" /> Download Report</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-emerald-400 font-bold uppercase mb-4 text-[9px] flex items-center gap-2"><Check className="w-3 h-3" /> Strengths</h4>
                    <div className="space-y-3">{analysis.strengths.map((s: string, i: number) => <p key={i} className="text-slate-200">• {s}</p>)}</div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-rose-400 font-bold uppercase mb-4 text-[9px] flex items-center gap-2"><Shield className="w-3 h-3" /> Gaps</h4>
                    <div className="space-y-3">{analysis.gaps.map((g: string, i: number) => <p key={i} className="text-slate-200">• {g}</p>)}</div>
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-8 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[9px] mb-6 flex items-center gap-2"><HelpCircle className="w-3 h-3" /> Strategic Interview Guide</h4>
                  <div className="space-y-4">{analysis.questions.map((q: string, i: number) => <div key={i} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 text-[11px] leading-relaxed text-slate-300">"{q}"</div>)}</div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase gap-6 text-center p-12 opacity-50">
                <Sparkles className="w-8 h-8 opacity-20" />
                <p>Waiting for Elite AI Screen...</p>
              </div>
            )}
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in duration-500">
          <div className="relative w-full max-w-4xl bg-[#0F172A] border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-12 md:w-3/5 flex flex-col justify-center">
                 <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tighter">Hire Smarter. <br/><span className="text-indigo-400 italic">Finish First.</span></h2>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Unlock Recruit-IQ Elite for unlimited scans, advanced intelligence reports, and document parsing.</p>
                 <a href={finalStripeUrl} className="block w-full py-5 bg-indigo-600 text-center text-white font-black rounded-2xl uppercase tracking-wider text-xs shadow-2xl hover:bg-indigo-500 transition-all hover:scale-[1.02]">
                    Start 3-Day Free Trial
                 </a>
                 <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-500 hover:text-white uppercase font-black w-full tracking-[0.2em] mt-8 transition-colors">Dismiss</button>
              </div>
              <div className="md:w-2/5 bg-slate-900/50 p-12 border-l border-slate-800 flex flex-col justify-center gap-8">
                 <div className="flex gap-4"><Zap className="text-indigo-400" /> <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Elite Speed Analysis</span></div>
                 <div className="flex gap-4"><Shield className="text-purple-400" /> <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Precision Skill Matching</span></div>
                 <div className="flex gap-4"><Star className="text-emerald-400" /> <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Unlimited Strategic Scans</span></div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
