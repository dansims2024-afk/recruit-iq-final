import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, ArrowRight, FileText } from 'lucide-react';

const RecruitIQBranded = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef(null);

  // 1. FIX: Real File Upload Logic
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: file }));
    }
  };

  // 2. FIX: Sample Button Logic
  const injectSample = () => {
    const sample = { name: activeTab === 1 ? "Sample_Job_Description.pdf" : "Sample_Resume.pdf", size: "1.2MB" };
    setFiles(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: sample }));
  };

  const isReady = files.jd && files.resume;

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

      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP SECTION: Branded Quick Start */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl" />
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-orange-500 text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]" />
              Quick Start Guide
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Upload JD', desc: 'Define your target benchmark', color: 'text-blue-500' },
              { num: '02', title: 'Upload Resume', desc: 'Provide candidate data', color: 'text-blue-500' },
              { num: '03', title: 'Get Synergy', desc: 'View AI-powered analysis', color: 'text-orange-500' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-1 group">
                <div className="flex items-center gap-3">
                  <span className={`${step.color} font-mono text-lg font-black opacity-40 group-hover:opacity-100 transition-opacity`}>{step.num}</span>
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
            {/* Tabs */}
            <div className="flex bg-black/40 p-1.5 gap-1.5">
              {[1, 2].map((num) => (
                <button 
                  key={num}
                  onClick={() => setActiveTab(num)}
                  className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all duration-300 ${
                    activeTab === num ? 'bg-[#1c2128] text-blue-400 ring-1 ring-white/10' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    (num === 1 ? files.jd : files.resume) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-800'
                  }`}>
                    {(num === 1 ? files.jd : files.resume) ? <CheckCircle size={12} className="text-white" /> : num}
                  </div>
                  {num === 1 ? 'STEP 1: JOB DESCRIPTION' : 'STEP 2: RESUME'}
                </button>
              ))}
            </div>

            {/* Dropzone */}
            <div className="p-10">
              <div className="border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center bg-black/20 hover:border-blue-500/40 transition-all group relative">
                <div className="mb-6 inline-flex p-5 rounded-3xl bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 italic uppercase tracking-tighter">
                  Drop {activeTab === 1 ? 'Job Description' : 'Resume'}
                </h3>
                
                {/* File Status Display */}
                {(activeTab === 1 ? files.jd : files.resume) ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm mb-6 animate-in fade-in zoom-in duration-300">
                    <FileText size={16} />
                    {(activeTab === 1 ? files.jd : files.resume).name}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[10px] mb-8 uppercase tracking-[0.3em] font-black opacity-50">PDF • DOCX • TXT</p>
                )}

                <div className="flex items-center justify-center gap-6">
                  <button onClick={() => fileInputRef.current.click()} className="px-6 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white text-xs font-black rounded-full transition-all border border-blue-600/20">
                    BROWSE FILES
                  </button>
                  <button onClick={injectSample} className="text-slate-500 hover:text-orange-500 text-xs font-black underline decoration-slate-800 underline-offset-8 uppercase tracking-widest transition-all">
                    Try Sample
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Branded Action Button */}
          <button 
            disabled={!isReady}
            className={`w-full py-6 rounded-3xl flex items-center justify-center gap-4 font-black tracking-[0.3em] transition-all duration-700 group ${
              isReady 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-[1.01] hover:shadow-blue-500/50' 
              : 'bg-[#0d1117] text-slate-800 cursor-not-allowed border border-white/5'
            }`}
          >
            <Sparkles size={20} className={isReady ? "text-orange-400 animate-spin-slow" : ""} />
            RUN SYNERGY SCAN
            <ArrowRight size={18} className={`transition-transform duration-300 ${isReady ? "group-hover:translate-x-2" : "opacity-0"}`} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default RecruitIQBranded;
