import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`; // (Truncated for space, keep your full sample text here)
const SAMPLE_RESUME = `MARCUS VANDELAY...`; // (Truncated for space, keep your full sample text here)

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [guestUsage, setGuestUsage] = useState(0);
  const GUEST_LIMIT = 3;

  const isPro = user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  // --- REDIRECT BYPASS LOGIC ---
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const justPaid = query.get('success');

    if (justPaid && isLoaded && isSignedIn) {
      user.reload().then(() => { 
        window.history.replaceState({}, document.title, "/"); 
      });
    }

    // REDIRECTS DISABLED FOR MAINTENANCE MODE
    /*
    if (isLoaded && isSignedIn && !isPro && !justPaid) {
       window.location.href = STRIPE_URL;
    }
    */
  }, [isLoaded, isSignedIn, isPro]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } catch (err) { alert("Error reading file."); }
  };

  const handleScreen = async () => {
    if (!isSignedIn && guestUsage >= GUEST_LIMIT) return setShowUpgrade(true);
    if (!jdReady || !resumeReady) return alert("Please complete Step 1 and Step 2.");
    
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyze JD and Resume. Return JSON: {"score": 0-100, "summary": "...", "questions": []}. JD: ${jdText} Resume: ${resumeText}` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      setAnalysis(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (err) { alert("Analysis failed."); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <img src={logo} alt="Recruit-IQ" className="h-10 w-auto" />
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/10 border border-indigo-500/50 px-4 py-2 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
            {isPro ? "PRO ACCESS ACTIVE" : "MAINTENANCE MODE"}
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {user?.primaryEmailAddress?.emailAddress}
          </div>
        </div>
      </div>

      {/* 1-2-3 QUICK START GUIDE */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border ${jdReady ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2">1. Define Role</h4>
             <p className="text-[11px] text-slate-400">Paste the job description.</p>
          </div>
          <div className={`p-6 rounded-3xl border ${resumeReady ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2">2. Load Candidate</h4>
             <p className="text-[11px] text-slate-400">Upload or paste the resume.</p>
          </div>
          <div className={`p-6 rounded-3xl border ${analysis ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2">3. Unlock Intel</h4>
             <p className="text-[11px] text-slate-400">Run the AI screening.</p>
          </div>
      </div>

      {/* MAIN INTERFACE */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Job Description</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Resume</button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 transition hover:text-white">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 transition hover:text-white">Load Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />

            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg">
              {loading ? "Analyzing Candidate..." : "Screen Candidate →"}
            </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="h-[750px] overflow-y-auto space-y-6">
            {analysis ? (
              <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-5xl font-black mb-6">{analysis.score}%</div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">Match Confidence</h3>
                <p className="text-slate-200 text-sm italic">"{analysis.summary}"</p>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-4 uppercase tracking-widest">
                 <div className="text-4xl opacity-20">📊</div>
                 Waiting for data...
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
