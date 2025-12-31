import React, { useState, useRef } from 'react';
import { 
  Upload, CheckCircle, FileText, BrainCircuit, Target, Lock, 
  Search, BookOpen, X, ShieldCheck, Layers, Wand2, Printer, 
  Zap, BarChart3, AlertCircle, TrendingUp, HelpCircle, ListChecks, Loader2, Sparkles
} from 'lucide-react';

const RecruitIQApp = () => {
  // --- STATE ---
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const fileInputRef = useRef(null);

  // --- SAMPLE DATA ---
  const useSample = () => {
    setTextData({
      jd: `SENIOR PRODUCT MANAGER - AI PLATFORM\n- 8+ years experience\n- LLM integrations\n- SQL, Python\n- Series B+ growth experience`,
      resume: `ALEX R. CANDIDATE\n- 6.5 years AI/ML scaling\n- Led OpenAI bot transition @ TechFlow\n- SQL Dashboarding @ DataSync\n- Python, AWS, LLMs`
    });
  };

  const handleScreenCandidate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResultsModal(true);
    }, 2500);
  };

  const isStepDone = (num) => {
    const type = num === 1 ? 'jd' : 'resume';
    return files[type] || textData[type].length > 50;
  };

  const isReady = isStepDone(1) && isStepDone(2);

  // --- BRAND LOGO ---
  const SwirlLogo = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <defs>
        <linearGradient id="swirlGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M20 4C11.1 4 4 11.1 4 20C4 28.8 11.1 36 20 36" stroke="url(#swirlGrad)" strokeWidth="6" strokeLinecap="round" />
      <path d="M36 20C36 11.1 28.8 4 20 4" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      <path d="M20 36C28.8 36 36 28.8 36 20" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans relative overflow-x-hidden">
      
      {/* 1. HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 no-print">
        <div className="flex items-center gap-4">
          <SwirlLogo />
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">RECRUIT <span className="text-blue-500">IQ</span></h1>
        </div>
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/10 shadow-xl">
          <button className="px-6 py-2 text-[10px] font-black bg-blue-600 text-white rounded-lg shadow-lg">STANDARD (FREE)</button>
          <button className="px-6 py-2 text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-widest">PRO ($29.99)</button>
        </div>
      </header>

      {/* 2. MAIN DASHBOARD CONTENT */}
      <main className={`max-w-4xl mx-auto space-y-6 no-print transition-all duration-500 ${showResultsModal ? 'opacity-10 blur-3xl pointer-events-none' : ''}`}>
        
        {/* Step Guide Bar */}
        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center gap-10">
          <h2 className="text-orange-500 text-[10px] font-black tracking-[0.3em] uppercase italic border-r border-white/10 pr-10">Step Guide</h2>
          <div className="flex gap-12 flex-1">
            {['Input JD', 'Input Resume', 'Screen'].map((txt, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={`font-mono text-sm font-bold ${isStepDone(i + 1) || (i === 2 && isReady) ? 'text-blue-500' : 'text-slate-800'}`}>0{i+1}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input Container */}
        <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col">
          <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
            {[1, 2].map((num) => (
              <button key={num} onClick={() => setActiveTab(num)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all ${activeTab === num ? 'bg-[#1c2128] text-blue-400 border border-white/5 shadow-lg' : 'text-slate-600'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isStepDone(num) ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800'}`}>
                  {isStepDone(num) ? <CheckCircle size={12} /> : num}
                </div>
                {num === 1 ? 'JOB DESCRIPTION' : 'CANDIDATE RESUME'}
              </button>
            ))}
          </div>

          <div className="p-10 flex flex-col items-center">
            <textarea 
              value={activeTab === 1 ? textData.jd : textData.resume}
              onChange={(e) => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.value }))}
              placeholder={`Paste or upload your content here...`}
              className="w-full h-64 bg-black/20 border border-white/5 rounded-[2rem] p-8 text-sm text-slate-400 focus:outline-none focus:border-blue-500/50 resize-none font-mono mb-6"
            />
            <button onClick={useSample} className="text-[10px] font-black text-blue-500 border border-blue-500/20 px-6 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">
              Use Full Sample Data
            </button>
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

      {/* 3. THE PRINTABLE PDF REPORT MODAL */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10 bg-black/95 backdrop-blur-3xl overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-none md:rounded-[3rem] shadow-2xl flex flex-col print:shadow-none print:m-0">
            
            <div className="bg-slate-100 px-10 py-6 flex justify-between items-center no-print border-b border-slate-200">
               <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Deep-Dive Synergy Audit</span>
               <div className="flex gap-3">
                 <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
                    <Printer size={14} /> Download PDF
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Overall Match</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                 <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem]">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-3">Key Strengths</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">Candidate is a Tier-1 match for AI Infrastructure. Direct experience with LLM orchestration and MLOps pipelines at scale.</p>
                 </div>
                 <div className="p-8 bg-orange-50/50 border border-orange-100 rounded-[2rem]">
                    <h4 className="text-[10px] font-black text-orange-600 uppercase mb-3">Gap Mitigation</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"Management tenure is 1.5 years short of preference; however, project complexity compensates for the duration."</p>
                 </div>
              </div>

              <div className="mb-12">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ListChecks size={16} /> Technical Evidence Matrix
                </h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white text-[9px] uppercase tracking-widest font-black">
                      <tr><th className="px-6 py-4">Requirement</th><th className="px-6 py-4">Evidence</th><th className="px-6 py-4 text-center">Match</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                      <tr><td className="px-6 py-4 uppercase">AI / LLM Integration</td><td className="px-6 py-4 font-normal">Implemented OpenAI bots @ TechFlow</td><td className="px-6 py-4 text-center text-blue-600">100%</td></tr>
                      <tr><td className="px-6 py-4 uppercase">SQL / Python</td><td className="px-6 py-4 font-normal">Managed enterprise analytics dashboards</td><td className="px-6 py-4 text-center text-blue-600">100%</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-slate-100 flex justify-between items-center opacity-50">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Confruitment Document • Recruit IQ Deep-Dive • {new Date().toLocaleDateString()}</p>
                <SwirlLogo size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{` @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-shimmer { animation: shimmer 2s infinite linear; } @media print { .no-print { display: none !important; } body { background: white !important; } .fixed { position: static !important; } } `}</style>
    </div>
  );
};

export default RecruitIQApp;
