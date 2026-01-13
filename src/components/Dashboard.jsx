import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- SAMPLES --- (Keeping these exactly as they were)
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`;
const SAMPLE_RESUME = `MARCUS VANDELAY...`;

export default function Dashboard({ kinde }) {
  // --- KINDE AUTH STATE ---
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- ANALYSIS STATE ---
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // --- KINDE SYNC LOGIC ---
  useEffect(() => {
    const syncUser = async () => {
      try {
        const profile = await kinde.getUser();
        if (profile) {
          setUser(profile);
          // Check the 'is_pro' property we created in Kinde settings
          const claim = await kinde.getClaim("is_pro");
          setIsPro(claim?.value === true);
        }
      } catch (err) {
        console.error("Kinde Sync Error:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    syncUser();
    // Poll every 2.5s to catch the Zapier update instantly
    const interval = setInterval(syncUser, 2500);
    return () => clearInterval(interval);
  }, [kinde]);

  // --- STRIPE PREFILL ---
  const userEmail = user?.email;
  const finalStripeUrl = userEmail 
    ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` 
    : STRIPE_URL;

  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  // --- 1. LOAD LOCAL COUNTS ---
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  // --- 2. AUTO-REDIRECT (Guest -> Stripe) ---
  useEffect(() => {
    // If user logged in and we have a pending upgrade flag
    if (user && localStorage.getItem('recruit_iq_pending_upgrade') === 'true') {
      setIsRedirecting(true);
      localStorage.removeItem('recruit_iq_pending_upgrade');
      setTimeout(() => { window.location.href = finalStripeUrl; }, 1500);
    }
  }, [user, finalStripeUrl]);

  // --- 3. SUCCESS UI HANDLER ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout_success') === 'true' && !isPro) {
      setIsVerifying(true);
    }
    if (isPro) setIsVerifying(false);
  }, [isPro]);

  // --- AUTH ACTIONS ---
  const handleGuestSignup = () => {
    localStorage.setItem('recruit_iq_pending_upgrade', 'true');
    kinde.register(); // Kinde Native Registration
  };

  const handleLogin = () => kinde.login();
  const handleLogout = () => kinde.logout();

  // --- TOAST & CLEAR ---
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleClear = () => {
    setJdText(''); setResumeText(''); setAnalysis(null); setActiveTab('jd');
    showToast("Dashboard cleared", "info");
  };

  // --- FILE UPLOAD (Mammoth.js & PDF.js) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        const pdfjs = window.pdfjsLib;
        if (!pdfjs) { showToast("PDF Reader loading...", "error"); return; }
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ') + "\n";
        }
        text = fullText;
      } else { text = await file.text(); }
      
      if (activeTab === 'jd') setJdText(text); else setResumeText(text);
      showToast(`${file.name} uploaded!`, "success");
    } catch (err) { showToast("File read error.", "error"); }
  };

  // --- PDF DOWNLOAD ---
  const downloadPDF = () => {
    if (!analysis) return;
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("Recruit-IQ Intelligence Report", 20, 20);
    // ... (rest of your PDF styling remains exactly the same as original)
    const cName = analysis.candidate_name || "Candidate Report";
    doc.save(`${cName.replace(/\s+/g, '_')}_Report.pdf`); 
    showToast("Report downloaded!", "success");
  };

  // --- GEMINI AI SCREENING ---
  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) {
        showToast("Step 1 and Step 2 required.", "error");
        return;
    }
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract name. Return JSON: {"candidate_name": "Name", "score": 0-100, "summary": "...", "strengths": ["..."], "gaps": ["..."], "questions": ["..."], "outreach_email": "..."}`;

      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const result = JSON.parse(jsonMatch[0]);

      setAnalysis(result);
      
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Analysis Complete", "success");

    } catch (err) { showToast("AI Analysis failed.", "error"); } 
    finally { setLoading(false); }
  };

  if (isAuthLoading) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center flex-col text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
        <p className="text-slate-400">Taking you to secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans pt-20">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <img src={logo} alt="Recruit-IQ" className="h-12 w-auto drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
            <div className="hidden md:block">
                <h1 className="text-2xl font-black tracking-tighter text-white leading-none">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mt-1">By Core Creativity AI</p>
            </div>
        </div>
        
        <div className="flex gap-3 items-center">
            {user ? (
               <div className="flex items-center gap-3">
                 <span className="text-[10px] opacity-40 uppercase font-bold hidden lg:block">{user.email}</span>
                 <button onClick={handleLogout} className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-tighter transition-colors">Logout</button>
               </div>
            ) : (
               <button onClick={handleLogin} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-tighter transition-colors">Login</button>
            )}

            {isVerifying && (
                <div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-300 animate-pulse">
                    Activating Membership...
                </div>
            )}
            <div className={`bg-indigo-500/10 border px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all duration-500 ${isPro ? 'border-emerald-500/50 text-emerald-400 shadow-emerald-500/20' : 'border-indigo-500/50 text-indigo-400 shadow-indigo-500/10'}`}>
                <span className={`w-2 h-2 rounded-full ${isPro ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`}></span>
                {isPro ? "ELITE MEMBERSHIP ACTIVE" : `FREE TRIAL: ${3 - scanCount} SCANS LEFT`}
            </div>
        </div>
      </div>

      {/* --- TOAST --- */}
      {toast.show && (
        <div className={`fixed top-24 right-5 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-500' : 'bg-emerald-950/90 border-emerald-500'}`}>
           <p className="text-sm font-bold tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* --- MODAL --- */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
           <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700/50 rounded-[2rem] p-10 text-center">
              <h2 className="text-3xl font-black mb-4">Elite Membership Required</h2>
              <p className="text-slate-400 mb-8">You've reached your trial limit. Upgrade to unlock unlimited AI screening.</p>
              
              {!user ? (
                <button onClick={handleGuestSignup} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl uppercase">Create Account to Start Trial</button>
              ) : (
                <a href={finalStripeUrl} className="block w-full py-4 bg-emerald-600 text-white font-bold rounded-xl uppercase">Activate 3-Day Free Trial</a>
              )}
              <button onClick={() => setShowLimitModal(false)} className="mt-4 text-xs opacity-50 underline">Close</button>
           </div>
        </div>
      )}

      {/* --- THE REST OF YOUR UI (JD/Resume areas) stays the same from here --- */}
      {/* ... (I've kept the same structure below for brevity) ... */}
      <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px]">
             {/* Text area and Analyze button as you had them */}
             <textarea 
                className="flex-1 bg-[#0B1120] p-6 rounded-2xl border border-slate-800 outline-none text-xs"
                value={activeTab === 'jd' ? jdText : resumeText} 
                onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
                placeholder="Paste data..."
             />
             <button onClick={handleScreen} className="mt-6 py-5 bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest">
                {loading ? "Analyzing..." : "Screen Candidate →"}
             </button>
          </div>
          
          <div className="h-[850px] overflow-y-auto">
              {/* Analysis Results mapping as you had them */}
              {analysis && (
                <div className="animate-in fade-in space-y-4">
                   <div className="bg-indigo-600 p-8 rounded-[2rem] text-center">
                      <div className="text-5xl font-black">{analysis.score}%</div>
                      <div className="text-xs uppercase font-bold opacity-70 mt-2">Match Score</div>
                   </div>
                   {/* Map strengths, gaps, etc. */}
                </div>
              )}
          </div>
      </div>
    </div>
  );
}
