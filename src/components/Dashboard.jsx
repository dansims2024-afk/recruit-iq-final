import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- SAMPLES --- (Keeping these exactly as they were)
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`;
const SAMPLE_RESUME = `MARCUS VANDELAY...`;
// --- SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

export default function Dashboard({ kinde }) {
  // --- KINDE AUTH STATE ---
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

  // --- ANALYSIS STATE ---
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
@@ -26,85 +59,72 @@ export default function Dashboard({ kinde }) {
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
  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  // --- STRIPE PREFILL ---
  const userEmail = user?.email;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
const finalStripeUrl = userEmail 
? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` 
: STRIPE_URL;

  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  // --- 1. LOAD LOCAL COUNTS ---
  // --- 1. LOAD COUNTS ---
useEffect(() => {
const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
setScanCount(savedCount);
}, []);

// --- 2. AUTO-REDIRECT (Guest -> Stripe) ---
useEffect(() => {
    // If user logged in and we have a pending upgrade flag
    if (user && localStorage.getItem('recruit_iq_pending_upgrade') === 'true') {
    if (isSignedIn && localStorage.getItem('recruit_iq_pending_upgrade') === 'true') {
setIsRedirecting(true);
localStorage.removeItem('recruit_iq_pending_upgrade');
setTimeout(() => { window.location.href = finalStripeUrl; }, 1500);
}
  }, [user, finalStripeUrl]);
  }, [isSignedIn, finalStripeUrl]);

  // --- 3. SUCCESS UI HANDLER ---
  // --- 3. ROBUST VERIFICATION (The Fix for "Stuck" State) ---
useEffect(() => {
const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout_success') === 'true' && !isPro) {
      setIsVerifying(true);
    const isCheckoutSuccess = urlParams.get('checkout_success');

    if (isSignedIn && !isPro && isCheckoutSuccess) {
        setIsVerifying(true);
        
        // Attempt 1: Poll Clerk silently every 1.5s
        const interval = setInterval(async () => {
            await user.reload();
        }, 1500);

        // Attempt 2: FAILSAFE HARD RELOAD after 6 seconds
        // If Zapier is slow, this forces the browser to get fresh data
        const timeout = setTimeout(() => {
             window.location.href = window.location.pathname; // Hard refresh clearing query params
        }, 6000);

        return () => { clearInterval(interval); clearTimeout(timeout); };
}
    
    // Stop verifying if we become Pro
if (isPro) setIsVerifying(false);
  }, [isPro]);

  // --- AUTH ACTIONS ---
  }, [isSignedIn, isPro, user]);

const handleGuestSignup = () => {
localStorage.setItem('recruit_iq_pending_upgrade', 'true');
    kinde.register(); // Kinde Native Registration
    clerk.openSignUp();
};

  const handleLogin = () => kinde.login();
  const handleLogout = () => kinde.logout();

  // --- TOAST & CLEAR ---
const showToast = (message, type = 'success') => {
setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
};

const handleClear = () => {
setJdText(''); setResumeText(''); setAnalysis(null); setActiveTab('jd');
    showToast("Dashboard cleared", "info");
    showToast("Dashboard cleared for new search", "info");
};

  // --- FILE UPLOAD (Mammoth.js & PDF.js) ---
const handleFileUpload = async (e) => {
const file = e.target.files[0];
if (!file) return;
@@ -115,7 +135,7 @@ export default function Dashboard({ kinde }) {
text = result.value;
} else if (file.name.endsWith('.pdf')) {
const pdfjs = window.pdfjsLib;
        if (!pdfjs) { showToast("PDF Reader loading...", "error"); return; }
        if (!pdfjs) { showToast("PDF Reader loading... wait 5s.", "error"); return; }
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
const pdf = await loadingTask.promise;
@@ -130,30 +150,47 @@ export default function Dashboard({ kinde }) {

if (activeTab === 'jd') setJdText(text); else setResumeText(text);
showToast(`${file.name} uploaded!`, "success");
    } catch (err) { showToast("File read error.", "error"); }
    } catch (err) { console.error(err); showToast("File read error. Copy/paste instead.", "error"); }
};

  // --- PDF DOWNLOAD ---
