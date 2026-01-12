import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`; // Paste full JD sample here
const SAMPLE_RESUME = `MARCUS VANDELAY...`; // Paste full Resume sample here

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const isPro = user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success') && isLoaded && isSignedIn) {
      user.reload().then(() => { 
        window.history.replaceState({}, document.title, "/"); 
      });
    }
  }, [isLoaded, isSignedIn]);

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
    if (!jdReady || !resumeReady) return alert("Please complete both steps first.");
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Return JSON ONLY: {
        "score": 0-100,
        "summary": "...",
        "strengths": ["...", "..."],
        "gaps": ["...", "..."],
        "interview_strategy": "...",
        "market_intelligence": "...",
        "industry_outlook": "..."
      }`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.status === 429) throw new Error("Rate limit hit. Please wait 60 seconds.");
      const data = await response.json();
      setAnalysis(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (err) { alert("Analysis failed. Try again in 60 seconds."); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <img src={logo} alt="Recruit-IQ" className="h-10 w-auto" />
        <div className="bg-indigo-500/10 border border-indigo-500/50 px-4 py-2 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
            {isPro ? "PRO ACCESS ACTIVE" : "MAINTENANCE MODE"}
        </div>
      </div>

      {/* 1-2-3 QUICK START */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border transition-all ${jdReady ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-[10px] uppercase tracking-widest">1. Define Role</h4>
                {jdReady && <span className="text-emerald-400 text-lg font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-400">Paste the job description.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${resumeReady ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-[10px] uppercase tracking-widest">2. Load Candidate</h4>
                {resumeReady && <span className="text-emerald-400 text-lg font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-400">Upload or paste the resume.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-emerald-900/20 border-emerald-500/50 shadow-lg' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-[10px] uppercase tracking-widest">3. Unlock Intel</h4>
                {analysis && <span className="text-emerald-400 text-lg font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-400">Run the AI screening.</p>
          </div>
      </div>

      {/* MAIN INTERFACE */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Job Description</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Resume</button>
            </div>
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-colors">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400">Load Full Samples</button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl">
              {loading ? "Analyzing..." : "Screen Candidate →"}
            </button>
        </div>

        {/* PRO RESULTS PANEL */}
        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Match Confidence</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <h4 className="text-emerald-400 font-bold uppercase text-[10px] mb-3">Strengths</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">
                      {analysis.strengths?.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
                    <h4 className="text-rose-400 font-bold uppercase text-[10px] mb-3">Critical Gaps</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">
                      {analysis.gaps?.map((g, i) => <li key={i}>• {g}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[10px] mb-2">Market & Industry Outlook</h4>
                  <p className="text-[11px] text-slate-300 mb-4">{analysis.market_intelligence}</p>
                  <p className="text-[11px] text-slate-300">{analysis.industry_outlook}</p>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-4 uppercase tracking-widest">
                 Waiting for screening data...
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
