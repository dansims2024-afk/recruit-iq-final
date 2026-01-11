import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react"; 

// --- CONFIGURATION ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- SAMPLE DATA ---
const SAMPLE_JD = `JOB TITLE: Senior FinTech Architect
LOCATION: New York, NY
SALARY: $220k - $260k + Equity

OVERVIEW:
Vertex Financial is a high-frequency trading firm rebuilding our core engine for sub-millisecond latency.

RESPONSIBILITIES:
- Architect high-availability microservices on AWS (EKS, Lambda).
- Optimize low-latency trading algorithms.
- Lead a team of 8-10 senior engineers.

QUALIFICATIONS:
- 10+ years software engineering experience.
- Deep expertise in AWS cloud-native services.`;

const SAMPLE_RESUME = `ALEXANDER MERCER
Senior Principal Engineer | alex.mercer@example.com

SUMMARY:
Lead Engineer with 12 years experience building scalable financial systems. 

EXPERIENCE:
Innovate Financial | Lead Engineer | 2019 - Present
- Migrated core trading engine to AWS EKS.
- Reduced latency by 45% via Redis caching strategies.

SKILLS:
- AWS, Docker, Kubernetes, Terraform, Node.js, Go, Python.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  // App State
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Freemium & Stripe State
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [guestUsage, setGuestUsage] = useState(0);
  const GUEST_LIMIT = 3;

  // READ FROM ZAPIER: If Zapier updated the user, this will be true
  const isPro = user?.publicMetadata?.isPro === true;

  // --- 1. INITIALIZATION & DATA SYNC ---
  useEffect(() => {
    const storedUsage = localStorage.getItem('riq_guest_usage');
    if (storedUsage) setGuestUsage(parseInt(storedUsage));

    // SMART SYNC: If they return from Stripe, reload Clerk data to catch the "isPro" stamp
    const query = new URLSearchParams(window.location.search);
    if (query.get('success') && isLoaded && isSignedIn) {
      setTimeout(() => {
        user.reload().then(() => {
          window.history.replaceState({}, document.title, "/");
        });
      }, 1500); 
    }
  }, [isLoaded, isSignedIn]);

  // --- 2. THE "BOUNCER" (REDIRECTS IF NOT PRO) ---
  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro) {
       const query = new URLSearchParams(window.location.search);
       if (!query.get('success')) {
          window.location.href = STRIPE_URL;
       }
    }
  }, [isLoaded, isSignedIn, isPro]);

  // --- PDF EXTRACTION ---
  const extractPdfText = async (file) => {
    try {
      const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/+esm');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + "\n";
      }
      return fullText;
    } catch (err) { return null; }
  };

  // --- FILE HANDLING ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        const extracted = await extractPdfText(file);
        text = extracted || "Error reading PDF.";
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } catch (err) { alert("Error reading file."); }
  };

  const loadSamples = () => {
    setJdText(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
  };

  // --- WORD REPORT ---
  const downloadReport = () => {
    if (!analysis) return;
    const content = `<html><body><h1>Recruit-IQ Report</h1><h2>Score: ${analysis.score}%</h2><p>${analysis.summary}</p></body></html>`;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RecruitIQ_Report.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LIVE SCREENING LOGIC ---
  const handleScreen = async () => {
    if (!isSignedIn && guestUsage >= GUEST_LIMIT) return setShowUpgrade(true);
    if (isSignedIn && !isPro) return setShowUpgrade(true);
    if (!jdText || !resumeText) return alert("Please provide both Job Description and Resume.");
    
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Act as a recruiter. Analyze JD and Resume. Return JSON: {"score": 0-100, "summary": "...", "strengths": [], "gaps": [], "questions": [], "email_subject": "...", "email_body": "..."}. JD: ${jdText} Resume: ${resumeText}` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      setAnalysis(parsed);
      
      if (!isSignedIn) {
        const newUsage = guestUsage + 1;
        setGuestUsage(newUsage);
        localStorage.setItem('riq_guest_usage', newUsage.toString());
      }
    } catch (err) { alert("Analysis failed."); } finally { setLoading(false); }
  };

  // --- LOADING OVERLAY ---
  if (isSignedIn && !isPro && isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
         <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
         <h2 className="text-xl font-bold uppercase tracking-widest">Finalizing Pro Access...</h2>
         <p className="text-slate-400 text-sm mt-2 text-center px-6">Zapier is syncing your payment. One moment.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-slate-950 min-h-screen font-sans relative">
      
      {/* RESTORED WOW UPGRADE MODAL */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
          <div className="relative w-full max-w-lg group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-75 animate-pulse transition duration-1000"></div>
            <div className="relative bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/60 via-slate-900 to-slate-900 p-10 text-center border-b border-slate-800">
                 <button onClick={() => setShowUpgrade(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition">✕</button>
                 <div className="text-6xl mb-6">🚀</div>
                 <h2 className="text-3xl font-black text-white mb-3">UNLEASH FULL ACCESS</h2>
                 <p className="text-slate-300 text-sm">3 Free Guest Screens used. Time to go Pro.</p>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                       <div className="text-emerald-500 font-bold">✓</div>
                       <p className="text-sm font-bold text-white">Unlimited AI Screening</p>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                       <div className="text-emerald-500 font-bold">✓</div>
                       <p className="text-sm font-bold text-white">Professional Word Reports</p>
                    </div>
                 </div>
                 <SignUpButton mode="modal" forceRedirectUrl={STRIPE_URL}>
                    <button className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-emerald-600/30">Create Free Account & Start Trial →</button>
                 </SignUpButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK START BAR */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex justify-between items-center">
          <h2 className="text-emerald-400 font-black uppercase text-xs tracking-widest">🚀 Recruit-IQ Intelligence</h2>
          <span className="bg-slate-800 text-slate-300 px-4 py-1.5 rounded-full text-[10px] font-bold">
            {isPro ? "PRO ACTIVE" : `GUEST CREDITS LEFT: ${Math.max(0, GUEST_LIMIT - guestUsage)}`}
          </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* RESTORED INPUT PANEL */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative">
            <div className="flex gap-3 mb-4">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase transition-all ${activeTab === 'jd' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>1. Job Description</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase transition-all ${activeTab === 'resume' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>2. Resume</button>
            </div>

            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-black/30 hover:bg-black/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-800 text-slate-400 transition">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={loadSamples} className="flex-1 bg-black/30 hover:bg-black/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-800 text-slate-400 transition">Load Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-black/20 resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono mb-4 focus:border-slate-600 transition-colors"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />

            <button onClick={handleScreen} disabled={loading} className="py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-emerald-900/50 flex items-center justify-center gap-3 disabled:opacity-50">
               {loading ? "Analyzing..." : "3. Screen Candidate"}
            </button>
        </div>

        {/* RESTORED RESULTS PANEL */}
        <div className="h-[850px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {analysis ? (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-6 pb-10">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500"></div>
                  <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-4xl font-black mb-6 shadow-2xl ${analysis.score > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}>{analysis.score}%</div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">Match Confidence</h3>
                  <p className="text-slate-200 text-sm italic">"{analysis.summary}"</p>
                </div>

                <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-slate-800">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest">Key Strengths</h4>
                    <ul className="space-y-2">{analysis.strengths.map((s, i) => <li key={i} className="text-xs text-slate-300 flex gap-3"><span className="text-emerald-500">✓</span> {s}</li>)}</ul>
                </div>

                <div className="bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-500/20">
                    <div className="flex justify-between items-end mb-4">
                       <h4 className="text-[10px] font-black uppercase text-indigo-400">Interview Guide</h4>
                       <button onClick={downloadReport} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-2">Download Report ↓</button>
                    </div>
                    <ul className="space-y-3">{analysis.questions.map((q, i) => <li key={i} className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800">"{q}"</li>)}</ul>
                </div>

                <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
                    <h4 className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">Outreach Draft</h4>
                    <div className="bg-black/30 p-4 rounded-xl border border-slate-800">
                       <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Subject</p>
                       <p className="text-xs text-white mb-4">{analysis.email_subject}</p>
                       <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{analysis.email_body}</p>
                    </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-6 px-12 text-center opacity-50">
                 <div className="text-6xl grayscale">🧠</div>
                 <p className="uppercase tracking-widest leading-loose">Intelligence Engine Standby.<br/>Upload JD & Resume to Start.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