const downloadPDF = () => {
if (!analysis) return;
const { jsPDF } = window.jspdf; 
const doc = new jsPDF();
doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("Recruit-IQ Intelligence Report", 20, 20);
    // ... (rest of your PDF styling remains exactly the same as original)
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("Recruit-IQ Intelligence Report", 20, 20);
    doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.text(`Candidate Match Analysis & Interview Guide`, 20, 30);
    doc.setTextColor(0, 0, 0); doc.setFontSize(18); doc.setFont("helvetica", "bold");
const cName = analysis.candidate_name || "Candidate Report";
    doc.save(`${cName.replace(/\s+/g, '_')}_Report.pdf`); 
    showToast("Report downloaded!", "success");
    doc.text(`${cName}`, 20, 55);
    doc.setTextColor(79, 70, 229); doc.text(`Match Score: ${analysis.score}%`, 140, 55);
    doc.setTextColor(60, 60, 60); doc.setFontSize(12); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "Summary unavailable", 170);
    doc.text(summaryLines, 20, 70);
    let currentY = 70 + (summaryLines.length * 6) + 15;
    doc.setFont("helvetica", "bold"); doc.setTextColor(16, 185, 129); doc.text("Key Strengths", 20, currentY); currentY += 8;
    doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    (analysis.strengths || []).forEach((s) => { if (currentY > 280) { doc.addPage(); currentY = 20; } const sLines = doc.splitTextToSize(`• ${s}`, 170); doc.text(sLines, 20, currentY); currentY += (sLines.length * 6) + 2; });
    currentY += 10;
    doc.setFont("helvetica", "bold"); doc.setTextColor(244, 63, 94); doc.text("Critical Gaps", 20, currentY); currentY += 8;
    doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    (analysis.gaps || []).forEach((g) => { if (currentY > 280) { doc.addPage(); currentY = 20; } const gLines = doc.splitTextToSize(`• ${g}`, 170); doc.text(gLines, 20, currentY); currentY += (gLines.length * 6) + 2; });
    doc.addPage(); doc.setFillColor(243, 244, 246); doc.rect(0, 0, 210, 300, 'F');
    doc.setFontSize(18); doc.setTextColor(79, 70, 229); doc.setFont("helvetica", "bold"); doc.text("Strategic Interview Guide", 20, 30);
    doc.setFontSize(12); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "italic"); doc.text(`Suggested questions for ${cName}:`, 20, 45);
    doc.setFont("helvetica", "normal"); let qPos = 60;
    (analysis.questions || []).forEach((q, i) => { const qLines = doc.splitTextToSize(`${i+1}. ${q}`, 170); doc.text(qLines, 20, qPos); qPos += (qLines.length * 6) + 10; });
    doc.save(`${cName.replace(/\s+/g, '_')}_Report.pdf`); showToast("PDF Report downloaded!", "success");
};

  // --- GEMINI AI SCREENING ---
const handleScreen = async () => {
if (!isPro && scanCount >= 3) {
setShowLimitModal(true);
return;
}
if (!jdReady || !resumeReady) {
        showToast("Step 1 and Step 2 required.", "error");
        showToast("Please complete Step 1 (JD) and Step 2 (Resume) first.", "error");
return;
}
setLoading(true);
@@ -171,9 +208,18 @@ export default function Dashboard({ kinde }) {
const data = await response.json();
const rawText = data.candidates[0].content.parts[0].text;
const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON");
const result = JSON.parse(jsonMatch[0]);

      setAnalysis(result);
      setAnalysis({
        candidate_name: result.candidate_name || "Candidate",
        score: result.score || 0,
        summary: result.summary || "Done.",
        strengths: result.strengths || [],
        gaps: result.gaps || [],
        questions: result.questions || [],
        outreach_email: result.outreach_email || ""
      });

if (!isPro) {
const newCount = scanCount + 1;
@@ -182,11 +228,11 @@ export default function Dashboard({ kinde }) {
}
showToast("Analysis Complete", "success");

    } catch (err) { showToast("AI Analysis failed.", "error"); } 
    } catch (err) { console.error(err); showToast("Analysis failed.", "error"); } 
finally { setLoading(false); }
};

  if (isAuthLoading) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

