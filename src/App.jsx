import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, ArrowRight, FileText, Type, Loader2, BrainCircuit, RotateCcw, Target, AlertCircle, X } from 'lucide-react';

const RecruitIQApp = () => {
  // --- STATE MANAGEMENT ---
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [mode, setMode] = useState({ 1: 'file', 2: 'file' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const fileInputRef = useRef(null);

  // --- LOGIC HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: file }));
  };

  const useSample = () => {
    const sample = { name: activeTab === 1 ? "Sample_JD.pdf" : "Sample_Resume.pdf", size: "1.4MB" };
    setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: sample }));
  };

  const isStepDone = (num) => {
    const type = num === 1 ? 'jd' : 'resume';
    return files[type] || textData[type].length > 50;
  };

  const isReady = isStepDone(1) && isStepDone(2);

  const handleScreenCandidate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResultsModal(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans relative">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      
      {/* 1. BRAND HEADER (Restored) */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
            RECRUIT <span className="text-blue-500">IQ</span>
          </h1>
        </div>
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/10 shadow-lg">
          <button className="px-4 py-1.5 text-[10px] font-bold bg-blue-600 text-white rounded-lg shadow-md">STANDARD (FREE)</button>
          <button className="px-4 py-1.5 text-[10px] font-bold text-slate-500 hover:text-white transition-colors">PRO ($29.99)</button>
        </div>
      </header>

      {/* 2. TOP QUICK START GUIDE (Restored) */}
      <main className={`max-w-5xl mx-auto space-y-6 transition-all duration-500 ${showResultsModal ? 'blur-xl opacity-50 scale-[0.98]' : ''}`}>
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center gap-8">
          <div className="flex items-center gap-3 pr-8 border-r border-white/5 text-orange-500">
            <h2 className="text-white text-[10px] font-black tracking-[0.2em] uppercase italic">Quick Start</h2>
          </div>
          <div className="flex gap-8 flex-1">
            {['Input JD', 'Input Resume', 'Screen Candidate'].map((txt, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <span className={`font-mono text-sm font-bold ${isStepDone(i + 1) || (i === 2 && isReady) ? 'text-blue-500' : 'text-slate-700'}`}>0{i+1}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. MAIN INPUT CARD (Active Features) */}
        <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[440px] flex flex-col">
          <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
            {[1, 2].map((num) => (
              <button key={num} onClick={() => setActiveTab(num)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all ${activeTab === num ? 'bg-[#1c2128] text-blue-400 shadow-lg' : 'text-slate-600'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isStepDone(num) ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800'}`}>
                  {isStepDone(num) ? <CheckCircle size={12} /> : num}
                </div>
                {num === 1 ? 'JOB DESCRIPTION' : 'CANDIDATE RESUME'}
              </button>
            ))}
          </div>

          <div className="p-10 flex-1 flex flex-col items-center justify-center text-center">
            {/* Mode Selector */}
            <div className="flex gap-3 mb-8">
              <button onClick={() => setMode(prev => ({ ...prev, [activeTab]: 'file' }))} className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${mode[activeTab] === 'file' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>FILE UPLOAD</button>
              <button onClick={() => setMode(prev => ({ ...prev, [activeTab]: 'text' }))} className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${mode[activeTab] === 'text' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>PASTE TEXT</button>
            </div>

            {mode[activeTab] === 'file' ? (
              <div className="w-full max-w-lg border-2 border-dashed border-white/5 rounded-3xl p-10 bg-black/10 group">
                <div className="mb-4 inline-flex p-5 rounded-2xl bg-blue-500/5 text-blue-500 group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                <h3 className="text-xl font-bold text-white mb-2 italic uppercase">Drop {activeTab === 1 ? 'JD' : 'Resume'} File</h3>
                {files[activeTab === 1 ? 'jd' : 'resume'] ? (
                  <p className="text-emerald-400 font-bold text-sm mb-6">{(activeTab === 1 ? files.jd : files.resume).name}</p>
                ) : (
                  <p className="text-slate-600 text-[10px] mb-8 uppercase tracking-widest">Select PDF or Word</p>
                )}
                <div className="flex justify-center gap-6">
                  <button onClick={() => fileInputRef.current.click()} className="text-blue-500 font-black text-xs hover:underline uppercase tracking-widest">Browse Files</button>
                  <div className="w-px h-4 bg-white/10" />
                  <button onClick={useSample} className="text-slate-500 font-black text-xs hover:text-white uppercase tracking-widest transition-colors">Try a Sample</button>
                </div>
              </div>
            ) : (
              <textarea 
                value={activeTab === 1 ? textData.jd : textData.resume}
                onChange={(e) => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.value }))}
                placeholder={`Paste the ${activeTab === 1 ? 'Job Description' : 'Resume'} text content here...`}
                className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-800 resize-none"
              />
            )}
          </div>
        </div>

        {/* 4. RE-DESIGNED SCREEN CANDIDATE BUTTON (With Number 3) */}
        <button 
          disabled={!isReady || isProcessing}
          onClick={handleScreenCandidate}
          className={`w-full py-8 rounded-[2.5rem] flex items-center justify-center gap-5 font-black tracking-[0.4em] transition-all relative overflow-hidden ${isReady && !isProcessing ? 'bg-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)]' : 'bg-[#0d1117] text-slate-800 border border-white/5 opacity-50'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isReady ? 'bg-orange-500 shadow-[0_0_15px_#f97316]' : 'bg-slate-800'}`}>3</div>
          <span className="flex items-center gap-3 uppercase">
            {isProcessing ? <><Loader2 className="animate-spin" size={24} /> Spooling AI...</> : <><Sparkles size={20} className="text-orange-400" /> Screen Candidate</>}
          </span>
          {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-orange-500 w-full animate-shimmer" />}
        </button>
      </main>

      {/* 5. FLOATING RESULTS MODAL (Final Goal) */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0d1117] w-full max-w-4xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-white/5">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Analysis <span className="text-blue-500">Report</span></h2>
              <button onClick={() => setShowResultsModal(false)} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X /></button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col items-center p-8 bg-black/40 rounded-3xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-4">Synergy Score</span>
                <div className="relative flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                    <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={452.4} strokeDashoffset={452.4 - (452.4 * 0.88)} className="text-blue-500 transition-all duration-1000" />
                  </svg>
                  <span className="absolute text-5xl font-black text-white italic">88<span className="text-blue-500 text-2xl">%</span></span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                  <h4 className="text-[10px] font-black text-blue-400 tracking-widest uppercase mb-4 flex items-center gap-2"><Target size={14} /> Match Profile</h4>
                  <div className="space-y-4">
                    {['Frontend (95%)', 'Backend (80%)', 'Cloud (70%)'].map(s => (
                      <div key={s} className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: s.split('(')[1].split(')')[0]}} /></div>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-500/5 p-6 rounded-3xl border border-orange-500/10 text-xs text-slate-400 font-medium">
                   <h4 className="text-orange-500 font-black mb-2 uppercase tracking-widest">AI Summary</h4>
                   Candidate is a strong match. Proceed to interview for architecture verification.
                </div>
              </div>
            </div>
            <div className="p-8 text-center bg-black/20 border-t border-white/5">
              <button onClick={() => setShowResultsModal(false)} className="px-10 py-3 bg-white/5 text-white font-black text-xs rounded-2xl transition-all uppercase tracking-widest">Close Report</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{` @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-shimmer { animation: shimmer 2s infinite linear; } `}</style>
    </div>
  );
};

export default RecruitIQApp;
