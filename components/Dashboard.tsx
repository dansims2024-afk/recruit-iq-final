"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from "jspdf"; 
import { useUser, useClerk, SignUpButton, UserButton } from "@clerk/nextjs";

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
  const [toast, setToast] = useState({ show: false, message: '' });
  const [verifying, setVerifying] = useState(false);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id && user?.primaryEmailAddress?.emailAddress
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
    
    if (isLoaded && isSignedIn) {
      user.reload().catch(() => null);
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('signup') === 'true' && !isPro) {
        window.location.href = finalStripeUrl;
        return;
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
    try {
      const res = await fetch('/api/manual-check', { method: 'POST' });
      if (res.ok) {
        await user?.reload(); 
        if (user?.publicMetadata?.isPro) {
          setShowLimitModal(false);
          showToast("Elite Status Confirmed!");
        } else { showToast("Verifying... try once more."); }
      } else { showToast("Payment not found yet."); }
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
        const pdf = await window.pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + "\n";
        }
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast("File uploaded!");
    } catch (err) { showToast("Upload failed."); }
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (!jdReady || !resumeReady) { showToast("Steps 1 & 2 Required."); return; }
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
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("RECRUIT-IQ REPORT", 20, 25);
    doc.setTextColor(30, 41, 59); doc.setFontSize(18); doc.text(analysis.candidate_name, 20, 55);
    doc.text(`SCORE: ${analysis.score}%`, 140, 55);
    doc.setFontSize(10); const lines = doc.splitTextToSize(analysis.summary, 170);
    doc.text(lines, 20, 70); doc.save(`Report_${analysis.candidate_name}.pdf`);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4"><img src="/logo.png" className="h-10" />
          <h1 className="text-xl font-black uppercase">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
            {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
          </div>
          <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 flex flex-col h-[700px]">
          <div className="flex gap-3 mb-6">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. JD {jdReady && "✓"}</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume {resumeReady && "✓"}</button>
          </div>
          <label className="block mb-4 text-center cursor-pointer bg-slate-800 py-2 rounded-lg text-[9px] font-bold uppercase border border-slate-700">Upload PDF/DOCX<input type="file" onChange={handleFileUpload} className="hidden" /></label>
          <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-4 border border-slate-800 rounded-xl text-xs font-mono" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
          <button onClick={handleScreen} disabled={loading} className="mt-6 py-4 rounded-xl font-black uppercase text-xs bg-indigo-600 shadow-lg">{loading ? "Analyzing..." : "Execute AI Screen →"}</button>
        </div>

        <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 h-[700px] overflow-y-auto">
          {analysis ? (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-black border-4 border-indigo-500/50">{analysis.score}%</div>
              <div className="font-bold text-lg">{analysis.candidate_name}</div>
              <button onClick={downloadPDF} className="bg-slate-800 text-indigo-400 px-6 py-2 rounded-lg text-[10px] font-bold uppercase border border-slate-700">Download PDF</button>
              <div className="text-left text-xs text-slate-300 space-y-4 pt-4">
                <p><strong>Summary:</strong> {analysis.summary}</p>
                <p className="text-emerald-400"><strong>Strengths:</strong> {analysis.strengths.join(', ')}</p>
                <p className="text-rose-400"><strong>Gaps:</strong> {analysis.gaps.join(', ')}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase opacity-40">📊<br/>Engine Idle</div>
          )}
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="relative bg-[#0F172A] border border-slate-700 p-10 rounded-[2rem] max-w-sm w-full text-center">
            <button onClick={() => setShowLimitModal(false)} className="absolute top-4 right-4 text-slate-500">✕</button>
            <h2 className="text-2xl font-black mb-4 uppercase">Upgrade to Elite</h2>
            {!isSignedIn ? (
              <SignUpButton 
                mode="modal" 
                afterSignUpUrl="/?signup=true"
                // This ensures they go straight to the payment path after verification
                signUpForceRedirectUrl="/?signup=true"
              >
                <button className="w-full py-4 bg-indigo-600 rounded-xl font-black uppercase text-xs">Sign Up</button>
              </SignUpButton>
            ) : (
              <div className="space-y-4">
                <a href={finalStripeUrl} target="_blank" className="block w-full py-4 bg-indigo-600 rounded-xl font-black uppercase text-xs">Start Elite Trial</a>
                <button onClick={handleVerifySubscription} disabled={verifying} className="w-full py-2 bg-slate-800 rounded-xl font-bold uppercase text-[9px] text-slate-400 border border-slate-700">
                  {verifying ? "Checking..." : "I've Paid (Force Unlock)"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {toast.show && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 px-6 py-2 rounded-lg font-black text-[10px] uppercase">{toast.message}</div>}
    </div>
  );
}
