"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, FileText, User, Download, Zap, Shield, HelpCircle, CheckCircle2 } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

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
  const [verifying, setVerifying] = useState(false);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
    
    // Auto-catch payment success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true' && !isPro) {
      handleVerifySubscription();
    }
  }, [isPro]);

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
          showToast("Elite Status Confirmed!", "success");
        }
      }
    } catch (err) { console.error(err); } finally { setVerifying(false); }
  };

  // --- PDF & WORD UPLOAD (NO TERMINAL REQUIRED) ---
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
        // Use the CDN-loaded PDF.js logic
        // @ts-ignore
        const pdfJS = window.pdfjsLib;
        pdfJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfJS.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ') + "\n";
        }
        text = fullText;
      } else {
        text = await file.text();
      }

      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} uploaded successfully!`);
    } catch (err) {
      showToast("Error reading file. Try pasting text.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (!jdReady || !resumeReady) { showToast("Missing input.", "error"); return; }
    setLoading(true);
    try {
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, summary, 3 strengths, 3 gaps, 5 questions, and outreach email. Return JSON.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);
      setAnalysis(result);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Analysis Complete!");
    } catch (err) { showToast("AI Engine Error.", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <h1 className="text-2xl font-black uppercase">Recruit-IQ</h1>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      {/* PROGRESS WIZARD WITH GREEN CHECKMARKS */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${jdReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                {jdReady && <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in" />}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest">Job Description</h4>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${resumeReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                {resumeReady && <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in" />}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest">Candidate Resume</h4>
          </div>
          <div className={`p-6 rounded-3xl border ${analysis ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest">AI Intelligence</h4>
          </div>
      </div>

      {/* INPUT AREA */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl relative">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {jdReady && <Check className="w-3 h-3 text-emerald-400" />} 1. JD
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {resumeReady && <Check className="w-3 h-3 text-emerald-400" />} 2. Resume
                </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700">
                Upload PDF / Word
                <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste or upload text here..."
            />
            
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
              {loading ? "Crunching Data..." : "Execute AI Screen →"}
            </button>
        </div>

        {/* RESULTS AREA */}
        <div className="h-[750px] overflow-y-auto space-y-6">
            {analysis ? (
              <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] animate-in fade-in zoom-in">
                <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4 shadow-xl">{analysis.score}%</div>
                <div className="text-white font-bold text-center text-xl mb-6">{analysis.candidate_name}</div>
                <button onClick={() => downloadPDF()} className="w-full bg-slate-800 py-3 rounded-xl text-[10px] font-bold uppercase text-indigo-400 border border-slate-700">Download Report</button>
                <div className="mt-8 space-y-4 text-xs text-slate-300">
                  <p><strong className="text-emerald-400">Strengths:</strong> {analysis.strengths.join(', ')}</p>
                  <p><strong className="text-rose-400">Gaps:</strong> {analysis.gaps.join(', ')}</p>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest gap-6">
                <Zap className="w-8 h-8 opacity-20" />
                <p>Waiting for Intelligence</p>
              </div>
            )}
        </div>
      </div>

      {/* SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90 animate-in fade-in">
          <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-3xl font-black mb-6 uppercase">Upgrade to Elite</h2>
            {!isSignedIn ? (
              <SignUpButton mode="modal" afterSignUpUrl="/"><button className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs">Start Trial</button></SignUpButton>
            ) : (
              <div className="space-y-4">
                <a href={finalStripeUrl} className="block w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs">Unlock Elite Access</a>
                <button onClick={handleVerifySubscription} disabled={verifying} className="w-full py-2 text-slate-500 font-bold uppercase text-[10px]">{verifying ? "Syncing..." : "Sync Account"}</button>
              </div>
            )}
            <button onClick={() => setShowLimitModal(false)} className="mt-6 text-[10px] text-slate-500 font-bold uppercase underline">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
