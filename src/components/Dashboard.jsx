import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react"; 

// --- CONFIGURATION ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- SAMPLE DATA ---
const SAMPLE_JD = `JOB TITLE: Senior FinTech Architect
OVERVIEW: Vertex Financial is rebuilding our core engine for sub-millisecond latency.
QUALIFICATIONS: 10+ years software engineering experience. Deep expertise in AWS.`;

const SAMPLE_RESUME = `ALEXANDER MERCER
Senior Principal Engineer. Lead Engineer with 12 years experience building scalable financial systems. 
SKILLS: AWS, Docker, Kubernetes, Terraform, Node.js, Go.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  // App State
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Freemium State
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [guestUsage, setGuestUsage] = useState(0);
  const GUEST_LIMIT = 3;

  // --- 1. THE TRUTH SOURCE: CHECK CLERK METADATA ---
  // This is what Zapier updates!
  const isPro = user?.publicMetadata?.isPro === true;

  // --- 2. INITIALIZATION & DATA SYNC ---
  useEffect(() => {
    // Load local guest usage
    const storedUsage = localStorage.getItem('riq_guest_usage');
    if (storedUsage) setGuestUsage(parseInt(storedUsage));

    // SMART SYNC: If they just returned from Stripe, force a reload to get the Pro status
    const query = new URLSearchParams(window.location.search);
    if (query.get('success') && isLoaded && isSignedIn) {
      // Small delay to let Zapier finish its work
      setTimeout(() => {
        user.reload().then(() => {
          window.history.replaceState({}, document.title, "/");
        });
      }, 1500); 
    }
  }, [isLoaded, isSignedIn]);

  // --- 3. THE "BOUNCER" (REDIRECTS IF NOT PAID) ---
  useEffect(() => {
    // Kicks signed-in users to Stripe if they haven't paid
    if (isLoaded && isSignedIn && !isPro) {
       const query = new URLSearchParams(window.location.search);
       if (!query.get('success')) {
          window.location.href = STRIPE_URL;
       }
    }
  }, [isLoaded, isSignedIn, isPro]);

  // --- FILE HANDLING ---
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        text = await extractPdfText(file) || "Error reading PDF.";
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } catch (err) { alert("Error reading file."); }
  };

  // --- LIVE SCREENING LOGIC ---
  const handleScreen = async () => {
    if (!isSignedIn && guestUsage >= GUEST_LIMIT) return setShowUpgrade(true);
    if (isSignedIn && !isPro) return setShowUpgrade(true);
    if (!jdText || !resumeText) return alert("Please fill both sides.");
    
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyze JD and Resume. Return JSON: {"score": 0-100, "summary": "...", "strengths": [], "gaps": [], "questions": []}. JD: ${jdText} Resume: ${resumeText}` }] }],
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

  // --- INTERFACE ---
  if (isSignedIn && !isPro && isLoaded) {
     return (
       <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold uppercase tracking-widest">Verifying Pro Status...</h2>
          <p className="text-slate-400 text-sm mt-2">Syncing with Stripe Intelligence</p>
       </div>
     );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-slate-950 min-h-screen relative">
      
      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden p-10 text-center">
                 <button onClick={() => setShowUpgrade(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition">✕</button>
                 <div className="text-6xl mb-6">🚀</div>
                 <h2 className="text-3xl font-black text-white mb-6">UNLEASH PRO ACCESS</h2>
                 <p className="text-slate-400 mb-8">Unlock unlimited AI screening and professional reports.</p>
                 <SignUpButton mode="modal" forceRedirectUrl={STRIPE_URL}>
                    <button className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest hover:bg-emerald-400 transition">Start Free Trial →</button>
                 </SignUpButton>
          </div>
        </div>
      )}

      {/* DASHBOARD UI */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex justify-between items-center">
          <h2 className="text-emerald-400 font-black uppercase text-xs tracking-widest">Recruit-IQ Intelligence</h2>
          <span className="bg-slate-800 text-slate-300 px-4 py-1.5 rounded-full text-[10px] font-bold">
            {isPro ? "PRO ACTIVE" : `GUEST CREDITS: ${GUEST_LIMIT - guestUsage}`}
          </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px]">
            <div className="flex gap-3 mb-4">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase ${activeTab === 'jd' ? 'bg-blue-600' : 'bg-slate-800'}`}>1. Job Description</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800'}`}>2. Resume</button>
            </div>
            <textarea className="flex-1 bg-black/20 text-slate-300 p-6 rounded-2xl text-xs font-mono mb-4 border border-slate-800 outline-none" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <button onClick={handleScreen} disabled={loading} className="py-5 bg-emerald-600 rounded-2xl font-black uppercase text-xs tracking-widest text-white">{loading ? "Analyzing..." : "Analyze Candidate"}</button>
        </div>

        <div className="h-[700px] overflow-y-auto space-y-6">
            {analysis ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="text-4xl font-black text-emerald-500 mb-4">{analysis.score}% Match</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{analysis.summary}"</p>
                <div className="space-y-4">
                  <div className="bg-black/20 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase mb-2">Strengths</h4>
                    <ul className="text-xs text-slate-400 space-y-1">{analysis.strengths.map((s,i) => <li key={i}>• {s}</li>)}</ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 text-[10px] uppercase tracking-widest">Waiting for data...</div>
            )}
        </div>
      </div>
    </div>
  );
}
