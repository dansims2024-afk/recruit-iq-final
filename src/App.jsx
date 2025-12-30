import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, ArrowRight, FileText, Type, BrainCircuit, Loader2 } from 'lucide-react';

const RecruitIQFinal = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [mode, setMode] = useState({ 1: 'file', 2: 'file' });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: file }));
  };

  const handleScreenCandidate = () => {
    setIsProcessing(true);
    // Simulate AI Spooling
    setTimeout(() => {
      setIsProcessing(false);
      alert("Analysis Complete!");
    }, 4000);
  };

  const isStepDone = (num) => {
    const type = num === 1 ? 'jd' : 'resume';
    return files[type] || textData[type].length > 50;
  };

  const isReady = isStepDone(1) && isStepDone(2);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)]">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Recruit <span className="text-blue-500">IQ</span></h1>
        </div>
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/10 shadow-lg">
          <button className="px-4 py-1.5 text-[10px] font-bold bg-blue-600 text-white rounded-lg shadow-md">STANDARD (FREE)</button>
          <button className="px-4 py-1.5 text-[10px] font-bold text-slate-500 hover:text-white transition-colors">PRO ($29.99)</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        
        {/* Quick Start Guide */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl" />
          <h2 className="text-orange-500 text-xs font-black tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]" />
            Quick Start Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Input JD', desc: 'File or Text' },
              { num: '02', title: 'Input Resume', desc: 'Candidate info' },
              { num: '03', title: 'Screen Candidate', desc: 'Get Analysis' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-1 group">
                <div className="flex items-center gap-3">
                  <span className="text-blue-500/40 font-mono text-lg font-black group-hover:text-blue-400 transition-colors">{step.num}</span>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">{step.title}</h3>
                </div>
                <p className="text-slate-400 text-xs pl-8">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-[#0d1117] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
            {[1, 2].map((num) => (
              <button 
                key={num}
                onClick={() => setActiveTab(num)}
                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all duration-300 ${
                  activeTab === num ? 'bg-[#1c2128] text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'text-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isStepDone(num) ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-800'
                }`}>
                  {isStepDone(num) ? <CheckCircle size={12} /> : num}
                </div>
                {num === 1 ? 'JOB DESCRIPTION' : 'CANDIDATE RESUME'}
              </button>
            ))}
          </div>

          <div className="p-8">
            <div className="flex justify-center gap-4 mb-8">
              <button 
                onClick={() => setMode(prev => ({ ...prev, [activeTab]: 'file' }))}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${mode[activeTab] === 'file' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <Upload size={14} /> UPLOAD FILE
              </button>
              <button 
                onClick={() => setMode(prev => ({ ...prev, [activeTab]: 'text' }))}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${mode[activeTab] === 'text' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <Type size={14} /> PASTE TEXT
              </button>
            </div>

            {mode[activeTab] === 'file' ? (
              <div className="border-2 border-dashed border-white/5 rounded-[2.5rem] p-12 text-center bg-black/20 hover:border-blue-500/40 transition-all group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <div className="mb-4 inline-flex p-6 rounded-3xl bg-blue-600/10 text-blue-500 group-hover:scale-110 transition-transform duration-500">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase italic tracking-tighter">
                  Drop {activeTab === 1 ? 'JD' : 'Resume'} File Here
                </h3>
                {files[activeTab === 1 ? 'jd' : 'resume'] ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-400/5 px-4 py-2 rounded-full inline-block mx-auto">
                    <FileText size={16} />
                    {(activeTab === 1 ? files.jd : files.resume).name}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Click to browse your files</p>
                )}
              </div>
            ) : (
              <textarea 
                value={textData[activeTab === 1 ? 'jd' : 'resume']}
                onChange={(e) => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.value }))}
                placeholder={`Paste the ${activeTab === 1 ? 'Job Description' : 'Resume'} text content here...`}
                className="w-full h-56 bg-black/40 border border-white/10 rounded-3xl p-8 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-700 resize-none transition-all"
              />
            )}
          </div>
        </div>

        {/* Action Button with Number 3 and Spooling */}
        <div className="relative group">
          <button 
            disabled={!isReady || isProcessing}
            onClick={handleScreenCandidate}
            className={`w-full py-7 rounded-[2rem] flex items-center justify-center gap-5 font-black tracking-[0.4em] transition-all duration-700 relative overflow-hidden ${
              isReady && !isProcessing
              ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-[0_20px_60px_rgba(37,99,235,0.4)] hover:scale-[1.01] hover:shadow-blue-500/60' 
              : 'bg-[#0d1117] text-slate-800 cursor-not-allowed border border-white/5'
            }`}
          >
            {/* The Badge Number 3 */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
              isReady ? 'bg-orange-500 text-white shadow-[0_0_15px_#f97316]' : 'bg-slate-800 text-slate-600'
            }`}>
              3
            </div>

            <span className="flex items-center gap-3">
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin text-blue-300" size={24} />
                  SPOOLING AI...
                </>
              ) : (
                <>
                  <Sparkles size={20} className={isReady ? "text-orange-400 animate-pulse" : ""} />
                  SCREEN CANDIDATE
                </>
              )}
            </span>
            
            {/* Animated Spooling Bar */}
            {isProcessing && (
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 via-blue-400 to-orange-500 w-full animate-shimmer" />
            )}
          </button>
        </div>
      </main>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default RecruitIQFinal;
