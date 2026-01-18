"use client";
import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // Check Permissions
  const isPro = isSignedIn && (user?.publicMetadata?.isPro === true);

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        activeTab === 'jd' ? setJdText(result.value) : setResumeText(result.value);
      } else {
        const text = await file.text();
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      }
    } catch (err) { alert("Error reading file."); }
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (!jdText || !resumeText) return alert("Please fill both boxes.");

    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; 

    try {
        const prompt = `Analyze this JD: ${jdText} and Resume: ${resumeText}. Return JSON with: { "candidate_name": "Name", "score": 85, "summary": "text", "strengths": ["a","b"], "gaps": ["a","b"], "questions": ["q1"], "outreach_email": "text" }`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) 
        });
        
        const data = await response.json();
        // Clean the response in case Gemini adds markdown code blocks
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "");
        const result = JSON.parse(rawText);
        
        setAnalysis(result);
        if (!isPro) {
            setScanCount(scanCount + 1);
            localStorage.setItem('recruit_iq_scans', (scanCount + 1).toString());
        }
    } catch (err) { 
        console.error(err);
        alert("AI Error. Check API Key."); 
    } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] text-white p-10">Loading Engine...</div>;

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans p-6 md:p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        <div className="flex gap-4">
           {!isSignedIn && <SignInButton mode="modal"><button className="text-sm font-bold uppercase text-slate-400 hover:text-white">Log In</button></SignInButton>}
           <UserButton />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT: INPUTS */}
        <div className="bg-[#111827] p-8 rounded-3xl border border-slate-800 flex flex-col h-[700px]">
            <div className="flex gap-2 mb-4">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Resume</button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] p-4 rounded-xl resize-none text-xs font-mono text-slate-300 outline-none border border-slate-800 focus:border-indigo-500"
              placeholder={`Paste ${activeTab === 'jd' ? 'Job Description' : 'Resume'} text here...`}
              value={activeTab === 'jd' ? jdText : resumeText}
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            />
            <div className="mt-4 flex gap-4">
                 <label className="cursor-pointer bg-slate-800 px-4 py-3 rounded-xl text-xs font-bold uppercase hover:bg-slate-700">
                    Upload File <input type="file" className="hidden" accept=".txt,.docx" onChange={handleFileUpload}/>
                 </label>
                 <button onClick={handleScreen} disabled={loading} className="flex-1 bg-indigo-600 py-3 rounded-xl text-xs font-bold uppercase hover:bg-indigo-500 disabled:opacity-50">
                    {loading ? "Scanning..." : "Run Analysis"}
                 </button>
            </div>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="bg-[#111827] p-8 rounded-3xl border border-slate-800 h-[700px] overflow-y-auto">
            {!analysis ? (
                <div className="h-full flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-800 rounded-2xl">Results will appear here</div>
            ) : (
                <div className="space-y-6 animate-in fade-in">
                    <div className="text-center">
                        <div className="text-5xl font-black text-white mb-2">{analysis.score}%</div>
                        <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{analysis.candidate_name}</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-2xl text-xs text-slate-300 leading-relaxed">{analysis.summary}</div>
                    <div>
                        <h4 className="text-emerald-400 text-[10px] font-bold uppercase mb-2">Strengths</h4>
                        <ul className="text-xs text-slate-300 space-y-1">{analysis.strengths?.map((s:any,i:number) => <li key={i}>• {s}</li>)}</ul>
                    </div>
                    <div>
                        <h4 className="text-rose-400 text-[10px] font-bold uppercase mb-2">Gaps</h4>
                        <ul className="text-xs text-slate-300 space-y-1">{analysis.gaps?.map((s:any,i:number) => <li key={i}>• {s}</li>)}</ul>
                    </div>
                     <div>
                        <h4 className="text-blue-400 text-[10px] font-bold uppercase mb-2">Email Draft</h4>
                        <div className="p-4 bg-slate-800/30 rounded-2xl text-[10px] font-mono text-slate-400 whitespace-pre-wrap">{analysis.outreach_email}</div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* LIMIT MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-[#111827] p-8 rounded-3xl max-w-md w-full text-center border border-slate-700">
                <h2 className="text-2xl font-black text-white mb-2">Limit Reached</h2>
                <p className="text-slate-400 text-sm mb-6">You've used your free scans. Upgrade to Elite for unlimited access.</p>
                <a href="https://buy.stripe.com/YOUR_LINK_HERE" className="block w-full py-4 bg-indigo-600 rounded-xl font-bold uppercase text-sm mb-4">Upgrade Now</a>
                <button onClick={() => setShowLimitModal(false)} className="text-xs text-slate-500 underline">Close</button>
            </div>
        </div>
      )}
    </div>
  );
}
