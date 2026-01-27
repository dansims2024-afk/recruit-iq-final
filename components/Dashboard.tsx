"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from "jspdf"; 
import { useUser, useClerk, SignUpButton, UserButton } from "@clerk/nextjs";

// THE REAL STRIPE LINK
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`; // Truncated for brevity
const SAMPLE_RESUME = `MARCUS VANDELAY...`; // Truncated for brevity

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

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userId = user?.id;

  const finalStripeUrl = userId && userEmail
    ? `${STRIPE_URL}?client_reference_id=${userId}&prefilled_email=${encodeURIComponent(userEmail)}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
    
    if (isLoaded && isSignedIn) {
      // 1. SILENT RELOAD to get latest Pro status
      user.reload().catch(() => null);

      // 2. AUTO-REDIRECT LOGIC
      // Check if the URL has "?signup=true" (which we set in Vercel env vars)
      const urlParams = new URLSearchParams(window.location.search);
      const isNewSignup = urlParams.get('signup') === 'true';

      if (isNewSignup && !isPro) {
        // If they just signed up and aren't pro yet, send them STRAIGHT to Stripe
        window.location.href = finalStripeUrl;
        return;
      }

      // 3. AUTO-OPEN MODAL: If limit reached and not pro
      if (!isPro && savedCount >= 3) {
        setShowLimitModal(true);
      }
    }
  }, [isLoaded, isSignedIn, isPro, finalStripeUrl]);

  const handleVerifySubscription = async () => {
    setVerifying(true);
    try {
        const response = await fetch('/api/manual-check', { method: 'POST' });
        if (response.ok) {
            await user?.reload(); 
            setTimeout(() => {
                if (user?.publicMetadata?.isPro) {
                    setShowLimitModal(false);
                    showToast("Elite Status Confirmed!", "success");
                } else {
                    showToast("Verified, but refreshing... try one more time.", "info");
                }
            }, 1000);
        } else {
            showToast("Payment record not found yet.", "error");
        }
    } catch (err) {
        showToast("Connection error. Try again.", "error");
    } finally {
        setVerifying(false);
    }
  };

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = (e: any) => {
    e.preventDefault();
    window.location.href = `mailto:hello@corecreativityai.com?subject=Support&body=${encodeURIComponent(supportMessage)}`;
    setShowSupportModal(false);
    setSupportMessage('');
    showToast("Email client opened!", "info");
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
        const pdfjs = window.pdfjsLib;
        const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + "\n";
        }
        text = fullText;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} uploaded!`, "success");
    } catch (err) { showToast("Upload failed.", "error"); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("INTELLIGENCE REPORT", 20, 25);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("RECRUIT-IQ | POWERED BY CORE CREATIVITY AI", 20, 32);
    doc.setTextColor(30, 41, 59); doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text(cName, 20, 60);
    doc.setTextColor(79, 70, 229); doc.text(`MATCH SCORE: ${analysis.score}%`, 130, 60);
    doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.text("EXECUTIVE SUMMARY", 20, 72);
    doc.setTextColor(51, 65, 85); doc.setFontSize(11); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 79);
    doc.save(`RecruitIQ_Report_${cName}.pdf`);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) { showToast("Steps 1 & 2 Required.", "error"); return; }
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; 
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}...`; // Truncated
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (!result) throw new Error("Failed to parse AI response");
      setAnalysis(result);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Generated", "success");
    } catch (err) { showToast("AI Engine Error.", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
            <div className="hidden md:block">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Elite Candidate Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  1. Job Description {jdReady && "✓"}
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  2. Resume {resumeReady && "✓"}
                </button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-xl hover:bg-indigo-500 transition-all">
              {loading ? "Analyzing..." : "Execute AI Screen →"}
            </button>
        </div>

        <div className="h-[850px] overflow-y-auto space-y-6">
            {analysis ? (
              <div className="space-y-6">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="uppercase text-[9px] font-bold text-slate-500 mb-1">Elite Match Score</h3>
                  <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 transition-all">Download Report</button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest gap-4 text-center p-10 opacity-40">
                <span className="text-5xl">📊</span>
                Intelligence Engine Idle...
              </div>
            )}
        </div>
      </div>

      {/* MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="relative bg-[#0F172A] border border-slate-700 p-10 rounded-[2rem] max-w-lg w-full text-center shadow-2xl">
            <button onClick={() => setShowLimitModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white text-xl font-bold">✕</button>
            <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tighter">Upgrade to Elite</h2>
            <p className="text-slate-400 mb-8 text-sm">You have exhausted your trial scans. Access unlimited intelligence now.</p>
            {!isSignedIn ? (
                <SignUpButton mode="modal" afterSignUpUrl="/?signup=true">
                    <button className="w-full py-5 bg-indigo-600 rounded-xl font-black uppercase text-xs shadow-xl">Create Elite Account</button>
                </SignUpButton>
            ) : (
                <div className="space-y-4">
                  <a href={finalStripeUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-5 bg-indigo-600 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-indigo-500 transition-all">Start 3-Day Free Trial</a>
                  <button onClick={handleVerifySubscription} disabled={verifying} className="w-full py-3 bg-slate-800 rounded-xl font-bold uppercase text-[10px] text-slate-300 border border-slate-700 hover:text-white transition-all">
                    {verifying ? "Checking Stripe..." : "I've Already Paid (Force Unlock)"}
                  </button>
                </div>
            )}
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl font-black text-[10px] uppercase bg-emerald-600 shadow-2xl animate-in slide-in-from-bottom`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
