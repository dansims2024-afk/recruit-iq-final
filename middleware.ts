"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, Check, FileText, User, Download, Send, 
  Zap, Shield, HelpCircle, CheckCircle2, XCircle, Info,
  Briefcase
} from "lucide-react";

// --- CONSTANTS & SAMPLES ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

const SAMPLE_JD = `JOB TITLE: Lead Skilled Trades Supervisor (HVAC/Electrical)
LOCATION: Mid-Atlantic Region (Philadelphia/NJ)
SALARY: $110,000 - $135,000 + Company Vehicle + Bonus

OVERVIEW:
Join a premier industrial services firm. We are looking for a Lead Supervisor to oversee multi-site mechanical installations and manage a team of 20+ technicians.

REQUIREMENTS:
- 10+ years in Skilled Trades management.
- Master Electrician or Master Plumber license preferred.
- Expert knowledge of OSHA safety protocols and blueprint reading.
- Experience with project scheduling software and budget management.`;

const SAMPLE_RESUME = `ROBERT 'BOB' MILLER
Senior Trades Project Manager | Cherry Hill, NJ

SUMMARY:
Results-driven Trades Leader with 15 years of experience overseeing large-scale mechanical projects. Proven track record of finishing 15% under budget while maintaining 100% safety compliance.

EXPERIENCE:
Mid-Atlantic Industrial | Project Lead | 2018 - Present
- Managed $5M+ electrical infrastructure projects for pharmaceutical plants.
- Supervised a crew of 25 union and non-union technicians.
- Reduced project turnaround time by 20% through better resource allocation.

SKILLS:
- OSHA 30 Certified.
- Industrial HVAC, Electrical Systems, PLC Logic.
- Microsoft Project, Procore, Bluebeam.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
  // --- STATE MANAGEMENT ---
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

  // --- BUILD-TIME SAFETY GATE ---
  // This prevents Clerk hooks from firing during Vercel's static build phase
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-indigo-500 font-black tracking-widest animate-pulse uppercase">
        Recruit-IQ Initializing...
      </div>
    );
  }

  // --- DERIVED STATE ---
  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  const storageKey = user?.id ? `recruit_iq_scans_${user.id}` : 'recruit_iq_scans_guest';

  // --- PERSISTENCE ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedCount = parseInt(localStorage.getItem(storageKey) || '0');
        setScanCount(savedCount);
    }
  }, [storageKey, user?.id]); 

  // --- SUBSCRIPTION & REDIRECT FLOW ---
  useEffect(() => {
    if (!isSignedIn) return;

    const handleReturnFlow = async () => {
      if (isPro) {
        sessionStorage.removeItem('trigger_stripe');
        return; 
      }
      if (sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
        return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment_success') === 'true' && !isPro) {
        showToast("Finalizing Elite Access...", "info");
        await handleVerifySubscription();
      }
    };
    handleReturnFlow();
  }, [isSignedIn, isPro, user, finalStripeUrl]);

  // --- UTILITY FUNCTIONS ---
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
    } catch (err) { showToast("Connection error.", "error"); } finally { setVerifying(false); }
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
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} Uploaded Successfully!`);
    } catch (err) { showToast("Upload failed.", "error"); } finally { setLoading(false); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();
    const score = analysis.score;

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * lineHeight;
    };

    // Header Design
    doc.setFillColor(67, 56, 202); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("CONFIDENTIAL REPORT", 15, 20);
    doc.setFontSize(10); doc.text("GENERATED BY RECRUIT-IQ AI", 15, 30);
    doc.text(`${new Date().toLocaleDateString()}`, 170, 28);

    // Score & Name
    doc.setTextColor(30, 41, 59); doc.setFontSize(22); doc.text(cName, 15, 55);
    doc.setDrawColor(67, 56, 202); doc.setFillColor(243, 244, 246);
    doc.circle(180, 52, 12, 'FD');
    doc.setTextColor(67, 56, 202); doc.setFontSize(16); doc.text(`${score}%`, 174, 54);

    // Summary Box
    doc.setFillColor(248, 250, 252); doc.rect(15, 65, 180, 35, 'F');
    doc.setTextColor(71, 85, 105); doc.setFontSize(10); doc.text("EXECUTIVE SUMMARY", 20, 72);
    doc.setTextColor(30, 41, 59); addWrappedText(analysis.summary || "", 20, 78, 170, 5);

    doc.save(`RecruitIQ_Report_${cName.replace(/\s/g, '_')}.pdf`);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true); return;
    }
    if (!jdReady || !resumeReady) { showToast("Input Required.", "error"); return; }
    
    setLoading(true);
    setAnalysis(null);
    try {
      const response = await fetch('/api/generate', { 
        method: "POST", 
        body: JSON.stringify({ 
            prompt: `JD: ${jdText} \n RESUME: ${resumeText}` 
        }) 
      });
      if (!response.ok) throw new Error("AI Engine Busy.");
      const data = await response.json();
      setAnalysis(data);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem(storageKey, newCount.toString());
      }
      showToast("Intelligence Generated!");
    } catch (err: any) { 
      showToast(err.message || "Connection Error.", "error"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto space-y-12 text-white bg-[#0B1120] min-h-screen pt-20 font-sans tracking-tight">
      
      {/* TOAST NOTIFICATIONS */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl border ${toast.type === 'error' ? 'bg-rose-500/90 border-rose-400' : 'bg-indigo-600/90 border-indigo-400'}`}>
          <p className="text-sm font-bold uppercase tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* HEADER NAVIGATION */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-800/50 pb-8">
        <div className="flex items-center gap-4">
            <div className="hidden md:block">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wide mt-1">Elite Candidate Screening</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-6 py-2 rounded-full text-xs font-bold border flex items-center gap-2 ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro && <Zap className="w-4 h-4 fill-current" />}
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal" fallbackRedirectUrl="/">
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-lg">Log In</button>
                </SignInButton>
            ) : <UserButton />}
        </div>
      </div>

      {/* WORKSPACE - INPUTS & RESULTS */}
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-[#111827] p-10 rounded-[3rem] border border-slate-800 flex flex-col h-[800px] shadow-2xl">
            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-5 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {jdReady && <Check className="w-4 h-4 text-emerald-400" />} 1. Job Description
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-5 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-3 border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {resumeReady && <Check className="w-4 h-4 text-emerald-400" />} 2. Resume
                </button>
            </div>
            
            <div className="flex gap-4 mb-6">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-4 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-white border border-slate-700 transition-all">Upload PDF / Word<input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" /></label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Skilled Trades Samples Loaded!", "info");}} className="flex-1 bg-slate-800/50 py-4 rounded-xl text-xs font-black uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-200 p-10 border border-slate-800 rounded-[2.5rem] text-base leading-relaxed focus:border-indigo-500 transition-colors custom-scrollbar font-sans"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste text or upload file..."
            />
            
            <button onClick={handleScreen} disabled={loading} className="mt-10 py-6 rounded-2xl font-black uppercase text-sm bg-indigo-600 shadow-2xl flex items-center justify-center gap-4 hover:bg-indigo-500 transition-all disabled:opacity-50 tracking-wider">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white animate-pulse" />}
              {loading ? "CRUNCHING DATA..." : "EXECUTE ELITE AI SCREEN →"}
            </button>
        </div>

        {/* AI OUTPUT COLUMN */}
        <div className="h-[800px] overflow-y-auto space-y-10 pr-4 custom-scrollbar pb-10">
            {analysis ? (
              <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-[#111827] border border-slate-800 p-12 rounded-[3.5rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                  <div className="w-32 h-32 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-6xl font-black mb-6 shadow-xl border-4 border-indigo-500/20">{analysis.score}%</div>
                  <h3 className="uppercase text-xs font-black tracking-widest text-slate-500 mb-2">Match Score</h3>
                  <div className="text-white font-black text-3xl mb-10 tracking-tight uppercase">{analysis.candidate_name}</div>
                  
                  <div className="bg-slate-900/50 rounded-[2rem] p-10 mb-10 text-left border border-slate-800/50 shadow-inner">
                    <h4 className="text-slate-500 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-3"><FileText className="w-4 h-4" /> Executive Summary</h4>
                    <p className="text-base text-slate-200 leading-loose font-medium">{analysis.summary}</p>
                  </div>

                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-10 py-5 rounded-2xl text-xs font-black uppercase border border-slate-700 transition-all flex items-center gap-3 mx-auto">
                    <Download className="w-5 h-5" /> Download Elite Report (PDF)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[2.5rem] text-sm">
                    <h4 className="text-emerald-400 font-black uppercase mb-6 text-xs tracking-widest flex items-center gap-3"><Check className="w-5 h-5" /> Strengths</h4>
                    <div className="space-y-4">
                        {(analysis.strengths || []).map((s: any, i: number) => <p key={i} className="text-slate-200 leading-relaxed font-bold">• {s}</p>)}
                    </div>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-10 rounded-[2.5rem] text-sm">
                    <h4 className="text-rose-400 font-black uppercase mb-6 text-xs tracking-widest flex items-center gap-3"><Shield className="w-5 h-5" /> Critical Gaps</h4>
                    <div className="space-y-4">
                        {(analysis.gaps || []).map((g: any, i: number) => <p key={i} className="text-slate-200 leading-relaxed font-bold">• {g}</p>)}
                    </div>
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-12 rounded-[3rem]">
                  <h4 className="text-indigo-400 font-black uppercase text-xs mb-10 tracking-widest flex items-center gap-4"><HelpCircle className="w-5 h-5" /> Interview Guide</h4>
                  <div className="space-y-6">
                    {(analysis.questions || []).map((q: any, i: number) => (
                        <div key={i} className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 text-sm leading-relaxed text-slate-200 font-bold italic shadow-inner">"{q}"</div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-12 rounded-[3rem] text-center">
                    <h4 className="text-blue-400 font-black uppercase text-xs mb-8 tracking-widest">Outreach Template</h4>
                    <div className="bg-slate-950/80 rounded-[2rem] p-10 mb-10 text-left border border-slate-800 shadow-2xl">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">{analysis.outreach_email}</p>
                    </div>
                    <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Email Copied!");}} className="w-full py-6 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-4 border border-slate-700">
                      <Copy className="w-5 h-5" /> Copy Template
                    </button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[4rem] flex flex-col items-center justify-center text-slate-700 font-black text-xs uppercase tracking-[0.4em] gap-10">
                <Zap className="w-12 h-12 opacity-20 animate-pulse" />
                <p>Waiting for Intel</p>
              </div>
            )}
        </div>
      </div>

      {/* SALES / UPGRADE MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in">
          <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[3.5rem] p-16 max-w-4xl w-full shadow-2xl flex flex-col md:flex-row overflow-hidden group">
              <div className="relative p-4 md:w-3/5">
                 <h2 className="text-7xl font-black text-white mb-8 leading-none tracking-tighter uppercase italic">Unlock <span className="text-indigo-400">Elite.</span></h2>
                 <p className="text-slate-400 mb-12 font-black uppercase text-xs tracking-widest leading-loose">Unlimited scans, Deep AI metrics, and Strategic interview engineering.</p>
                 
                 {!isSignedIn ? (
                    <SignUpButton mode="modal" fallbackRedirectUrl="/">
                        <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="block w-full py-8 bg-indigo-600 text-center text-white font-black rounded-[2.5rem] uppercase tracking-widest hover:scale-[1.02] transition-all text-xs shadow-2xl shadow-blue-500/40">Start Free Trial</button>
                    </SignUpButton>
                 ) : (
                    <div className="space-y-6">
                        <a href={finalStripeUrl} className="block w-full py-8 bg-indigo-600 text-center text-white font-black rounded-[2.5rem] uppercase tracking-widest hover:scale-[1.02] transition-all text-xs shadow-2xl">Upgrade Now</a>
                        <button onClick={handleVerifySubscription} disabled={verifying} className="block w-full py-4 bg-slate-800 text-slate-400 font-black rounded-2xl uppercase tracking-widest transition-all text-xs border border-slate-700">{verifying ? "VERIFYING..." : "SYNC ACCOUNT"}</button>
                    </div>
                 )}
                 <button onClick={() => setShowLimitModal(false)} className="mt-10 text-xs text-slate-600 font-black uppercase tracking-widest hover:text-white underline transition-all w-full text-center">Maybe Later</button>
              </div>
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 flex-col items-center justify-center p-20 text-center shadow-inner">
                 <Zap className="w-16 h-16 text-indigo-400 mb-12 animate-pulse" />
                 <h3 className="font-black text-white text-4xl uppercase tracking-tighter mb-8">Elite</h3>
                 <ul className="text-xs text-slate-500 space-y-6 font-black uppercase tracking-widest text-left">
                    <li>✓ Unlimited Scans</li>
                    <li>✓ Match Analytics</li>
                    <li>✓ Strategic Guides</li>
                    <li>✓ Outreach Engine</li>
                 </ul>
              </div>
          </div>
        </div>
      )}

      {/* FOOTER & SUPPORT */}
      <footer className="mt-20 border-t border-slate-800 pt-12 pb-24 text-center text-xs uppercase font-black tracking-widest text-slate-500">
        <p className="mb-6">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by AI.</p>
        <div className="flex justify-center gap-10">
          <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400">Support</button>
          <button className="hover:text-indigo-400">Terms</button>
        </div>
      </footer>

      {showSupportModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-12 rounded-[3rem] max-w-lg w-full shadow-2xl text-center">
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter">Support</h2>
            <textarea className="w-full h-48 bg-[#0B1120] border border-slate-800 rounded-3xl p-8 text-sm text-white outline-none resize-none mb-10" placeholder="Message..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-6">
                <button onClick={() => {showToast("Sent!"); setShowSupportModal(false);}} className="flex-1 py-5 bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest">Send</button>
                <button onClick={() => setShowSupportModal(false)} className="px-10 py-5 bg-slate-800 rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
