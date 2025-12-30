import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, ArrowRight, FileText, Type, Loader2, BrainCircuit, RotateCcw, Target, AlertCircle, Info } from 'lucide-react';

const RecruitIQApp = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef(null);

  const isStepDone = (num) => {
    const type = num === 1 ? 'jd' : 'resume';
    return files[type] || textData[type].length > 50;
  };

  const isReady = isStepDone(1) && isStepDone(2);

  const handleScreenCandidate = () => {
    setIsProcessing(true);
    // This simulates the AI "Thinking" phase you saw on the black screen
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 3000);
  };

  // --- VIEW 1: THE RESULTS DASHBOARD ---
  if (showResults) {
    return (
      <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans flex justify-center">
        <div className="max-w-4xl w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Analysis <span className="text-blue-500">Report</span></h1>
            <button onClick={() => setShowResults(false)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg tracking-widest">
              <RotateCcw size={14} /> NEW SCREENING
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Gauge */}
            <div className="bg-[#0d1117] p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center shadow-xl">
              <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-4 text-center">Synergy Score</span>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * 0.82)}
                    className="text-blue-500 transition-all duration-1000" 
                  />
                </svg>
                <span className="absolute text-4xl font-black text-white italic">82<span className="text-blue-500 text-xl">%</span></span>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="md:col-span-2 bg-[#0d1117] p-8 rounded-3xl border border-white/5 flex flex-col justify-center">
              <h3 className="text-xs font-black text-orange-500 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <BrainCircuit size={16} /> AI Summary
              </h3>
              <p className="text-sm leading-relaxed text-slate-400 font-medium">
                The candidate is a <span className="text-white">High Match</span> for the technical requirements. Their background in <span className="text-blue-400">React and Cloud Architecture</span> aligns perfectly with the JD. <span className="text-orange-400 italic">Caution:</span> There is a minor gap in leadership years mentioned in the requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: THE MAIN INPUT SCREEN ---
  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans">
      <input type="file" ref={fileInputRef} onChange={(e) => setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.files[0] }))} className="hidden" />
      
      <main className="max-w-5xl mx-auto space-y-6">
        {/* Quick Start Top Bar */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-wrap md:flex-nowrap gap-8 items-center">
          <div className="flex items-center gap-3 pr-8 border-r border-white/5">
            <Zap size={20} className="text-blue-500" />
            <h2 className="text-white text-xs font-black tracking-widest uppercase italic">Guide</h2>
          </div>
          <div className="flex gap-8 flex-1">
            {['Input JD', 'Input Resume', 'Screen Candidate'].map((txt, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-blue-500/40 font-mono text-sm font-bold">0{i+1}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-[#0d1117] rounded-3xl border border-white/5 shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
          <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
            {[1, 2].map((num) => (
              <button key={num} onClick={() => setActiveTab(num)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all ${activeTab === num ? 'bg-[#1c2128] text-blue-400' : 'text-slate-600'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isStepDone(num) ? 'bg-emerald-500 text-white' : 'bg-slate-800'}`}>
                  {isStepDone(num) ? <CheckCircle size={12} /> : num}
                </div>
                {num === 1 ? 'JOB DESCRIPTION' : 'CANDIDATE RESUME'}
              </button>
            ))}
          </div>

          <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center mb-6">
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 italic uppercase">Drop {activeTab === 1 ? 'JD' : 'Resume'} File</h3>
            <div className="flex gap-4">
               <button onClick={() => fileInputRef.current.click()} className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black rounded-full hover:shadow-blue-500/40 transition-all uppercase tracking-widest">Select File</button>
               <button onClick={() => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: 'Sample Data Loaded...' }))} className="px-8 py-3 bg-white/5 text-slate-400 text-[10px] font-black rounded-full hover:bg-white/10 transition-all uppercase tracking-widest">Paste Text</button>
            </div>
          </div>
        </div>

        {/* Screen Candidate Button (Step 3) */}
        <button 
          disabled={!isReady || isProcessing}
          onClick={handleScreenCandidate}
          className={`w-full py-8 rounded-3xl flex items-center justify-center gap-5 font-black tracking-[0.4em] transition-all relative overflow-hidden ${isReady ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-slate-900 text-slate-800 border border-white/5'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isReady ? 'bg-orange-500 text-white shadow-[0_0_15px_#f97316]' : 'bg-slate-800'}`}>3</div>
          <span className="flex items-center gap-3 uppercase">
            {isProcessing ? <><Loader2 className="animate-spin" size={24} /> Spooling AI...</> : <><Sparkles size={20} className="text-orange-400" /> Screen Candidate</>}
          </span>
          {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-orange-500 w-full animate-shimmer" />}
        </button>
      </main>

      <style jsx>{` @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-shimmer { animation: shimmer 2s infinite linear; } `}</style>
    </div>
  );
};

export default RecruitIQApp;
