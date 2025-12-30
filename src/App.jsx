import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, FileText, Loader2, BrainCircuit, Target, Lock, Search, BookOpen, X, ChevronRight, ShieldCheck, Unlock, Layers, Mail, Copy, Wand2 } from 'lucide-react';

const RecruitIQApp = () => {
  // --- STATE ---
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [mode, setMode] = useState({ 1: 'file', 2: 'file' });
  const [inputCategory, setInputCategory] = useState('single'); // 'single' or 'batch'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('Initializing...');
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [outreachEmail, setOutreachEmail] = useState("");
  const fileInputRef = useRef(null);

  // --- LOGIC ---
  const handleScreenCandidate = () => {
    setIsProcessing(true);
    const stages = ["Parsing Documents...", "Analyzing Skill Gaps...", "Calculating Synergy..."];
    let step = 0;
    const interval = setInterval(() => {
      setProcessingStage(stages[step]);
      step++;
      if (step >= stages.length) clearInterval(interval);
    }, 800);

    setTimeout(() => {
      setIsProcessing(false);
      setShowResultsModal(true);
    }, 3000);
  };

  const generateOutreach = () => {
    const draft = `Subject: Opportunity: Senior Role at [Company] / Your background in React\n\nHi Alex,\n\nI was just reviewing your profile using our Recruit IQ engine. Your 88% synergy score caught my attention—specifically your deep expertise in Node.js and Cloud Architecture. \n\nWe're looking for someone exactly like you for our current opening. Would you be open to a 15-minute sync this week?\n\nBest,\nRecruiting Team`;
    setOutreachEmail(draft);
  };

  const isReady = (files.jd || textData.jd.length > 50) && (files.resume || textData.resume.length > 50);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans relative selection:bg-blue-500/30">
      <input type="file" ref={fileInputRef} className="hidden" />

      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">RECRUIT <span className="text-blue-500">IQ</span></h1>
        </div>
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/10">
          <button className="px-4 py-1.5 text-[10px] font-bold bg-blue-600 text-white rounded-lg">FREE TIER</button>
        </div>
      </header>

      <main className={`max-w-6xl mx-auto space-y-6 transition-all duration-700 ${showResultsModal ? 'blur-2xl opacity-20' : ''}`}>
        
        {/* QUICK START (Top) */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center gap-8">
          <div className="flex items-center gap-3 pr-8 border-r border-white/5">
            <h2 className="text-orange-500 text-[10px] font-black tracking-[0.2em] uppercase italic">Step Guide</h2>
          </div>
          <div className="flex gap-8 flex-1">
            {['Input JD', 'Input Resume', 'Screen'].map((txt, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-slate-700">0{i+1}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[480px]">
          {/* Main Category Toggle (Single vs Batch) */}
          <div className="flex bg-black/60 p-2 gap-2 border-b border-white/5">
            <button 
              onClick={() => setInputCategory('single')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${inputCategory === 'single' ? 'bg-[#1c2128] text-blue-500 shadow-lg' : 'text-slate-600'}`}
            >
              <FileText size={14} /> Single Screen
            </button>
            <button 
              onClick={() => setInputCategory('batch')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${inputCategory === 'batch' ? 'bg-[#1c2128] text-blue-500' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <Layers size={14} /> Batch Screening <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded ml-1">PRO</span>
            </button>
          </div>

          <div className="flex-1 p-8 flex flex-col items-center justify-center">
            {inputCategory === 'batch' ? (
              /* PRO UPGRADE FOR BATCH */
              <div className="text-center space-y-6 max-w-sm animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                  <Lock size={32} />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Unlock Batch Mode</h3>
                <p className="text-sm text-slate-500 font-medium">Screen up to 100 resumes against a single JD in seconds. Export ranked leaderboards and top talent shortlists.</p>
                <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-900/20 hover:scale-105 transition-all">Upgrade to Pro</button>
              </div>
            ) : (
              /* SINGLE SCREEN INPUTS */
              <div className="w-full flex flex-col items-center">
                <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5 w-full max-w-md">
                   {[1, 2].map(n => (
                     <button key={n} onClick={() => setActiveTab(n)} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === n ? 'bg-[#1c2128] text-blue-400' : 'text-slate-600'}`}>
                       {n === 1 ? 'STEP 1: JOB DESCRIPTION' : 'STEP 2: RESUME'}
                     </button>
                   ))}
                </div>
                <div className="w-full max-w-xl border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center bg-black/10">
                   <Upload size={32} className="mx-auto mb-4 text-blue-500" />
                   <h3 className="text-lg font-bold text-white mb-6 uppercase italic">Upload {activeTab === 1 ? 'JD' : 'Resume'} File</h3>
                   <button onClick={() => { setFiles({ jd: {name: 'Sample.pdf'}, resume: {name: 'Resume.pdf'} })}} className="text-blue-500 text-[10px] font-black uppercase hover:underline">Use Sample Data</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SCREEN BUTTON */}
        <button 
          disabled={!isReady || isProcessing || inputCategory === 'batch'}
          onClick={handleScreenCandidate}
          className={`w-full py-8 rounded-[2.5rem] flex items-center justify-center gap-6 font-black tracking-[0.4em] transition-all relative overflow-hidden ${isReady && !isProcessing && inputCategory !== 'batch' ? 'bg-blue-600 text-white shadow-2xl' : 'bg-[#0d1117] text-slate-800'}`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">3</div>
          <span className="uppercase">{isProcessing ? processingStage : 'Screen Candidate'}</span>
          {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-orange-500 w-full animate-shimmer" />}
        </button>
      </main>

      {/* RESULTS MODAL (Outreach Integrated) */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0b0e14] w-full max-w-5xl h-[90vh] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-[#161b22]">
              <h2 className="text-2xl font-black text-white italic uppercase italic tracking-tighter">Analysis <span className="text-blue-500">Report</span></h2>
              <button onClick={() => {setShowResultsModal(false); setOutreachEmail("");}} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Score & Insights */}
              <div className="space-y-8">
                <div className="bg-[#161b22] p-10 rounded-3xl border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-6">Synergy Score</span>
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="45%" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                      <circle cx="50%" cy="50%" r="45%" stroke="#3b82f6" strokeWidth="10" fill="transparent" strokeDasharray="300" strokeDashoffset="40" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-6xl font-black italic">88%</span>
                  </div>
                  <div className="mt-6 flex gap-2">
                    {['React', 'Node.js', 'AWS'].map(tag => <span key={tag} className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-[9px] font-black border border-blue-500/20">{tag}</span>)}
                  </div>
                </div>
              </div>

              {/* Outreach Section (Feature 3) */}
              <div className="bg-[#161b22] rounded-3xl border border-white/5 p-8 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Wand2 size={16} className="text-blue-500" /> Outreach Generator
                  </h3>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">AI Crafted</span>
                </div>
                
                {outreachEmail ? (
                  <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                    <textarea 
                      readOnly 
                      value={outreachEmail} 
                      className="flex-1 w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xs text-slate-400 font-medium leading-relaxed resize-none focus:outline-none"
                    />
                    <div className="mt-4 flex gap-3">
                       <button className="flex-1 py-3 bg-white/5 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><Copy size={14}/> Copy Draft</button>
                       <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"><Mail size={14}/> Send via Outlook</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-xs text-slate-500 font-medium mb-6">Convert this score into an interview. Generate a personalized reach-out based on their top skills.</p>
                    <button onClick={generateOutreach} className="px-8 py-3 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-105 transition-all">Generate Outreach</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{` @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-shimmer { animation: shimmer 2s infinite linear; } `}</style>
    </div>
  );
};

export default RecruitIQApp;
