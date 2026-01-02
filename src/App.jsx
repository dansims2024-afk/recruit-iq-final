import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const APP_NAME = "Recruit-IQ";
const COPYRIGHT = "Core Creativity AI 2026";
const MAX_FREE_SCREENS = 3;

// --- DYNAMIC COLOR THEME ---
const THEME = {
  step1: "bg-blue-600",
  step2: "bg-indigo-600",
  step3: "bg-emerald-600",
};

export default function RecruitIQApp() {
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [screenCount, setScreenCount] = useState(0);

  // --- LOGIC: FIXED RESUME PARSING ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      // FIX: Using actual file content from the reader event
      const actualContent = event.target.result;
      const formattedContent = `[Parsed from ${file.name}]\n\n${actualContent}`;
      
      if (activeTab === 'jd') {
        setJdText(formattedContent);
      } else {
        setResumeText(formattedContent);
      }
      setLoading(false);
    };

    reader.onerror = () => {
      console.error("File reading failed");
      setLoading(false);
    };

    reader.readAsText(file); // Reading as text for parsing
  };

  const handleScreen = () => {
    if (screenCount >= MAX_FREE_SCREENS) return;
    setLoading(true);
    setScreenCount(prev => prev + 1);

    setTimeout(() => {
      setAnalysis({
        matchScore: 92,
        strengths: [
          "Demonstrated 45% latency reduction in high-scale FinTech systems.",
          "Scalability expert: managed growth from 50 to 500+ microservices.",
          "Strong leadership: mentored 15+ engineers through architectural shifts.",
          "Query optimization: 60% improvement in database load times.",
          "Advanced React 19 architecture and event-driven patterns."
        ],
        gaps: [
          "No explicit experience with EKS (AWS) orchestration specifics.",
          "Lacks documentation on SOC2 or HIPAA compliance leadership.",
          "Resume doesn't detail Go-based security implementation."
        ]
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200">
      
      {/* HEADER */}
      <header className="h-20 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl" />
          <span className="text-xl font-black uppercase tracking-tighter text-white">{APP_NAME}</span>
        </div>
        <div className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
          {MAX_FREE_SCREENS - screenCount} Screens Left
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-10 space-y-10">
        
        {/* QUICK START GUIDE (COLOR CODED) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex justify-between items-center shadow-2xl">
           <div className="flex items-center gap-4">
             <span className={`${THEME.step1} text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-blue-600/30`}>1</span>
             <p className="text-xs font-bold uppercase text-slate-300">Set JD</p>
           </div>
           <div className="flex items-center gap-4">
             <span className={`${THEME.step2} text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-indigo-600/30`}>2</span>
             <p className="text-xs font-bold uppercase text-slate-300">Upload Resume</p>
           </div>
           <div className="flex items-center gap-4">
             <span className={`${THEME.step3} text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-emerald-600/30`}>3</span>
             <p className="text-xs font-bold uppercase text-slate-300">Screen</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* INPUT PANEL */}
          <section className="bg-[#0f172a] rounded-[3rem] border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
            <div className="flex p-2 bg-[#020617]/40 border-b border-slate-800">
              <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'jd' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>
                <span className={`inline-block w-4 h-4 rounded-full mr-2 ${THEME.step1} text-white text-[8px]`}>1</span> JD
              </button>
              <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'resume' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>
                <span className={`inline-block w-4 h-4 rounded-full mr-2 ${THEME.step2} text-white text-[8px]`}>2</span> Resume
              </button>
            </div>

            <div className="p-4 border-b border-slate-800 bg-[#020617]/20 flex justify-between">
               <label className="flex items-center gap-2 cursor-pointer bg-blue-600/10 px-5 py-2.5 rounded-2xl border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase transition-all hover:bg-blue-600/20">
                 Upload File
                 <input type="file" className="hidden" onChange={handleFileUpload} />
               </label>
            </div>

            <textarea 
              className="flex-1 p-8 bg-transparent outline-none text-slate-300 resize-none font-medium leading-relaxed" 
              placeholder={`Paste content here...`} 
              value={activeTab === 'jd' ? jdText : resumeText}
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            />

            <div className="p-8 border-t border-slate-800">
              <button onClick={handleScreen} disabled={loading} className={`w-full py-6 rounded-3xl ${THEME.step3} text-white font-black uppercase text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95`}>
                <span className="bg-white text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-[9px]">3</span>
                {loading ? "Analyzing..." : "Screen Candidate"}
              </button>
            </div>
          </section>

          {/* OUTPUT PANEL */}
          <section className="bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] p-10">
            {!analysis ? (
               <div className="h-full flex items-center justify-center text-slate-600 italic">Awaiting synergy scan...</div>
            ) : (
              <div className="space-y-6">
                <div className="text-4xl font-black text-emerald-500">{analysis.matchScore}% Synergy</div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-emerald-400">Strengths</h4>
                  {analysis.strengths.map((s, i) => <div key={i} className="text-xs text-slate-300">• {s}</div>)}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-[#0f172a] py-8 px-10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <div>&copy; {COPYRIGHT}</div>
        <div className="flex gap-8">
          <a href="#">Privacy</a> <a href="#">Terms</a> <a href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}
