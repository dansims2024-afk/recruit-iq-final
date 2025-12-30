import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, ArrowRight, FileText, Type, Loader2, BrainCircuit, RotateCcw, Target, AlertCircle } from 'lucide-react';

const RecruitIQProduction = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [mode, setMode] = useState({ 1: 'file', 2: 'file' });
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
    // Simulate AI thinking time
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 3500);
  };

  const resetAnalysis = () => {
    setShowResults(false);
    setFiles({ jd: null, resume: null });
    setTextData({ jd: "", resume: "" });
  };

  // --- RESULTS VIEW COMPONENT ---
  if (showResults) {
    return (
      <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Result Header */}
          <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">Screening <span className="text-blue-500">Report</span></h1>
              <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mt-2">Candidate: Senior Developer Match</p>
            </div>
            <button onClick={resetAnalysis} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg">
              <RotateCcw size={14} /> NEW SCREENING
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Synergy Score Gauge */}
            <div className="bg-[#0d1117] p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-orange-500" />
              <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-4">Synergy Score</span>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * 0.85)}
                    className="text-blue-500 transition-all duration-1000 ease-out" 
                  />
                </svg>
                <span className="absolute text-4xl font-black text-white italic">85<span className="text-blue-500 text-xl">%</span></span>
              </div>
              <p className="text-emerald-400 text-[10px] font-bold mt-4 tracking-widest uppercase">Strong Alignment</p>
            </div>

            {/* Quick Stats */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-[#0d1117] p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3 text-blue-400 mb-2">
                  <Target size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Skill Match</span>
                </div>
                <div className="space-y-3 mt-4">
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[90%]" /></div>
                   <div className="flex justify-between text-[10px] font-bold uppercase"><span className="text-slate-500">Technical</span><span>90%</span></div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-[75%]" /></div>
                   <div className="flex justify-between text-[10px] font-bold uppercase"><span className="text-slate-500">Experience</span><span>75%</span></div>
                </div>
              </div>
              <div className="bg-[#0d1117] p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                <div className="flex items-center gap-3 text-orange-500 mb-2">
                  <AlertCircle size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Key Gaps</span>
                </div>
                <ul className="text-[11px] font-bold text-slate-300 space-y-2 uppercase tracking-tight">
                  <li className="flex items-start gap-2">• AWS Architecture Cert</li>
                  <li className="flex items-start gap-2">• Lead Experience (1yr Short)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="bg-[#0d1117] p-8 rounded-3xl border border-white/5 relative">
            <h3 className="text-xs font-black text-blue-400 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <BrainCircuit size={16} /> AI Recommendations
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              This candidate demonstrates exceptional technical proficiency in <span className="text-white font-bold">React and Node.js</span>, matching 95% of the JD's stack requirements. However, their management experience is slightly below the 5-year benchmark. <span className="text-orange-400 italic">Recommendation:</span> Focus interview questions on their ability to mentor junior staff and handle project architecture decisions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN SCREENING INPUT VIEW ---
  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans">
      <input type="file" ref={fileInputRef} onChange={(e) => setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.files[0] }))} className="hidden" />
      
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Header and Input Card omitted for brevity but remain the same as previous step... */}
        {/* [Insert Header and Input Card logic here from previous code] */}

        {/* The Action Button with Step 3 */}
        <button 
          disabled={!isReady || isProcessing}
          onClick={handleScreenCandidate}
          className={`w-full py-7 rounded-[2rem] flex items-center justify-center gap-5 font-black tracking-[0.4em] transition-all relative overflow-hidden ${
            isReady && !isProcessing
            ? 'bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-[1.01]' 
            : 'bg-[#0d1117] text-slate-800 cursor-not-allowed border border-white/5 opacity-50'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isReady ? 'bg-orange-500 shadow-[0_0_15px_#f97316]' : 'bg-slate-800'}`}>3</div>
          <span className="flex items-center gap-3 uppercase">
            {isProcessing ? <><Loader2 className="animate-spin" size={20} /> Spooling AI...</> : <><Sparkles size={20} className="text-orange-400" /> Screen Candidate</>}
          </span>
          {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-orange-500 w-full animate-shimmer" />}
        </button>
      </main>
      
      <style jsx>{` @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-shimmer { animation: shimmer 2s infinite linear; } `}</style>
    </div>
  );
};

export default RecruitIQProduction;
