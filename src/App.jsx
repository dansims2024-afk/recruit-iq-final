import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, ArrowRight, FileText, Type } from 'lucide-react';

const RecruitIQFinal = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [mode, setMode] = useState({ 1: 'file', 2: 'file' }); // 'file' or 'text'
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: file }));
  };

  const toggleMode = (tabNum, newMode) => {
    setMode(prev => ({ ...prev, [tabNum]: newMode }));
  };

  // Check if step is complete (either file exists or text is pasted)
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
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/10">
          <button className="px-4 py-1.5 text-[10px] font-bold bg-blue-600 text-white rounded-lg shadow-md">FREE</button>
          <button className="px-4 py-1.5 text-[10px] font-bold text-slate-500 hover:text-white transition-colors">PRO ($29.99)</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP SECTION: Quick Start (Branded Orange) */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-orange-500 text-xs font-black tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]" />
            Quick Start Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Input JD', desc: 'Upload file or paste text' },
              { num: '02', title: 'Input Resume', desc: 'Add candidate details' },
              { num: '03', title: 'Screen Candidate', desc: 'Get your synergy score' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-blue-500/40 font-mono text-lg font-black">{step.num}</span>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">{step.title}</h3>
                </div>
                <p className="text-slate-400 text-xs pl-8">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interaction Zone */}
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-[#0d1117] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
            {/* Step Tabs */}
            <div className="flex bg-black/40 p-1.5 gap-1.5 border-b border-white/5">
              {[1, 2].map((num) => (
                <button 
                  key={num}
                  onClick={() => setActiveTab(num)}
                  className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all ${
                    activeTab === num ? 'bg-[#1c2128] text-blue-400 ring-1 ring-white/10' : 'text-slate-600'
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

            {/* Input Content */}
            <div className="p-8">
              {/* Mode Selector (File vs Text) */}
              <div className="flex justify-center gap-4 mb-8">
                <button 
                  onClick={() => toggleMode(activeTab, 'file')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${mode[activeTab] === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  <Upload size={14} /> UPLOAD FILE
                </button>
                <button 
                  onClick={() => toggleMode(activeTab, 'text')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${mode[activeTab] === 'text' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  <Type size={14} /> PASTE TEXT
                </button>
              </div>

              {mode[activeTab] === 'file' ? (
                <div className="border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center bg-black/20 hover:border-blue-500/40 transition-all group">
                  <div className="mb-4 inline-flex p-5 rounded-3xl bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter italic">
                    {activeTab === 1 ? 'Drop JD File' : 'Drop Resume File'}
                  </h3>
                  {files[activeTab === 1 ? 'jd' : 'resume'] ? (
                    <p className="text-emerald-400 font-bold text-sm mb-6">{(activeTab === 1 ? files.jd : files.resume).name}</p>
                  ) : (
                    <p className="text-slate-500 text-[10px] mb-8 uppercase tracking-widest">PDF • DOCX • TXT</p>
                  )}
                  <div className="flex justify-center gap-4">
                    <button onClick={() => fileInputRef.current.click()} className="px-8 py-2.5 bg-blue-600 text-white text-xs font-black rounded-full hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
                      SELECT FILE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <textarea 
                    value={textData[activeTab === 1 ? 'jd' : 'resume']}
                    onChange={(e) => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.value }))}
                    placeholder={activeTab === 1 ? "Paste the full job description here..." : "Paste the candidate's resume text here..."}
                    className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-700 resize-none"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    {textData[activeTab === 1 ? 'jd' : 'resume'].length} Characters
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <button 
            disabled={!isReady}
            className={`w-full py-6 rounded-3xl flex items-center justify-center gap-4 font-black tracking-[0.4em] transition-all duration-700 ${
              isReady 
              ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-[0_20px_60px_rgba(37,99,235,0.3)] hover:scale-[1.01]' 
              : 'bg-[#0d1117] text-slate-800 cursor-not-allowed border border-white/5 opacity-40'
            }`}
          >
            <Sparkles size={20} className={isReady ? "text-orange-400 animate-pulse" : ""} />
            SCREEN CANDIDATE
            <ArrowRight size={18} className={isReady ? "translate-x-0" : "opacity-0"} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default RecruitIQFinal;