if (isRedirecting) {
return (
@@ -210,82 +256,175 @@ export default function Dashboard({ kinde }) {
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

        <div className="flex gap-3">
            {/* Show verifying status if stuck */}
{isVerifying && (
<div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-300 animate-pulse">
Activating Membership...
</div>
)}
<div className={`bg-indigo-500/10 border px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all duration-500 ${isPro ? 'border-emerald-500/50 text-emerald-400 shadow-emerald-500/20' : 'border-indigo-500/50 text-indigo-400 shadow-indigo-500/10'}`}>
                <span className={`w-2 h-2 rounded-full ${isPro ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`}></span>
                {isPro ? "ELITE MEMBERSHIP ACTIVE" : `FREE TRIAL: ${3 - scanCount} SCANS LEFT`}
               <span className={`w-2 h-2 rounded-full ${isPro ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`}></span>
               {isPro ? "ELITE MEMBERSHIP ACTIVE" : `FREE TRIAL: ${3 - scanCount} SCANS LEFT`}
</div>
</div>
</div>

      {/* --- TOAST --- */}
      {/* TOAST */}
{toast.show && (
        <div className={`fixed top-24 right-5 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-500' : 'bg-emerald-950/90 border-emerald-500'}`}>
        <div className={`fixed top-24 right-5 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 border ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-500' : toast.type === 'info' ? 'bg-slate-800/90 border-slate-500' : 'bg-emerald-950/90 border-emerald-500'}`}>
           <span className="text-xl">{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅'}</span>
<p className="text-sm font-bold tracking-wide">{toast.message}</p>
</div>
)}

      {/* --- MODAL --- */}
      {/* --- SALES MODAL (UPDATED) --- */}
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
          <div className="relative w-full max-w-2xl group animate-in zoom-in-95 duration-300">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-10 md:w-3/5 flex flex-col justify-center relative z-10">
                 <div className="mb-4"><img src={logo} alt="Recruit-IQ Logo" className="h-8 w-auto opacity-90" /></div>
                 
                 <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                    Hire Your Next Star <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">In Seconds.</span>
                 </h2>
                 
                 <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Stop manually screening resumes. Unlock the full power of Recruit-IQ to uncover hidden talent instantly.
                 </p>

                 {/* DYNAMIC BUTTONS */}
                 {!isSignedIn ? (
                   // GUEST -> SIGN UP
                   <>
                     <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-3 mb-4 text-center animate-pulse relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                         <span className="absolute -top-2 -right-2 text-xl drop-shadow">🎁</span>
                         <p className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                             Limited Time: Claim Your 3-Day Free Trial!
                         </p>
                     </div>
                     <button onClick={handleGuestSignup} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-lg shadow-indigo-500/25">
                        Create Free Account
                     </button>
                   </>
                 ) : (
                   // USER -> STRIPE TRIAL
                   <>
                     <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-3 mb-4 text-center animate-pulse relative shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                         <span className="absolute -top-2 -right-2 text-xl drop-shadow">⚡</span>
                         <p className="text-xs font-black text-blue-300 uppercase tracking-wider">
                             Ready? Activate Your 3-Day Free Trial.
                         </p>
                     </div>
                     <a href={finalStripeUrl} className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-bold rounded-xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-lg shadow-blue-500/25">
                        Start 3-Day Free Trial
                     </a>
                     <div className="text-center mt-3 space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Then $29/mo • Cancel Anytime</p>
                     </div>
                   </>
                 )}
                 
                 <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-600 mt-4 hover:text-white underline decoration-slate-700 w-full">No thanks, I'll screen manually</button>
              </div>

              {/* Right Side: Visual Proof */}
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 flex-col items-center justify-center p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <div className="text-center relative z-10 space-y-4">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.3)]"><span className="text-4xl">💎</span></div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Elite Membership</h3>
                        <p className="text-xs text-slate-400 mt-1 px-4">Join 500+ recruiters saving 20+ hours per week.</p>
                    </div>
                 </div>
              </div>
            </div>
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
      {/* QUICK START */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => { setActiveTab('jd'); showToast("Switched to Job Description Input", "info"); }} className={`p-6 rounded-3xl border transition-all cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50 ${jdReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2"><h4 className={`font-bold text-[10px] uppercase tracking-widest ${jdReady ? 'text-emerald-400' : 'text-slate-400'}`}>1. Define Requirements</h4>{jdReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}</div>
             <p className="text-[11px] text-slate-300">Click here to upload or paste the Job Description.</p>
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
          <div onClick={() => { setActiveTab('resume'); showToast("Switched to Resume Input", "info"); }} className={`p-6 rounded-3xl border transition-all cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50 ${resumeReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2"><h4 className={`font-bold text-[10px] uppercase tracking-widest ${resumeReady ? 'text-emerald-400' : 'text-slate-400'}`}>2. Input Candidate</h4>{resumeReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}</div>
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
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>1. Job Description {jdReady && <span className="text-emerald-300 font-bold text-sm">✓</span>}</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>2. Resume {resumeReady && <span className="text-emerald-300 font-bold text-sm">✓</span>}</button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-colors">Upload / Paste File <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" /></label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400">Load Full Samples</button>
              <button onClick={handleClear} className="flex-none bg-rose-500/10 border border-rose-500/50 py-3 px-4 rounded-xl text-[10px] font-bold uppercase text-rose-400 hover:bg-rose-500 hover:text-white transition-colors">New Search</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6 focus:border-indigo-500/50 transition-colors placeholder-slate-600"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste the Job Description here..." : "Paste the Resume here or Upload a PDF/DOCX file..."}
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl hover:shadow-indigo-500/25 transition-all">
              {loading ? "Analyzing..." : `3. Screen Candidate (${isPro ? 'Unlimited' : `${3 - scanCount} Free Left`}) →`}
            </button>
        </div>

        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Match Confidence</h3>
                  <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto border border-slate-700"><span>📄</span> Download Report & Guide</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl"><h4 className="text-emerald-400 font-bold uppercase text-[10px] mb-3">Strengths</h4><ul className="text-[11px] text-slate-300 space-y-2">{(analysis.strengths || []).map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl"><h4 className="text-rose-400 font-bold uppercase text-[10px] mb-3">Gaps</h4><ul className="text-[11px] text-slate-300 space-y-2">{(analysis.gaps || []).map((g, i) => <li key={i}>• {g}</li>)}</ul></div>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-4"><h4 className="text-indigo-400 font-bold uppercase text-[10px]">Targeted Interview Questions</h4><button onClick={downloadPDF} className="text-slate-400 hover:text-white text-[10px] underline">Download Guide</button></div>
                  <ul className="text-[11px] text-slate-300 space-y-3">{(analysis.questions || []).map((q, i) => <li key={i} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">"{q}"</li>)}</ul>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold uppercase text-[10px] mb-3">AI Outreach Email</h4>
                  <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#0B1120] p-5 rounded-xl border border-slate-800">{analysis.outreach_email}</p>
                  <button onClick={() => { navigator.clipboard.writeText(analysis.outreach_email); showToast("Email copied!", "success"); }} className="mt-4 w-full py-3 bg-slate-800 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700 transition-colors">Copy to Clipboard</button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-4 uppercase tracking-widest">Waiting for screening data...</div>
            )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center relative z-10">
        <p className="text-slate-600 text-xs mb-4 font-medium tracking-wide">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-6 text-[10px] font-bold tracking-widest uppercase text-slate-500">
          <a href="#" className="hover:text-indigo-400 transition-colors duration-300">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-400 transition-colors duration-300">Terms of Service</a>
          <a href="mailto:support@recruit-iq.com" className="hover:text-indigo-400 transition-colors duration-300 flex items-center gap-1">Contact Support</a>
        </div>
      </footer>
</div>
);
}
