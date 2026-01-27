"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from "jspdf"; 
import { useUser, SignUpButton, UserButton } from "@clerk/nextjs";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech.
- Deep expertise in AWS Cloud Architecture.
- Strong proficiency in Go, C++, Python, and TypeScript.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure.`;

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
  const [verifying, setVerifying] = useState(false);

  // BUILD FIX: Define variables in the component scope
  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user?.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
    
    if (isLoaded && isSignedIn) {
      const urlParams = new URLSearchParams(window.location.search);
      // Auto-redirect to Stripe if just signed up
      if (urlParams.get('signup') === 'true' && !isPro) {
        window.location.href = finalStripeUrl;
        return;
      }
      // Auto-unlock if returning from successful payment
      if (urlParams.get('payment_success') === 'true' && !isPro) {
        handleVerifySubscription();
      }
      if (!isPro && savedCount >= 3) setShowLimitModal(true);
    }
  }, [isLoaded, isSignedIn, isPro, finalStripeUrl]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleVerifySubscription = async () => {
    setVerifying(true);
    showToast("Syncing with Stripe...");
    try {
      const res = await fetch('/api/manual-check', { method: 'POST' });
      if (res.ok) {
        await user?.reload(); 
        if (user?.publicMetadata?.isPro) {
          setShowLimitModal(false);
          showToast("Elite Status Confirmed!");
          window.history.replaceState({}, '', '/');
        } else { showToast("Verification pending... try once more."); }
      } else { showToast("Payment record not found yet."); }
    } catch (err) { showToast("Connection error."); } finally { setVerifying(false); }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        // @ts-ignore
        const pdfJS = window.pdfjsLib;
        const pdf = await pdfJS.getDocument(URL.createObjectURL(file)).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ') + "\n";
        }
        text = fullText;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast("File uploaded!");
    } catch (err) { showToast("Upload failed."); }
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (!jdReady || !resumeReady) { showToast("Input Required."); return; }
    setLoading(true);
    try {
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, summary, 3 strengths, 3 gaps, 5 questions, and outreach email. Return ONLY JSON.`;
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
      showToast("Intelligence Generated");
    } catch (err) { showToast("AI Engine Error."); } finally { setLoading(false); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("RECRUIT-IQ REPORT", 20, 25);
    doc.text(analysis.candidate_name, 20, 55);
    doc.save(`Report_${analysis.candidate_name}.pdf`);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-xl font-black uppercase">Recruit-IQ</h1>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
            {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
          </div>
          <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 flex flex-col h-[750px]">
          <div className="flex gap-3 mb-6">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase border ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. JD {jdReady && "✓"}</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase border ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume {resumeReady && "✓"}</button>
          </div>
          <div className="flex gap-2 mb-4">
            <label className="flex-1 text-center cursor-pointer bg-slate-800 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700">Upload File<input type="file" onChange={handleFileUpload} className="hidden" /></label>
            <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Samples Loaded");}} className="flex-1 bg-indigo-600/10 py-3 rounded-xl text-[10px] font-bold uppercase text-indigo-400 border border-indigo-500/30">Load Samples</button>
          </div>
          <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
          <button onClick={handleScreen} disabled={loading} className="mt-6 py-4 rounded-xl font-black uppercase text-xs bg-indigo-600 shadow-lg">{loading ? "Analyzing..." : "Execute AI Screen →"}</button>
        </div>

        <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 h-[750px] overflow-y-auto">
          {analysis ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-black border-4 border-indigo-500/50">{analysis.score}%</div>
              <div className="font-bold text-lg">{analysis.candidate_name}</div>
              <button onClick={downloadPDF} className="bg-slate-800 text-indigo-400 px-6 py-2 rounded-lg text-[10px] font-bold uppercase border border-slate-700">Download PDF</button>
              <div className="text-left text-xs text-slate-300 space-y-4 pt-4">
                <p><strong className="text-indigo-400 uppercase text-[10px]">Summary:</strong><br/>{analysis.summary}</p>
                <p className="text-emerald-400"><strong className="uppercase text-[10px]">Strengths:</strong><br/>{analysis.strengths.join(', ')}</p>
                <p className="text-rose-400"><strong className="uppercase text-[10px]">Gaps:</strong><br/>{analysis.gaps.join(', ')}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase opacity-40">📊 Engine Idle</div>
          )}
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="relative bg-[#0F172A] border border-slate-700 p-10 rounded-[2rem] max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black mb-4 uppercase">Upgrade to Elite</h2>
            {!isSignedIn ? (
              <SignUpButton mode="modal" afterSignUpUrl="/?signup=true"><button className="w-full py-4 bg-indigo-600 rounded-xl font-black uppercase text-xs">Sign Up</button></SignUpButton>
            ) : (
              <div className="space-y-4">
                <a href={finalStripeUrl} target="_blank" className="block w-full py-4 bg-indigo-600 rounded-xl font-black uppercase text-xs shadow-xl">Start Elite Trial</a>
                <button onClick={handleVerifySubscription} disabled={verifying} className="w-full py-3 bg-slate-800 rounded-xl font-bold uppercase text-[10px] text-slate-400 border border-slate-700">{verifying ? "Syncing..." : "I've Paid (Force Unlock)"}</button>
              </div>
            )}
          </div>
        </div>
      )}
      {toast.show && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 px-6 py-2 rounded-lg font-black text-[10px] uppercase shadow-2xl">{toast.message}</div>}
    </div>
  );
}
