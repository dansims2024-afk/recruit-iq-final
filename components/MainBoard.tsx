"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, FileText, User, Download, Zap, Shield, HelpCircle } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech.
- Deep expertise in AWS Cloud Architecture.
- Strong proficiency in Go (Golang), C++, and Python.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design.`;

const MainBoard = () => {
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 20;
  const resumeReady = resumeText.trim().length > 20;
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = () => {
    showToast("Support request sent! We'll be in touch.", "success");
    setShowSupportModal(false);
    setSupportMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else {
        text = await file.text();
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} uploaded!`);
    } catch (err) {
      showToast("Upload failed.", "error");
    }
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) {
      showToast("Please provide both JD and Resume.", "error");
      return;
    }
    
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze JD: ${jdText} and Resume: ${resumeText}. Return ONLY valid JSON: {"candidate_name": "Name", "score": 85, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`
            }]
          }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "AI Error");

      const rawText = data.candidates[0].content.parts[0].text;
      const cleanJson = JSON.parse(rawText.match(/\{[\s\S]*\}/)[0]);
      
      setAnalysis(cleanJson);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Generated!");
    } catch (err: any) {
      showToast("AI Error: Check API Key", "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("RECRUIT-IQ INTELLIGENCE REPORT", 20, 20);
    doc.setFontSize(14);
    doc.text(`Candidate: ${analysis.candidate_name}`, 20, 40);
    doc.text(`Match Score: ${analysis.score}%`, 20, 50);
    doc.save(`RecruitIQ_${analysis.candidate_name}.pdf`);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border ${toast.type === 'error' ? 'bg-rose-500/90' : 'bg-indigo-600/90'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-white">{toast.message}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center font-black">IQ</div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE" : `TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal"><button className="bg-indigo-600 px-5 py-2 rounded-lg text-xs font-bold">Log In</button></SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Resume</button>
            </div>
            
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />

            <div className="flex gap-2 mt-4">
               <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 py-2 text-[9px] uppercase font-bold text-slate-500 border border-slate-800 rounded-lg hover:text-white transition-colors">Load Samples</button>
               <label className="flex-1 text-center cursor-pointer py-2 text-[9px] uppercase font-bold text-slate-500 border border-slate-800 rounded-lg hover:text-white transition-colors">
                  Upload Docx <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
               </label>
            </div>

            <button onClick={handleScreen} disabled={loading} className="mt-4 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-2xl flex items-center justify-center gap-3">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {loading ? "Analyzing..." : "Execute Screen"}
            </button>
        </div>

        {/* RESULTS */}
        <div className="h-[700px] overflow-y-auto space-y-6">
            {analysis ? (
              <div className="space-y-6">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                  <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-black mb-4">{analysis.score}%</div>
                  <div className="text-white font-bold text-xl mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 mx-auto flex items-center gap-2">
                    <Download className="w-3 h-3" /> Download Report
                  </button>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                   <h4 className="text-indigo-400 font-bold uppercase text-[10px] mb-2">Executive Summary</h4>
                   <p className="text-xs text-slate-300 leading-relaxed">{analysis.summary}</p>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase">
                Ready for Analysis
              </div>
            )}
        </div>
      </div>

      <footer className="text-center text-[10px] uppercase font-bold text-slate-500 pb-10">
        &copy; 2026 Recruit-IQ • <button onClick={() => setShowSupportModal(true)} className="underline">Support</button>
      </footer>

      {showSupportModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full">
            <h2 className="text-xl font-black mb-6 uppercase text-center">Support</h2>
            <textarea className="w-full h-32 bg-[#0B1120] border border-slate-800 rounded-xl p-4 text-xs text-white outline-none mb-4" placeholder="Message..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={handleSupportSubmit} className="flex-1 py-4 bg-indigo-600 rounded-xl font-bold uppercase text-xs">Send</button>
              <button onClick={() => setShowSupportModal(false)} className="px-6 py-4 bg-slate-800 rounded-xl font-bold uppercase text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainBoard;
