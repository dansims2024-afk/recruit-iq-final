import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck, Lock, X, Check, Download, Twitter, Linkedin, Github, TrendingUp, Target, Users } from 'lucide-react';

// FIXED: "export default" ensures the screen is no longer blank
export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [activeTab, setActiveTab] = useState('jd');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');
  
  const fileInputRef = useRef(null);
  const isJDFilled = jobDescription.trim().length > 50;
  const isResumeFilled = resume.trim().length > 50;

  const hasAccess = (feature) => {
    if (simTier === 'pro') return true;
    return feature === 'score'; 
  };

  const handleFeatureClick = (feature, name) => {
    if (!hasAccess(feature)) {
      setLockedFeatureName(name);
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const loadSampleData = () => {
    setJobDescription(`📄 Job Title: Medical Assistant\nOverview: Seeking a skilled Medical Assistant... [Full JD]`);
    setResume(`Jill McSample | Newark, NJ\nSummary: Detail-oriented Medical Assistant... [Full Resume]`);
  };

  const handleAnalyze = () => {
    if (!isJDFilled || !isResumeFilled) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match with active CMA status and localized experience.",
        strengths: [
          { title: "Technical Stack Mastery", desc: "Expert proficiency in Epic and Cerner EMR systems with 3+ years of experience." },
          { title: "Quantifiable Efficiency", desc: "25% faster patient intake cycles in high-volume Newark clinics." }
        ],
        gaps: [
          { title: "Oncology Billing Complexity", desc: "Limited exposure to high-complexity oncology modifiers." },
          { title: "Software Transition Lag", desc: "Requires 1-week ramp-up for latest AthenaHealth V3 updates." }
        ],
        interviewQuestions: [
          "Describe your workflow for zero-error documentation in Epic during surges.",
          "How do you handle a procedure you haven't performed in over 12 months?",
          "Can you walk us through your ICD-10 coding validation process?",
          "How do you prioritize patient comfort while maintaining pace?",
          "Describe your experience with sterile field maintenance."
        ],
        marketData: { low: 38500, avg: 47200, high: 56000 }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* 1. BENEFIT-DRIVEN UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-purple-500/40 w-full max-w-xl rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white z-10"><X size={24}/></button>
            <div className="text-center relative z-10">
              <div className="inline-flex p-4 bg-purple-600/20 rounded-2xl mb-6 text-purple-500"><Zap size={32} fill="currentColor" /></div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Upgrade to Recruit-IQ Pro</h2>
              <p className="text-slate-400 text-sm mb-10">Unlock <span className="text-white font-bold">{lockedFeatureName}</span> and gain these benefits:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><TrendingUp size={20}/></div>
                  <div><p className="text-[11px] font-bold text-white uppercase mb-1">Market Edge</p><p className="text-[10px] text-slate-500">Real-time compensation data.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500"><Target size={20}/></div>
                  <div><p className="text-[11px] font-bold text-white uppercase mb-1">Deep Audit</p><p className="text-[10px] text-slate-500">Expose critical growth gaps.</p></div>
                </div>
              </div>

              <button className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-white shadow-xl uppercase transition-all hover:scale-[1.02]">
                Activate Pro for $29.99/mo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & QUICK START GUIDE */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-purple-500 rounded-full"></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">RECRUIT<span className="text-purple-500 ml-1">IQ</span></h1>
        </div>
        <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1">
          <button onClick={() => setSimTier('standard')} className={`px-8 py-2 rounded-xl text-[10px] uppercase font-bold transition-all ${simTier === 'standard' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Standard</button>
          <button onClick={() => setSimTier('pro')} className={`px-8 py-2 rounded-xl text-[10px] uppercase font-bold transition-all ${simTier === 'pro' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>Pro</button>
        </div>
      </header>

      {/* QUICK START GUIDE SECTION */}
      <section className="max-w-7xl mx-auto w-full px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 transition-all ${isJDFilled ? 'border-emerald-500/50' : 'border-blue-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>{isJDFilled ? "✓" : "1"}</div>
            <div className="text-xs">Step 1: Add JD</div>
          </div>
          {/* ... Step 2 & 3 Mirror ... */}
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* INPUTS - LEFT */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl relative">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>1. JD</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>2. Resume</button>
          </div>
          <div className="flex-1 relative">
            <textarea className="w-full h-full p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste content..." />
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <button onClick={loadSampleData} className="text-[10px] font-bold text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg bg-slate-900/50">Sample</button>
              <button onClick={() => fileInputRef.current.click()} className="text-[10px] text-slate-400 border border-white/10 px-3 py-1.5 rounded-lg bg-slate-800">Upload</button>
            </div>
          </div>
          <div className="p-6 bg-slate-950/30 border-t border-slate-800">
             <button onClick={handleAnalyze} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase shadow-xl flex items-center justify-center gap-2"><Sparkles size={18}/> Run Synergy Scan</button>
          </div>
        </section>

        {/* RESULTS - RIGHT */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {analysis && (
            <div className="space-y-6">
              {/* Score - Always Visible */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8 shadow-xl">
                  <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                  <div><h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Match Result</h3><p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.fitSummary}"</p></div>
              </div>

              {/* Locked Talent Audit */}
              <div onClick={() => handleFeatureClick('pro', 'Talent Audit')} className="relative cursor-pointer">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl"><Lock size={20} className="text-purple-500" /></div>}
                <div className={`space-y-4 ${!hasAccess('pro') ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-4 italic tracking-[0.2em]"><CheckCircle2 size={12}/> Strengths Audit</span>
                    {analysis.strengths.map((s, i) => (<div key={i} className="border-l-2 border-emerald-500/30 pl-4 mb-4"><p className="text-xs font-black text-white uppercase">{s.title}</p><p className="text-[11px] text-slate-400">{s.desc}</p></div>))}
                  </div>
                  <div className="bg-slate-900 p-6 rounded-3xl border border-rose-500/20 shadow-xl">
                    <span className="text-rose-500 text-[10px] font-bold uppercase block mb-4 italic tracking-[0.2em]"><AlertCircle size={12}/> Critical Growth Gaps</span>
                    {analysis.gaps.map((g, i) => (<div key={i} className="border-l-2 border-rose-500/30 pl-4 mb-4"><p className="text-xs font-black text-white uppercase">{g.title}</p><p className="text-[11px] text-slate-400">{g.desc}</p></div>))}
                  </div>
                </div>
              </div>

              {/* Interview Guide */}
              <div onClick={() => handleFeatureClick('pro', 'Interview Intelligence')} className="relative cursor-pointer">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5"><Lock size={20} className="text-purple-500" /></div>}
                <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl ${!hasAccess('pro') ? 'opacity-30' : ''}`}>
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-6"><ClipboardCheck size={14} /> AI Interview Guide</h3>
                  {analysis.interviewQuestions.map((q, i) => (<div key={i} className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-xs text-slate-300 italic mb-2">"{q}"</div>))}
                </div>
              </div>

              {/* Market Intelligence - RESTRUCTURED UNDER INTERVIEW GUIDE */}
              <div onClick={() => handleFeatureClick('pro', 'Market Intelligence')} className="relative cursor-pointer">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl"><Lock size={20} className="text-purple-500" /></div>}
                <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl ${!hasAccess('pro') ? 'opacity-30' : ''}`}>
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-10"><DollarSign size={14}/> Comp Intelligence</h3>
                  <div className="h-4 bg-slate-950 rounded-full border border-white/5 relative mx-4">
                     <div className="absolute left-1/2 -top-10 -translate-x-1/2 flex flex-col items-center">
                         <span className="text-[14px] font-black text-white">$47,200</span>
                         <div className="w-0.5 h-6 bg-purple-500 mt-1"></div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <input type="file" ref={fileInputRef} className="hidden" />
    </div>
  );
}
