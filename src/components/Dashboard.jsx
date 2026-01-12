import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`; // (Keep your full sample text here)
const SAMPLE_RESUME = `MARCUS VANDELAY...`; // (Keep your full sample text here)

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  // Auto-fill Stripe email so they don't use the wrong one
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const finalStripeUrl = userEmail 
    ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` 
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const handleClear = () => {
    setJdText(''); setResumeText(''); setAnalysis(null); setActiveTab('jd');
    showToast("Ready for new candidate", "info");
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
        if (!pdfjs) { showToast("PDF Reader loading... wait 5s.", "error"); return; }
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
    } catch (err) { console.error(err); showToast("File read error. Copy/paste instead.", "error"); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    // (Keep your existing PDF generation code here)
    doc.text("Recruit-IQ Intelligence Report", 20, 20);
    doc.text(`Match Score: ${analysis.score}%`, 20, 40);
    doc.text(doc.splitTextToSize(analysis.summary || "", 170), 20, 50);
    doc.save("Recruit-IQ-Report.pdf");
    showToast("PDF Downloaded", "success");
  };

  const handleScreen = async () => {
    // 1. LIMIT CHECK: If 3 scans used AND not Pro, stop them.
    if (!isPro && scanCount >= 3) {
      setShowLimitModal(true);
      return;
    }

    if (!jdReady || !resumeReady) {
        showToast("Please fill in Job Description and Resume.", "error");
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
      if (!jsonMatch) throw new Error("No JSON");
      const result = JSON.parse(jsonMatch[0]);

      setAnalysis({
        candidate_name: result.candidate_name || "Candidate",
        score: result.score || 0,
        summary: result.summary || "Done.",
        strengths: result.strengths || [],
        gaps: result.gaps || [],
        questions: result.questions || [],
        outreach_email: result.outreach_email || ""
      });
      
      // Increment usage if not Pro
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Analysis Complete", "success");

    } catch (err) { console.error(err); showToast("Analysis failed.", "error"); } 
    finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans pt-20">
      
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-24 right-5 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 border ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-500' : 'bg-emerald-950/90 border-emerald-500'}`}>
           <span className="text-xl">{toast.type === 'error' ? '⚠️' : '✅'}</span>
           <p className="text-sm font-bold tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* --- THE FLOW MODAL --- */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Side: The "Pitch" */}
            <div className="p-10 md:w-3/5 flex flex-col justify-center relative z-10">
               <div className="mb-4"><img src={logo} alt="Recruit-IQ" className="h-8 w-auto opacity-90" /></div>
               
               <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                  {isSignedIn ? "Start Your Free Trial" : "Save Your Progress"}
               </h2>
               
               <p className="text-slate-400 text-sm mb-6">
                  {isSignedIn 
                    ? "You've used your 3 free scans. Start your 3-day free trial to unlock unlimited access. Cancel anytime." 
                    : "You've hit the guest limit. Create a free account to continue your journey."}
               </p>

               {/* SMART BUTTON SWITCHER */}
               {!isSignedIn ? (
                 // STEP 2: IF GUEST -> SIGN UP (CLERK)
                 <button onClick={() => clerk.openSignUp()} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-lg shadow-indigo-500/25">
                    Create Free Account
                 </button>
               ) : (
                 // STEP 3: IF SIGNED IN -> START TRIAL (STRIPE)
                 <a href={finalStripeUrl} className="block w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-center text-white font-bold rounded-xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-lg shadow-emerald-500/25">
                    Start 3-Day Free Trial
                 </a>
               )}
               
               <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-600 mt-4 hover:text-white underline decoration-slate-700 w-full">
                 {isSignedIn ? "No thanks, I'll wait" : "Maybe later"}
               </button>
            </div>

            {/* Right Side: Visual Proof */}
            <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 flex-col items-center justify-center p-8">
               <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.3)]"><span className="text-4xl">💎</span></div>
                  <div>
                      <h3 className="font-bold text-white text-lg">{isSignedIn ? "Pro Access" : "Free Account"}</h3>
                      <p className="text-xs text-slate-400 mt-1">{isSignedIn ? "Unlimited Screening" : "Secure Your Data"}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- REST OF DASHBOARD UI (Tabs, Inputs, Results) --- */}
      {/* (Keep the rest of your Dashboard code exactly as it was in the previous version) */}
      
      {/* QUICK START HEADER */}
      {!analysis && (
        <div className="text-center mb-10">
           <img src={logo} alt="Recruit-IQ" className="h-16 w-auto mx-auto mb-6" />
           <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
             Who are you hiring <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">today?</span>
           </h1>
        </div>
      )}

      {/* TABS & INPUTS... (Paste the rest of your UI code here) */}
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
              placeholder={activeTab === 'jd' ? "Paste Job Description..." : "Paste Resume..."}
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl hover:shadow-indigo-500/25 transition-all">
              {loading ? "Analyzing..." : `3. Screen Candidate (${isPro ? 'Unlimited' : `${3 - scanCount} Free Left`}) →`}
            </button>
        </div>

        {/* RESULTS AREA */}
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
                  <h4 className="text-indigo-400 font-bold uppercase text-[10px] mb-3">Targeted Interview Questions</h4>
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
    </div>
  );
}
