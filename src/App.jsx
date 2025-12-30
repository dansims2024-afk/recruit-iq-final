import React, { useState } from 'react';
import { Upload, Sparkles, CheckCircle, Zap, ArrowRight } from 'lucide-react';

const RecruitIQStreamlined = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [activeTab, setActiveTab] = useState(1);

  const isReady = files.jd && files.resume;

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase">Recruit <span className="text-blue-500">IQ</span></h1>
        </div>
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/5">
          <button className="px-4 py-1.5 text-[10px] font-bold bg-[#1c2128] text-white rounded-lg">STANDARD (FREE)</button>
          <button className="px-4 py-1.5 text-[10px] font-bold text-slate-500 hover:text-white transition-colors">PRO ($29.99)</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP SECTION: Horizontal Quick Start Guide */}
        <div className="bg-[#0d1117]/50 border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-blue-400 text-xs font-black tracking-[0.2em] uppercase">Quick Start Guide</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { num: '01', title: 'Upload JD', desc: 'Define your target benchmark' },
              { num: '02', title: 'Upload Resume', desc: 'Provide candidate data' },
              { num: '03', title: 'Get Synergy Score', desc: 'View AI-powered analysis' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-2 relative">
                <div className="flex items-center gap-3">
                  <span className="text-blue-500/30 font-mono text-lg font-bold">{step.num}</span>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wide">{step.title}</h3>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed pl-8">{step.desc}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1 text-slate-800" size={16} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION: Main Interaction Zone */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-[#0d1117] rounded-3xl border border-white/5 shadow-2xl overflow-hidden mb-6">
            {/* Tabs */}
            <div className="flex bg-black/20 p-2 gap-2">
              {[1, 2].map((num) => (
                <button 
                  key={num}
                  onClick={() => setActiveTab(num)}
                  className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold transition-all duration-300 ${
                    activeTab === num ? 'bg-[#1c2128] text-blue-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    (num === 1 ? files.jd : files.resume) ? 'bg-emerald-500 text-white' : 'bg-slate-800'
                  }`}>
                    {(num === 1 ? files.jd : files.resume) ? <CheckCircle size={12} /> : num}
                  </div>
                  {num === 1 ? 'UPLOAD JOB DESCRIPTION' : 'UPLOAD RESUME'}
                </button>
              ))}
            </div>

            {/* Dropzone Content */}
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto py-10 border-2 border-dashed border-white/10 rounded-3xl hover:border-blue-500/40 transition-colors group cursor-pointer bg-black/10">
                <div className="mb-6 inline-flex p-4 rounded-2xl bg-blue-500/5 text-blue-500 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Drop {activeTab === 1 ? 'Job Description' : 'Resume'} here
                </h3>
                <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest font-medium">Support PDF, DOCX or TXT</p>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <button className="text-blue-400 font-bold hover:text-blue-300">Browse Files</button>
                  <div className="w-px h-4 bg-white/10" />
                  <button className="text-slate-400 hover:text-white underline decoration-slate-700 underline-offset-4">Try a Sample</button>
                </div>
              </div>
            </div>
          </div>

          {/* Large Action Button */}
          <button 
            disabled={!isReady}
            className={`w-full py-6 rounded-3xl flex items-center justify-center gap-3 font-black tracking-[0.2em] transition-all duration-500 ${
              isReady 
              ? 'bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.25)] hover:bg-blue-500' 
              : 'bg-[#161b22] text-slate-700 cursor-not-allowed border border-white/5 opacity-50'
            }`}
          >
            <Sparkles size={20} />
            RUN SYNERGY SCAN
          </button>
        </div>
      </main>
    </div>
  );
};

export default RecruitIQStreamlined;
