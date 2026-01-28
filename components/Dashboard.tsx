"use client"; // Must be the absolute first line

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, FileText, User, Download, Zap, Shield, HelpCircle, CheckCircle2 } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL EXTENDED SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech.
- Deep expertise in AWS Cloud Architecture.
- Strong proficiency in Go, C++, Python, and TypeScript.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
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
  const [verifying, setVerifying] = useState(false);

  // BUILD FIX: Define all variables in the component scope
  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  useEffect(() => {
    const handleReturnFlow = async () => {
      if (!isLoaded || !isSignedIn) return;

      // STRIPE TRAP: Redirect returning users
      if (sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment_success') === 'true' && !isPro) {
        showToast("Syncing Elite Membership...", "info");
        await handleVerifySubscription();
      }
    };
    handleReturnFlow();
  }, [isSignedIn, isPro, isLoaded, user, finalStripeUrl]);

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
          window.history.replaceState({}, '', '/');
        }
      } else { showToast("Syncing... try again in a few seconds.", "info"); }
    } catch (err) { console.error(err); } finally { setVerifying(false); }
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
      showToast(`${file.name} uploaded successfully!`);
    } catch (err) { showToast("File error. Try pasting instead.", "error"); } finally { setLoading(false); }
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) { showToast("Input Required.", "error"); return; }
    setLoading(true);
    try {
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, summary, 3 strengths, 3 gaps, 5 questions, and outreach email. Return JSON.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const cleanJson = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);
      setAnalysis(cleanJson);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Generated!");
    } catch (err) { showToast("AI Engine Error.", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border flex items-center gap-2 ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? <Zap className="w-3 h-3 fill-current" /> : null}
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      {/* QUICK START WIZARD */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${jdReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                {jdReady && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest">Requirements</h4>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${resumeReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                {resumeReady && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest">Candidate Data</h4>
          </div>
          <div className={`p-6 rounded-3xl border ${analysis ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3"><span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</span></div>
              <h4 className="uppercase text-[10px] font-black tracking-widest">Intelligence</h4>
          </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl relative">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {jdReady && <Check className="w-3 h-3 text-emerald-400" />} 1. Job Description
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {resumeReady && <Check className="w-3 h-3 text-emerald-400" />} 2. Resume
                </button>
            </div>
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700">Upload PDF / Word<input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" /></label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Elite samples loaded!", "info");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700">Load Samples</button>
            </div>
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} placeholder="Paste text here..."/>
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 transition-all shadow-2xl">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Execute AI Screen →"}
            </button>
        </div>

        <div className="h-[750px] overflow-y-auto space-y-6">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <div className="text-white font-bold text-xl mb-6">{analysis.candidate_name}</div>
                </div>
                {/* Result sections for strengths, gaps, questions... */}
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest gap-6"><Zap className="w-8 h-8 opacity-20" /><p>Waiting for Intelligence</p></div>
            )}
        </div>
      </div>

      {/* SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90 animate-in fade-in">
          <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2.5rem] p-10 max-w-4xl w-full shadow-2xl flex flex-col md:flex-row overflow-hidden">
              <div className="p-4 md:w-3/5">
                 <h2 className="text-5xl font-black text-white mb-4 leading-none tracking-tighter uppercase">Unlock Elite</h2>
                 <p className="text-slate-400 mb-8 font-medium leading-relaxed">Unlimited resume scans, deep AI analysis, and interview guides.</p>
                 {!isSignedIn ? (
                    /* FIXED: Removed invalid 'forceRedirectUrl' and 'signInForceRedirectUrl' */
                    <SignUpButton mode="modal" afterSignUpUrl="/">
                        <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="block w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl uppercase tracking-wider text-xs">Start 3-Day Free Trial</button>
                    </SignUpButton>
                 ) : (
                    <div className="space-y-3">
                        <a href={finalStripeUrl} className="block w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-2xl uppercase tracking-wider text-xs">Start 3-Day Free Trial</a>
                        <button onClick={handleVerifySubscription} disabled={verifying} className="block w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-2xl uppercase text-[10px]">{verifying ? "Syncing..." : "I've Paid (Sync Account)"}</button>
                    </div>
                 )}
                 <button onClick={() => setShowLimitModal(false)} className="mt-6 text-[10px] text-slate-500 font-bold uppercase underline w-full">Close</button>
              </div>
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 p-12 flex-col items-center justify-center text-center"><Zap className="w-10 h-10 text-indigo-400 mb-4" /><h3 className="font-black text-white uppercase text-2xl tracking-tighter mb-4">Elite Access</h3><ul className="text-xs text-slate-400 space-y-3 font-medium"><li>✓ Unlimited Resume Scans</li><li>✓ Strategic Interview Guides</li></ul></div>
          </div>
        </div>
      )}
      {toast.show && <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 px-6 py-2 rounded-lg font-black text-[10px] uppercase shadow-2xl z-[400]`}>{toast.message}</div>}
    </div>
  );
}
