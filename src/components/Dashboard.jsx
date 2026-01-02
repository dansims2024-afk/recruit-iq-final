import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react"; // Hook to check if user is guest or logged in

export default function Dashboard() {
  const { isSignedIn } = useUser(); // Check auth status
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSignUpGate, setShowSignUpGate] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  // Load guest usage from local storage on load
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
    // 1. GUEST GATE LOGIC
    if (!isSignedIn) {
      if (guestCount >= 3) {
        setShowSignUpGate(true); // Stop! Show Modal
        return;
      }
      // Increment guest usage
      const newCount = guestCount + 1;
      setGuestCount(newCount);
      localStorage.setItem('guest_screens', newCount.toString());
    }

    // 2. Run Analysis (Simulated for Demo)
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        score: 92,
        summary: "Strong candidate match with verified architecture experience.",
        strengths: [
          "45% latency reduction matches core performance goals.",
          "Managed AWS scale from 50 to 500+ services.",
          "Lead experience managing 15+ engineers.",
          "Direct FinTech background ($500M daily volume).",
          "Expert in React and Node.js ecosystems."
        ],
        gaps: [
          "No mention of React 19 concurrent features.",
          "Lacks specific EKS migration metrics.",
          "SOC2 compliance experience is implied, not explicit."
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative">
      
      {/* GUEST BANNER (If not signed in) */}
      {!isSignedIn && !showSignUpGate && (
        <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Trial Mode</span>
            <p className="text-sm text-blue-200">You have <span className="text-white font-bold">{3 - guestCount} free screens</span> remaining.</p>
          </div>
          <SignUpButton mode="modal" className="text-xs font-bold uppercase text-white hover:text-blue-400 transition">Sign Up Free</SignUpButton>
        </div>
      )}

      {/* 1-2-3 GUIDE */}
      <div className="flex flex-col md:flex-row justify-between p-6 bg-slate-900 border border-slate-800 rounded-3xl gap-4">
         <div className="flex items-center gap-3"><span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</span> <span className="text-xs font-bold uppercase text-slate-400">Paste JD</span></div>
         <div className="flex items-center gap-3"><span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</span> <span className="text-xs font-bold uppercase text-slate-400">Upload Resume</span></div>
         <div className="flex items-center gap-3"><span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</span> <span className="text-xs font-bold uppercase text-slate-400">Get Score</span></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUTS */}
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 flex flex-col h-[650px] shadow-2xl">
           <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
             <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}>1. Job Description</button>
             <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}>2. Resume</button>
           </div>
           
           <div className="mb-4 flex justify-between items-center">
             <label className="cursor-pointer bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-blue-500/20 transition">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
             </label>
             <span className="text-[10px] text-slate-600 uppercase font-bold">{activeTab === 'jd' ? jdText.length : resumeText.length} chars</span>
           </div>

           <textarea 
             className="flex-1 bg-transparent resize-none outline-none text-slate-300 font-medium leading-relaxed p-2"
             placeholder={`Paste ${activeTab === 'jd' ? 'Job Description' : 'Resume'} text here...`}
             value={activeTab === 'jd' ? jdText : resumeText}
             onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
           />
           
           <div className="pt-6 mt-4 border-t border-slate-800">
              <button onClick={handleScreen} disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                {loading ? "Analyzing..." : "3. Screen Candidate"}
              </button>
           </div>
        </div>
        
        {/* OUTPUTS */}
        <div className="h-[650px] overflow-y-auto custom-scrollbar">
           {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 gap-4">
               <p className="font-black uppercase tracking-widest text-xs">Ready to Analyze</p>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                   <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center text-4xl font-black text-white mb-4 shadow-inner border border-slate-700">{analysis.score}</div>
                   <p className="text-slate-300 italic">"{analysis.summary}"</p>
                </div>

                <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-widest">5 Key Strengths</h4>
                   <ul className="space-y-3">
                     {analysis.strengths.map((s, i) => <li key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-emerald-500">✓</span> {s}</li>)}
                   </ul>
                </div>

                <div className="bg-slate-900 border border-rose-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-rose-500 mb-4 tracking-widest">3 Critical Gaps</h4>
                   <ul className="space-y-3">
                     {analysis.gaps.map((g, i) => <li key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-rose-500">!</span> {g}</li>)}
                   </ul>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* SIGN UP GATE MODAL */}
      {showSignUpGate && (
        <div className="fixed inset-0 bg-black/90 z-[100] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-[#0f172a] border border-slate-700 p-10 rounded-[3rem] max-w-md w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-600/40">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 2v20M2 12h20"/></svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Free Trial Complete</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">You've used your 3 free guest screens. Create a free account to save your data and continue using Recruit-IQ.</p>
              
              <SignUpButton mode="modal">
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-xl transition-all hover:scale-[1.02]">
                  Create Free Account
                </button>
              </SignUpButton>
              
              <button onClick={() => setShowSignUpGate(false)} className="mt-6 text-[10px] font-bold uppercase text-slate-600 hover:text-slate-400">Cancel</button>
           </div>
        </div>
      )}
    </div>
  );
}
