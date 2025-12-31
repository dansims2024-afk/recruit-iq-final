import React, { useState, useRef } from 'react';
import { 
  Upload, CheckCircle, FileText, BrainCircuit, Target, Lock, 
  Search, BookOpen, X, ShieldCheck, Layers, Printer, 
  Zap, ListChecks, Loader2, Sparkles, HelpCircle, TrendingUp, AlertCircle
} from 'lucide-react';

const RecruitIQApp = () => {
  // --- STATE ---
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const fileInputRef = useRef(null);

  // --- SAMPLE DATA HANDLER ---
  const useSample = () => {
    setTextData({
      jd: `SENIOR PRODUCT MANAGER - AI PLATFORM\n\nKey Requirements:\n- 8+ years experience in technical PM roles.\n- Direct experience with LLM orchestration and MLOps.\n- Proficiency in SQL, Python, and Data Visualization.\n- Experience in Series B+ high-growth environments.`,
      resume: `ALEX R. CANDIDATE\n\nProfessional Summary:\nTechnical Product Leader with 6.5 years experience.\n\nKey Achievements:\n- Led OpenAI bot transition at TechFlow, reducing latency by 40%.\n- Managed SQL enterprise analytics dashboards at DataSync.\n- Technical Skills: Python, AWS, S3, LLM Fine-tuning.`
    });
  };

  const handleScreenCandidate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResultsModal(true);
    }, 2500);
  };

  const isReady = textData.jd.length > 50 && textData.resume.length > 50;

  // --- BRAND LOGO ---
  const SwirlLogo = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <defs>
        <linearGradient id="swirlGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M20 4C11.1 4 4 11.1 4 20C4 28.8 11.1 36 20 36" stroke="url(#swirlGrad)" strokeWidth="6" strokeLinecap="round" />
      <path d="M36 20C36 11.1 28.8 4 20 4" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      <path d="M20 36C28.8 36 36 28.8 36 20" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans relative overflow-x-hidden">
      
      {/* 1. HEADER (Always Visible) */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 no-print">
        <div className="flex items-center gap-4">
          <SwirlLogo />
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">RECRUIT <span className="text-blue-500">IQ</span></h1>
        </div>
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/10 shadow-xl">
          <button className="px-6 py-2 text-[10px] font-black bg-blue-600 text-white rounded-lg shadow-lg">STANDARD (FREE)</button>
          <button className="px-6 py-2 text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-widest uppercase">Pro ($29.99)</button>
        </div>
      </header>

      {/* 2. MAIN DASHBOARD UI */}
      {!showResultsModal && (
        <main className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
          {/* Step Guide Bar */}
          <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
            <h2 className="text-orange-500 text-[10px] font-black tracking-[0.3em] uppercase italic border-r border-white/10 pr-10">Step Guide</h2>
            <div className="flex gap-12 flex-1 justify-center">
              {['Input JD', 'Input Resume', 'Screen Candidate'].map((txt, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className={`font-mono text-sm font-bold ${isReady || (i === 0 && textData.jd.length > 50) ? 'text-blue-500' : 'text-slate-800'}`}>0{i+1}</span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{txt}</span>
                </div>
              ))}
            </div>
            <button onClick={useSample} className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest border border-blue-500/20">
              Try Full Sample
            </button>
          </div>

          {/* Dual Input Panels */}
          <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[450px]">
            <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
              {[1, 2].map((num) => (
                <button key={num} onClick={() => setActiveTab(num)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all ${activeTab === num ? 'bg-[#1c2128] text-blue-400 border border-white/5 shadow-lg' : 'text-slate-600'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${num === 1 ? (textData.jd.length > 50 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800') : (textData.resume.length > 50 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800')}`}>
                    {num}
                  </div>
                  {num === 1 ? 'JOB DESCRIPTION' : 'CANDIDATE RESUME'}
                </button>
              ))}
            </div>

            <div className="p-8 flex-1">
              <textarea 
                value={activeTab === 1 ? textData.jd : textData.resume}
                onChange={(e) => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.value }))}
                placeholder={`Paste the ${activeTab === 1 ? 'Job Description' : 'Resume'} text content here...`}
                className="w-full h-full min-h-[280px] bg-black/20 border border-white/5 rounded-[2rem] p-8 text-sm text-slate-400 focus:outline-none focus:border-blue-500/50 resize-none font-mono transition-all placeholder:text-slate-800"
              />
            </div>
          </div>

          {/* Action Button */}
          <button 
            disabled={!isReady || isProcessing}
            onClick={handleScreenCandidate}
            className={`w-full py-10 rounded-[2.5rem] flex items-center justify-center gap-8 font-black tracking-[0.5em] transition-all relative overflow-hidden text-lg ${isReady && !isProcessing ? 'bg-blue-600 text-white shadow-[0_25px_60px_rgba(37,99,235,0.4)]' : 'bg-[#0d1117] text-slate-800 border border-white/5 opacity-50'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${isReady ? 'bg-orange-500 text-white shadow-[0_0_20px_#f97316]' : 'bg-slate-900'}`}>3</div>
            <span className="uppercase">{isProcessing ? 'SPOOLING AI...' : 'SCREEN CANDIDATE'}</span>
            {isProcessing && <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-400 via-orange-500 to-blue-400 w-full animate-shimmer" />}
          </button>
        </main>
      )}

      {/* 3. THE PDF REPORT MODAL (Full Depth & Bottom Table) */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10 bg-black/95 backdrop-blur-3xl overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-none md:rounded-[3rem] shadow-2xl flex flex-col print:shadow-none print:m-0">
            
            <div className="bg-slate-100 px-10 py-6 flex justify-between items-center no-print border-b border-slate-200">
               <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Comprehensive Assessment</span>
               <div className="flex gap-3">
                 <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
                    <Printer size={14} /> Save Report as PDF
                 </button>
                 <button onClick={() => setShowResultsModal(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
               </div>
            </div>

            <div className="p-16 print:p-10 flex-1">
              <div className="flex justify-between items-start border-b-[6px] border-slate-900 pb-10 mb-10">
                <div className="flex items-center gap-4">
                  <SwirlLogo size={40} />
                  <h1 className="text-2xl font-black tracking-tighter italic uppercase">RECRUIT <span className="text-blue-600">IQ</span></h1>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-black italic text-blue-600 leading-none">88%</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Overall Match Score</p>
                </div>
              </div>

              {/* Analysis Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                 <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2rem]">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2"><TrendingUp size={14} /> Match Strengths</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">Candidate is a Tier-1 match for AI Infrastructure. Direct evidence of LLM orchestration and MLOps at scale matches our Series B trajectory.</p>
                 </div>
                 <div className="p-8 bg-orange-50/50 border border-orange-100 rounded-[2rem]">
                    <h4 className="text-[10px] font-black text-orange-600 uppercase mb-3 flex items-center gap-2"><AlertCircle size={14} /> Gap Mitigation</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"Management tenure is 6.5 years vs 8 preferred. Recommend verifying cross-functional leadership depth during the technical round."</p>
                 </div>
              </div>

              {/* Technical Evidence Matrix (Bottom Table) */}
              <div className="mb-12">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ListChecks size={16} className="text-blue-600" /> Technical Evidence Matrix
                </h3>
                <div className="border border-slate-200 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white text-[9px] uppercase tracking-widest font-black">
                      <tr><th className="px-6 py-4">Requirement</th><th className="px-6 py-4">Resume Evidence</th><th className="px-6 py-4 text-center">Match</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                      <tr><td className="px-6 py-5 uppercase">AI / LLM Integration</td><td className="px-6 py-5 font-normal">Led OpenAI bot transition at TechFlow</td><td className="px-6 py-5 text-center text-blue-600">100%</td></tr>
                      <tr><td className="px-6 py-5 uppercase">SQL / Python</td><td className="px-6 py-5 font-normal">Managed enterprise analytics dashboards</td><td className="px-6 py-5 text-center text-blue-600">100%</td></tr>
                      <tr><td className="px-6 py-5 uppercase">Cloud (AWS/S3)</td><td className="px-6 py-5 font-normal">Orchestrated S3 Data Lakes at DataSync</td><td className="px-6 py-5 text-center text-blue-600">90%</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interview Strategy */}
              <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] mt-12 grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technical Validation</h4>
                  <p className="text-[11px] text-slate-300 font-medium italic leading-relaxed">"Ask them to diagram their migration from monolith to microservices—focus on data integrity during the cutover."</p>
                </div>
                <div className="space-y-4 text-right">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recruitment Audit</h4>
                   <div className="flex items-center justify-end gap-2 mt-4">
                    <SwirlLogo size={24} />
                    <span className="text-sm font-black tracking-tighter uppercase italic text-white">RECRUIT <span className="text-blue-500">IQ</span></span>
                   </div>
                   <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-2">{new Date().toLocaleDateString()} • Confidential Document</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .fixed { position: static !important; }
          .bg-black\/95 { background: transparent !important; }
        }
      `}</style>
    </div>
  );
};

export default RecruitIQApp;
