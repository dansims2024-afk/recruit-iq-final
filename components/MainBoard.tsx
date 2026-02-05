"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, FileText, User, Download, Zap, Shield, HelpCircle } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect\nLOCATION: New York, NY\nSALARY: $240,000 - $285,000\n\nREQUIREMENTS:\n- 12+ years experience\n- AWS Cloud Architecture\n- Go, C++, and Python.`;
const SAMPLE_RESUME = `MARCUS VANDELAY\nPrincipal Architect\n\nEXPERIENCE:\n14 years building financial infrastructure.\nExpert in AWS, Kubernetes, and Go.`;

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
  const finalStripeUrl = userEmail ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = () => {
    showToast("Support request sent!", "success");
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
      showToast("Content too short to analyze.", "error");
      return;
    }
    
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || apiKey.includes("your_gemini")) {
      showToast("API Key Missing in Vercel settings!", "error");
      setLoading(false);
      return;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyze JD: ${jdText} and Resume: ${resumeText}. Return ONLY JSON: {"candidate_name": "Name", "score": 85, "summary": "text", "strengths": ["a"], "gaps": ["b"], "questions": ["c"], "outreach_email": "text"}` }] }]
        })
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
      showToast("Intelligence Generated!");
    } catch (err) {
      showToast("AI Error. Check console.", "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.text("RECRUIT-IQ REPORT", 20, 20);
    doc.text(`Candidate: ${analysis.candidate_name}`, 20, 30);
    doc.text(`Match Score: ${analysis.score}%`, 20, 40);
    doc.save("Report.pdf");
  };

  if (!isLoaded) return null;

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border ${toast.type === 'error' ? 'bg-rose-500/90' : 'bg-indigo-600/90'}`}>
          <p className="text-xs font-bold uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full text-[10px] font-bold border border-indigo-500 text-indigo-400">
            {isPro ? "ELITE" : `FREE: ${3 - scanCount} LEFT`}
          </div>
          {!isSignedIn ? (
            <SignInButton mode="modal" fallbackRedirectUrl="/"><button className="bg-indigo-600 px-5 py-2 rounded-lg text-xs font-bold">Log In</button></SignInButton>
          ) : <UserButton fallbackRedirectUrl="/"/>}
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[650px]">
          <div className="flex gap-3 mb-6">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase border ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800'}`}>JD</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase border ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Resume</button>
          </div>
          <textarea 
            className="flex-1 bg-[#0B1120] rounded-2xl p-6 text-xs text-slate-300 outline-none border border-slate-800"
            value={activeTab === 'jd' ? jdText : resumeText}
            onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            placeholder="Paste text here..."
          />
          <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 bg-indigo-600 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
            {loading ? "Crunching..." : "Execute Screen"}
          </button>
          <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="mt-2 text-[9px] uppercase font-bold text-slate-500 hover:text-white">Load Sample Data</button>
        </div>

        {/* RESULTS */}
        <div className="h-[650px] overflow-y-auto space-y-6">
          {analysis ? (
            <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-black mb-4">{analysis.score}%</div>
              <h2 className="text-xl font-bold mb-4">{analysis.candidate_name}</h2>
              <button onClick={downloadPDF} className="bg-slate-800 px-6 py-3 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2 mx-auto"><Download className="w-3 h-3"/> Download Report</button>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex items-center justify-center text-slate-600 text-[10px] font-bold uppercase">Waiting for analysis...</div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-[10px] text-slate-600 uppercase font-bold pb-10">
        &copy; 2026 Recruit-IQ • <button onClick={() => setShowSupportModal(true)} className="underline">Support</button>
      </footer>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full">
            <h2 className="text-xl font-black mb-4 text-center">Contact Support</h2>
            <textarea className="w-full h-32 bg-[#0B1120] rounded-xl p-4 text-xs mb-4 outline-none border border-slate-800" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={handleSupportSubmit} className="flex-1 py-3 bg-indigo-600 rounded-xl font-bold text-xs uppercase">Send</button>
              <button onClick={() => setShowSupportModal(false)} className="px-6 py-3 bg-slate-800 rounded-xl font-bold text-xs uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainBoard;
