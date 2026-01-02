import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";

// CONSTANTS
const SAMPLE_JD = `Senior FinTech Architect: 10+ Years experience in AWS, high-volume transaction processing ($500M+ daily), and microservices scaling. Required: React, Node.js, and SOC2 compliance knowledge.`;
const SAMPLE_RESUME = `Lead Engineer at Innovate Financial. Managed AWS scale from 50 to 500+ microservices. Reduced core engine latency by 45%, saving $2M in annual compute costs. Expert in React and Node.js. Mentored teams of 15.`;

export default function Dashboard() {
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSignUpGate, setShowSignUpGate] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  // Load guest usage
  useEffect(() => {
    const savedCount = localStorage.getItem('guest_screens');
    if (savedCount) setGuestCount(parseInt(savedCount));
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = "";
        if (file.name.endsWith('.docx')) {
          const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
          text = result.value;
        } else {
          text = new TextDecoder().decode(event.target.result);
        }
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      } catch (err) { console.error(err); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLoadSamples = () => {
    setJdText(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setActiveTab('jd'); // Reset view to JD
  };

  const handleScreen = () => {
    if (!isSignedIn) {
      if (guestCount >= 3) {
        setShowSignUpGate(true);
        return;
      }
      const newCount = guestCount + 1;
      setGuestCount(newCount);
      localStorage.setItem('guest_screens', newCount.toString());
    }

    setLoading(true);
    // SIMULATED AI ANALYSIS
    setTimeout(() => {
      setAnalysis({
        score: 94,
        summary: "Exceptional alignment. The candidate's architectural experience directly translates to the high-volume transaction goals.",
        strengths: [
          "Proven 45% reduction in latency ($2M savings).",
          "Scaled AWS from 50 to 500+ microservices.",
          "Lead-level mentorship of teams (15+ members).",
          "Direct experience with high-volume FinTech ($500M+).",
          "Mastery of React and Node.js ecosystems."
        ],
        gaps: [
          "Limited detail on React 19 concurrent features.",
          "No specific metrics on EKS migration strategy.",
          "SOC2 compliance experience is implied via scale, not explicit."
        ],
        questions: [
          "Can you walk us through the specific AWS services used to reduce latency by 45%?",
          "Describe a time you had to mentor a struggling senior engineer.",
          "How do you handle data consistency across 500+ microservices?",
          "What is your approach to SOC2 audit preparation?"
        ],
        marketIntel: {
          salary: "$190k - $240k",
          difficulty: "High (Top 5% Talent)",
          availability: "2-3 weeks notice period typical"
        },
        email: "Subject: Interview Request - Senior Architect Role\n\nHi [Name],\n\nI was impressed by your work scaling Innovate Financial's core engine. Your experience reducing latency by 45% is exactly what we need.\n\nAre you open to a 15-min chat this Thursday?\n\nBest,\n[Your Name]"
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative font-sans">
      
      {/* FREE SCREEN COUNTER (Restored) */}
      {!isSignedIn && (
        <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
             <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Guest Mode</span>
             <p className="text-sm text-blue-200">You have <span className="text-white font-bold">{3 - guestCount} free screens</span> remaining.</p>
          </div>
          <SignUpButton mode="modal">
            <button className="text-xs font-bold uppercase text-blue-400 hover:text-white transition">Sign Up to Save</button>
          </SignUpButton>
        </div>
      )}

      {/* 1-2-3 GUIDE */}
      <div className="flex flex-col md:flex-row justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl gap-4">
         <div className="flex items-center gap-4"><span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">1</span><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Set JD</p></div>
         <div className="flex items-center gap-4"><span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">2</span><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Resume</p></div>
         <div className="flex items-center gap-4"><span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20">3</span><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Screen</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 flex flex-col h-[800px] shadow-2xl relative">
           
           <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
             <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}>JD Editor</button>
             <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}>Resume View</button>
           </div>
           
           <div className="mb-4 flex gap-2">
             <label className="flex-1 text-center cursor-pointer bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-3 rounded-xl text-[10px] font-black uppercase border border-blue-500/20 transition">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
             </label>
             {/* SINGLE CLICK LOAD BUTTON */}
             <button 
                onClick={handleLoadSamples}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700 transition"
             >
                Load Full Sample Data
             </button>
           </div>

           <textarea 
             className="flex-1 bg-transparent resize-none outline-none text-slate-300 font-medium leading-relaxed p-4 border border-slate-800/50 rounded-2xl mb-4"
             placeholder={`Paste text or use the Load Sample button...`}
             value={activeTab === 'jd' ? jdText : resumeText}
             onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
           />
           
           <button onClick={handleScreen} disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
             {loading ? "Analyzing..." : "3. Get Analysis Score"}
           </button>

           {/* SWIRL LOGO (Top Right) */}
           <div className="absolute top-4 right-4 opacity-20 hover:opacity-100 transition-opacity">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10C30 10 10 30 10 50C10 70 30 90 50 90C70 90 90 70 90 50C90 30 70 10 50 10Z" stroke="white" strokeWidth="2" strokeDasharray="4 4"/>
                <path d="M50 25C65 25 75 35 75 50C75 65 65 75 50 75C35 75 25 65 25 50" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
                <path d="M50 40C55 40 60 45 60 50C60 55 55 60 50 60" stroke="#10b981" strokeWidth="6" strokeLinecap="round"/>
              </svg>
           </div>
        </div>
        
        {/* OUTPUT PANEL */}
        <div className="h-[800px] overflow-y-auto pr-2 custom-scrollbar">
           {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 uppercase font-black text-[10px] tracking-widest">
               <p>Analysis Result View</p>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                {/* Score & Summary */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                   <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black mb-4 text-white shadow-lg shadow-blue-500/40">
                     {analysis.score}
                   </div>
                   <p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.summary}"</p>
                </div>

                {/* Strengths & Gaps */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-[2rem]">
                     <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-widest">Strengths</h4>
                     <ul className="space-y-2">{analysis.strengths.slice(0,3).map((s, i) => <li key={i} className="text-[10px] text-slate-400 flex gap-2">✓ {s}</li>)}</ul>
                  </div>
                  <div className="bg-slate-900 border border-rose-500/20 p-6 rounded-[2rem]">
                     <h4 className="text-[10px] font-black uppercase text-rose-500 mb-4 tracking-widest">Gaps</h4>
                     <ul className="space-y-2">{analysis.gaps.map((g, i) => <li key={i} className="text-[10px] text-slate-400 flex gap-2">! {g}</li>)}</ul>
                  </div>
                </div>

                {/* RESTORED: Market Intelligence */}
                <div className="bg-slate-900 border border-indigo-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">Market Intelligence</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 p-3 rounded-xl">
                        <p className="text-[9px] text-slate-500 uppercase">Est. Salary</p>
                        <p className="text-sm font-bold text-white">{analysis.marketIntel.salary}</p>
                      </div>
                      <div className="bg-black/20 p-3 rounded-xl">
                        <p className="text-[9px] text-slate-500 uppercase">Availability</p>
                        <p className="text-sm font-bold text-white">{analysis.marketIntel.availability}</p>
                      </div>
                   </div>
                </div>

                {/* RESTORED: Interview Questions */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Strategic Interview Questions</h4>
                   <ul className="space-y-3">
                     {analysis.questions.map((q, i) => <li key={i} className="text-xs text-slate-300 italic">"Q{i+1}: {q}"</li>)}
                   </ul>
                </div>

                {/* RESTORED: Email Outreach */}
                <div className="bg-slate-900 border border-blue-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">Outreach Draft</h4>
                   <div className="bg-black/20 p-4 rounded-xl text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                     {analysis.email}
                   </div>
                   <button onClick={() => alert("Copied to clipboard!")} className="mt-4 w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] font-black uppercase rounded-lg transition">Copy Email</button>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* SIGN UP GATE MODAL */}
      {showSignUpGate && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
           <div className="bg-[#0f172a] border border-slate-700 p-10 rounded-[3rem] max-w-md w-full text-center shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Trial Limit Reached</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">You've reached your 3-screen guest limit. Create an account to continue using Recruit-IQ.</p>
              <SignUpButton mode="modal">
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs text-white shadow-xl shadow-blue-600/30 transition-all">Create Free Account</button>
              </SignUpButton>
              <button onClick={() => setShowSignUpGate(false)} className="mt-6 text-[10px] font-bold uppercase text-slate-600 hover:text-slate-400">Not now</button>
           </div>
        </div>
      )}
    </div>
  );
}
