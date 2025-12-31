import React, { useState, useRef } from 'react';
import { 
  Upload, Sparkles, CheckCircle, FileText, Loader2, BrainCircuit, 
  Target, Lock, Search, BookOpen, X, ChevronRight, ShieldCheck, 
  Unlock, Layers, Mail, Copy, Wand2, Zap 
} from 'lucide-react';

const RecruitIQApp = () => {
  // --- STATE MANAGEMENT ---
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

  // --- LOGIC HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: file }));
  };

  const useSample = () => {
    setFiles({
      jd: { name: "Senior_Product_Manager_JD.pdf", size: "1.2MB" },
      resume: { name: "Sample_Candidate_Resume.pdf", size: "845KB" }
    });
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

  const generateOutreach = () => {
    const draft = `Subject: Opportunity: Senior Role at [Company] / Your background in React\n\nHi Alex,\n\nI was just reviewing your profile using our Recruit IQ engine. Your 88% synergy score caught my attention—specifically your deep expertise in Node.js and Cloud Architecture. \n\nWe're looking for someone exactly like you for our current opening. Would you be open to a 15-minute sync this week?\n\nBest,\nRecruiting Team`;
    setOutreachEmail(draft);
  };

  // --- CUSTOM LOGO COMPONENT (Matches the Blue/Purple Swirl Image) ---
  const SwirlLogo = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <defs>
        <linearGradient id="swirlGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path 
        d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36" 
        stroke="url(#swirlGrad)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        className="opacity-90"
      />
      <path 
        d="M36 20C36 11.1634 28.8366 4 20 4" 
        stroke="#3b82f6" 
        strokeWidth="6" 
        strokeLinecap="round" 
        className="opacity-80"
      />
      <path 
        d="M20 36C28.8366 36 36 28.8366 36 20" 
        stroke="#a855f7" 
        strokeWidth="6" 
        strokeLinecap="round"
        className="opacity-80"
      />
    </svg>
  );

  // --- FEATURE CARD COMPONENT ---
  const FeatureCard = ({ title, icon: Icon, color, delay, score, content }) => (
    <div className={`bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-700 hover:border-blue-500/30 transition-all`} style={{animationDelay: delay}}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
            <Icon size={16} className={color.replace('bg-', 'text-')} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">{title}</h3>
        </div>
        {score && <span className={`text-xs font-black px-2 py-1 rounded bg-black/40 text-blue-400`}>{score}</span>}
      </div>
      <div className="p-5">
        <ul className="space-y-3">
          {content.map((item, i) => (
            <li key={i} className="text-[11px] text-slate-400 font-medium flex items-start gap-2 leading-relaxed">
              <span className={`mt-1 w-1 h-1 rounded-full ${color}`}></span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans relative">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {/* HEADER WITH NEW LOGO */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {/* LOGO REPLACEMENT */}
          <SwirlLogo />
          
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            RECRUIT <span className="text-blue-500">IQ</span>
          </h1>
        </div>
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/10 shadow-xl">
          <button className="px-6 py-2 text-[10px] font-black bg-blue-600 text-white rounded-lg shadow-lg">STANDARD (FREE)</button>
          <button className="px-6 py-2 text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-widest">PRO ($29.99)</button>
        </div>
      </header>

      <main className={`max-w-6xl mx-auto space-y-6 transition-all duration-700 ${showResultsModal ? 'blur-3xl opacity-20 pointer-events-none' : ''}`}>
        
        {/* STEP GUIDE TOP BAR */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center gap-10">
          <h2 className="text-orange-500 text-[10px] font-black tracking-[0.3em] uppercase italic border-r border-white/10 pr-10">Step Guide</h2>
          <div className="flex gap-12 flex-1">
            {['Input JD', 'Input Resume', 'Screen'].map((txt, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={`font-mono text-sm font-bold ${isStepDone(i + 1) || (i === 2 && isReady) ? 'text-blue-500' : 'text-slate-800'}`}>0{i+1}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INPUT CARD */}
        <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
          <div className="flex bg-black/60 p-2 gap-2 border-b border-white/5">
            <button 
              onClick={() => setInputCategory('single')}
              className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all ${inputCategory === 'single' ? 'bg-[#1c2128] text-blue-400 shadow-xl border border-white/5' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <FileText size={16} /> Single Screen
            </button>
            <button 
              onClick={() => setInputCategory('batch')}
              className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all ${inputCategory === 'batch' ? 'bg-[#1c2128] text-orange-500' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <Layers size={16} /> Batch Screening <span className="bg-orange-500 text-white text-[8px] px-2 py-0.5 rounded-md ml-1 font-black">PRO</span>
            </button>
          </div>

          <div className="flex-1 p-12 flex flex-col items-center justify-center relative">
            {inputCategory === 'batch' ? (
              <div className="text-center space-y-8 max-w-sm animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-[2rem] flex items-center justify-center mx-auto border border-orange-500/20 shadow-2xl">
                  <Lock size={32} />
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Unlock Batch Mode</h3>
                <p className="text-sm text-slate-500 font-medium">Screen hundreds of candidates at once. Get a ranked leaderboard of top talent automatically.</p>
                <button className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">Upgrade Now</button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* File vs Text Toggles */}
                <div className="absolute top-6 right-10 flex bg-black/40 rounded-full p-1 border border-white/5">
                  <button onClick={() => setMode(p => ({...p, [activeTab]: 'file'}))} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode[activeTab] === 'file' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>File</button>
                  <button onClick={() => setMode(p => ({...p, [activeTab]: 'text'}))} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode[activeTab] === 'text' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Text</button>
                </div>

                <div className="flex bg-black/40 p-2 rounded-2xl mb-12 border border-white/5 w-full max-w-lg">
                   {[1, 2].map(n => (
                     <button key={n} onClick={() => setActiveTab(n)} className={`flex-1 py-4 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === n ? 'bg-[#1c2128] text-blue-400 border border-white/5 shadow-lg' : 'text-slate-600'}`}>
                       {n === 1 ? 'STEP 1: JOB DESCRIPTION' : 'STEP 2: RESUME'}
                     </button>
                   ))}
                </div>
                
                {mode[activeTab] === 'file' ? (
                  <div className="w-full max-w-2xl border-2 border-dashed border-white/10 rounded-[3rem] p-16 text-center bg-black/20 group hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => fileInputRef.current.click()}>
                    <div className="mb-8 inline-flex p-6 rounded-3xl bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <Upload size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter">UPLOAD {activeTab === 1 ? 'JD' : 'RESUME'} FILE</h3>
                    {files[activeTab === 1 ? 'jd' : 'resume'] ? (
                      <div className="text-emerald-400 font-black text-sm uppercase tracking-widest bg-emerald-500/10 px-6 py-3 rounded-full border border-emerald-500/20 inline-flex items-center gap-2">
                        <CheckCircle size={16} /> {(activeTab === 1 ? files.jd : files.resume).name}
                      </div>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); useSample(); }} className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] hover:underline decoration-2 underline-offset-8">Use Sample Data</button>
                    )}
                  </div>
                ) : (
                  <textarea 
                    value={activeTab === 1 ? textData.jd : textData.resume}
                    onChange={(e) => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.value }))}
                    placeholder={`Paste the ${activeTab === 1 ? 'Job Description' : 'Resume'} text content here...`}
                    className="w-full h-56 max-w-2xl bg-[#050910] border border-white/10 rounded-2xl p-8 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* SCREEN CANDIDATE BUTTON */}
        <button 
          disabled={!isReady || isProcessing || inputCategory === 'batch'}
          onClick={handleScreenCandidate}
          className={`w-full py-10 rounded-[2.5rem] flex items-center justify-center gap-8 font-black tracking-[0.5em] transition-all relative overflow-hidden text-lg ${isReady && !isProcessing && inputCategory !== 'batch' ? 'bg-blue-600 text-white shadow-[0_25px_60px_rgba(37,99,235,0.4)] hover:scale-[1.01]' : 'bg-[#0d1117] text-slate-800 border border-white/5 opacity-50'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${isReady ? 'bg-orange-500 text-white shadow-[0_0_20px_#f97316]' : 'bg-slate-900'}`}>3</div>
          <span className="uppercase">{isProcessing ? processingStage : 'SCREEN CANDIDATE'}</span>
          {isProcessing && <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-400 via-orange-500 to-blue-400 w-full animate-shimmer" />}
        </button>
      </main>

      {/* UNLOCKED RESULTS MODAL */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0b0e14] w-full max-w-6xl h-[85vh] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            
            <div className="flex justify-between items-center px-10 py-8 border-b border-white/5 bg-[#161b22]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Analysis <span className="text-blue-500">Complete</span></h2>
              </div>
              <button onClick={() => setShowResultsModal(false)} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-4 flex flex-col space-y-6">
                <div className="bg-[#161b22] border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl">
                  <span className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase mb-8">Overall Synergy Score</span>
                  <div className="relative flex items-center justify-center w-56 h-56 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="45%" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                      <circle cx="50%" cy="50%" r="45%" stroke="#3b82f6" strokeWidth="12" fill="transparent" strokeDasharray={700} strokeDashoffset={700 - (700 * 0.88)} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-6xl font-black text-white italic">88<span className="text-blue-500 text-3xl">%</span></span>
                  </div>
                  <p className="text-xs text-emerald-400 font-bold tracking-widest uppercase">High Alignment Detected</p>
                </div>

                <div className="bg-[#161b22] border border-white/5 rounded-3xl p-8 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><Wand2 size={16} className="text-blue-500" /> Outreach Generator</h3>
                  {outreachEmail ? (
                    <div className="space-y-4">
                      <textarea readOnly value={outreachEmail} className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] text-slate-400 leading-relaxed resize-none" />
                      <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Copy Outreach</button>
                    </div>
                  ) : (
                    <button onClick={generateOutreach} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Generate AI Email</button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                 <FeatureCard 
                    title="ATS Optimization" icon={Search} color="bg-blue-500" score="92/100" delay="0s" 
                    content={["Resume format is completely parseable.", "Standard section headings found.", "Suggestion: Add 'Typescript' to skills list."]}
                 />
                 <FeatureCard 
                    title="Skill Gap Finder" icon={Target} color="bg-red-500" delay="0.1s" 
                    content={["Missing: AWS Solutions Architect Cert.", "Missing: GraphQL experience stated.", "Gap: Management years (1 yr below)."]}
                 />
                 <FeatureCard 
                    title="Keyword Match" icon={BookOpen} color="bg-purple-500" score="High" delay="0.2s" 
                    content={["Matched: React, Node.js, Docker, CI/CD.", "Partial: 'Microservices' context is weak.", "Missing: 'Agile Methodology' mention."]}
                 />
                 <FeatureCard 
                    title="Interview Prep" icon={BrainCircuit} color="bg-emerald-500" delay="0.3s" 
                    content={["Q1: Describe optimizing a React rendering cycle.", "Q2: How do you handle large-scale state?", "Q3: Approach to containerizing legacy apps."]}
                 />
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
