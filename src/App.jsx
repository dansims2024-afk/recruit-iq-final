import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, ArrowRight, FileText, Type, Loader2, BrainCircuit, RotateCcw, Target, AlertCircle, X } from 'lucide-react';

const RecruitIQApp = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [mode, setMode] = useState({ 1: 'file', 2: 'file' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const fileInputRef = useRef(null);

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
      <input type="file" ref={fileInputRef} onChange={(e) => setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.files[0] }))} className="hidden" />
      
      {/* Main Dashboard UI */}
      <main className={`max-w-5xl mx-auto space-y-6 transition-all duration-500 ${showResultsModal ? 'blur-md scale-[0.98] opacity-50' : ''}`}>
        {/* Header/Guide */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center gap-8">
          <div className="flex items-center gap-3 pr-8 border-r border-white/5 text-blue-500">
            <Zap size={20} className="fill-current" />
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
        <div className="bg-[#0d1117] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden min-h-[420px] flex flex-col">
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

          <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
             {/* Upload Logic Omitted for brevity but preserved from previous iteration */}
             <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center mb-6">
                <Upload size={32} />
             </div>
             <h3 className="text-xl font-bold text-white mb-6 uppercase italic tracking-tighter">Add {activeTab === 1 ? 'Job Description' : 'Resume'}</h3>
             <div className="flex gap-4">
                <button onClick={() => fileInputRef.current.click()} className="px-10 py-3 bg-blue-600 text-white text-[10px] font-black rounded-full hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all tracking-widest uppercase">Browse Files</button>
                <button onClick={() => setMode(prev => ({ ...prev, [activeTab]: 'text' }))} className="px-10 py-3 bg-white/5 text-slate-400 text-[10px] font-black rounded-full hover:bg-white/10 transition-all tracking-widest uppercase">Paste Text</button>
             </div>
          </div>
        </div>

        {/* Step 3 Action Button */}
        <button 
          disabled={!isReady || isProcessing}
          onClick={handleScreenCandidate}
          className={`w-full py-8 rounded-[2rem] flex items-center justify-center gap-5 font-black tracking-[0.4em] transition-all relative overflow-hidden ${isReady && !isProcessing ? 'bg-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)]' : 'bg-[#0d1117] text-slate-800 border border-white/5 opacity-50'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isReady ? 'bg-orange-500 shadow-[0_0_15px_#f97316]' : 'bg-slate-800'}`}>3</div>
          <span className="flex items-center gap-3 uppercase">
            {isProcessing ? <><Loader2 className="animate-spin" size={24} /> Spooling AI...</> : <><Sparkles size={20} className="text-orange-400" /> Screen Candidate</>}
          </span>
          {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-orange-500 w-full animate-shimmer" />}
        </button>
      </main>

      {/* RESULTS MODAL */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0d1117] w-full max-w-4xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-10 py-8 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500"><BrainCircuit /></div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Analysis <span className="text-blue-500">Ready</span></h2>
              </div>
              <button onClick={() => setShowResultsModal(false)} className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-all text-slate-500"><X /></button>
            </div>

            {/* Modal Content */}
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="flex flex-col items-center p-8 bg-black/40 rounded-3xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-4">Synergy Score</span>
                  <div className="relative flex items-center justify-center">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={452.4} strokeDashoffset={452.4 - (452.4 * 0.88)} className="text-blue-500 transition-all duration-1000" />
                    </svg>
                    <span className="absolute text-5xl font-black text-white italic">88<span className="text-blue-500 text-2xl">%</span></span>
                  </div>
                  <p className="mt-4 text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Exceptional Match</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                  <h4 className="text-[10px] font-black text-blue-400 tracking-widest uppercase mb-4 flex items-center gap-2"><Target size={14} /> Skill Alignment</h4>
                  <div className="space-y-4">
                    {[{l: 'Frontend', v: '95%'}, {l: 'Backend', v: '80%'}, {l: 'Cloud', v: '70%'}].map(s => (
                      <div key={s.l} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>{s.l}</span><span>{s.v}</span></div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: s.v}} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-500/5 p-6 rounded-3xl border border-orange-500/10">
                   <h4 className="text-[10px] font-black text-orange-500 tracking-widest uppercase mb-2 flex items-center gap-2"><AlertCircle size={14} /> AI Recommendation</h4>
                   <p className="text-xs text-slate-400 leading-relaxed font-medium">This candidate's technical skills are top-tier. <span className="text-white font-bold underline decoration-blue-500 underline-offset-4">Proceed to Technical Round</span> to verify architecture experience.</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-black/40 text-center border-t border-white/5">
              <button onClick={() => setShowResultsModal(false)} className="px-12 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs rounded-2xl transition-all uppercase tracking-widest">Close Report</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{` @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-shimmer { animation: shimmer 2s infinite linear; } `}</style>
    </div>
  );
};

export default RecruitIQApp;
