import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, FileText, Type, Loader2, BrainCircuit, Target, Lock, Search, BookOpen, AlertCircle, X, ChevronRight, ShieldCheck } from 'lucide-react';

const RecruitIQApp = () => {
  // --- STATE ---
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [mode, setMode] = useState({ 1: 'file', 2: 'file' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('Initializing...');
  const [showResultsModal, setShowResultsModal] = useState(false);
  const fileInputRef = useRef(null);

  // --- LOGIC ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: file }));
  };

  // One-click populates BOTH for instant testing
  const useSample = () => {
    setFiles({
      jd: { name: "Senior_React_Developer_JD.pdf", size: "1.2MB" },
      resume: { name: "Alex_Candidate_Resume_2025.pdf", size: "845KB" }
    });
    // Auto-switch to "ready" state visually if user was looking at text
    setMode({ 1: 'file', 2: 'file' }); 
  };

  const isStepDone = (num) => {
    const type = num === 1 ? 'jd' : 'resume';
    return files[type] || textData[type].length > 50;
  };

  const isReady = isStepDone(1) && isStepDone(2);

  const handleScreenCandidate = () => {
    setIsProcessing(true);
    const stages = ["Parsing Documents...", "Extracting Keywords...", "Analyzing Skill Gaps...", "Calculating Synergy..."];
    
    // Simulate complex AI processing stages
    let step = 0;
    const interval = setInterval(() => {
      setProcessingStage(stages[step]);
      step++;
      if (step >= stages.length) clearInterval(interval);
    }, 800);

    setTimeout(() => {
      setIsProcessing(false);
      setShowResultsModal(true);
    }, 3500);
  };

  // --- COMPONENTS ---
  
  // The Locked Feature Card
  const FeatureCard = ({ title, icon: Icon, color, delay }) => (
    <div className={`relative bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-700`} style={{animationDelay: delay}}>
      {/* Visible Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
          <Icon size={16} className={color.replace('bg-', 'text-')} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">{title}</h3>
      </div>
      
      {/* Blurred Content */}
      <div className="p-6 relative">
        <div className="space-y-3 filter blur-sm select-none opacity-50">
          <div className="h-2 bg-slate-700 rounded w-3/4"></div>
          <div className="h-2 bg-slate-700 rounded w-full"></div>
          <div className="h-2 bg-slate-700 rounded w-5/6"></div>
          <div className="h-2 bg-slate-700 rounded w-4/5"></div>
        </div>
        
        {/* Lock Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] transition-all group-hover:bg-black/70">
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-[0_0_15px_#f97316] mb-3 transform group-hover:scale-110 transition-transform">
            <Lock size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Upgrade to Unlock</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans relative selection:bg-orange-500/30">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
            RECRUIT <span className="text-blue-500">IQ</span>
          </h1>
        </div>
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/10 shadow-lg">
          <div className="px-4 py-1.5 text-[10px] font-bold text-white bg-blue-600 rounded-lg shadow-sm">FREE TIER</div>
          <div className="px-4 py-1.5 text-[10px] font-bold text-slate-500 flex items-center gap-1">
            <Lock size={10} /> PRO
          </div>
        </div>
      </header>

      <main className={`max-w-6xl mx-auto space-y-6 transition-all duration-700 ${showResultsModal ? 'blur-xl opacity-30 scale-95 pointer-events-none' : ''}`}>
        
        {/* QUICK START (Horizontal & Top) */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 pr-8 md:border-r border-white/5 min-w-max">
            <h2 className="text-orange-500 text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Quick Guide
            </h2>
          </div>
          <div className="flex justify-between w-full gap-4">
            {['Upload JD', 'Upload Resume', 'See Results'].map((txt, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <span className={`font-mono text-lg font-black transition-colors ${i < 2 && isStepDone(i+1) ? 'text-emerald-500' : 'text-slate-800 group-hover:text-blue-500'}`}>0{i+1}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{txt}</span>
                {i < 2 && <ChevronRight size={14} className="text-slate-800 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN INPUT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
          
          {/* Left Column: Toggles & Inputs */}
          <div className="lg:col-span-12 bg-[#0d1117] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
              {[1, 2].map((num) => (
                <button key={num} onClick={() => setActiveTab(num)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all ${activeTab === num ? 'bg-[#1c2128] text-blue-400 shadow-inner ring-1 ring-white/5' : 'text-slate-600 hover:text-slate-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isStepDone(num) ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-800'}`}>
                    {isStepDone(num) ? <CheckCircle size={12} /> : num}
                  </div>
                  {num === 1 ? 'JOB DESCRIPTION' : 'CANDIDATE RESUME'}
                </button>
              ))}
            </div>

            {/* Input Zone */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
               {/* Mode Switcher */}
               <div className="absolute top-6 right-6 flex bg-black/40 rounded-full p-1 border border-white/5">
                 <button onClick={() => setMode(p => ({...p, [activeTab]: 'file'}))} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode[activeTab] === 'file' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>File</button>
                 <button onClick={() => setMode(p => ({...p, [activeTab]: 'text'}))} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode[activeTab] === 'text' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Text</button>
               </div>

              {mode[activeTab] === 'file' ? (
                <div className="w-full max-w-xl border-2 border-dashed border-white/10 rounded-3xl p-12 bg-black/20 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group text-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
                  <div className="mb-6 inline-flex p-5 rounded-3xl bg-[#161b22] text-blue-500 shadow-lg group-hover:scale-110 group-hover:text-white group-hover:bg-blue-600 transition-all duration-300">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 italic uppercase tracking-tighter">
                    Upload {activeTab === 1 ? 'JD' : 'Resume'}
                  </h3>
                  
                  {files[activeTab === 1 ? 'jd' : 'resume'] ? (
                    <div className="flex items-center justify-center gap-2 mt-4 text-emerald-400 bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-500/20">
                       <FileText size={14} />
                       <span className="font-bold text-xs">{(activeTab === 1 ? files.jd : files.resume).name}</span>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-6">
                      <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">PDF • DOCX • TXT</p>
                      <div className="flex justify-center items-center gap-4">
                         <span className="text-blue-500 text-xs font-black uppercase hover:underline decoration-2 underline-offset-4">Browse Files</span>
                         <span className="text-slate-700">|</span>
                         <button 
                           onClick={(e) => { e.stopPropagation(); useSample(); }}
                           className="text-slate-400 text-xs font-black uppercase hover:text-orange-500 transition-colors flex items-center gap-1"
                         >
                           Try Sample Data
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <textarea 
                  value={textData[activeTab === 1 ? 'jd' : 'resume']}
                  onChange={(e) => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.value }))}
                  placeholder={`Paste the ${activeTab === 1 ? 'Job Description' : 'Resume'} text content here...`}
                  className="w-full h-full max-w-2xl bg-[#050910] border border-white/10 rounded-2xl p-6 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-slate-700 font-mono"
                />
              )}
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button 
          disabled={!isReady || isProcessing}
          onClick={handleScreenCandidate}
          className={`w-full py-8 rounded-[2rem] flex items-center justify-center gap-6 font-black tracking-[0.4em] transition-all relative overflow-hidden group ${
            isReady && !isProcessing
            ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-[0_20px_50px_rgba(37,99,235,0.25)] hover:shadow-blue-500/40 hover:scale-[1.01]' 
            : 'bg-[#0d1117] text-slate-700 border border-white/5 cursor-not-allowed'
          }`}
        >
          {/* Step 3 Badge */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${
            isReady ? 'bg-orange-500 text-white shadow-[0_0_20px_#f97316] rotate-0' : 'bg-slate-800 rotate-180'
          }`}>
            3
          </div>

          <span className="flex items-center gap-4 uppercase text-lg">
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin text-blue-300" size={24} />
                <span className="animate-pulse">{processingStage}</span>
              </>
            ) : (
              <>
                <Sparkles size={24} className={isReady ? "text-orange-400 group-hover:rotate-12 transition-transform" : ""} />
                Screen Candidate
              </>
            )}
          </span>
          
          {/* Progress Bar Animation */}
          {isProcessing && <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-orange-500 w-full animate-shimmer" />}
        </button>
      </main>

      {/* --- RESULTS MODAL (FREEMIUM) --- */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-[#0b0e14] w-full max-w-5xl h-[85vh] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-[#161b22]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Analysis <span className="text-blue-500">Complete</span></h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Free Tier Report</p>
                </div>
              </div>
              <button onClick={() => setShowResultsModal(false)} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white hover:bg-red-500/20 hover:rotate-90 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT: THE SCORE (FREE) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="bg-[#161b22] border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden h-full">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500" />
                  <span className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase mb-8">Overall Synergy Score</span>
                  
                  {/* Custom Gauge */}
                  <div className="relative flex items-center justify-center w-64 h-64 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                       <defs>
                         <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#3b82f6" />
                           <stop offset="100%" stopColor="#10b981" />
                         </linearGradient>
                       </defs>
                      <circle cx="50%" cy="50%" r="45%" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                      <circle cx="50%" cy="50%" r="45%" stroke="url(#scoreGradient)" strokeWidth="12" fill="transparent" 
                        strokeDasharray={700} strokeDashoffset={700 - (700 * 0.88)} strokeLinecap="round"
                        className="animate-gauge"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-7xl font-black text-white italic tracking-tighter drop-shadow-2xl">88<span className="text-3xl text-emerald-500">%</span></span>
                      <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">High Match</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs">
                    Candidate shows strong alignment with core technical requirements. <span className="text-white font-bold">Recommended for interview.</span>
                  </p>
                </div>
              </div>

              {/* RIGHT: LOCKED FEATURES (PRO) */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                 <div className="md:col-span-2 mb-2 flex items-center justify-between">
                   <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                     <Lock size={12} className="text-orange-500" /> Premium Insights
                   </h3>
                   <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Locked</span>
                 </div>

                 {/* The 4 Features from your screenshot */}
                 <FeatureCard title="ATS Optimization" icon={Search} color="bg-blue-500" delay="0s" />
                 <FeatureCard title="Skill Gap Finder" icon={Target} color="bg-red-500" delay="0.1s" />
                 <FeatureCard title="Keyword Suggestions" icon={BookOpen} color="bg-purple-500" delay="0.2s" />
                 <FeatureCard title="Interview Prep" icon={BrainCircuit} color="bg-emerald-500" delay="0.3s" />
                 
                 <div className="md:col-span-2 mt-4 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-between shadow-xl shadow-blue-900/20">
                    <div>
                      <h4 className="text-white font-black italic uppercase text-lg">Unlock Full Report</h4>
                      <p className="text-blue-100 text-xs font-medium">Get deep insights, skill gaps, and interview questions.</p>
                    </div>
                    <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                      Upgrade $29.99
                    </button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Global Animations */}
      <style jsx>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
        .animate-gauge { stroke-dashoffset: 700; animation: dash 1.5s ease-out forwards; animation-delay: 0.5s; }
        @keyframes dash { to { stroke-dashoffset: ${700 - (700 * 0.88)}; } }
      `}</style>
    </div>
  );
};

export default RecruitIQApp;
