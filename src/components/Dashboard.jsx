import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from '../logo.png'; 

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- FULL SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate to ensure 99.999% uptime.
- Lead the migration from legacy monolithic structures to a modern, event-driven architecture using Kafka and gRPC.
- Optimize C++ and Go-based trading engines for sub-millisecond latency.
- Establish CI/CD best practices and mentor a global team of 15+ senior engineers.

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech or Capital Markets.
- Deep expertise in AWS Cloud Architecture (AWS Certified Solutions Architect preferred).
- Proven track record with Kubernetes, Docker, Kafka, Redis, and Terraform.
- Strong proficiency in Go (Golang), C++, Python, and TypeScript.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | New York, NY | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data using AWS Lambda.
- Reduced infrastructure costs by 35% through aggressive AWS Graviton migration.

InnovaTrade | Senior Staff Engineer | Chicago, IL | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency.
- Implemented automated failover protocols that prevented over $10M in potential slippage.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java.
- Cloud: AWS (EKS, Lambda, Aurora, SQS), Terraform, Docker, Kubernetes.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const finalStripeUrl = userEmail 
    ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` 
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  // Clerk auto-redirect logic
  useEffect(() => {
    if (isSignedIn && localStorage.getItem('recruit_iq_pending_upgrade') === 'true') {
      setIsRedirecting(true);
      localStorage.removeItem('recruit_iq_pending_upgrade');
      setTimeout(() => { window.location.href = finalStripeUrl; }, 1500);
    }
  }, [isSignedIn, finalStripeUrl]);

  // Handle Checkout Success Verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (isSignedIn && !isPro && urlParams.get('checkout_success')) {
        setIsVerifying(true);
        const interval = setInterval(async () => { await user.reload(); }, 1500);
        const timeout = setTimeout(() => { window.location.href = window.location.pathname; }, 6000);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }
    if (isPro) setIsVerifying(false);
  }, [isSignedIn, isPro, user]);

  const handleGuestSignup = () => {
    localStorage.setItem('recruit_iq_pending_upgrade', 'true');
    clerk.openSignUp();
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent("Recruit-IQ Support Request");
    const body = encodeURIComponent(supportMessage);
    window.location.href = `mailto:hello@corecreativityai.com?subject=${subject}&body=${body}`;
    setShowSupportModal(false);
    setSupportMessage('');
    showToast("Email client opened!", "info");
  };

  const handleClear = () => {
    setJdText(''); setResumeText(''); setAnalysis(null); setActiveTab('jd');
    showToast("Dashboard cleared", "info");
  };

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
    } catch (err) { showToast("Upload failed.", "error"); }
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (!jdReady || !resumeReady) { showToast("Please complete Steps 1 & 2.", "error"); return; }
    setLoading(true);
    // [Gemini API logic should be here]
    setTimeout(() => { setLoading(false); }, 2000);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

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
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <img src={logo} alt="Recruit-IQ" className="h-12 w-auto drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
            <div className="hidden md:block">
                <h1 className="text-2xl font-black tracking-tighter">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mt-1">By Core Creativity AI</p>
            </div>
        </div>
        <div className="flex gap-3">
            {isVerifying && <div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-300 animate-pulse">Activating Membership...</div>}
            <div className={`bg-indigo-500/10 border px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg ${isPro ? 'border-emerald-500/50 text-emerald-400 shadow-emerald-500/20' : 'border-indigo-500/50 text-indigo-400 shadow-indigo-500/10'}`}>
                <span className={`w-2 h-2 rounded-full ${isPro ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`}></span>
                {isPro ? "ELITE MEMBERSHIP ACTIVE" : `FREE TRIAL: ${3 - scanCount} SCANS LEFT`}
            </div>
        </div>
      </div>

      {/* TOAST */}
      {toast.show && (
        <div className="fixed top-24 right-5 z-[60] px-6 py-4 rounded-xl shadow-2xl bg-indigo-600/90 border border-indigo-500 flex items-center gap-3 animate-in slide-in-from-top-5">
           <p className="text-sm font-bold tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* --- QUICK START --- */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => { setActiveTab('jd'); showToast("Switched to Job Description", "info"); }} className={`p-6 rounded-3xl border transition-all cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50 ${jdReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className={`font-bold text-[10px] uppercase tracking-widest ${jdReady ? 'text-emerald-400' : 'text-slate-400'}`}>1. Define Requirements</h4>
                {jdReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}
              </div>
              <p className="text-[11px] text-slate-300">Click here to upload or paste the Job Description.</p>
          </div>
          <div onClick={() => { setActiveTab('resume'); showToast("Switched to Resume Input", "info"); }} className={`p-6 rounded-3xl border transition-all cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50 ${resumeReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className={`font-bold text-[10px] uppercase tracking-widest ${resumeReady ? 'text-emerald-400' : 'text-slate-400'}`}>2. Input Candidate</h4>
                {resumeReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}
              </div>
              <p className="text-[11px] text-slate-300">Click here to upload or paste the Resume.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
              <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2 text-indigo-400">3. Analyze & Act</h4>
              <p className="text-[11px] text-slate-300">Get match score, interview guide, and outreach email.</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  1. Job Description {jdReady && <span className="text-emerald-300 font-bold text-sm">✓</span>}
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  2. Resume {resumeReady && <span className="text-emerald-300 font-bold text-sm">✓</span>}
                </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-colors">
                Upload pdf or doc
                <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Loaded Sample Data", "info");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400">
                Load Full Samples
              </button>
              <button onClick={handleClear} className="flex-none bg-rose-500/10 border border-rose-500/50 py-3 px-4 rounded-xl text-[10px] font-bold uppercase text-rose-400">New Search</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-indigo-600">
              {loading ? "Analyzing..." : `3. Screen Candidate (${isPro ? 'Unlimited' : `${3 - scanCount} Free Left`}) →`}
            </button>
        </div>

        <div className="h-[850px] border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest">
            {analysis ? "View Results Here" : "Waiting for screening data..."}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center relative z-10">
        <p className="text-slate-600 text-xs mb-4 font-medium tracking-wide">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-6 text-[10px] font-bold tracking-widest uppercase text-slate-500">
          <a href="https://www.corecreativityai.com/blank" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
          <a href="https://www.corecreativityai.com/blank-2" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400 transition-colors uppercase">Contact Support</button>
        </div>
      </footer>

      {/* --- SUPPORT MODAL --- */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700/50 rounded-[2rem] p-8 shadow-2xl text-center">
            <h2 className="text-2xl font-black mb-2">Contact Support</h2>
            <p className="text-slate-400 text-sm mb-6">Questions? Submissions go to hello@corecreativityai.com</p>
            <form onSubmit={handleSupportSubmit} className="space-y-4 text-left">
              <textarea required className="w-full h-32 bg-[#0B1120] border border-slate-800 rounded-xl p-4 text-xs text-white outline-none resize-none" placeholder="How can we help?" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-indigo-600 rounded-xl font-bold uppercase text-[10px]">Send via Email</button>
                <button type="button" onClick={() => setShowSupportModal(false)} className="px-6 py-3 bg-slate-800 rounded-xl font-bold uppercase text-[10px] text-slate-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
