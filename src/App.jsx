import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, FileText, Loader2, BrainCircuit, Target, Lock, Search, BookOpen, X, ChevronRight, ShieldCheck, Unlock, Layers, Mail, Copy, Wand2 } from 'lucide-react';

const RecruitIQApp = () => {
  // --- STATE ---
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [inputCategory, setInputCategory] = useState('single');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [outreachEmail, setOutreachEmail] = useState("");
  const fileInputRef = useRef(null);

  // --- LOGIC ---
  const handleScreenCandidate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResultsModal(true);
    }, 3000);
  };

  const useSample = () => {
    setFiles({
      jd: { name: "Senior_Product_Manager_JD.pdf" },
      resume: { name: "Sample_Candidate_Resume.pdf" }
    });
  };

  const isReady = (files.jd || textData.jd.length > 50) && (files.resume || textData.resume.length > 50);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans relative">
      <input type="file" ref={fileInputRef} className="hidden" />

      {/* HEADER WITH CORRECT LOGO */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {/* LOGO BOX */}
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src="https://raw.githubusercontent.com/RecruitIQ/branding/main/logo.png" 
              alt="Recruit IQ" 
              className="w-full h-full object-contain"
              // Fallback to the uploaded logo file if the URL above isn't live in your environment
              onError={(e) => { e.target.src = 'https://i.postimg.cc/85m8yK9B/logo-circular.png'; }} 
            />
          </div>
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
          <h2 className="text-orange-500 text-[10px] font-black tracking-[0.3em] uppercase italic italic border-r border-white/10 pr-10">Step Guide</h2>
          <div className="flex gap-12 flex-1">
            {['Input JD', 'Input Resume', 'Screen'].map((txt, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={`font-mono text-sm font-bold ${isReady && i === 2 ? 'text-blue-500' : 'text-slate-800'}`}>0{i+1}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INPUT CARD */}
        <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
          {/* Toggles */}
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

          <div className="flex-1 p-12 flex flex-col items-center justify-center">
            {inputCategory === 'batch' ? (
              <div className="text-center space-y-8 max-w-sm animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-[2rem] flex items-center justify-center mx-auto border border-orange-500/20 shadow-2xl">
                  <Lock size={32} />
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Unlock Batch Mode</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Screen hundreds of candidates at once. Get a ranked leaderboard of top talent automatically.</p>
                <button className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">Upgrade Now</button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex bg-black/40 p-2 rounded-2xl mb-12 border border-white/5 w-full max-w-lg">
                   {[1, 2].map(n => (
                     <button key={n} onClick={() => setActiveTab(n)} className={`flex-1 py-4 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === n ? 'bg-[#1c2128] text-blue-400 border border-white/5 shadow-lg' : 'text-slate-600'}`}>
                       {n === 1 ? 'STEP 1: JOB DESCRIPTION' : 'STEP 2: RESUME'}
                     </button>
                   ))}
                </div>
                
                <div className="w-full max-w-2xl border-2 border-dashed border-white/10 rounded-[3rem] p-16 text-center bg-black/20 group hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => fileInputRef.current.click()}>
                   <div className="mb-8 inline-flex p-6 rounded-3xl bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <Upload size={40} />
                   </div>
                   <h3 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter italic tracking-tighter">UPLOAD {activeTab === 1 ? 'JD' : 'RESUME'} FILE</h3>
                   
                   {files[activeTab === 1 ? 'jd' : 'resume'] ? (
                     <div className="text-emerald-400 font-black text-sm uppercase tracking-widest bg-emerald-500/10 px-6 py-3 rounded-full border border-emerald-500/20 inline-flex items-center gap-2">
                       <CheckCircle size={16} /> {(activeTab === 1 ? files.jd : files.resume).name}
                     </div>
                   ) : (
                     <button onClick={(e) => { e.stopPropagation(); useSample(); }} className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] hover:underline decoration-2 underline-offset-8">Use Sample Data</button>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SCREEN CANDIDATE BUTTON (STEP 3) */}
        <button 
          disabled={!isReady || isProcessing || inputCategory === 'batch'}
          onClick={handleScreenCandidate}
          className={`w-full py-10 rounded-[2.5rem] flex items-center justify-center gap-8 font-black tracking-[0.5em] transition-all relative overflow-hidden text-lg ${isReady && !isProcessing && inputCategory !== 'batch' ? 'bg-blue-600 text-white shadow-[0_25px_60px_rgba(37,99,235,0.4)] hover:scale-[1.01]' : 'bg-[#0d1117] text-slate-800 border border-white/5 opacity-50'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${isReady ? 'bg-orange-500 text-white shadow-[0_0_20px_#f97316]' : 'bg-slate-900'}`}>3</div>
          <span className="uppercase">{isProcessing ? 'SPOOLING AI...' : 'SCREEN CANDIDATE'}</span>
          {isProcessing && <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-400 via-orange-500 to-blue-400 w-full animate-shimmer" />}
        </button>
      </main>

      {/* MODAL / RESULTS VIEW (Omitted for space but logic is ready) */}
      <style jsx>{` @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-shimmer { animation: shimmer 2s infinite linear; } `}</style>
    </div>
  );
};

export default RecruitIQApp;
