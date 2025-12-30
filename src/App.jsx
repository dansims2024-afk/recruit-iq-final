import React, { useState } from 'react';
import { Upload, Sparkles, FileText, Info, CheckCircle, Zap } from 'lucide-react';

const RecruitIQPro = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [activeTab, setActiveTab] = useState(1);

  const isReady = files.jd && files.resume;

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">RECRUIT <span className="text-blue-500">IQ</span></h1>
        </div>
        <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-white/5">
          <button className="px-5 py-2 text-xs font-bold bg-[#1c2128] text-white rounded-lg shadow-sm">FREE</button>
          <button className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors">PRO</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Action Zone */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0d1117]/80 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex bg-black/20 p-2 gap-2">
              {[1, 2].map((num) => (
                <button 
                  key={num}
                  onClick={() => setActiveTab(num)}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-3 text-xs font-bold transition-all duration-300 ${
                    activeTab === num ? 'bg-[#1c2128] text-blue-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    (num === 1 ? files.jd : files.resume) ? 'bg-emerald-500 text-white' : 'bg-slate-800'
                  }`}>
                    {(num === 1 ? files.jd : files.resume) ? <CheckCircle size={12} /> : num}
                  </div>
                  {num === 1 ? 'JOB DESCRIPTION' : 'CANDIDATE RESUME'}
                </button>
              ))}
            </div>

            <div className="p-10">
              {/* Dropzone */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-16 text-center bg-[#0a0d12] transition-colors hover:border-blue-500/40">
                  <div className="mb-6 inline-flex p-4 rounded-2xl bg-blue-500/5 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {activeTab === 1 ? 'Upload Job Description' : 'Upload Resume'}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">Select a PDF or Word document to begin</p>
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <button className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Browse Files</button>
                    <div className="w-px h-4 bg-white/10" />
                    <button className="text-slate-400 hover:text-white underline decoration-slate-700 underline-offset-4 transition-colors">Try a Sample</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            disabled={!isReady}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black tracking-widest transition-all duration-500 ${
              isReady 
              ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-[1.01]' 
              : 'bg-[#161b22] text-slate-600 cursor-not-allowed border border-white/5'
            }`}
          >
            <Sparkles size={20} className={isReady ? "animate-pulse" : ""} />
            RUN SYNERGY SCAN
          </button>
        </div>

        {/* Right: Info Panels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-[#161b22] to-[#0d1117] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Info size={120} />
            </div>
            <h2 className="text-blue-400 text-xs font-black tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Quick Start Guide
            </h2>
            <div className="space-y-6">
              {[
                { step: '01', text: 'Upload the Job Description to define the benchmark.', highlight: 'Job Description' },
                { step: '02', text: 'Provide your Resume to analyze the alignment.', highlight: 'Resume' },
                { step: '03', text: 'AI generates a Synergy Score and specific advice.', highlight: 'Synergy Score' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <span className="text-blue-500/40 font-mono text-sm group-hover:text-blue-500 transition-colors">{item.step}</span>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {item.text.split(item.highlight)[0]}
                    <span className="text-white font-semibold italic">{item.highlight}</span>
                    {item.text.split(item.highlight)[1]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-dashed border-white/10 bg-[#0d1117]/30">
            <h3 className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase mb-6">AI Capabilities</h3>
            <div className="grid grid-cols-2 gap-3">
              {['ATS Optimizer', 'Skill Gap Finder', 'Keyword Match', 'Interview Prep'].map(feat => (
                <div key={feat} className="px-4 py-3 rounded-xl bg-[#161b22] border border-white/5 text-[11px] font-bold text-slate-400 hover:text-white hover:border-blue-500/30 transition-all cursor-default">
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruitIQPro;
