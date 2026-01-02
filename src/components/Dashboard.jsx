import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";

// Sample Data Constants
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
    setTimeout(() => {
      setAnalysis({
        score: 94,
        summary: "Exceptional alignment in FinTech architecture with quantifiable performance wins.",
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
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative font-sans">
      
      {/* 1-2-3 QUICK START (COLOR CODED) */}
      <div className="flex flex-col md:flex-row justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl gap-4">
         <div className="flex items-center gap-4"><span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">1</span><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Set JD</p></div>
         <div className="flex items-center gap-4"><span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">2</span><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Resume</p></div>
         <div className="flex items-center gap-4"><span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20">3</span><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Screen</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 flex flex-col h-[650px] shadow-2xl">
           <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
             <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>1. JD</button>
             <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>2. Resume</button>
           </div>
           
           <div className="mb-4 flex gap-2">
             <label className="flex-1 text-center cursor-pointer bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-3 rounded-xl text-[10px] font-black uppercase border border-blue-500/20 transition">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
             </label>
             {/* SAMPLE BUTTONS */}
             <button 
                onClick={() => activeTab === 'jd' ? setJdText(SAMPLE_JD) : setResumeText(SAMPLE_RESUME)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700 transition"
             >
                Load Sample {activeTab === 'jd' ? 'JD' : 'Resume'}
             </button>
           </div>

           <textarea 
             className="flex-1 bg-transparent resize-none outline-none text-slate-300 font-medium leading-relaxed p-4 border border-slate-800/50 rounded-2xl"
             placeholder={`Paste or load ${activeTab === 'jd' ? 'Job Description' : 'Resume'}...`}
             value={activeTab === 'jd' ? jdText : resumeText}
             onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
           />
           
           <button onClick={handleScreen} disabled={loading} className="mt-6 w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 transition-all">
             {loading ? "Analyzing..." : "3. Screen Candidate"}
           </button>
        </div>
        
        {/* OUTPUT PANEL */}
        <div className="h-[650px] overflow-y-auto pr-2">
           {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 uppercase font-black text-[10px] tracking-widest">
               Analysis Pending
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                   <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black mb-4">{analysis.score}</div>
                   <p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.summary}"</p>
                </div>
                <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-widest">5 Strengths</h4>
                   <ul className="space-y-3">{analysis.strengths.map((s, i) => <li key={i} className="text-xs text-slate-400 flex gap-2"><span>✓</span> {s}</li>)}</ul>
                </div>
                <div className="bg-slate-900 border border-rose-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-rose-500 mb-4 tracking-widest">3 Gaps</h4>
                   <ul className="space-y-3">{analysis.gaps.map((g, i) => <li key={i} className="text-xs text-slate-400 flex gap-2"><span>!</span> {g}</li>)}</ul>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* SIGN UP GATE */}
      {showSignUpGate && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-[#0f172a] border border-slate-700 p-10 rounded-[3rem] max-w-md w-full text-center shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Trial Complete</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">You've reached the 3-screen limit. Create a free account to continue using Recruit-IQ.</p>
              <SignUpButton mode="modal">
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs text-white shadow-xl transition-all">Create Free Account</button>
              </SignUpButton>
              <button onClick={() => setShowSignUpGate(false)} className="mt-6 text-[10px] font-bold uppercase text-slate-600">Cancel</button>
           </div>
        </div>
      )}
    </div>
  );
}
